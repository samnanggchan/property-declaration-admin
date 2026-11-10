"use client";

import * as React from "react";
import {
  FileTextIcon,
  SparklesIcon,
  FolderOpenIcon,
  RotateCcwIcon,
  PrinterIcon,
  SaveIcon,
  PlusIcon,
  Trash2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  CheckCircle2Icon,
  SearchIcon,
  CopyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCheckIcon,
  ShoppingBagIcon,
  MapPinIcon,
  UsersIcon,
  XIcon,
  Building2Icon,
  UserIcon,
  CompassIcon,
  LayersIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { printCleanDocument } from "@/lib/print-service";
import { calculateAgeFromDob, cn } from "@/lib/utils";
import { toKhmerDigits as kh } from "@/lib/inheritance-request-types";

import {
  MAX_PARTIES,
  WITNESS_SLOTS,
  PURPOSES,
  CAUSES,
  PROPERTY_TYPES,
  LAND_USE_TYPES,
  USAGE_NATURES,
  POSSESSION_SOURCES,
  PropertyType,
  TransferPurpose,
  TransferCause,
  PersonData,
  LegalEntityData,
  SellerParty,
  BuyerParty,
  WitnessData,
  TransferApplication,
  emptyPersonData,
  emptyLegalEntityData,
  emptySellerParty,
  emptyBuyerParty,
  emptyWitnessData,
  emptyTransferApplication,
  createSampleTransferApplication,
} from "@/lib/transfer-application-types";

import {
  transferApplicationApi,
  saveTransferDraft,
  loadTransferDraft,
} from "@/lib/transfer-application-store";

import { TransferApplicationPrint } from "./transfer-application-print";

/* ═════════════════════════ Reusable Field Component ═════════════════════════ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  className,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-foreground/80 select-none">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 shadow-none"
      />
    </div>
  );
}

/* ═════════════════════════ Searchable Property Type Combobox ═════════════════════════ */

interface PropertyTypeComboboxProps {
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}

function PropertyTypeCombobox({
  value,
  onChange,
  label = "ជ្រើសរើសប្រភេទទ្រព្យ",
  placeholder = "ជ្រើសរើស ឬស្វែងរកប្រភេទទ្រព្យ...",
}: PropertyTypeComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return PROPERTY_TYPES;
    return PROPERTY_TYPES.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase().trim()),
    );
  }, [search]);

  return (
    <div ref={containerRef} className="space-y-1.5 relative select-none">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground flex items-center">
          <span className="text-destructive font-bold mr-1">*</span>
          {label}
        </Label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearch("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            សម្អាត
          </button>
        )}
      </div>

      <div className="relative">
        <Input
          type="text"
          value={open ? search : value || ""}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          placeholder={placeholder}
          className="h-9.5 pr-8 rounded-xl border border-border/80 bg-background text-xs shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/20 cursor-text"
        />
        <div
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground"
        >
          <SearchIcon className="size-4" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-popover p-1 shadow-lg text-xs space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-2.5 px-3 text-muted-foreground text-center">
              មិនមានទិន្នន័យ
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = value === item;
              return (
                <div
                  key={item}
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs",
                    isSelected
                      ? "bg-blue-600 text-white font-medium"
                      : "hover:bg-muted/60 text-foreground",
                  )}
                >
                  <span>{item}</span>
                  {isSelected && <CheckIcon className="size-4 text-white" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════ Person Card Component ═════════════════════════ */

interface PersonCardProps {
  title: string;
  badgeText?: string;
  badgeColor?: string;
  person: PersonData;
  onChange: (updated: PersonData) => void;
  onCopyAddress?: () => void;
  copyAddressLabel?: string;
  showGenderSelect?: boolean;
}

function PersonCard({
  title,
  badgeText,
  badgeColor = "bg-primary text-primary-foreground",
  person,
  onChange,
  onCopyAddress,
  copyAddressLabel = "ចម្លងអាសយដ្ឋាន",
  showGenderSelect = false,
}: PersonCardProps) {
  const ageStr = person.dob ? calculateAgeFromDob(person.dob) : "";

  const patch = (p: Partial<PersonData>) => {
    onChange({ ...person, ...p });
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {badgeText && (
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4.5", badgeColor)}>
              {badgeText}
            </Badge>
          )}
          {ageStr && (
            <span className="text-[11px] text-muted-foreground font-medium">({ageStr})</span>
          )}
        </div>

        {onCopyAddress && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCopyAddress}
            className="h-6 text-[11px] text-primary hover:bg-primary/10 gap-1 cursor-pointer px-2"
          >
            <CopyIcon className="size-3" />
            <span>{copyAddressLabel}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="ឈ្មោះពេញ (Full Name)"
          value={person.full_name}
          onChange={(v) => patch({ full_name: v })}
          placeholder="ឧ. សុខ ចាន់ថន"
          required
        />

        <Field
          label="លេខអត្តសញ្ញាណប័ណ្ណ (ID Number)"
          value={person.id_card_number}
          onChange={(v) => patch({ id_card_number: v })}
          placeholder="010352372(02)"
        />

        <Field
          label={ageStr ? `ថ្ងៃខែឆ្នាំកំណើត (${ageStr})` : "ថ្ងៃខែឆ្នាំកំណើត (YYYY-MM-DD)"}
          value={person.dob}
          onChange={(v) => patch({ dob: v })}
          placeholder="1973-02-22"
        />

        {showGenderSelect ? (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/80">ភេទ (Gender)</Label>
            <select
              value={person.gender || ""}
              onChange={(e) => patch({ gender: e.target.value })}
              className="h-9 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
            >
              <option value="">— ជ្រើសរើស —</option>
              <option value="ប្រុស">ប្រុស (Male)</option>
              <option value="ស្រី">ស្រី (Female)</option>
            </select>
          </div>
        ) : (
          <Field
            label="សញ្ជាតិ (Nationality)"
            value={person.nationality}
            onChange={(v) => patch({ nationality: v })}
            placeholder="ខ្មែរ"
          />
        )}

        <Field
          label="ទីកន្លែងកំណើត (Place of Birth)"
          value={person.pob}
          onChange={(v) => patch({ pob: v })}
          placeholder="ឃុំ... ស្រុក... ខេត្ត..."
          className="sm:col-span-2"
        />

        <Field
          label="ឈ្មោះឪពុក (Father's Name)"
          value={person.father_name}
          onChange={(v) => patch({ father_name: v })}
          placeholder="ឈ្មោះឪពុក"
        />

        <Field
          label="ឈ្មោះម្តាយ (Mother's Name)"
          value={person.mother_name}
          onChange={(v) => patch({ mother_name: v })}
          placeholder="ឈ្មោះម្តាយ"
        />

        <Field
          label="អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)"
          value={person.current_address}
          onChange={(v) => patch({ current_address: v })}
          placeholder="ផ្ទះលេខ... ផ្លូវ... ភូមិ... សង្កាត់... ខណ្ឌ... រាជធានីភ្នំពេញ"
          className="sm:col-span-2"
          required
        />
      </div>
    </div>
  );
}

/* ═════════════════════════ Legal Entity Card Component ═════════════════════════ */

interface LegalEntityCardProps {
  entity: LegalEntityData;
  onChange: (updated: LegalEntityData) => void;
}

function LegalEntityCard({ entity, onChange }: LegalEntityCardProps) {
  const patch = (p: Partial<LegalEntityData>) => {
    onChange({ ...entity, ...p });
  };

  return (
    <div className="space-y-4">
      {/* Company Details */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <Building2Icon className="size-4 text-purple-600" />
          <span className="text-xs font-semibold text-foreground">
            នីតិបុគ្គល (Legal Entity / Company)
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            ក្រុមហ៊ុន
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="លក្ខន្តិកៈ (Charter)"
            value={entity.charter_number}
            onChange={(v) => patch({ charter_number: v })}
            placeholder="លក្ខន្តិកៈក្រុមហ៊ុន លេខ..."
          />
          <Field
            label="អង្គភាព (Entity Name)"
            value={entity.entity_name}
            onChange={(v) => patch({ entity_name: v })}
            placeholder="ឈ្មោះក្រុមហ៊ុន ឬអង្គភាព"
            required
          />
          <Field
            label="អាសយដ្ឋាន (ទីស្នាក់ការ) (Head Office Address)"
            value={entity.head_office_address}
            onChange={(v) => patch({ head_office_address: v })}
            placeholder="ទីស្នាក់ការក្រុមហ៊ុន..."
            className="sm:col-span-2"
            required
          />
        </div>
      </div>

      {/* Representative Details */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <UserIcon className="size-4 text-purple-600" />
          <span className="text-xs font-semibold text-foreground">
            ព័ត៌មានអ្នកតំណាង ឬអ្នកគ្រប់គ្រង (Company Representative)
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            អ្នកតំណាង
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="ឈ្មោះពេញ (Representative Name)"
            value={entity.representative_name}
            onChange={(v) => patch({ representative_name: v })}
            placeholder="ឧ. ឈូ ស៊ីសេង"
            required
          />

          <Field
            label="មុខងារ / តួនាទី (Position / Role)"
            value={entity.representative_role}
            onChange={(v) => patch({ representative_role: v })}
            placeholder="ឧ. នាយកប្រតិបត្តិ, នាយករង..."
          />

          <Field
            label="អត្តសញ្ញាណប័ណ្ណលេខ"
            value={entity.representative_id}
            onChange={(v) => patch({ representative_id: v })}
            placeholder="010352372(02)"
          />

          <Field
            label="ថ្ងៃខែឆ្នាំកំណើត (YYYY-MM-DD)"
            value={entity.representative_dob}
            onChange={(v) => patch({ representative_dob: v })}
            placeholder="1973-02-22"
          />

          <Field
            label="សញ្ជាតិ"
            value={entity.representative_nationality}
            onChange={(v) => patch({ representative_nationality: v })}
            placeholder="ខ្មែរ"
          />

          <Field
            label="ទីកន្លែងកំណើត"
            value={entity.representative_pob}
            onChange={(v) => patch({ representative_pob: v })}
            placeholder="ឃុំ... ស្រុក... ខេត្ត..."
          />

          <Field
            label="ឈ្មោះឪពុក"
            value={entity.representative_father}
            onChange={(v) => patch({ representative_father: v })}
            placeholder="ឈ្មោះឪពុក"
          />

          <Field
            label="ឈ្មោះម្តាយ"
            value={entity.representative_mother}
            onChange={(v) => patch({ representative_mother: v })}
            placeholder="ឈ្មោះម្តាយ"
          />

          <Field
            label="អាសយដ្ឋានបច្ចុប្បន្នរបស់អ្នកតំណាង"
            value={entity.representative_address}
            onChange={(v) => patch({ representative_address: v })}
            placeholder="ទីលំនៅបច្ចុប្បន្ន..."
            className="sm:col-span-2"
          />
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════ Main Form Component ═════════════════════════ */

export function TransferApplicationForm() {
  const [data, setData] = React.useState<TransferApplication>(emptyTransferApplication);
  const [hydrated, setHydrated] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Stepper state: 1, 2, 3, 4
  const [activeStep, setActiveStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Print view filter tabs: all | 1 | 2 | annexSellers | annexBuyers
  const [printPage, setPrintPage] = React.useState<"all" | 1 | 2 | "annexSellers" | "annexBuyers">(
    "all",
  );

  // Screen split view mode on desktop
  const [viewMode, setViewMode] = React.useState<"split" | "form" | "preview">("split");

  // Accordion state for sellers & buyers
  const [openSellerMap, setOpenSellerMap] = React.useState<Record<number, boolean>>({ 0: true });
  const [openBuyerMap, setOpenBuyerMap] = React.useState<Record<number, boolean>>({ 0: true });

  // Saved records Dialog
  const [isDbListOpen, setIsDbListOpen] = React.useState(false);
  const [dbList, setDbList] = React.useState<TransferApplication[]>([]);
  const [searchFilter, setSearchFilter] = React.useState("");

  /* ────────────────── Hydration & Autosave ────────────────── */

  React.useEffect(() => {
    try {
      const draft = loadTransferDraft();
      setData(draft);
    } catch (e) {
      console.warn("Failed to load draft:", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    saveTransferDraft(data);
  }, [data, hydrated]);

  /* ────────────────── Step 1 Helpers ────────────────── */

  const updateParcelAndProperty = (patch: Partial<TransferApplication["parcel_and_property"]>) => {
    setData((prev) => {
      const current = prev.parcel_and_property;
      const updated = { ...current, ...patch };

      if (
        patch.streetNo !== undefined ||
        patch.village !== undefined ||
        patch.sangkat !== undefined ||
        patch.khan !== undefined ||
        patch.city !== undefined
      ) {
        const parts = [
          updated.city || "រាជធានីភ្នំពេញ",
          updated.khan ? `ខណ្ឌ${updated.khan}` : "",
          updated.sangkat ? `សង្កាត់${updated.sangkat}` : "",
          updated.village ? `ភូមិ${updated.village}` : "",
          updated.streetNo ? `ផ្លូវលេខ ${updated.streetNo}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        updated.location = parts;
      }

      return { ...prev, parcel_and_property: updated };
    });
  };

  const updateCharacteristics = (
    patch: Partial<TransferApplication["parcel_and_property"]["property_characteristics"]>,
  ) => {
    setData((prev) => ({
      ...prev,
      parcel_and_property: {
        ...prev.parcel_and_property,
        property_characteristics: {
          ...prev.parcel_and_property.property_characteristics,
          ...patch,
        },
      },
    }));
  };

  const updateBoundaries = (
    patch: Partial<TransferApplication["parcel_and_property"]["boundaries"]>,
  ) => {
    setData((prev) => ({
      ...prev,
      parcel_and_property: {
        ...prev.parcel_and_property,
        boundaries: {
          ...prev.parcel_and_property.boundaries,
          ...patch,
        },
      },
    }));
  };

  /* ────────────────── Step 2 Helpers (Sellers) ────────────────── */

  const addSeller = () => {
    if (data.sellers.length >= MAX_PARTIES) {
      toast.error(`អាចបន្ថែមបានអតិបរមាត្រឹម ${MAX_PARTIES} នាក់`);
      return;
    }
    const newSeller = emptySellerParty();
    if (data.sellers[0]?.husband.current_address) {
      newSeller.husband.current_address = data.sellers[0].husband.current_address;
      newSeller.wife.current_address = data.sellers[0].husband.current_address;
      newSeller.person.current_address = data.sellers[0].husband.current_address;
    }
    const nextIdx = data.sellers.length;
    setData((prev) => ({ ...prev, sellers: [...prev.sellers, newSeller] }));
    setOpenSellerMap((prev) => ({ ...prev, [nextIdx]: true }));
    toast.success(`បានបន្ថែមអ្នកលក់ទី ${kh(nextIdx + 1)}`);
  };

  const removeSeller = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.sellers.length <= 1) {
      toast.error("ត្រូវមានអ្នកលក់យ៉ាងហោចណាស់ ១ នាក់");
      return;
    }
    setData((prev) => ({
      ...prev,
      sellers: prev.sellers.filter((_, i) => i !== idx),
    }));
    toast.info("បានដកចេញ");
  };

  const patchSeller = (idx: number, patch: Partial<SellerParty>) => {
    setData((prev) => ({
      ...prev,
      sellers: prev.sellers.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  };

  /* ────────────────── Step 3 Helpers (Buyers) ────────────────── */

  const addBuyer = () => {
    if (data.buyers.length >= MAX_PARTIES) {
      toast.error(`អាចបន្ថែមបានអតិបរមាត្រឹម ${MAX_PARTIES} នាក់`);
      return;
    }
    const newBuyer = emptyBuyerParty();
    if (data.buyers[0]?.person.current_address) {
      newBuyer.person.current_address = data.buyers[0].person.current_address;
      newBuyer.husband.current_address = data.buyers[0].person.current_address;
      newBuyer.wife.current_address = data.buyers[0].person.current_address;
    }
    const nextIdx = data.buyers.length;
    setData((prev) => ({ ...prev, buyers: [...prev.buyers, newBuyer] }));
    setOpenBuyerMap((prev) => ({ ...prev, [nextIdx]: true }));
    toast.success(`បានបន្ថែមអ្នកទិញទី ${kh(nextIdx + 1)}`);
  };

  const removeBuyer = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.buyers.length <= 1) {
      toast.error("ត្រូវមានអ្នកទិញយ៉ាងហោចណាស់ ១ នាក់");
      return;
    }
    setData((prev) => ({
      ...prev,
      buyers: prev.buyers.filter((_, i) => i !== idx),
    }));
    toast.info("បានដកចេញ");
  };

  const patchBuyer = (idx: number, patch: Partial<BuyerParty>) => {
    setData((prev) => ({
      ...prev,
      buyers: prev.buyers.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }));
  };

  /* ────────────────── Step 4 Helpers (Witnesses) ────────────────── */

  const patchWitness = (idx: 0 | 1, patch: Partial<WitnessData>) => {
    setData((prev) => {
      const next: [WitnessData, WitnessData] = [...prev.witnesses];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, witnesses: next };
    });
  };

  const copyWitnessAddress = () => {
    const w1Addr = data.witnesses[0]?.residence_address;
    if (!w1Addr) {
      toast.error("សូមបញ្ចូលអាសយដ្ឋានសាក្សីទី ១ ជាមុនសិន");
      return;
    }
    patchWitness(1, { residence_address: w1Addr });
    toast.success("បានចម្លងអាសយដ្ឋានសាក្សីទី ១ ទៅសាក្សីទី ២");
  };

  /* ────────────────── Actions ────────────────── */

  const handleSave = async () => {
    setSaving(true);
    try {
      const title =
        data.title?.trim() ||
        (data.parcel_and_property.parcel_number
          ? `ពាក្យសុំផ្ទេរ-ក្បាលដី ${data.parcel_and_property.parcel_number}`
          : `ពាក្យសុំផ្ទេរ-${new Date().toLocaleDateString("km-KH")}`);

      let res: TransferApplication;
      if (data.id) {
        res = await transferApplicationApi.update(data.id, {
          ...data,
          title,
        });
        toast.success("បានធ្វើបច្ចុប្បន្នភាពពាក្យសុំជោគជ័យ");
      } else {
        res = await transferApplicationApi.create({
          ...data,
          title,
        });
        setData(res);
        toast.success("បានរក្សាទុកពាក្យសុំថ្មីជោគជ័យ");
      }
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការរក្សាទុក");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    if (confirm("តើអ្នកពិតជាចង់បង្កើតពាក្យសុំថ្មីមែនទេ? ទិន្នន័យចាស់នឹងត្រូវជម្រះ។")) {
      const fresh = emptyTransferApplication();
      setData(fresh);
      saveTransferDraft(fresh);
      setActiveStep(1);
      toast.info("បានបង្កើតទម្រង់ថ្មី");
    }
  };

  const handleSample = () => {
    const sample = createSampleTransferApplication();
    setData(sample);
    saveTransferDraft(sample);
    toast.success("បានផ្ទុកទិន្នន័យគំរូសាកល្បង");
  };

  const handleOpenList = async () => {
    try {
      const res = await transferApplicationApi.list();
      setDbList(res.data);
      setIsDbListOpen(true);
    } catch {
      toast.error("មិនអាចទាញយកបញ្ជីដែលបានរក្សាទុក");
    }
  };

  const handleLoadRecord = (item: TransferApplication) => {
    setData(item);
    saveTransferDraft(item);
    setIsDbListOpen(false);
    toast.success(`បានបើក "${item.title || "ពាក្យសុំ"}"`);
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("តើអ្នកពិតជាចង់លុបពាក្យសុំនេះមែនទេ?")) return;
    try {
      await transferApplicationApi.remove(id);
      setDbList((prev) => prev.filter((r) => r.id !== id));
      if (data.id === id) {
        setData((prev) => ({ ...prev, id: undefined }));
      }
      toast.success("បានលុបរួចរាល់");
    } catch {
      toast.error("បរាជ័យក្នុងការលុប");
    }
  };

  const handlePrint = () => {
    printCleanDocument("printable-document", "ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ");
  };

  /* ────────────────── Step Validation ────────────────── */

  const isStep1Done = Boolean(data.parcel_and_property.parcel_number);
  const isStep2Done = Boolean(
    data.sellers[0]?.husband.full_name ||
      data.sellers[0]?.person.full_name ||
      data.sellers[0]?.legal_entity.entity_name,
  );
  const isStep3Done = Boolean(
    data.buyers[0]?.person.full_name ||
      data.buyers[0]?.husband.full_name ||
      data.buyers[0]?.legal_entity.entity_name,
  );
  const isStep4Done = Boolean(data.witnesses[0]?.full_name);

  const filteredRecords = dbList.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const title = (item.title || "").toLowerCase();
    const deed = (item.parcel_and_property.parcel_number || "").toLowerCase();
    const loc = (item.parcel_and_property.location || "").toLowerCase();
    return title.includes(q) || deed.includes(q) || loc.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* ═════════════════════ Top Toolbar ═════════════════════ */}
      <div className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-border/70 bg-background/95 p-3 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileTextIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ (Transfer Application)</span>
              {data.parcel_and_property.parcel_number && (
                <Badge variant="outline" className="text-[11px] font-mono">
                  {data.parcel_and_property.parcel_number}
                </Badge>
              )}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              លំហូរការងារ ៤ ជំហាន ៖ ក្បាលដី & ទ្រព្យ, អ្នកលក់ (១-១០), អ្នកទិញ (១-១០) និងសាក្សី
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSample}
            className="h-8 gap-1 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
            title="ផ្ទុកទិន្នន័យគំរូសាកល្បង"
          >
            <SparklesIcon className="size-3.5 text-amber-500" />
            <span className="hidden sm:inline">ទិន្នន័យគំរូ</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNew}
            className="h-8 gap-1 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RotateCcwIcon className="size-3.5" />
            <span className="hidden sm:inline">ថ្មី</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenList}
            className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <FolderOpenIcon className="size-3.5 text-blue-600" />
            <span>បញ្ជីរក្សាទុក</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90"
          >
            <SaveIcon className="size-3.5" />
            <span>{data.id ? "កែប្រែ" : "រក្សាទុក"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <PrinterIcon className="size-3.5" />
            <span>បោះពុម្ព</span>
          </Button>
        </div>
      </div>

      {/* ═════════════════════ View Controls & Tabs ═════════════════════ */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        {/* Page Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setPrintPage("all")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              printPage === "all"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            ទំព័រទាំងអស់
          </button>
          <button
            type="button"
            onClick={() => setPrintPage(1)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              printPage === 1
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            ទំព័រទី ១
          </button>
          <button
            type="button"
            onClick={() => setPrintPage(2)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              printPage === 2
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            ទំព័រទី ២
          </button>
          <button
            type="button"
            onClick={() => setPrintPage("annexBuyers")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1",
              printPage === "annexBuyers"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>ឧបសម្ព័ន្ធអ្នកទិញ</span>
            {data.buyers.length > 1 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {kh(data.buyers.length)}
              </Badge>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPrintPage("annexSellers")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1",
              printPage === "annexSellers"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>ឧបសម្ព័ន្ធអ្នកលក់</span>
            {data.sellers.length > 1 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {kh(data.sellers.length)}
              </Badge>
            )}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
          <span className="mr-1">ទិដ្ឋភាព ៖</span>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "split" ? "secondary" : "ghost"}
            onClick={() => setViewMode("split")}
            className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
          >
            ទន្ទឹមគ្នា (Split)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "form" ? "secondary" : "ghost"}
            onClick={() => setViewMode("form")}
            className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
          >
            ទម្រង់បញ្ចូល (Form)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            onClick={() => setViewMode("preview")}
            className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
          >
            មើលគំរូ A4 (Preview)
          </Button>
        </div>
      </div>

      {/* ═════════════════════ Main Grid ═════════════════════ */}
      <div
        className={cn(
          "grid gap-6 items-start",
          viewMode === "split"
            ? "grid-cols-1 lg:grid-cols-12"
            : viewMode === "form"
            ? "grid-cols-1 max-w-4xl mx-auto"
            : "grid-cols-1",
        )}
      >
        {/* ───────────── Left: Stepper Input Form ───────────── */}
        {viewMode !== "preview" && (
          <div
            className={cn(
              "no-print space-y-4",
              viewMode === "split" ? "lg:col-span-5 xl:col-span-5" : "w-full",
            )}
          >
            {/* Clickable Stepper (I, II, III, IV) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  step: 1 as const,
                  label: "I",
                  title: "ក្បាលដី & ទ្រព្យ",
                  isDone: isStep1Done,
                  icon: MapPinIcon,
                },
                {
                  step: 2 as const,
                  label: "II",
                  title: `អ្នកលក់ (${kh(data.sellers.length)})`,
                  isDone: isStep2Done,
                  icon: ShoppingBagIcon,
                },
                {
                  step: 3 as const,
                  label: "III",
                  title: `អ្នកទិញ (${kh(data.buyers.length)})`,
                  isDone: isStep3Done,
                  icon: UserCheckIcon,
                },
                {
                  step: 4 as const,
                  label: "IV",
                  title: "សាក្សី & ពិនិត្យ",
                  isDone: isStep4Done,
                  icon: UsersIcon,
                },
              ].map((s) => {
                const isActive = activeStep === s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(s.step)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      isActive
                        ? "border-primary bg-primary/5 text-foreground shadow-xs font-semibold ring-1 ring-primary/20"
                        : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : s.isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {s.isDone && !isActive ? <CheckIcon className="size-3.5" /> : s.label}
                    </span>
                    <div className="truncate">
                      <span className="block text-xs truncate">{s.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stepper Content */}
            <div className="space-y-4">
              {/* ──── STEP I: PARCEL & PROPERTY ──── */}
              {activeStep === 1 && (
                <Card className="rounded-2xl border-border/80 shadow-2xs">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPinIcon className="size-4 text-primary" />
                      ជំហានទី ១ ៖ ព័ត៌មានក្បាលដី និងលក្ខណៈសម្បត្តិទ្រព្យ
                    </CardTitle>
                    <CardDescription className="text-xs">
                      បញ្ចូលលេខក្បាលដី ទីតាំង ប្រភេទទ្រព្យ ក្រឡាផ្ទៃ និងព្រំប្រទល់ ៤ ទិស
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Parcel Details */}
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                        ព័ត៌មានក្បាលដី (Parcel Details)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field
                          label="លេខក្បាលដី (Parcel Number)"
                          value={data.parcel_and_property.parcel_number}
                          onChange={(v) => updateParcelAndProperty({ parcel_number: v })}
                          placeholder="ឧ. 12050605-4575"
                          required
                        />
                        <Field
                          label="កាលបរិច្ឆេទចុះបញ្ជី (Registration Date)"
                          type="date"
                          value={data.parcel_and_property.registration_date}
                          onChange={(v) => updateParcelAndProperty({ registration_date: v })}
                        />
                        <Field
                          label="ផ្លូវលេខ"
                          value={data.parcel_and_property.streetNo}
                          onChange={(v) => updateParcelAndProperty({ streetNo: v })}
                          placeholder="២១៧"
                        />
                        <Field
                          label="ភូមិ"
                          value={data.parcel_and_property.village}
                          onChange={(v) => updateParcelAndProperty({ village: v })}
                          placeholder="ត្រពាំងថ្លឹង១"
                        />
                        <Field
                          label="សង្កាត់/ឃុំ"
                          value={data.parcel_and_property.sangkat}
                          onChange={(v) => updateParcelAndProperty({ sangkat: v })}
                          placeholder="ចោមចៅទី១"
                        />
                        <Field
                          label="ខណ្ឌ/ស្រុក"
                          value={data.parcel_and_property.khan}
                          onChange={(v) => updateParcelAndProperty({ khan: v })}
                          placeholder="ពោធិ៍សែនជ័យ"
                        />
                        <Field
                          label="រាជធានី/ខេត្ត"
                          value={data.parcel_and_property.city}
                          onChange={(v) => updateParcelAndProperty({ city: v })}
                          placeholder="រាជធានីភ្នំពេញ"
                        />
                        <Field
                          label="កាលបរិច្ឆេទពាក្យសុំ (dd.mm.yyyy)"
                          value={data.date}
                          onChange={(v) => setData((p) => ({ ...p, date: v }))}
                          placeholder="06.11.2026"
                        />
                        <Field
                          label="ទីតាំងក្បាលដីពេញលេញ (Location Auto-Composed)"
                          value={data.parcel_and_property.location}
                          onChange={(v) => updateParcelAndProperty({ location: v })}
                          placeholder="ទីតាំងក្បាលដី..."
                          className="sm:col-span-2"
                        />
                      </div>
                    </div>

                    {/* Property Characteristics */}
                    <div className="space-y-3 pt-3 border-t">
                      <span className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                        ព័ត៌មានទ្រព្យ (Property Characteristics)
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        <Field
                          label="ក្រឡាផ្ទៃ / ទំហំ (Size)"
                          value={data.parcel_and_property.property_characteristics.size}
                          onChange={(v) => updateCharacteristics({ size: v })}
                          placeholder="ឧ. 157 m²"
                          required
                        />

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-foreground/80">
                            រូបភាពប្រើប្រាស់ដី (Land Use)
                          </Label>
                          <select
                            value={
                              data.parcel_and_property.property_characteristics.land_use_type
                            }
                            onChange={(e) =>
                              updateCharacteristics({ land_use_type: e.target.value })
                            }
                            className="h-9 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
                          >
                            {LAND_USE_TYPES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-foreground/80">
                            លក្ខណៈនៃការប្រើប្រាស់ (Usage Nature)
                          </Label>
                          <select
                            value={data.parcel_and_property.property_characteristics.usage_nature}
                            onChange={(e) =>
                              updateCharacteristics({ usage_nature: e.target.value })
                            }
                            className="h-9 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
                          >
                            {USAGE_NATURES.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-foreground/80">
                            ប្រភពនៃការកាន់កាប់ (Source)
                          </Label>
                          <select
                            value={
                              data.parcel_and_property.property_characteristics
                                .source_of_acquisition
                            }
                            onChange={(e) =>
                              updateCharacteristics({ source_of_acquisition: e.target.value })
                            }
                            className="h-9 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
                          >
                            {POSSESSION_SOURCES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Field
                          label="ឆ្នាំកាន់កាប់ (Acquisition Year)"
                          value={
                            data.parcel_and_property.property_characteristics.acquisition_year
                          }
                          onChange={(v) => updateCharacteristics({ acquisition_year: v })}
                          placeholder="2005"
                        />
                      </div>
                    </div>

                    {/* Boundaries */}
                    <div className="space-y-3 pt-3 border-t">
                      <span className="text-xs font-semibold text-foreground block uppercase tracking-wider flex items-center gap-1.5">
                        <CompassIcon className="size-3.5 text-primary" />
                        ព័ត៌មានព្រំប្រទល់ ៤ ទិស (Boundaries)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field
                          label="ខាងជើង (North)"
                          value={data.parcel_and_property.boundaries.north}
                          onChange={(v) => updateBoundaries({ north: v })}
                          placeholder="ឧ. ដីឡូត៍លេខ..."
                        />
                        <Field
                          label="ខាងត្បូង (South)"
                          value={data.parcel_and_property.boundaries.south}
                          onChange={(v) => updateBoundaries({ south: v })}
                          placeholder="ឧ. ដីឡូត៍លេខ..."
                        />
                        <Field
                          label="ខាងកើត (East)"
                          value={data.parcel_and_property.boundaries.east}
                          onChange={(v) => updateBoundaries({ east: v })}
                          placeholder="ឧ. ផ្លូវលេខ..."
                        />
                        <Field
                          label="ខាងលិច (West)"
                          value={data.parcel_and_property.boundaries.west}
                          onChange={(v) => updateBoundaries({ west: v })}
                          placeholder="ឧ. ដីឡូត៍លេខ..."
                        />
                      </div>
                    </div>

                    {/* Transfer Purpose & Causes */}
                    <div className="space-y-3 pt-3 border-t">
                      <Label className="text-xs font-semibold text-foreground">
                        ក- គោលបំណងនៃការផ្ទេរ (Purpose)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PURPOSES.map((pur) => {
                          const isSelected = data.purpose === pur.key;
                          return (
                            <button
                              key={pur.key}
                              type="button"
                              onClick={() => setData((p) => ({ ...p, purpose: pur.key }))}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                                  : "border-border/70 hover:bg-muted/40 text-foreground/80",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-muted-foreground/40",
                                )}
                              >
                                {isSelected && "✓"}
                              </span>
                              <span className="leading-tight">{pur.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Co-owner fields if coWhole or coPart */}
                      {(data.purpose === "coWhole" || data.purpose === "coPart") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/70 mt-2">
                          <Field
                            label="ឈ្មោះម្ចាស់កម្មសិទ្ធិអវិភាគ"
                            value={data.coOwnerName}
                            onChange={(v) => setData((p) => ({ ...p, coOwnerName: v }))}
                            placeholder="ឈ្មោះម្ចាស់កម្មសិទ្ធិអវិភាគ"
                          />
                          <Field
                            label="នៃលេខ (ចំណែក)"
                            value={data.coOwnerNo}
                            onChange={(v) => setData((p) => ({ ...p, coOwnerNo: v }))}
                            placeholder="ឧ. ០១"
                          />
                        </div>
                      )}
                    </div>

                    {/* Cause */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs font-semibold text-foreground">
                        ខ- មូលហេតុផ្ទេរ (Cause of Transfer)
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CAUSES.map((cau) => {
                          const isSelected = data.cause === cau.key;
                          return (
                            <button
                              key={cau.key}
                              type="button"
                              onClick={() => setData((p) => ({ ...p, cause: cau.key }))}
                              className={cn(
                                "flex items-center gap-1.5 p-2 rounded-xl border text-xs text-left transition-all cursor-pointer",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                                  : "border-border/70 hover:bg-muted/40 text-foreground/80",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-3.5 shrink-0 items-center justify-center rounded-full border text-[9px]",
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-muted-foreground/40",
                                )}
                              >
                                {isSelected && "✓"}
                              </span>
                              <span className="truncate">{cau.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {data.cause === "other" && (
                          <Field
                            label="បញ្ជាក់មូលហេតុផ្សេងៗ"
                            value={data.causeOther}
                            onChange={(v) => setData((p) => ({ ...p, causeOther: v }))}
                            placeholder="បញ្ជាក់មូលហេតុ..."
                          />
                        )}
                        <Field
                          label="កាលបរិច្ឆេទនៃមូលហេតុ (dd.mm.yyyy)"
                          value={data.causeDate}
                          onChange={(v) => setData((p) => ({ ...p, causeDate: v }))}
                          placeholder="06.11.2026"
                        />
                        <Field
                          label="ចំណែកកម្មសិទ្ធិអវិភាគថ្មី (ឃ)"
                          value={data.newCoOwnerShare}
                          onChange={(v) => setData((p) => ({ ...p, newCoOwnerShare: v }))}
                          placeholder="ឧ. ១/២ ឬ ២០%"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ──── STEP II: SELLERS PARTY ──── */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBagIcon className="size-4 text-amber-600" />
                      <h3 className="text-sm font-semibold text-foreground">
                        ជំហានទី ២ ៖ ភាគីអ្នកលក់ (Seller Party)
                      </h3>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                        {kh(data.sellers.length)}/{kh(MAX_PARTIES)} នាក់
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addSeller}
                      disabled={data.sellers.length >= MAX_PARTIES}
                      className="h-8 rounded-xl text-xs gap-1 border-dashed border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer"
                    >
                      <PlusIcon className="size-3.5" />
                      <span>បន្ថែមអ្នកលក់</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {data.sellers.map((seller, idx) => {
                      const isOpen = Boolean(openSellerMap[idx]);
                      const displayName =
                        seller.seller_type === "LEGAL_ENTITY"
                          ? seller.legal_entity.entity_name || `ក្រុមហ៊ុនអ្នកលក់ទី ${idx + 1}`
                          : seller.property_classification === "ទ្រព្យរួមប្តីប្រពន្ធ"
                          ? seller.husband.full_name
                            ? `${seller.husband.full_name} & ${seller.wife.full_name || "ប្រពន្ធ"}`
                            : `អ្នកលក់ (ប្តីប្រពន្ធ) ទី ${idx + 1}`
                          : seller.person.full_name ||
                            seller.husband.full_name ||
                            `អ្នកលក់ទី ${idx + 1}`;

                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden transition-all"
                        >
                          <div
                            onClick={() =>
                              setOpenSellerMap((prev) => ({
                                ...prev,
                                [idx]: !prev[idx],
                              }))
                            }
                            className="flex items-center justify-between p-3.5 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white shadow-2xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {displayName}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {seller.seller_type === "LEGAL_ENTITY"
                                  ? "នីតិបុគ្គល"
                                  : "រូបវន្តបុគ្គល"}
                              </Badge>
                              {seller.seller_type === "INDIVIDUAL" && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {seller.property_classification}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {data.sellers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => removeSeller(idx, e)}
                                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="ដកចេញ"
                                >
                                  <Trash2Icon className="size-3.5" />
                                </Button>
                              )}
                              {isOpen ? (
                                <ChevronUpIcon className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDownIcon className="size-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {isOpen && (
                            <div className="p-4 space-y-4 border-t border-border/60">
                              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-2 rounded-xl">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      patchSeller(idx, { seller_type: "INDIVIDUAL" })
                                    }
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                      seller.seller_type === "INDIVIDUAL"
                                        ? "bg-background text-foreground shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground",
                                    )}
                                  >
                                    រូបវន្តបុគ្គល (Individual)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      patchSeller(idx, { seller_type: "LEGAL_ENTITY" })
                                    }
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                      seller.seller_type === "LEGAL_ENTITY"
                                        ? "bg-background text-foreground shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground",
                                    )}
                                  >
                                    នីតិបុគ្គល/ក្រុមហ៊ុន (Legal Entity)
                                  </button>
                                </div>
                              </div>

                              {seller.seller_type === "INDIVIDUAL" ? (
                                <div className="space-y-3">
                                  <PropertyTypeCombobox
                                    value={seller.property_classification}
                                    onChange={(val) =>
                                      patchSeller(idx, {
                                        property_classification: val,
                                        marital_status:
                                          val === "ទ្រព្យរួមប្តីប្រពន្ធ"
                                            ? "MARRIED"
                                            : "SINGLE",
                                      })
                                    }
                                    label="ជ្រើសរើសប្រភេទទ្រព្យ"
                                    placeholder="ជ្រើសរើស ឬស្វែងរកប្រភេទទ្រព្យ..."
                                  />

                                  {seller.property_classification === "ទ្រព្យរួមប្តីប្រពន្ធ" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                      <PersonCard
                                        title="ប្ដី (Husband)"
                                        badgeText="ប្ដី"
                                        badgeColor="bg-blue-600 text-white"
                                        person={seller.husband}
                                        onChange={(p) => patchSeller(idx, { husband: p })}
                                      />
                                      <PersonCard
                                        title="ប្រពន្ធ (Wife)"
                                        badgeText="ប្រពន្ធ"
                                        badgeColor="bg-pink-600 text-white"
                                        person={seller.wife}
                                        onChange={(p) => patchSeller(idx, { wife: p })}
                                        onCopyAddress={() => {
                                          if (seller.husband.current_address) {
                                            patchSeller(idx, {
                                              wife: {
                                                ...seller.wife,
                                                current_address:
                                                  seller.husband.current_address,
                                              },
                                            });
                                            toast.success("បានចម្លងអាសយដ្ឋានពីប្ដី");
                                          } else {
                                            toast.error("សូមបញ្ចូលអាសយដ្ឋានប្ដីជាមុនសិន");
                                          }
                                        }}
                                        copyAddressLabel="ចម្លងអាសយដ្ឋានពីប្ដី"
                                      />
                                    </div>
                                  ) : (
                                    <div className="pt-1">
                                      <PersonCard
                                        title={`ព័ត៌មានអ្នកលក់ (${seller.property_classification})`}
                                        badgeText="ម្ចាស់កម្មសិទ្ធិទោល"
                                        badgeColor="bg-amber-600 text-white"
                                        person={
                                          seller.person.full_name
                                            ? seller.person
                                            : seller.husband
                                        }
                                        onChange={(p) =>
                                          patchSeller(idx, {
                                            person: p,
                                            husband: p,
                                          })
                                        }
                                        showGenderSelect
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <LegalEntityCard
                                  entity={seller.legal_entity}
                                  onChange={(e) => patchSeller(idx, { legal_entity: e })}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ──── STEP III: BUYERS PARTY ──── */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <UserCheckIcon className="size-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-foreground">
                        ជំហានទី ៣ ៖ ភាគីអ្នកទិញ (Buyer Party)
                      </h3>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                        {kh(data.buyers.length)}/{kh(MAX_PARTIES)} នាក់
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addBuyer}
                      disabled={data.buyers.length >= MAX_PARTIES}
                      className="h-8 rounded-xl text-xs gap-1 border-dashed border-blue-300 text-blue-800 hover:bg-blue-50 cursor-pointer"
                    >
                      <PlusIcon className="size-3.5" />
                      <span>បន្ថែមអ្នកទិញ</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {data.buyers.map((buyer, idx) => {
                      const isOpen = Boolean(openBuyerMap[idx]);
                      const displayName =
                        buyer.buyer_type === "LEGAL_ENTITY"
                          ? buyer.legal_entity.entity_name || `ក្រុមហ៊ុនអ្នកទិញទី ${idx + 1}`
                          : buyer.property_classification === "ទ្រព្យរួមប្តីប្រពន្ធ"
                          ? buyer.husband.full_name
                            ? `${buyer.husband.full_name} & ${buyer.wife.full_name || "ប្រពន្ធ"}`
                            : `អ្នកទិញ (ប្តីប្រពន្ធ) ទី ${idx + 1}`
                          : buyer.person.full_name ||
                            buyer.husband.full_name ||
                            `អ្នកទិញ (${buyer.property_classification || "ទោល"}) ទី ${idx + 1}`;

                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden transition-all"
                        >
                          <div
                            onClick={() =>
                              setOpenBuyerMap((prev) => ({
                                ...prev,
                                [idx]: !prev[idx],
                              }))
                            }
                            className="flex items-center justify-between p-3.5 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-2xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {displayName}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {buyer.buyer_type === "LEGAL_ENTITY"
                                  ? "នីតិបុគ្គល"
                                  : "រូបវន្តបុគ្គល"}
                              </Badge>
                              {buyer.buyer_type === "INDIVIDUAL" && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {buyer.property_classification || "ទ្រព្យរួមប្តីប្រពន្ធ"}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {data.buyers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => removeBuyer(idx, e)}
                                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="ដកចេញ"
                                >
                                  <Trash2Icon className="size-3.5" />
                                </Button>
                              )}
                              {isOpen ? (
                                <ChevronUpIcon className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDownIcon className="size-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {isOpen && (
                            <div className="p-4 space-y-4 border-t border-border/60">
                              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-2 rounded-xl">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      patchBuyer(idx, { buyer_type: "INDIVIDUAL" })
                                    }
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                      buyer.buyer_type === "INDIVIDUAL"
                                        ? "bg-background text-foreground shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground",
                                    )}
                                  >
                                    រូបវន្តបុគ្គល (Individual)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      patchBuyer(idx, { buyer_type: "LEGAL_ENTITY" })
                                    }
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                      buyer.buyer_type === "LEGAL_ENTITY"
                                        ? "bg-background text-foreground shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground",
                                    )}
                                  >
                                    នីតិបុគ្គល/ក្រុមហ៊ុន (Legal Entity)
                                  </button>
                                </div>
                              </div>

                              {buyer.buyer_type === "INDIVIDUAL" ? (
                                <div className="space-y-3">
                                  <PropertyTypeCombobox
                                    value={buyer.property_classification}
                                    onChange={(val) =>
                                      patchBuyer(idx, {
                                        property_classification: val,
                                        marital_status:
                                          val === "ទ្រព្យរួមប្តីប្រពន្ធ"
                                            ? "MARRIED"
                                            : "SINGLE",
                                      })
                                    }
                                    label="ជ្រើសរើសប្រភេទទ្រព្យ"
                                    placeholder="ជ្រើសរើស ឬស្វែងរកប្រភេទទ្រព្យ..."
                                  />

                                  {buyer.property_classification === "ទ្រព្យរួមប្តីប្រពន្ធ" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                      <PersonCard
                                        title="ប្ដី (Husband)"
                                        badgeText="ប្ដី"
                                        badgeColor="bg-blue-600 text-white"
                                        person={buyer.husband}
                                        onChange={(p) => patchBuyer(idx, { husband: p })}
                                      />
                                      <PersonCard
                                        title="ប្រពន្ធ (Wife)"
                                        badgeText="ប្រពន្ធ"
                                        badgeColor="bg-pink-600 text-white"
                                        person={buyer.wife}
                                        onChange={(p) => patchBuyer(idx, { wife: p })}
                                        onCopyAddress={() => {
                                          if (buyer.husband.current_address) {
                                            patchBuyer(idx, {
                                              wife: {
                                                ...buyer.wife,
                                                current_address:
                                                  buyer.husband.current_address,
                                              },
                                            });
                                            toast.success("បានចម្លងអាសយដ្ឋានពីប្ដី");
                                          } else {
                                            toast.error("សូមបញ្ចូលអាសយដ្ឋានប្ដីជាមុនសិន");
                                          }
                                        }}
                                        copyAddressLabel="ចម្លងអាសយដ្ឋានពីប្ដី"
                                      />
                                    </div>
                                  ) : (
                                    <div className="pt-1">
                                      <PersonCard
                                        title={`ព័ត៌មានអ្នកទិញ (${buyer.property_classification})`}
                                        badgeText="ម្ចាស់កម្មសិទ្ធិទោល"
                                        badgeColor="bg-blue-600 text-white"
                                        person={
                                          buyer.person.full_name
                                            ? buyer.person
                                            : buyer.husband
                                        }
                                        onChange={(p) =>
                                          patchBuyer(idx, {
                                            person: p,
                                            husband: p,
                                          })
                                        }
                                        showGenderSelect
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <LegalEntityCard
                                  entity={buyer.legal_entity}
                                  onChange={(e) => patchBuyer(idx, { legal_entity: e })}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ──── STEP IV: WITNESSES & SUMMARY ──── */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <Card className="rounded-2xl border-border/80 shadow-2xs">
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <UsersIcon className="size-4 text-purple-600" />
                            ជំហានទី ៤ ៖ សាក្សីចំនួន ២ នាក់ (Witnesses)
                          </CardTitle>
                          <CardDescription className="text-xs">
                            បានអានសេចក្តីនៃលិខិតនេះឱ្យគូភាគីស្តាប់ចំពោះមុខ
                          </CardDescription>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={copyWitnessAddress}
                          className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                        >
                          <CopyIcon className="size-3" />
                          <span>ចម្លងអាសយដ្ឋានសាក្សីទី១ ទៅសាក្សីទី២</span>
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Witness 1 */}
                        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
                          <div className="flex items-center gap-2 border-b pb-1.5">
                            <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                              ១
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              សាក្សីទី ១ (Witness 1)
                            </span>
                            <Badge variant="outline" className="text-[10px] ml-auto">
                              សាក្សី
                            </Badge>
                          </div>

                          <Field
                            label="ឈ្មោះពេញ (Full Name) *"
                            value={data.witnesses[0]?.full_name}
                            onChange={(v) => patchWitness(0, { full_name: v })}
                            placeholder="ឧ. ឡឺក សុជា"
                            required
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <Field
                              label="លេខអត្តសញ្ញាណប័ណ្ណ"
                              value={data.witnesses[0]?.id_card_number}
                              onChange={(v) => patchWitness(0, { id_card_number: v })}
                              placeholder="090 203 564 (01)"
                            />
                            <Field
                              label="ថ្ងៃខែឆ្នាំកំណើត / អាយុ"
                              value={data.witnesses[0]?.dob_or_age}
                              onChange={(v) => patchWitness(0, { dob_or_age: v })}
                              placeholder="2004-10-23"
                            />
                          </div>

                          <Field
                            label="ទីលំនៅ / អាសយដ្ឋានបច្ចុប្បន្ន"
                            value={data.witnesses[0]?.residence_address}
                            onChange={(v) => patchWitness(0, { residence_address: v })}
                            placeholder="១ឃុំ ចក្រី ស្រុក រមាសហែក ខេត្ត ស្វាយរៀង"
                          />
                        </div>

                        {/* Witness 2 */}
                        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
                          <div className="flex items-center gap-2 border-b pb-1.5">
                            <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                              ២
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              សាក្សីទី ២ (Witness 2)
                            </span>
                            <Badge variant="outline" className="text-[10px] ml-auto">
                              សាក្សី
                            </Badge>
                          </div>

                          <Field
                            label="ឈ្មោះពេញ (Full Name) *"
                            value={data.witnesses[1]?.full_name}
                            onChange={(v) => patchWitness(1, { full_name: v })}
                            placeholder="ឧ. ទន់ សុភាព"
                            required
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <Field
                              label="លេខអត្តសញ្ញាណប័ណ្ណ"
                              value={data.witnesses[1]?.id_card_number}
                              onChange={(v) => patchWitness(1, { id_card_number: v })}
                              placeholder="090 455 823 (02)"
                            />
                            <Field
                              label="ថ្ងៃខែឆ្នាំកំណើត / អាយុ"
                              value={data.witnesses[1]?.dob_or_age}
                              onChange={(v) => patchWitness(1, { dob_or_age: v })}
                              placeholder="1980-10-23"
                            />
                          </div>

                          <Field
                            label="ទីលំនៅ / អាសយដ្ឋានបច្ចុប្បន្ន"
                            value={data.witnesses[1]?.residence_address}
                            onChange={(v) => patchWitness(1, { residence_address: v })}
                            placeholder="ភូមិព្រែកតាគង់ សង្កាត់ចាក់អង្រែលើ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ"
                          />
                        </div>
                      </div>

                      {/* Attachments */}
                      <div className="pt-2 border-t space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">
                          ឯកសារភ្ជាប់ (Attachments)
                        </Label>
                        <Input
                          value={data.attachments}
                          onChange={(e) => setData((p) => ({ ...p, attachments: e.target.value }))}
                          placeholder="ឧ. វិញ្ញាបនប័ត្រសម្គាល់ម្ចាស់អចលនវត្ថុ, អត្តសញ្ញាណប័ណ្ណ, សៀវភៅគ្រួសារ..."
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary Review Card */}
                  <Card className="rounded-2xl border-border/80 bg-muted/20 shadow-2xs">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <LayersIcon className="size-4 text-emerald-600" />
                        សង្ខេបព័ត៌មានពាក្យសុំផ្ទេរកម្មសិទ្ធិ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-card p-3 rounded-xl border">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">លេខក្បាលដី ៖</span>
                          <span className="font-semibold text-foreground font-mono">
                            {data.parcel_and_property.parcel_number || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">ប្រភេទទ្រព្យ ៖</span>
                          <span className="font-semibold text-foreground">
                            {data.parcel_and_property.property_characteristics.property_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">ក្រឡាផ្ទៃ ៖</span>
                          <span className="font-semibold text-foreground">
                            {data.parcel_and_property.property_characteristics.size || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">ភាគី ៖</span>
                          <span className="font-semibold text-foreground">
                            អ្នកលក់ {kh(data.sellers.length)} នាក់ | អ្នកទិញ {kh(data.buyers.length)} នាក់
                          </span>
                        </div>
                      </div>

                      {data.parcel_and_property.location && (
                        <p className="text-[11px] text-muted-foreground">
                          ទីតាំង ៖ <span className="text-foreground">{data.parcel_and_property.location}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Stepper Navigation Footer */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setActiveStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : prev))
                }
                disabled={activeStep === 1}
                className="h-9 rounded-xl text-xs gap-1 cursor-pointer"
              >
                <ChevronLeftIcon className="size-3.5" />
                <span>ថយក្រោយ</span>
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  ជំហាន {kh(activeStep)}/៤
                </span>
                {activeStep < 4 ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() =>
                      setActiveStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev))
                    }
                    className="h-9 rounded-xl text-xs gap-1 cursor-pointer"
                  >
                    <span>បន្ទាប់</span>
                    <ChevronRightIcon className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    className="h-9 rounded-xl text-xs gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <CheckCircle2Icon className="size-4" />
                    <span>រក្សាទុកទាំងអស់</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ───────────── Right: Live A4 Print Preview ───────────── */}
        {viewMode !== "form" && (
          <div
            className={cn(
              "print:block print:w-full space-y-4",
              viewMode === "split"
                ? "lg:col-span-7 xl:col-span-7"
                : "w-full max-w-4xl mx-auto",
            )}
          >
            <div className="no-print flex items-center justify-between border-b pb-2 px-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs rounded-full">
                  A4 Print Preview
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ទំព័រផ្លូវការ និងឧបសម្ព័ន្ធ (៦ ជួរឈរ)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <PrinterIcon className="size-3.5" />
                <span>បោះពុម្ព</span>
              </Button>
            </div>

            <div className="overflow-x-auto pb-6">
              <div className="min-w-[794px] mx-auto">
                <TransferApplicationPrint data={data} pageFilter={printPage} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════ Clean Saved Records Dialog ═════════════════════ */}
      <Dialog open={isDbListOpen} onOpenChange={setIsDbListOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <FolderOpenIcon className="size-5 text-blue-600" />
              <span>បញ្ជីពាក្យសុំផ្ទេរកម្មសិទ្ធិដែលបានរក្សាទុក ({kh(dbList.length)})</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ស្វែងរក បើកមើល ឬលុបពាក្យសុំដែលបានរក្សាទុកក្នុងប្រព័ន្ធ
            </DialogDescription>
          </DialogHeader>

          {/* Search bar */}
          <div className="relative mt-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="ស្វែងរកតាមលេខក្បាលដី, ទីតាំង..."
              className="h-9 pl-9 pr-8 text-xs rounded-xl bg-muted/40"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          {/* Records List */}
          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[260px] max-h-[460px]">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <FolderOpenIcon className="size-8 mx-auto opacity-40 text-muted-foreground" />
                <p>ពុំមានពាក្យសុំដែលត្រូវគ្នានឹងការស្វែងរកឡើយ</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleSample}
                  className="text-xs text-primary cursor-pointer"
                >
                  ផ្ទុកទិន្នន័យគំរូសាកល្បង
                </Button>
              </div>
            ) : (
              filteredRecords.map((item) => {
                const sName =
                  item.sellers[0]?.husband.full_name ||
                  item.sellers[0]?.person.full_name ||
                  item.sellers[0]?.legal_entity.entity_name ||
                  "—";
                const bName =
                  item.buyers[0]?.husband.full_name ||
                  item.buyers[0]?.person.full_name ||
                  item.buyers[0]?.legal_entity.entity_name ||
                  "—";
                const dateStr = item.updatedAt || item.createdAt || "";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleLoadRecord(item)}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-xs hover:border-primary/50 hover:bg-muted/40 cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {item.title || "ពាក្យសុំផ្ទេរកម្មសិទ្ធិ"}
                        </span>
                        {item.parcel_and_property.parcel_number && (
                          <Badge variant="outline" className="text-[10px] rounded-full">
                            ក្បាលដី: {item.parcel_and_property.parcel_number}
                          </Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        អ្នកលក់ ៖ <strong>{sName}</strong> ({kh(item.sellers.length)} នាក់) |
                        អ្នកទិញ ៖ <strong>{bName}</strong> ({kh(item.buyers.length)} នាក់)
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        {item.parcel_and_property.location && (
                          <span className="truncate max-w-[280px]">
                            {item.parcel_and_property.location}
                          </span>
                        )}
                        {dateStr && (
                          <span>• {new Date(dateStr).toLocaleString("km-KH")}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadRecord(item);
                        }}
                        className="h-7 rounded-lg text-xs cursor-pointer"
                      >
                        បើក
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => item.id && handleDeleteRecord(item.id, e)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="លុប"
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

