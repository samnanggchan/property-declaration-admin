"use client";

import * as React from "react";
import {
  PrinterIcon,
  XIcon,
  FileCheckIcon,
  HomeIcon,
  SaveIcon,
  Edit3Icon,
  LayersIcon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LandDeclaration, CadastralDetails } from "@/lib/types";
import { declarationsApi } from "@/lib/api";

interface OfficialCadastralCertificateProps {
  declaration: LandDeclaration;
  onClose?: () => void;
  onUpdated?: (updated: LandDeclaration) => void;
}

/**
 * Parses administrative units from a Cambodian location string.
 */
function parseLocation(loc: string) {
  const clean = loc || "";
  const cityMatch = clean.match(/(ក្រុង|រាជធានី|ខេត្ត)[^\s]+/i);
  const khanMatch = clean.match(/(ខណ្ឌ|ស្រុក)[^\s]+/i);
  const sangkatMatch = clean.match(/(សង្កាត់|ឃុំ)[^\s]+/i);
  const villageMatch = clean.match(/ភូមិ[^\s]+/i);

  return {
    city: cityMatch ? cityMatch[0] : "ក្រុងភ្នំពេញ",
    khan: khanMatch
      ? khanMatch[0].replace(/^(ខណ្ឌ|ស្រុក)/, "").trim()
      : "មានជ័យ",
    sangkat: sangkatMatch
      ? sangkatMatch[0].replace(/^(សង្កាត់|ឃុំ)/, "").trim()
      : "ស្ទឹងមានជ័យទី២",
    village: villageMatch
      ? villageMatch[0].replace(/^ភូមិ/, "").trim()
      : "ដំណាក់ធំ៥",
  };
}

/**
 * Parses parcel number from certificate number string.
 */
function parseCert(cert: string) {
  const clean = (cert || "").trim();
  const parts = clean.split(/[-–—]/);
  if (parts.length >= 2) {
    return {
      sheetNumber: parts[0].trim(),
      parcelNumber: parts[1].trim(),
    };
  }
  return {
    sheetNumber: "",
    parcelNumber: clean || "8480",
  };
}

/**
 * Extracts 4-digit year from date string (e.g. "22.02.1980" -> "1980")
 */
function extractYear(dob?: string): string {
  if (!dob) return "";
  const match = dob.match(/(?:19|20)\d{2}/);
  return match ? match[0] : dob.trim();
}

/**
 * Extracts ឃុំ or សង្កាត់ from a full address/birthplace string
 * e.g. "ឃុំឫស្សីស្រុក ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម" -> "ឃុំឫស្សីស្រុក"
 * e.g. "សង្កាត់ផ្សារចាស់ ក្រុងភ្នំពេញ" -> "សង្កាត់ផ្សារចាស់"
 */
function extractCommuneOrSangkat(address?: string): string {
  if (!address) return "";
  const clean = address.trim();

  const sangkatMatch = clean.match(/សង្កាត់[^\s,]+/);
  const khumMatch = clean.match(/ឃុំ[^\s,]+/);

  // If both exist or either exists, choose one (sangkat prioritized, else khum):
  if (sangkatMatch) return sangkatMatch[0];
  if (khumMatch) return khumMatch[0];

  // If neither ឃុំ nor សង្កាត់, take district, khan, province or fallback
  const khanMatch = clean.match(/(ស្រុក|ខណ្ឌ)[^\s,]+/);
  if (khanMatch) return khanMatch[0];

  const provinceMatch = clean.match(/(ខេត្ត|រាជធានី|ក្រុង)[^\s,]+/);
  if (provinceMatch) return provinceMatch[0];

  return clean;
}

