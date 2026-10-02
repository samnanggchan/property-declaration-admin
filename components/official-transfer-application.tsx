"use client";

import { PrinterIcon, XIcon, FileTextIcon, LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LandDeclaration,
  PersonFields,
  emptyPerson,
  emptyJoint,
} from "@/lib/types";
import { calculateAgeFromDob } from "@/lib/utils";

interface OfficialTransferApplicationProps {
  declaration?: LandDeclaration;
  record?: LandDeclaration;
  onClose?: () => void;
  onSwitchToDeclaration?: () => void;
  onSwitchToCertificate?: () => void;
}

/** Convert numbers (0-9) to Khmer numerals */
function toKhmerNum(num: string | number | undefined | null): string {
  if (num === undefined || num === null || num === "") return "";
  const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return String(num).replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
}

/** Parses address string into Cambodian administrative components without character class truncation */
function parseKhmerAddress(address: string | undefined | null) {
  if (!address) {
    return {
      house: "",
      street: "",
      village: "",
      sangkat: "",
      khan: "",
      city: "",
    };
  }
  const clean = address.trim();

  // Extract each administrative level using lookaheads so Khmer unicode syllables are never broken
  const houseMatch = clean.match(
    /(?:ផ្ទះលេខ|ផ្ទះ|№)\s*:?\s*(.*?)(?=\s*(?:ផ្លូវ|វិថី|ភូមិ|ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const streetMatch = clean.match(
    /(?:ផ្លូវលេខ|ផ្លូវ|វិថី)\s*:?\s*(.*?)(?=\s*(?:ភូមិ|ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const villageMatch = clean.match(
    /ភូមិ\s*:?\s*(.*?)(?=\s*(?:ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const sangkatMatch = clean.match(
    /(?:សង្កាត់|ឃុំ)\s*:?\s*(.*?)(?=\s*(?:ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const khanMatch = clean.match(
    /(?:ខណ្ឌ|ស្រុក|ក្រុង)\s*:?\s*(.*?)(?=\s*(?:រាជធានី|ខេត្ត)|$|,)/i,
  );
  const cityMatch = clean.match(/(?:រាជធានី|ខេត្ត)\s*:?\s*(.*?)(?=$|,)/i);

  return {
    house: houseMatch ? houseMatch[1].trim() : "",
    street: streetMatch ? streetMatch[1].trim() : "",
    village: villageMatch ? villageMatch[1].trim() : "",
    sangkat: sangkatMatch ? sangkatMatch[1].trim() : "",
    khan: khanMatch ? khanMatch[1].trim() : "",
    city:
      cityMatch && cityMatch[1].trim()
        ? cityMatch[1].trim()
        : clean.includes("ភ្នំពេញ")
          ? "ភ្នំពេញ"
          : "",
  };
}

/** Splits date into Day, Month, Year (e.g. 20.05.2025 -> day: 20, month: 05, year: 2025) */
function parseDateParts(dateStr: string | undefined | null) {
  if (!dateStr) return { day: "", month: "", year: "" };
  const clean = dateStr.trim();
  const parts = clean.split(/[./\-\s]/);
  if (parts.length >= 3) {
    return {
      day: toKhmerNum(parts[0]),
      month: toKhmerNum(parts[1]),
      year: toKhmerNum(parts[2]),
    };
  }
  return { day: "", month: "", year: toKhmerNum(clean) };
}

/** Extracts age number in Khmer numerals calculated from dob (e.g. 23.10.2004 -> ២១ or 27 ឆ្នាំ -> ២៧) */
function extractAgeNumber(person: PersonFields): string {
  if (!person.dob) return "";
  const calculated = calculateAgeFromDob(person.dob);
  if (calculated && calculated !== "—") {
    const cleaned = calculated.replace(/\s*ឆ្នាំ\s*$/, "").trim();
    return toKhmerNum(cleaned);
  }
  return "";
}

function extractAge(person: PersonFields): string {
  return extractAgeNumber(person);
}

/** Helper for form dotted field that spans exact allotted width with dotted baseline */
function FormDottedField({
  value,
  className = "",
  minDots = 12,
}: {
  value?: string | number | null;
  className?: string;
  minDots?: number;
}) {
  const text = value && String(value).trim() ? String(value).trim() : "";
  return (
    <span
      className={`inline-flex items-baseline justify-center border-b-[1.5px] border-dotted border-neutral-700 px-1 min-h-[20px] overflow-hidden ${className}`}
    >
      {text ? (
        <span className="font-bold text-neutral-950 whitespace-nowrap leading-tight text-center">
          {text}
        </span>
      ) : (
        <span className="text-neutral-400 font-mono tracking-widest text-[11px] select-none opacity-60 whitespace-nowrap">
          {".".repeat(Math.max(minDots, 100))}
        </span>
      )}
    </span>
  );
}

/** Helper for dots fill line */
function DottedLeader({
  value,
  minDots = 10,
  fallback = "...........................",
  className = "",
}: {
  value?: string | number | null;
  minDots?: number;
  fallback?: string;
  className?: string;
}) {
  if (value && String(value).trim()) {
    return (
      <span
        className={`inline-block font-semibold text-neutral-950 border-b border-dotted border-neutral-700 px-1 ${className}`}
      >
        {value}
      </span>
    );
  }
  return (
    <span className="text-neutral-400 font-mono tracking-widest text-[14px] select-none">
      {fallback || ".".repeat(minDots)}
    </span>
  );
}

export function OfficialTransferApplication({
  declaration,
  record,
  onClose,
  onSwitchToDeclaration,
  onSwitchToCertificate,
}: OfficialTransferApplicationProps) {
  const currentDoc = declaration || record;

  if (!currentDoc) {
    return null;
  }

  const joint = currentDoc.joint || emptyJoint();

  // Parties data (Seller Husband & Wife, Buyer Husband & Wife)
  const sellerHusband =
    currentDoc.seller?.husband || currentDoc.husband || emptyPerson();
  const sellerWife =
    currentDoc.seller?.wife || currentDoc.wife || emptyPerson();
  const buyerHusband = currentDoc.buyer?.husband || emptyPerson();
  const buyerWife = currentDoc.buyer?.wife || emptyPerson();

  // Seller: First Husband, Wife as spouse
  const primarySeller = sellerHusband.name
    ? sellerHusband
    : sellerWife.name
      ? sellerWife
      : emptyPerson();
  const sellerSpouse =
    sellerHusband.name && sellerWife.name
      ? sellerWife
      : sellerHusband.name
        ? emptyPerson()
        : sellerHusband;
  const secondarySeller =
    sellerHusband.name && sellerWife.name ? sellerWife : null;

  // Buyer: First Husband, Wife as spouse
  const primaryBuyer = buyerHusband.name
    ? buyerHusband
    : buyerWife.name
      ? buyerWife
      : emptyPerson();
  const buyerSpouse =
    buyerHusband.name && buyerWife.name
      ? buyerWife
      : buyerHusband.name
        ? emptyPerson()
        : buyerHusband;
  const secondaryBuyer = buyerHusband.name && buyerWife.name ? buyerWife : null;

  // Address parsing
  const sellerAddr = parseKhmerAddress(primarySeller.address);
  const buyerAddr = parseKhmerAddress(primaryBuyer.address);

  // Gender resolution
  const sellerGender = primarySeller.name
    ? primarySeller.status?.includes("ស្រី")
      ? "ស្រី"
      : "ប្រុស"
    : "";
  const buyerGender = primaryBuyer.name
    ? primaryBuyer.status?.includes("ស្រី")
      ? "ស្រី"
      : "ប្រុស"
    : "";

  // Transfer Date
  const transferDateStr = joint.registrationDate || joint.date || "20.05.2025";
  const transferDate = parseDateParts(transferDateStr);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl bg-background p-2 sm:p-4 text-foreground">
      {/* Load Fonts Requested by User */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@100;300;400;700;900&family=Moul&display=swap');

          .font-moul {
            font-family: 'Moul', 'Khmer OS Muol Light', serif;
          }

          .font-battambang {
            font-family: 'Battambang', 'Khmer OS Battambang', 'Khmer OS', sans-serif;
          }

          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .application-sheet {
              box-shadow: none !important;
              border: none !important;
              margin: 0 auto !important;
              padding: 12mm 14mm 10mm 14mm !important;
              width: 210mm !important;
              min-height: 297mm !important;
              max-width: 210mm !important;
              page-break-after: always !important;
              break-after: page !important;
            }
            .application-sheet:last-of-type {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .page-break {
              display: none !important;
            }
          }
        `,
        }}
      />

      {/* Top Action Bar (hidden on print) */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <PrinterIcon className="size-4" />
            បោះពុម្ព / ទាញយក PDF (Print / PDF)
          </Button>

          {onSwitchToDeclaration && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToDeclaration}
              className="gap-1.5 text-xs"
            >
              <FileTextIcon className="size-3.5 text-primary" />
              លិខិតប្រកាស (Declaration)
            </Button>
          )}

          {onSwitchToCertificate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToCertificate}
              className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
            >
              <LayersIcon className="size-3.5" />
              តារាងសម្រង់វិញ្ញាបនប័ត្រ (Certificate)
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-full"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* =========================================================================
          PAGE 1 (A4 FORMATTED)
          ========================================================================= */}
      <div className="application-sheet font-battambang mx-auto min-h-[297mm] w-full max-w-[210mm] border border-neutral-300 bg-white p-8 sm:px-12 sm:py-10 text-neutral-900 shadow-md transition-all text-[14px] leading-[1.85] flex flex-col justify-between mb-8">
        <div className="space-y-3">
          {/* Header: Kingdom of Cambodia */}
          <div className="relative text-center">
            <h1 className="font-moul text-base sm:text-lg tracking-wide text-neutral-950">
              ព្រះរាជាណាចក្រកម្ពុជា
            </h1>
            <h2 className="font-moul text-sm sm:text-lg tracking-wide text-neutral-950 mt-1">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </h2>
            <div className="my-1.5 flex items-center justify-center">
              <img
                src="/symbol-3.png"
                alt="symbol"
                className="h-auto sm:h-8 w-auto object-contain"
              />
            </div>

            {/* Top Right Reference Code */}
            <div className="absolute right-2 bottom-0 flex justify-end">
              <img
                src="/mtpp.png"
                alt="មន្ទីរ ដ.ន.ស.ស រាជធានីភ្នំពេញ"
                className="h-8 sm:h-8 w-auto object-contain"
              />
            </div>
          </div>

          {/* Document Main Title */}
          <div className="mt-4 mb-6 text-center">
            <h2 className="font-moul text-lg sm:text-xl text-neutral-950 tracking-wide">
              ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
            </h2>
          </div>

          {/* Section 1: Applicant Identification Paragraph (Seller First Husband/Wife, Buyer Husband/Wife) */}
          <div className="w-full space-y-1 text-[14px] leading-[2.3]">
            {/* Line 1 */}
            <div className="flex items-baseline w-full">
              <span className="w-8 shrink-0" />
              <span className="shrink-0">ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ </span>
              <FormDottedField
                value={
                  primarySeller.name ||
                  (joint.entity
                    ? `${joint.entity} (តំណាង: ${joint.repName || ""})`
                    : null)
                }
                className="flex-1 mx-1.5"
                minDots={30}
              />
              <span className="shrink-0 ml-1">ភេទ</span>
              <FormDottedField
                value={sellerGender}
                className="w-14 mx-1"
                minDots={6}
              />
              <span className="shrink-0 ml-1">អាយុ</span>
              <FormDottedField
                value={extractAgeNumber(primarySeller)}
                className="w-12 mx-1"
                minDots={6}
              />
              <span className="shrink-0 ml-0.5">
                ឆ្នាំ<sup>(១)</sup>
              </span>
              <span className="shrink-0 ml-2.5">អាសយដ្ឋានបច្ចុប្បន្ន</span>
            </div>

            {/* Line 2 */}
            <div className="flex items-baseline w-full">
              <span className="shrink-0">នៅផ្ទះលេខ</span>
              <FormDottedField
                value={sellerAddr.house ? toKhmerNum(sellerAddr.house) : null}
                className="w-20 mx-1"
                minDots={10}
              />
              <span className="shrink-0 ml-1">ផ្លូវលេខ</span>
              <FormDottedField
                value={sellerAddr.street ? toKhmerNum(sellerAddr.street) : null}
                className="w-20 mx-1"
                minDots={12}
              />
              <span className="shrink-0 ml-1">ភូមិ</span>
              <FormDottedField
                value={
                  sellerAddr.village ? toKhmerNum(sellerAddr.village) : null
                }
                className="w-20 mx-1"
                minDots={12}
              />
              <span className="shrink-0 ml-1">ឃុំ/សង្កាត់</span>
              <FormDottedField
                value={sellerAddr.sangkat || null}
                className="flex-1 mx-1"
                minDots={20}
              />
              <span className="shrink-0 ml-1">ក្រុង/ស្រុក/ខណ្ឌ</span>
            </div>

            {/* Line 3 */}
            <div className="flex items-baseline w-full">
              <FormDottedField
                value={sellerAddr.khan || null}
                className="flex-1 mr-1.5"
                minDots={25}
              />
              <span className="shrink-0">រាជធានី/ខេត្ត</span>
              <FormDottedField
                value={
                  sellerAddr.city ||
                  (primarySeller.address?.includes("ភ្នំពេញ")
                    ? "ភ្នំពេញ"
                    : null)
                }
                className="flex-1 mx-1.5"
                minDots={20}
              />
              <span className="shrink-0 ml-1">ប្ដី/ប្រពន្ធឈ្មោះ</span>
              <FormDottedField
                value={sellerSpouse.name || null}
                className="flex-1 ml-1.5"
                minDots={25}
              />
            </div>

            {/* Line 4 */}
            <div className="flex items-baseline w-full">
              <span className="shrink-0 font-semibold text-neutral-900">
                (បុគ្គលមានសិទ្ធិចុះបញ្ជី)
              </span>
              <span className="shrink-0 ml-1.5">និង ឈ្មោះ</span>
              <FormDottedField
                value={primaryBuyer.name || null}
                className="flex-1 mx-1.5"
                minDots={30}
              />
              <span className="shrink-0 ml-1">ភេទ</span>
              <FormDottedField
                value={buyerGender}
                className="w-14 mx-1"
                minDots={6}
              />
              <span className="shrink-0 ml-1">អាយុ</span>
              <FormDottedField
                value={extractAgeNumber(primaryBuyer)}
                className="w-12 mx-1"
                minDots={6}
              />
              <span className="shrink-0 ml-0.5">ឆ្នាំ</span>
            </div>

            {/* Line 5 */}
            <div className="flex items-baseline w-full">
              <span className="shrink-0 font-semibold text-neutral-900">
                <sup>(២)</sup>
              </span>
              <span className="w-8 shrink-0" />
              <span className="shrink-0">អាសយដ្ឋានបច្ចុប្បន្នផ្ទះលេខ</span>
              <FormDottedField
                value={buyerAddr.house ? toKhmerNum(buyerAddr.house) : null}
                className="w-24 mx-1"
                minDots={12}
              />
              <span className="shrink-0 ml-1">ផ្លូវលេខ</span>
              <FormDottedField
                value={buyerAddr.street ? toKhmerNum(buyerAddr.street) : null}
                className="w-24 mx-1"
                minDots={12}
              />
              <span className="shrink-0 ml-1">ភូមិ</span>
              <FormDottedField
                value={buyerAddr.village ? toKhmerNum(buyerAddr.village) : null}
                className="flex-1 mx-1"
                minDots={25}
              />
              <span className="shrink-0 ml-1">ឃុំ/</span>
            </div>

            {/* Line 6 */}
            <div className="flex items-baseline w-full">
              <span className="shrink-0">សង្កាត់</span>
              <FormDottedField
                value={buyerAddr.sangkat || null}
                className="flex-1 mx-1.5"
                minDots={20}
              />
              <span className="shrink-0 ml-1">ក្រុង/ស្រុក/ខណ្ឌ</span>
              <FormDottedField
                value={buyerAddr.khan || null}
                className="flex-1 mx-1.5"
                minDots={20}
              />
              <span className="shrink-0 ml-1">រាជធានី/ខេត្ត</span>
              <FormDottedField
                value={
                  buyerAddr.city ||
                  (primaryBuyer.address?.includes("ភ្នំពេញ") ? "ភ្នំពេញ" : null)
                }
                className="flex-1 mx-1.5"
                minDots={20}
              />
              <span className="shrink-0 ml-1">ប្ដី/ប្រពន្ធ</span>
            </div>

            {/* Line 7 */}
            <div className="flex items-baseline w-full">
              <span className="shrink-0">ឈ្មោះ</span>
              <FormDottedField
                value={buyerSpouse.name || null}
                className="w-72 mx-2"
                minDots={30}
              />
              <span className="shrink-0 font-semibold text-neutral-900">
                (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី)។
              </span>
            </div>
          </div>

          {/* Salutation */}
          <div className="mt-5 text-center leading-relaxed">
            <h3 className="font-moul text-sm text-neutral-950 underline">
              សូមគោរពជូន
            </h3>
            <p className="font-moul text-xs text-neutral-950 mt-1">
              លោកប្រធានមន្ទីររៀបចំដែនដី នគរូបនីយកម្ម សំណង់ និងសុរិយោដី
              រាជធានីភ្នំពេញ
            </p>
          </div>

          {/* Subject & Reference */}
          <div className="mt-4 space-y-2 text-[14px] leading-[1.9]">
            <div className="flex items-start gap-1">
              <span className="font-moul shrink-0 w-16 underline">
                កម្មវត្ថុ :
              </span>
              <div className="flex-1">
                <span>សំណើសុំចុះបញ្ជីអំពីការផ្ទេរ </span>
                <span className="text-neutral-400 font-mono">
                  .........................................
                </span>
                <span className="text-[14px] text-neutral-700">
                  {" "}
                  (កម្មសិទ្ធិទាំងមូល ឬកម្មសិទ្ធិមួយផ្នែក
                  ឬចំណែកកម្មសិទ្ធិអវិភាគទាំងមូល ឬចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែក)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1">
              <span className="font-moul shrink-0 w-16 underline">យោង :</span>
              <div className="flex-1">
                <span>មូលហេតុ និង​កាលបរិច្ឆេទ </span>
                <span className="text-neutral-400 font-mono">
                  ..........................................................
                </span>
              </div>
            </div>
          </div>

          {/* Intro Section */}
          <div className="mt-4 text-[14px]">
            <p className="ml-17 font-medium">
              តាមកម្មវត្ថុ និងយោងខាងលើនេះ​
              យើងខ្ញុំសូមស្នើសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិដូចខាងក្រោម ៖
            </p>
          </div>

          {/* Section ក: គោលបំណងនៃការចុះបញ្ជី */}
          <div className="mt-3 text-[14px] leading-relaxed">
            <h4 className="font-normal text-neutral-950">
              ក- គោលបំណងនៃការចុះបញ្ជី ៖
            </h4>
            <div className="ml-8 mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">-</span>
                <span>ការផ្ទេរកម្មសិទ្ធិទាំងមូល ឬ </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">-</span>
                <span>ការផ្ទេរកម្មសិទ្ធិមួយផ្នែក</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-bold">-</span>
                <span>
                  ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគទាំងមូលរបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ
                </span>
                <span className="text-neutral-400 font-mono">
                  ....................................
                </span>
                <span className="ml-2.5">នៃលេខ</span>
                <span className="text-neutral-400 font-mono">
                  .........................
                </span>
                <span>ឬ</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-bold">-</span>
                <span>
                  ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែករបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ
                </span>
                <span className="text-neutral-400 font-mono">
                  ....................................
                </span>
                <span className="ml-2.5">នៃលេខ</span>
                <span className="text-neutral-400 font-mono">
                  .....................
                </span>
              </div>
            </div>
          </div>

          {/* Section ខ: មូលហេតុ */}
          <div className="mt-4 text-[14px] leading-relaxed">
            <h4 className="font-normal text-neutral-950">ខ- មូលហេតុ ៖</h4>
            <div className="ml-8 mt-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-bold">-</span>
                <span className="font-normal text-neutral-950">ការលក់ទិញ</span>
                <span>ចុះថ្ងៃទី</span>
                <DottedLeader value={transferDate.day || "២០"} minDots={6} />
                <span>ខែ</span>
                <DottedLeader value={transferDate.month || "០៥"} minDots={8} />
                <span>ឆ្នាំ</span>
                <DottedLeader value={transferDate.year || "២០២៥"} minDots={8} />
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>ប្រទានកម្ម ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>ការដូរ ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnotes matching Image 2 anchored cleanly at bottom of Page 1 */}
        <div className="mt-6 pt-1 text-[12px] leading-[1.6] text-neutral-700 space-y-1.5">
          <div className="w-36 border-t-[1.5px] border-neutral-900 mb-2" />
          <div className="flex items-start gap-1">
            <span className="shrink-0 font-bold">
              - <sup>(១)</sup> និង <sup>(២)</sup>
            </span>
            <span>
              ក្នុងករណីបុគ្គលមានសិទ្ធិចុះបញ្ជី
              ឬបុគ្គលមានកាតព្វកិច្ចចុះបញ្ជីជានីតិបុគ្គល ត្រូវសរសេរនាមករណ៍
              និងអាសយដ្ឋាន ដែលជាទីស្នាក់ការរបស់នីតិបុគ្គលនោះ។
            </span>
          </div>
          <div className="flex items-start gap-1">
            <span className="shrink-0 font-bold">
              - <sup>(៣)</sup>
            </span>
            <span>
              ក្នុងករណីពាក្យសុំចុះបញ្ជីដាក់នៅរដ្ឋបាលសុរិយោដី ក្រុង/ស្រុក/ខណ្ឌ
              ត្រូវសរសេរបន្ថែមថា : "តាមរយៈ លោកប្រធាន ការិយាល័យរៀបចំដែនដី
              នគរូបនីយកម្ម សំណង់ និងភូមិបាល
              ក្រុង/ស្រុក/ខណ្ឌ...................................."
            </span>
          </div>
          <div className="flex items-start gap-1">
            <span className="shrink-0 font-bold underline">ចំណាំ៖</span>
            <span className="text-justify">
              សូមជម្រាបថា
              ដើម្បីជៀសវាងការយឺតយ៉ាវក្នុងការទទួលបាននូវលំដាប់អទិភាពដោយសារហេតុ
              ម្ចាស់សិទ្ធិអាចដាក់ពាក្យ សុំ
              ចុះបញ្ជីនៅរដ្ឋបាលសុរិយោដីរាជធានី/ខេត្ត ដោយផ្ទាល់តែម្តងក៏បានដែរ
              (សូមមើលប្រការ ៥ ដល់ប្រការ ៨ នៃប្រកាសអន្តរ
              ក្រសួងស្តីពីនីតិវិធីនៃការចុះបញ្ជីនៃសិទ្ធិប្រត្យក្សទាក់ទងនឹងក្រមរដ្ឋប្បវេណីលេខ
              ៣០ កយដនស-ប្រក/១៣ ចុះថ្ងៃទី ២៩ ខែមករា ឆ្នាំ២០១៣)។
            </span>
          </div>
        </div>
      </div>

      {/* Page Separator */}
      <div className="page-break my-4 no-print" />

      {/* =========================================================================
          PAGE 2 (A4 FORMATTED)
          ========================================================================= */}
      <div className="application-sheet font-battambang mx-auto min-h-[297mm] w-full max-w-[210mm] border border-neutral-300 bg-white p-8 sm:px-12 sm:py-10 text-neutral-900 shadow-md transition-all text-[14px] leading-[1.85] flex flex-col justify-between">
        <div className="space-y-4">
          {/* Continuation of Section ខ from Page 1 */}
          <div className="text-[14px] leading-relaxed">
            <div className="ml-8 space-y-1">
              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>សន្តតិកម្ម ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>ការបែងចែកមរតកតាមការព្រមព្រៀង ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>អច្ច័យទាន ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>សាលក្រម ឬសាលដីកាស្ថាពរ ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>ការបែងចែកកម្មសិទ្ធិអវិភាគ ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>ការបោះបង់ចំណែករបស់ម្ចាស់កម្មសិទ្ធិអវិភាគ ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ឬ</span>
              </div>

              <div className="flex flex-wrap items-center gap-1 text-neutral-800">
                <span className="font-bold">-</span>
                <span>មូលហេតុផ្សេងទៀត</span>
                <span className="text-neutral-400 font-mono">
                  ........................
                </span>
                <span>ចុះថ្ងៃទី</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>ខែ</span>
                <span className="text-neutral-400 font-mono">.......</span>
                <span>ឆ្នាំ</span>
                <span className="text-neutral-400 font-mono">........</span>
                <span>។</span>
              </div>
            </div>
          </div>

          {/* Section គ: បុគ្គលមានសិទ្ធិចុះបញ្ជី & បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី */}
          <div className="text-[14px] leading-[2.1]">
            <h4 className="font-normal text-neutral-950 mb-1">
              គ- បុគ្គលមានសិទ្ធិចុះបញ្ជី
            </h4>

            {/* Individual 1 (Seller Husband / Primary) */}
            <div className="ml-8 space-y-1">
              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ឈ្មោះ: </span>
                <DottedLeader
                  value={
                    primarySeller.name ||
                    (joint.entity
                      ? `${joint.entity} (តំណាង: ${joint.repName || ""})`
                      : null)
                  }
                  minDots={35}
                />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ថ្ងៃ ខែ ឆ្នាំកំណើត និងទីកន្លែងកំណើត: </span>
                <DottedLeader
                  value={
                    primarySeller.dob
                      ? `${toKhmerNum(primarySeller.dob)}${primarySeller.birthPlace ? ` នៅ ${primarySeller.birthPlace}` : ""}`
                      : null
                  }
                  minDots={30}
                />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ឈ្មោះឪពុក: </span>
                <DottedLeader
                  value={primarySeller.fatherName || null}
                  minDots={20}
                />
                <span className="ml-4">ឈ្មោះម្តាយ: </span>
                <DottedLeader
                  value={primarySeller.motherName || null}
                  minDots={20}
                />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>អាសយដ្ឋាន: </span>
                <DottedLeader
                  value={primarySeller.address || joint.officeAddress || null}
                  minDots={45}
                />
              </div>
            </div>

            {/* If Seller Wife exists, render dual person cleanly */}
            {secondarySeller && (
              <div className="ml-8 mt-2 pt-2 border-t border-dotted border-neutral-300 space-y-1">
                <div className="flex flex-wrap items-center">
                  <span className="font-bold mr-2">-</span>
                  <span>ឈ្មោះ (ប្រពន្ធ): </span>
                  <DottedLeader value={secondarySeller.name} minDots={35} />
                </div>
                <div className="flex flex-wrap items-center">
                  <span className="font-bold mr-2">-</span>
                  <span>ថ្ងៃ ខែ ឆ្នាំកំណើត និងទីកន្លែងកំណើត: </span>
                  <DottedLeader
                    value={
                      secondarySeller.dob
                        ? `${toKhmerNum(secondarySeller.dob)}${secondarySeller.birthPlace ? ` នៅ ${secondarySeller.birthPlace}` : ""}`
                        : null
                    }
                    minDots={30}
                  />
                </div>
                <div className="flex flex-wrap items-center">
                  <span className="font-bold mr-2">-</span>
                  <span>ឈ្មោះឪពុក: </span>
                  <DottedLeader
                    value={secondarySeller.fatherName || null}
                    minDots={20}
                  />
                  <span className="ml-4">ឈ្មោះម្តាយ: </span>
                  <DottedLeader
                    value={secondarySeller.motherName || null}
                    minDots={20}
                  />
                </div>
              </div>
            )}

            {/* Transferee / Buyer */}
            <h4 className="font-normal text-neutral-950 mt-4 mb-1">
              - បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី
            </h4>

            {/* Individual 1 (Buyer Husband / Primary) */}
            <div className="ml-8 space-y-1">
              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ឈ្មោះ: </span>
                <DottedLeader value={primaryBuyer.name || null} minDots={35} />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ថ្ងៃ ខែ ឆ្នាំកំណើត និងទីកន្លែងកំណើត: </span>
                <DottedLeader
                  value={
                    primaryBuyer.dob
                      ? `${toKhmerNum(primaryBuyer.dob)}${primaryBuyer.birthPlace ? ` នៅ ${primaryBuyer.birthPlace}` : ""}`
                      : null
                  }
                  minDots={30}
                />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ឈ្មោះឪពុក: </span>
                <DottedLeader
                  value={primaryBuyer.fatherName || null}
                  minDots={20}
                />
                <span className="ml-4">ឈ្មោះម្តាយ: </span>
                <DottedLeader
                  value={primaryBuyer.motherName || null}
                  minDots={20}
                />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>អាសយដ្ឋាន: </span>
                <DottedLeader
                  value={primaryBuyer.address || null}
                  minDots={45}
                />
              </div>
            </div>

            {/* If Buyer Wife exists, render dual person cleanly */}
            {secondaryBuyer && (
              <div className="ml-8 mt-2 pt-2 border-t border-dotted border-neutral-300 space-y-1">
                <div className="flex flex-wrap items-center">
                  <span className="font-bold mr-2">-</span>
                  <span>ឈ្មោះ (ប្រពន្ធ): </span>
                  <DottedLeader value={secondaryBuyer.name} minDots={35} />
                </div>
                <div className="flex flex-wrap items-center">
                  <span className="font-bold mr-2">-</span>
                  <span>ថ្ងៃ ខែ ឆ្នាំកំណើត និងទីកន្លែងកំណើត: </span>
                  <DottedLeader
                    value={
                      secondaryBuyer.dob
                        ? `${toKhmerNum(secondaryBuyer.dob)}${secondaryBuyer.birthPlace ? ` នៅ ${secondaryBuyer.birthPlace}` : ""}`
                        : null
                    }
                    minDots={30}
                  />
                </div>
                <div className="flex flex-wrap items-center">
                  <span className="font-bold mr-2">-</span>
                  <span>ឈ្មោះឪពុក: </span>
                  <DottedLeader
                    value={secondaryBuyer.fatherName || null}
                    minDots={20}
                  />
                  <span className="ml-4">ឈ្មោះម្តាយ: </span>
                  <DottedLeader
                    value={secondaryBuyer.motherName || null}
                    minDots={20}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section ឃ: ចំណុចផ្សេងៗទៀតដែលត្រូវចុះបញ្ជី */}
          <div className="mt-4 text-[14px] leading-[2.0]">
            <h4 className="font-normal text-neutral-950 mb-1">
              ឃ- ចំណុចផ្សេងៗទៀតដែលត្រូវចុះបញ្ជី
            </h4>
            <div className="ml-8">
              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>
                  ចំណែករបស់អ្នកសុំសិទ្ធិអវិភាគថ្មី
                  (ប្រសិនបើជាកម្មសិទ្ធិអវិភាគ){" "}
                </span>
                <DottedLeader value={null} minDots={12} />
              </div>
            </div>
          </div>

          {/* Section ង: អត្តសញ្ញាណ នៃអចលនវត្ថុ */}
          <div className="mt-4 text-[14px] leading-[2.0]">
            <h4 className="font-normal text-neutral-950 mb-1">
              ង- អត្តសញ្ញាណ នៃអចលនវត្ថុ
            </h4>
            <div className="ml-8 space-y-1">
              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>ទីតាំងដី </span>
                <DottedLeader
                  value={currentDoc.location || null}
                  minDots={45}
                />
              </div>

              <div className="flex flex-wrap items-center">
                <span className="font-bold mr-2">-</span>
                <span>លេខក្បាលដី ឬលេខសំបុត្រ </span>
                <DottedLeader
                  value={
                    currentDoc.certNumber
                      ? toKhmerNum(currentDoc.certNumber)
                      : null
                  }
                  minDots={35}
                />
              </div>
            </div>
          </div>

          {/* Closing Request */}
          <div className="mt-6 text-[14px] text-justify leading-relaxed indent-8 tracking-[1px]">
            អាស្រ័យហេតុនេះ សូមលោក<span className="font-moul">ប្រធានមន្ទីរ</span>{" "}
            មេត្តាពិនិត្យ និងសម្រេចអនុញ្ញាតចុះបញ្ជីតាមសំណើខាងលើដោយអនុគ្រោះ។
          </div>

          {/* Signature and Thumbprints Section */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-xs leading-relaxed">
            {/* Left: Transferor / Seller */}
            <div className="text-center">
              <p className="font-normal text-neutral-950 text-[11.5px]">
                អ្នកមានសិទ្ធិចុះបញ្ជី ឬតំណាង
              </p>
              <p className="italic text-neutral-600 text-[11.5px] mt-0.5">
                (ស្នាមមេដៃស្តាំ)
              </p>

              {/* Thumbprint box */}
              <div className="mx-auto mt-4 mb-2 flex size-20 items-center justify-center rounded border border-dashed border-neutral-400 bg-neutral-50/50">
                <span className="text-[10px] text-neutral-400 italic">
                  ស្នាមមេដៃ
                </span>
              </div>

              <div className="mt-2 font-semibold text-neutral-950 text-sm">
                {primarySeller.name || (joint.repName ? joint.repName : "")}
                {secondarySeller && ` និង ${secondarySeller.name}`}
              </div>
            </div>

            {/* Right: Transferee / Buyer & Date */}
            <div className="text-center">
              <p className="text-neutral-700 text-[11.5px]">
                ថ្ងៃ {transferDate.day ? transferDate.day : "..............."}{" "}
                ខែ {transferDate.month ? transferDate.month : "..............."}{" "}
                ឆ្នាំ{" "}
                {transferDate.year ? transferDate.year : "................"} ព.ស
                ២៥.....
              </p>
              <p className="text-neutral-900 font-medium text-[11.5px] mt-0.5">
                រាជធានីភ្នំពេញ ថ្ងៃទី{" "}
                {transferDate.day ? transferDate.day : "........."} ខែ{" "}
                {transferDate.month ? transferDate.month : "..........."}{" "}
                ឆ្នាំ២០
                {transferDate.year ? transferDate.year.slice(-2) : "......."}
              </p>

              <p className="font-normal text-neutral-950 text-[11.5px] mt-2">
                អ្នកមានកាតព្វកិច្ចចុះបញ្ជី ឬតំណាង
              </p>
              <p className="italic text-neutral-600 text-[11.5px] mt-0.5">
                (ស្នាមមេដៃស្តាំ)
              </p>

              {/* Thumbprint box */}
              <div className="mx-auto mt-4 mb-2 flex size-20 items-center justify-center rounded border border-dashed border-neutral-400 bg-neutral-50/50">
                <span className="text-[10px] text-neutral-400 italic">
                  ស្នាមមេដៃ
                </span>
              </div>

              <div className="mt-2 font-semibold text-neutral-950 text-sm">
                {primaryBuyer.name || ""}
                {secondaryBuyer && ` និង ${secondaryBuyer.name}`}
              </div>
            </div>
          </div>

          {/* Enclosures / Attachments (ឯកសារភ្ជាប់) */}
          <div className="mt-8 border-t border-dotted border-neutral-400 pt-3 text-[11.5px]">
            <span className="font-normal text-neutral-950">
              ឯកសារភ្ជាប់ ​៖
              ................................................................................................
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compatibility export
export const OfficialTransferApplicationDocument = OfficialTransferApplication;