export function OfficialCadastralCertificate({
  declaration,
  onClose,
  onUpdated,
}: OfficialCadastralCertificateProps) {
  const [variant, setVariant] = React.useState<"LMAP" | "HOUSE">(
    declaration.cadastral?.variant || "LMAP",
  );
  const [useGreenPaper, setUseGreenPaper] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Derived location & cert defaults
  const parsedLoc = React.useMemo(
    () => parseLocation(declaration.location),
    [declaration.location],
  );
  const parsedCert = React.useMemo(
    () => parseCert(declaration.certNumber),
    [declaration.certNumber],
  );

  // Seller info
  const sellerHusband = declaration.seller?.husband || declaration.husband;
  const sellerWife = declaration.seller?.wife || declaration.wife;
  // Buyer info
  const buyerHusband = declaration.buyer?.husband;
  const buyerWife = declaration.buyer?.wife;
  const hasBuyer = Boolean(buyerHusband?.name || buyerWife?.name);

  // Cadastral State
  const initialCadastral =
    declaration.cadastral || declaration.joint?.cadastral;
  const [city, setCity] = React.useState(
    initialCadastral?.city || parsedLoc.city,
  );
  const [khan, setKhan] = React.useState(
    initialCadastral?.khan || parsedLoc.khan,
  );
  const [sangkat, setSangkat] = React.useState(
    initialCadastral?.sangkat || parsedLoc.sangkat,
  );
  const [village, setVillage] = React.useState(
    initialCadastral?.village || parsedLoc.village,
  );

  const [sheetNumber, setSheetNumber] = React.useState(
    initialCadastral?.sheetNumber || parsedCert.sheetNumber,
  );
  const [parcelNumber, setParcelNumber] = React.useState(
    initialCadastral?.parcelNumber || parsedCert.parcelNumber,
  );
  const [area, setArea] = React.useState(declaration.joint?.area || "93 ម²");
  const [landType, setLandType] = React.useState(
    initialCadastral?.landType || declaration.joint?.landUse || "សាងសង់",
  );
  const [landUseNature, setLandUseNature] = React.useState(
    initialCadastral?.landUseNature || declaration.joint?.usageNature || "ឯកជន",
  );

  // Transfer / Sale Info (Row 2)
  const [transferType, setTransferType] = React.useState(
    initialCadastral?.transferType ||
      (hasBuyer ? "លក់ផ្តាច់" : "កាន់កាប់ដំបូង"),
  );
  const [transferDeedNo, setTransferDeedNo] = React.useState(
    initialCadastral?.transferDeedNo || "០១/២៦.ស.រ.អ",
  );
  const [transferDeedDate, setTransferDeedDate] = React.useState(
    initialCadastral?.transferDeedDate ||
      new Date().toISOString().slice(0, 10).split("-").reverse().join("."),
  );
  const [transferDetails, setTransferDetails] = React.useState(
    initialCadastral?.transferDetails ||
      (hasBuyer
        ? `កិច្ចសន្យាទិញ-លក់ផ្តាច់ (ពីឈ្មោះ ${sellerHusband?.name || ""} និង ${sellerWife?.name || ""} មកឈ្មោះ ${buyerHusband?.name || ""} និង ${buyerWife?.name || ""})`
        : "វិញ្ញាបនបត្រដើម"),
  );
  const [encumbrance, setEncumbrance] = React.useState(
    initialCadastral?.encumbrance || "គ្មាន",
  );
  const [otherRemarks, setOtherRemarks] = React.useState(
    initialCadastral?.otherRemarks || "",
  );

  // House Specific Fields
  const [houseNo, setHouseNo] = React.useState(
    initialCadastral?.houseNo || "១២E",
  );
  const [streetNo, setStreetNo] = React.useState(
    initialCadastral?.streetNo || "១៩៣",
  );
  const [roadNo, setRoadNo] = React.useState(initialCadastral?.roadNo || "");
  const [idCode, setIdCode] = React.useState(initialCadastral?.idCode || "");
  const [houseType, setHouseType] = React.useState(
    initialCadastral?.houseType || "ផ្ទះល្វែង E0",
  );
  const [houseGrade, setHouseGrade] = React.useState(
    initialCadastral?.houseGrade || "ថ្នាក់ទី២",
  );
  const [usableArea, setUsableArea] = React.useState(
    initialCadastral?.usableArea || "80 ម²",
  );
  const [builtArea, setBuiltArea] = React.useState(
    initialCadastral?.builtArea || "93 ម²",
  );

  // Boundaries
  const [boundNorth, setBoundNorth] = React.useState(
    initialCadastral?.boundaries?.north || "ជាប់ដីលេខ 8479",
  );
  const [boundEast, setBoundEast] = React.useState(
    initialCadastral?.boundaries?.east || "ជាប់ផ្លូវបេតុង ៨ម",
  );
  const [boundSouth, setBoundSouth] = React.useState(
    initialCadastral?.boundaries?.south || "ជាប់ដីលេខ 8481",
  );
  const [boundWest, setBoundWest] = React.useState(
    initialCadastral?.boundaries?.west || "ជាប់ដីលេខ 8485",
  );

  // Auto-reload from declaration
  const autoLoadFromLandSale = () => {
    const loc = parseLocation(declaration.location);
    const cert = parseCert(declaration.certNumber);
    setCity(loc.city);
    setKhan(loc.khan);
    setSangkat(loc.sangkat);
    setVillage(loc.village);
    setSheetNumber(cert.sheetNumber);
    setParcelNumber(cert.parcelNumber);
    setArea(declaration.joint?.area || "93 ម²");
    setLandType(declaration.joint?.landUse || "សាងសង់");
    setLandUseNature(declaration.joint?.usageNature || "ឯកជន");

    if (hasBuyer) {
      setTransferType("លក់ផ្តាច់");
      setTransferDetails(
        `កិច្ចសន្យាទិញ-លក់ផ្តាច់ (ពីឈ្មោះ ${sellerHusband?.name || ""} និង ${sellerWife?.name || ""} មកឈ្មោះ ${buyerHusband?.name || ""} និង ${buyerWife?.name || ""})`,
      );
    }
    toast.success(
      "បានផ្ទុកទិន្នន័យពីការលក់ដី និងម្ចាស់កម្មសិទ្ធិដោយស្វ័យប្រវត្តិ!",
    );
  };

  // Save changes back to declaration
  const handleSaveCadastral = async () => {
    setSaving(true);
    const updatedCadastral: CadastralDetails = {
      variant,
      city,
      khan,
      sangkat,
      village,
      sheetNumber,
      parcelNumber,
      landType,
      landUseNature,
      transferType,
      transferDeedNo,
      transferDeedDate,
      transferDetails,
      encumbrance,
      otherRemarks,
      houseNo,
      streetNo,
      roadNo,
      idCode,
      houseType,
      houseGrade,
      usableArea,
      builtArea,
      boundaries: {
        north: boundNorth,
        east: boundEast,
        south: boundSouth,
        west: boundWest,
      },
    };

    try {
      const updated = await declarationsApi.update(declaration.id, {
        cadastral: updatedCadastral,
        joint: {
          ...declaration.joint,
          area,
          cadastral: updatedCadastral,
        },
      });
      toast.success("បានរក្សាទុកព័ត៌មានតារាងសម្រង់វិញ្ញាបនប័ត្រជោគជ័យ!");
      setIsEditing(false);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error(err);
      toast.error("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper format for owner names
  const renderCoupleName = (
    husband?: { name?: string },
    wife?: { name?: string },
  ) => {
    const h = husband?.name?.trim();
    const w = wife?.name?.trim();
    if (h && w) {
      return (
        <div className="font-semibold leading-relaxed">
          <div>{h}</div>
          <div className="text-[11px] font-bold">និង</div>
          <div>{w}</div>
          <div className="text-[11px] font-normal text-neutral-600 dark:text-neutral-400">
            (ប្ដី - ប្រពន្ធ)
          </div>
        </div>
      );
    }
    return (
      <div className="font-semibold">
        {h || w || "—"}
        <div className="text-[11px] font-normal text-neutral-600 dark:text-neutral-400">
          ({h ? "ប្ដី" : "ប្រពន្ធ"})
        </div>
      </div>
    );
  };

  // Helper for DOB & Birthplace (Filtered to only Year & Commune/Sangkat)
  const renderCoupleDob = (
    husband?: { dob?: string; birthPlace?: string },
    wife?: { dob?: string; birthPlace?: string },
  ) => {
    const hYear = extractYear(husband?.dob);
    const hLoc = extractCommuneOrSangkat(husband?.birthPlace);
    const wYear = extractYear(wife?.dob);
    const wLoc = extractCommuneOrSangkat(wife?.birthPlace);

    return (
      <div className="text-xs space-y-1.5 leading-tight text-left">
        {(hYear || hLoc) && (
          <div>
            {hYear && (
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  ប្ដី:{" "}
                </span>
                <span className="font-bold">{hYear}</span>
              </div>
            )}
            {hLoc && (
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                {hLoc}
              </div>
            )}
          </div>
        )}
        {(wYear || wLoc) && (
          <div>
            {wYear && (
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  ប្រពន្ធ:{" "}
                </span>
                <span className="font-bold">{wYear}</span>
              </div>
            )}
            {wLoc && (
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                {wLoc}
              </div>
            )}
          </div>
        )}
        {!hYear && !wYear && <span>—</span>}
      </div>
    );
  };

  // Helper for Ancestry / Parentage (សាវតា: ឪ: ឈ្មោះឪពុក, ម: ឈ្មោះម្តាយ)
  const renderCoupleAncestry = (
    husband?: { fatherName?: string; motherName?: string },
    wife?: { fatherName?: string; motherName?: string },
  ) => {
    const hasHusbandParents = Boolean(
      husband?.fatherName || husband?.motherName,
    );
    const hasWifeParents = Boolean(wife?.fatherName || wife?.motherName);

    if (!hasHusbandParents && !hasWifeParents) {
      return <span className="text-neutral-400">—</span>;
    }

    return (
      <div className="text-xs space-y-1.5 leading-snug text-left">
        {hasHusbandParents && (
          <div>
            {husband?.fatherName && (
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  ឪ:
                </span>{" "}
                <span>{husband.fatherName}</span>
              </div>
            )}
            {husband?.motherName && (
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  ម:
                </span>{" "}
                <span>{husband.motherName}</span>
              </div>
            )}
          </div>
        )}
        {hasWifeParents && (
          <div
            className={
              hasHusbandParents
                ? "pt-1 border-t border-dashed border-neutral-300 dark:border-neutral-700"
                : ""
            }
          >
            {wife?.fatherName && (
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  ឪ:
                </span>{" "}
                <span>{wife.fatherName}</span>
              </div>
            )}
            {wife?.motherName && (
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  ម:
                </span>{" "}
                <span>{wife.motherName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Toolbar (Excluded from print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
          >
            <LayersIcon className="size-3.5 text-primary" />
            ទម្រង់ផ្លូវការ (Official Certificate Registry)
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {declaration.certNumber}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Template Switcher: LMAP vs HOUSE */}
          <div className="flex items-center rounded-lg border bg-background p-0.5 text-xs shadow-xs">
            <button
              onClick={() => setVariant("LMAP")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                variant === "LMAP"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheckIcon className="size-3.5" />
              LMAP (ដីធ្លី)
            </button>
            <button
              onClick={() => setVariant("HOUSE")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                variant === "HOUSE"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HomeIcon className="size-3.5" />
              HOUSE (ផ្ទះ/សំណង់)
            </button>
          </div>

          {variant === "HOUSE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseGreenPaper(!useGreenPaper)}
              className="h-8 gap-1.5 text-xs"
              title="ប្តូរពណ៌ក្រដាសបៃតងដូចច្បាប់ដើម"
            >
              <span
                className={`size-3 rounded-full ${useGreenPaper ? "bg-emerald-500" : "bg-neutral-300"}`}
              />
              {useGreenPaper ? "ក្រដាសបៃតង" : "ក្រដាសស"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={autoLoadFromLandSale}
            className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
            title="ទាញទិន្នន័យពីព័ត៌មានលក់ដីធ្លីឡើងវិញ"
          >
            <SparklesIcon className="size-3.5" />
            ផ្ទុកទិន្នន័យលក់ដី
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 gap-1.5 text-xs"
          >
            <Edit3Icon className="size-3.5" />
            {isEditing ? "បិទកែសម្រួល" : "កែសម្រួលវាល"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 bg-neutral-900 text-neutral-50 shadow-xs hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900"
          >
            <PrinterIcon className="size-3.5" />
            បោះពុម្ព (Print)
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Inline Quick-Edit Drawer / Form if active */}
      {isEditing && (
        <div className="no-print rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs transition-all">
          <div className="mb-3 flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-foreground">
              កែសម្រួលព័ត៌មានតារាងសម្រង់វិញ្ញាបនប័ត្រ (Certificate Metadata)
            </h4>
            <Button
              size="sm"
              disabled={saving}
              onClick={handleSaveCadastral}
              className="h-7 gap-1.5 bg-primary text-xs text-primary-foreground"
            >
              <SaveIcon className="size-3" />
              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក (Save)"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div>
              <Label className="text-[11px] text-muted-foreground">
                រាជធានី/ក្រុង
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                ខណ្ឌ/ស្រុក
              </Label>
              <Input
                value={khan}
                onChange={(e) => setKhan(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                សង្កាត់/ឃុំ
              </Label>
              <Input
                value={sangkat}
                onChange={(e) => setSangkat(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">ភូមិ</Label>
              <Input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                សន្លឹកផែនទីលេខ
              </Label>
              <Input
                value={sheetNumber}
                onChange={(e) => setSheetNumber(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                លេខក្បាលដី
              </Label>
              <Input
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                className="mt-1 h-7 text-xs font-semibold"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                ទំហំ / ក្រឡាផ្ទៃ
              </Label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                ប្រភេទដី
              </Label>
              <Input
                value={landType}
                onChange={(e) => setLandType(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                លក្ខណៈប្រើប្រាស់ដី
              </Label>
              <Input
                value={landUseNature}
                onChange={(e) => setLandUseNature(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                ប្រភេទផ្ទេរ
              </Label>
              <Input
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                placeholder="លក់ផ្តាច់"
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                លេខលិខិតសញ្ញា/កិច្ចសន្យា
              </Label>
              <Input
                value={transferDeedNo}
                onChange={(e) => setTransferDeedNo(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                ចុះកាលបរិច្ឆេទ
              </Label>
              <Input
                value={transferDeedDate}
                onChange={(e) => setTransferDeedDate(e.target.value)}
                className="mt-1 h-7 text-xs"
              />
            </div>
          </div>

          {variant === "HOUSE" && (
            <div className="mt-3 border-t pt-3">
              <h5 className="font-semibold text-foreground mb-2">
                ព័ត៌មានផ្ទះ និងព្រំប្រទល់ (HOUSE variant)
              </h5>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    ផ្ទះលេខ
                  </Label>
                  <Input
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    ផ្លូវលេខ
                  </Label>
                  <Input
                    value={streetNo}
                    onChange={(e) => setStreetNo(e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    ប្រភេទផ្ទះ
                  </Label>
                  <Input
                    value={houseType}
                    onChange={(e) => setHouseType(e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    ថ្នាក់
                  </Label>
                  <Input
                    value={houseGrade}
                    onChange={(e) => setHouseGrade(e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    ក្រឡាផ្ទៃប្រើប្រាស់
                  </Label>
                  <Input
                    value={usableArea}
                    onChange={(e) => setUsableArea(e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    ក្រឡាផ្ទៃសំណង់
                  </Label>
                  <Input
                    value={builtArea}
                    onChange={(e) => setBuiltArea(e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* The Printable Official Document Canvas */}
      <div
        id="printable-document"
        className={`mx-auto w-full max-w-5xl rounded-xl border p-6 sm:p-10 shadow-sm transition-colors text-neutral-900 ${
          variant === "HOUSE" && useGreenPaper
            ? "bg-[#edf5ec] border-emerald-800/40 text-neutral-950 font-serif"
            : "bg-white border-neutral-800 text-neutral-900"
        }`}
        style={{
          fontFamily:
            "'Battambang', 'Siemreap', 'Kantumruy Pro', 'Khmer OS', serif",
        }}
      >
        {/* =======================
            HEADER SECTION
            ======================= */}
        <div className="grid grid-cols-12 items-start gap-2 border-b-2 border-neutral-900 pb-3">
          {/* Top Left: Administrative Hierarchy */}
          <div className="col-span-3 text-xs leading-relaxed">
            <p className="font-bold">{city || "ក្រុងភ្នំពេញ"}</p>
            <p className="mt-0.5">
              ខណ្ឌ: <span className="font-semibold">{khan || "មានជ័យ"}</span>
            </p>
            <p className="mt-0.5">
              សង្កាត់:{" "}
              <span className="font-semibold">
                {sangkat || "ស្ទឹងមានជ័យទី២"}
              </span>
            </p>
            <p className="mt-0.5">
              ភូមិ:{" "}
              <span className="font-semibold">{village || "ដំណាក់ធំ៥"}</span>
            </p>
            {variant === "HOUSE" && (
              <p className="mt-0.5">
                លេខបញ្ជី:{" "}
                <span className="font-mono">
                  {declaration.certNumber || "—"}
                </span>
              </p>
            )}
          </div>

          {/* Top Center: Official Form Title */}
          <div className="col-span-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
              តារាងសម្រង់វិញ្ញាបនប័ត្រសំគាល់ម្ចាស់អចលនវត្ថុ
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold tracking-wide">
              លេខ ៖{" "}
              <span className="font-mono text-sm underline decoration-neutral-400 underline-offset-4">
                {declaration.certNumber ||
                  `${sheetNumber || "12061006"} - ${parcelNumber || "8480"}`}
              </span>
            </p>
            {variant === "HOUSE" && (
              <div className="mt-1 flex items-center justify-center gap-6 text-xs">
                <span>
                  សន្លឹកលេខ:{" "}
                  <span className="font-semibold">{sheetNumber || "—"}</span>
                </span>
                <span>
                  ក្បាលដីលេខ:{" "}
                  <span className="font-semibold">{parcelNumber || "—"}</span>
                </span>
              </div>
            )}
          </div>

          {/* Top Right: Cadastral Attributes */}
          <div className="col-span-3 text-right text-xs leading-relaxed">
            {variant === "LMAP" ? (
              <div className="space-y-0.5 inline-block text-left">
                <p>
                  សន្លឹកផែនទីលេខ :{" "}
                  <span className="font-semibold">{sheetNumber || "—"}</span>
                </p>
                <p>
                  លេខក្បាលដី :{" "}
                  <span className="font-bold font-mono text-sm">
                    {parcelNumber || "8480"}
                  </span>
                </p>
                <p>
                  ទំហំ : <span className="font-bold">{area || "93 ម²"}</span>
                </p>
                <p>
                  ប្រភេទដី :{" "}
                  <span className="font-semibold">{landType || "—"}</span>
                </p>
                <p>
                  លក្ខណៈនៃការប្រើប្រាស់ដី:{" "}
                  <span className="font-bold">{landUseNature || "ឯកជន"}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 inline-block text-left">
                <p>
                  វិថីលេខ:{" "}
                  <span className="font-semibold">{roadNo || "—"}</span>
                </p>
                <p>
                  ផ្លូវលេខ:{" "}
                  <span className="font-semibold">{streetNo || "១៩៣"}</span>
                </p>
                <p>
                  ផ្ទះលេខ:{" "}
                  <span className="font-semibold">{houseNo || "១២E"}</span>
                </p>
                <p>
                  អក្សរសម្គាល់លេខ:{" "}
                  <span className="font-semibold">{idCode || "—"}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =======================
            MAIN TABLE SECTION
            ======================= */}
        {variant === "LMAP" ? (
          /* =========================================================
             LMAP FORMAT (Land Administration & Systematic Cadastre)
             Matching Image 2
             ========================================================= */
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border-2 border-neutral-900 text-xs">
              <thead>
                {/* Master Headers */}
                <tr className="bg-neutral-100/80 text-center font-bold text-neutral-950 border-b-2 border-neutral-900">
                  <th
                    colSpan={3}
                    className="border-r-2 border-neutral-900 px-3 py-2 text-sm tracking-wide"
                  >
                    អត្តសញ្ញាណដ្ឋានម្ចាស់អចលនវត្ថុ
                  </th>
                  <th
                    colSpan={2}
                    className="border-r-2 border-neutral-900 px-3 py-2 text-sm tracking-wide"
                  >
                    ការផ្លាស់ប្តូរ
                  </th>
                  <th className="px-3 py-2 text-sm tracking-wide"></th>
                </tr>
                {/* Sub Headers */}
                <tr className="bg-neutral-50 text-center font-semibold text-neutral-900 border-b border-neutral-900 text-xs">
                  <th className="w-[24%] border-r border-neutral-900 px-2 py-2 leading-snug">
                    នាមត្រកូលនិងនាមខ្លួន <br />/ ប្រភេទទ្រព្យ
                  </th>
                  <th className="w-[18%] border-r border-neutral-900 px-2 py-2 leading-snug">
                    ថ្ងៃ ខែ ឆ្នាំ និង <br />
                    ទីកន្លែងកំណើត
                  </th>
                  <th className="w-[14%] border-r-2 border-neutral-900 px-2 py-2 leading-snug">
                    សាវតា
                  </th>
                  <th className="w-[24%] border-r border-neutral-900 px-2 py-2 leading-snug">
                    លេខចារឹក ដោយសង្ខេប នៃ <br />
                    លិខិតសញ្ញា ឬ សាលក្រមតុលាការ
                  </th>
                  <th className="w-[10%] border-r-2 border-neutral-900 px-2 py-2 leading-snug">
                    បន្ទុកលើ <br />
                    អចលនវត្ថុ
                  </th>
                  <th className="w-[10%] px-2 py-2 leading-snug">
                    សេចក្តីផ្សេងៗ
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* ────────────────────────────────────────────────────────
                    ROW 1: Original Owner / Seller (ម្ចាស់ដើម)
                    ──────────────────────────────────────────────────────── */}
                <tr className="border-b border-dashed border-neutral-400 align-top">
                  {/* Name & Property Type */}
                  <td className="border-r border-neutral-900 p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-neutral-950">
                        {renderCoupleName(sellerHusband, sellerWife)}
                      </div>
                    </div>
                  </td>

                  {/* DOB & Birthplace */}
                  <td className="border-r border-neutral-900 p-2.5">
                    {renderCoupleDob(sellerHusband, sellerWife)}
                  </td>

                  {/* សាវតា (ឪពុក ម្តាយ) */}
                  <td className="border-r-2 border-neutral-900 p-2.5 text-left font-medium">
                    {renderCoupleAncestry(sellerHusband, sellerWife)}
                  </td>

                  {/* Registered Deed / Acquisition */}
                  <td className="border-r border-neutral-900 p-2.5 text-[11px] leading-relaxed text-neutral-800">
                    <p className="font-medium text-neutral-900">
                      ចុះបញ្ជីដំបូង / ប្រភពនៃការកាន់កាប់៖{" "}
                      {declaration.joint?.possessionSource || "ទិញ"}
                    </p>
                    <p className="mt-0.5 text-neutral-600">
                      កាលបរិច្ឆេទចុះបញ្ជី៖ {declaration.joint?.date || "—"}
                    </p>
                  </td>

                  {/* Encumbrance */}
                  <td className="border-r-2 border-neutral-900 p-2.5 text-center text-[11px]">
                    គ្មាន
                  </td>

                  {/* Remarks */}
                  <td className="p-2.5 text-center text-[11px] text-neutral-500">
                    —
                  </td>
                </tr>

                {/* ────────────────────────────────────────────────────────
                    ROW 2: Buyer / Transfer on Land Sale (ម្ចាស់ថ្មីពីការលក់ដូរ)
                    ──────────────────────────────────────────────────────── */}
                {hasBuyer ? (
                  <tr className="border-b-2 border-neutral-900 bg-neutral-50/60 align-top">
                    {/* Buyer Names & Property Type */}
                    <td className="border-r border-neutral-900 p-2.5">
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-neutral-950">
                          {renderCoupleName(buyerHusband, buyerWife)}
                        </div>
                      </div>
                    </td>

                    {/* DOB & Birthplace */}
                    <td className="border-r border-neutral-900 p-2.5">
                      {renderCoupleDob(buyerHusband, buyerWife)}
                    </td>

                    {/* សាវតា (ឪពុក ម្តាយ) */}
                    <td className="border-r-2 border-neutral-900 p-2.5 text-left font-medium">
                      {renderCoupleAncestry(buyerHusband, buyerWife)}
                    </td>

                    {/* Transfer Record / Sale Deed Details */}
                    <td className="border-r border-neutral-900 p-2.5 text-[11px] leading-relaxed">
                      <div className="font-bold text-neutral-950">
                        {transferType} (ផ្ទេរកម្មសិទ្ធិអចលនវត្ថុ)
                      </div>
                      <div className="mt-1 text-neutral-800">
                        ចុះថ្ងៃទី{" "}
                        <span className="font-medium">{transferDeedDate}</span>
                        {transferDeedNo && (
                          <span>
                            {" "}
                            លេខ{" "}
                            <span className="font-mono font-medium">
                              {transferDeedNo}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[10.5px] italic text-neutral-600">
                        {transferDetails}
                      </div>
                    </td>

                    {/* Encumbrance */}
                    <td className="border-r-2 border-neutral-900 p-2.5 text-center text-[11px] font-medium">
                      {encumbrance || "គ្មាន"}
                    </td>

                    {/* Remarks */}
                    <td className="p-2.5 text-center text-[11px] text-neutral-600">
                      {otherRemarks || "—"}
                    </td>
                  </tr>
                ) : (
                  <tr className="border-b-2 border-neutral-900">
                    <td
                      colSpan={6}
                      className="p-4 text-center text-xs text-neutral-500 italic"
                    >
                      (មិនទាន់មានភាគីអ្នកទិញ - ចុច &quot;កែសម្រួល&quot;
                      ក្នុងទម្រង់ដើម្បីបន្ថែមភាគីអ្នកទិញដីធ្លី)
                    </td>
                  </tr>
                )}

                {/* Empty Filler Rows for Official Form Aesthetic */}
                {[1, 2].map((i) => (
                  <tr
                    key={i}
                    className="h-10 border-b border-dashed border-neutral-300"
                  >
                    <td className="border-r border-neutral-900" />
                    <td className="border-r border-neutral-900" />
                    <td className="border-r-2 border-neutral-900" />
                    <td className="border-r border-neutral-900" />
                    <td className="border-r-2 border-neutral-900" />
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* =========================================================
             HOUSE FORMAT (House & Land Registration)
             Matching Image 1
             ========================================================= */
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border-2 border-neutral-900 text-xs">
              <thead>
                {/* Master Headers */}
                <tr className="bg-emerald-100/50 text-center font-bold text-neutral-950 border-b-2 border-neutral-900">
                  <th
                    colSpan={3}
                    className="border-r border-neutral-900 px-2 py-2"
                  >
                    ភិនភាគក្បាលដី
                  </th>
                  <th
                    colSpan={4}
                    className="border-r border-neutral-900 px-2 py-2"
                  >
                    ពិពណ៌នាផ្ទះ
                  </th>
                  <th
                    colSpan={4}
                    className="border-r border-neutral-900 px-2 py-2"
                  >
                    អត្តសញ្ញាណដ្ឋានម្ចាស់កម្មសិទ្ធិ
                  </th>
                  <th
                    colSpan={2}
                    className="border-r border-neutral-900 px-2 py-2"
                  >
                    ការផ្លាស់ប្តូរ
                  </th>
                  <th rowSpan={2} className="px-2 py-2 w-[8%]">
                    សេចក្តីផ្សេងៗ
                  </th>
                </tr>

                {/* Sub Headers */}
                <tr className="bg-neutral-50/70 text-[10.5px] font-semibold text-center border-b border-neutral-900">
                  {/* Directions */}
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ព្រំប្រទល់
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ប្រភេទដី
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ទំហំ
                  </th>

                  {/* House Description */}
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ប្រភេទ
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ថ្នាក់
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ប្រើប្រាស់
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    សំណង់
                  </th>

                  {/* Owner Identity */}
                  <th className="border-r border-neutral-900 px-2 py-1">
                    នាមត្រកូល និងនាមខ្លួនទាំង ប្តី-ប្រពន្ធ
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    ថ្ងៃ ខែ ឆ្នាំ​ និង ស្រុកកំណើត
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    សាវតា
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    សញ្ញាត្តិ
                  </th>

                  {/* Transfer */}
                  <th className="border-r border-neutral-900 px-1.5 py-1">
                    លេខចារឹកសង្ខេបនៃសញ្ញានិងសាលក្រមតុលាការ
                  </th>
                  <th className="border-r border-neutral-900 px-1 py-1">
                    បន្ទុកលើអចលនវត្ថុ
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* 4 Cardinal Directions Rows on Left */}
                {[
                  { label: "ជើង (North)", val: boundNorth },
                  { label: "កើត (East)", val: boundEast },
                  { label: "ត្បូង (South)", val: boundSouth },
                  { label: "លិច (West)", val: boundWest },
                ].map((dir, idx) => (
                  <tr
                    key={dir.label}
                    className="border-b border-neutral-300 align-top"
                  >
                    {/* Directions Columns */}
                    <td className="border-r border-neutral-900 px-1.5 py-1 text-[10px] font-semibold">
                      {dir.label}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx === 0 ? builtArea : "—"}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center font-bold">
                      {idx === 0 ? area : "—"}
                    </td>

                    {/* House Details (merged or shown in first rows) */}
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx === 0 ? houseType : ""}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx === 0 ? houseGrade : ""}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx === 0 ? usableArea : ""}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx === 0 ? builtArea : ""}
                    </td>

                    {/* Ownership Columns (Row 0: Seller, Row 1: Buyer) */}
                    <td className="border-r border-neutral-900 px-2 py-1 text-[10.5px]">
                      {idx === 0 && (
                        <div>
                          <div className="font-bold">
                            {sellerHusband?.name || "—"}
                          </div>
                          <div className="font-bold">
                            {sellerWife?.name || ""}
                          </div>
                          <span className="text-[9px] text-neutral-600">
                            (ម្ចាស់ដើម)
                          </span>
                        </div>
                      )}
                      {idx === 1 && hasBuyer && (
                        <div>
                          <div className="font-bold text-primary">
                            {buyerHusband?.name || "—"}
                          </div>
                          {buyerHusband?.name && buyerWife?.name && (
                            <div className=" font-bold">និង</div>
                          )}
                          <div className="font-bold text-primary">
                            {buyerWife?.name || ""}
                          </div>
                          <span className="text-[9px] font-medium text-primary">
                            (ម្ចាស់ថ្មី/អ្នកទិញ)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-left">
                      {idx === 0 && (
                        <div>
                          {extractYear(sellerHusband?.dob) && (
                            <div>
                              <span className="font-semibold">ប្ដី:</span>{" "}
                              {extractYear(sellerHusband?.dob)}
                            </div>
                          )}
                          {extractCommuneOrSangkat(
                            sellerHusband?.birthPlace,
                          ) && (
                            <div className="text-[9px] text-neutral-600">
                              {extractCommuneOrSangkat(
                                sellerHusband?.birthPlace,
                              )}
                            </div>
                          )}
                          {extractYear(sellerWife?.dob) && (
                            <div className="mt-0.5">
                              <span className="font-semibold">ប្រពន្ធ:</span>{" "}
                              {extractYear(sellerWife?.dob)}
                            </div>
                          )}
                          {extractCommuneOrSangkat(sellerWife?.birthPlace) && (
                            <div className="text-[9px] text-neutral-600">
                              {extractCommuneOrSangkat(sellerWife?.birthPlace)}
                            </div>
                          )}
                        </div>
                      )}
                      {idx === 1 && hasBuyer && (
                        <div>
                          {extractYear(buyerHusband?.dob) && (
                            <div>
                              <span className="font-semibold">ប្ដី:</span>{" "}
                              {extractYear(buyerHusband?.dob)}
                            </div>
                          )}
                          {extractCommuneOrSangkat(
                            buyerHusband?.birthPlace,
                          ) && (
                            <div className="text-[9px] text-neutral-600">
                              {extractCommuneOrSangkat(
                                buyerHusband?.birthPlace,
                              )}
                            </div>
                          )}
                          {extractYear(buyerWife?.dob) && (
                            <div className="mt-0.5">
                              <span className="font-semibold">ប្រពន្ធ:</span>{" "}
                              {extractYear(buyerWife?.dob)}
                            </div>
                          )}
                          {extractCommuneOrSangkat(buyerWife?.birthPlace) && (
                            <div className="text-[9px] text-neutral-600">
                              {extractCommuneOrSangkat(buyerWife?.birthPlace)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-left">
                      {idx === 0 &&
                        renderCoupleAncestry(sellerHusband, sellerWife)}
                      {idx === 1 &&
                        hasBuyer &&
                        renderCoupleAncestry(buyerHusband, buyerWife)}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx === 0 && "—"}
                      {idx === 1 && hasBuyer && "—"}
                    </td>

                    {/* Transfer Deed */}
                    <td className="border-r border-neutral-900 px-1.5 py-1 text-[10px]">
                      {idx === 0 && (
                        <span>កាន់កាប់ដើម {declaration.joint?.date}</span>
                      )}
                      {idx === 1 && hasBuyer && (
                        <div>
                          <span className="font-bold">{transferType}</span>
                          <div>{transferDeedDate}</div>
                        </div>
                      )}
                    </td>
                    <td className="border-r border-neutral-900 px-1 py-1 text-[10px] text-center">
                      {idx <= 1 ? encumbrance || "គ្មាន" : ""}
                    </td>

                    {/* Remarks */}
                    <td className="px-1 py-1 text-[10px] text-center text-neutral-500">
                      {idx === 0 ? "—" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =======================
            FOOTER / DIRECTOR SIGNATURE BLOCK
            ======================= */}
        <div className="mt-8 flex items-end justify-between text-xs">
          <div className="text-left font-mono text-[11px] font-semibold text-neutral-600 tracking-wider">
            {variant}
          </div>

          <div className="text-center leading-relaxed">
            <p className="text-neutral-700">
              ភ្នំពេញ ថ្ងៃទី........... ខែ........... ឆ្នាំ ២០...........
            </p>
            <p className="mt-1 font-bold text-neutral-950 text-sm">
              ប្រធានមន្ទីររៀបចំដែនដីនគរូបនីយកម្មសំណង់ និងសុរិយោដីរាជធានីភ្នំពេញ
            </p>
            <div className="mt-14 flex items-center justify-center">
              <span className="border-b border-dashed border-neutral-400 px-16 py-1 italic text-neutral-400">
                (ហត្ថលេខា និងត្រា)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
