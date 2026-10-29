"use client";

import * as React from "react";
import {
  PlusIcon,
  PrinterIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
  CloudUploadIcon,
  FolderOpenIcon,
  FilePlusIcon,
  CheckIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inheritanceApi } from "@/lib/api";
import { InheritanceRequestPrint } from "@/components/inheritance-request-print";
import { printCleanDocument } from "@/lib/print-service";
import { cn, calculateAgeFromDob } from "@/lib/utils";
import {
  Applicant,
  APPLICANT_SLOTS,
  Child,
  CHILD_SLOTS,
  Deceased,
  DECEASED_SLOTS,
  InheritanceRequest,
  Relative,
  RELATIVE_SLOTS,
  Witness,
  WITNESS_SLOTS,
  buildAddressString,
  countNamed,
  emptyApplicant,
  emptyChild,
  emptyDeceased,
  emptyRelative,
  emptyRequest,
  emptyWitness,
  extractPlotNo,
  normalizeRequest,
  PROPERTY_TYPES,
  sampleRequest,
  toKhmerDigits as kh,
} from "@/lib/inheritance-request-types";

const STORAGE_KEY = "inheritance_request_draft_v1";

/* ═════════════════════════ small editor pieces ═════════════════════════ */

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2 border-b pb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-xs"
      />
    </div>
  );
}

function PropertyTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return PROPERTY_TYPES;
    return PROPERTY_TYPES.filter((t) =>
      t.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [search]);

  const handleSelect = (item: string) => {
    onChange(item);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
          <span className="text-destructive font-bold">*</span> ជ្រើសរើសប្រភេទទ្រព្យ
        </Label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearch("");
            }}
            className="text-[10px] text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
          >
            សម្អាត
          </button>
        )}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          value={isOpen ? search : value || search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            onChange(v);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch("");
          }}
          placeholder="ជ្រើសរើស ឬស្វែងរកប្រភេទទ្រព្យ..."
          className="h-8 pr-8 text-xs rounded-md bg-background transition-all"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          title="ស្វែងរកប្រភេទទ្រព្យ"
        >
          <SearchIcon className="size-3.5" />
        </button>

        {/* Floating Dropdown */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-neutral-200 bg-popover p-1 shadow-lg dark:border-neutral-800 animate-in fade-in-50 duration-150">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                ពុំមានប្រភេទទ្រព្យនេះទេ (អាចវាយបញ្ចូលដោយផ្ទាល់)
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = value === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-blue-600 text-white font-medium"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <span>{item}</span>
                    {isSelected && <CheckIcon className="size-3.5" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quick shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {(
          [
            "ទ្រព្យរួមប្តីប្រពន្ធ",
            "ទ្រព្យខាងប្រពន្ធ",
            "ទ្រព្យខាងប្តី",
            "ទ្រព្យលីវ",
            "ទ្រព្យផ្ទាល់ខ្លួន",
            "ទ្រព្យរួម",
          ] as const
        ).map((pt) => (
          <button
            key={pt}
            type="button"
            onClick={() => onChange(value === pt ? "" : pt)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] border transition-colors cursor-pointer",
              value === pt
                ? "bg-primary text-primary-foreground border-primary font-medium"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {pt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════ main component ═════════════════════════════ */

function getLastFilledIndex<T extends object>(list: T[] = []): number {
  const last = list.reduce(
    (max, item, idx) =>
      Object.values(item).some(
        (v) => typeof v === "string" && v.trim().length > 0,
      )
        ? idx + 1
        : max,
    0,
  );
  return Math.max(1, last);
}

export function InheritanceRequestForm() {
  const [data, setData] = React.useState<InheritanceRequest>(emptyRequest);
  const [hydrated, setHydrated] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isDbListOpen, setIsDbListOpen] = React.useState(false);
  const [dbList, setDbList] = React.useState<InheritanceRequest[]>([]);
  const [loadingDbList, setLoadingDbList] = React.useState(false);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [visibleDeceased, setVisibleDeceased] = React.useState<number>(1);
  const [visibleApplicants, setVisibleApplicants] = React.useState<number>(1);
  const [visibleWitnesses, setVisibleWitnesses] = React.useState<number>(1);
  const [visibleChildren, setVisibleChildren] = React.useState<number>(1);
  const [visibleRelatives, setVisibleRelatives] = React.useState<number>(1);
  const [pageFilter, setPageFilter] = React.useState<
    "all" | 1 | 2 | 3 | 4 | 5 | 6 | 7
  >("all");

  const fetchDbList = React.useCallback(async () => {
    try {
      setLoadingDbList(true);
      const res = await inheritanceApi.list({ limit: 50, order: "desc" });
      setDbList(res.data || []);
    } catch (err) {
      console.warn("Could not load inheritance requests from DB", err);
    } finally {
      setLoadingDbList(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDbList();
  }, [fetchDbList]);

  // load saved draft once (after mount, so server/client HTML match)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = normalizeRequest(JSON.parse(saved));
        setData(parsed);
        setVisibleDeceased(getLastFilledIndex(parsed.deceased));
        setVisibleApplicants(getLastFilledIndex(parsed.applicants));
        setVisibleWitnesses(getLastFilledIndex(parsed.witnesses));
        setVisibleChildren(getLastFilledIndex(parsed.children));
        setVisibleRelatives(getLastFilledIndex(parsed.relatives));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // autosave draft
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated]);

  const setField = <K extends keyof InheritanceRequest>(
    key: K,
    value: InheritanceRequest[K],
  ) => setData((p) => ({ ...p, [key]: value }));

  const patchDeceased = (i: number, patch: Partial<Deceased>) =>
    setData((p) => ({
      ...p,
      deceased: p.deceased.map((d, idx) =>
        idx === i ? { ...d, ...patch } : d,
      ),
    }));

  const patchApplicant = (i: number, patch: Partial<Applicant>) =>
    setData((p) => ({
      ...p,
      applicants: p.applicants.map((a, idx) =>
        idx === i ? { ...a, ...patch } : a,
      ),
    }));

  const patchWitness = (i: number, patch: Partial<Witness>) =>
    setData((p) => ({
      ...p,
      witnesses: p.witnesses.map((w, idx) =>
        idx === i ? { ...w, ...patch } : w,
      ),
    }));

  const patchChild = (i: number, patch: Partial<Child>) =>
    setData((p) => ({
      ...p,
      children: p.children.map((c, idx) =>
        idx === i ? { ...c, ...patch } : c,
      ),
    }));

  const patchRelative = (i: number, patch: Partial<Relative>) =>
    setData((p) => ({
      ...p,
      relatives: (
        p.relatives || Array.from({ length: RELATIVE_SLOTS }, emptyRelative)
      ).map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    }));

  const handleAddDeceased = () => {
    setVisibleDeceased((prev) => Math.min(DECEASED_SLOTS, prev + 1));
  };
  const handleRemoveDeceased = (index: number) => {
    setData((p) => {
      const cur = [...p.deceased];
      cur.splice(index, 1);
      cur.push(emptyDeceased());
      return { ...p, deceased: cur };
    });
    setVisibleDeceased((prev) => Math.max(1, prev - 1));
  };

  const handleAddApplicant = () => {
    setVisibleApplicants((prev) => Math.min(APPLICANT_SLOTS, prev + 1));
  };
  const handleRemoveApplicant = (index: number) => {
    setData((p) => {
      const cur = [...p.applicants];
      cur.splice(index, 1);
      cur.push(emptyApplicant());
      return { ...p, applicants: cur };
    });
    setVisibleApplicants((prev) => Math.max(1, prev - 1));
  };

  const handleAddWitness = () => {
    setVisibleWitnesses((prev) => Math.min(WITNESS_SLOTS, prev + 1));
  };
  const handleRemoveWitness = (index: number) => {
    setData((p) => {
      const cur = [...p.witnesses];
      cur.splice(index, 1);
      cur.push(emptyWitness());
      return { ...p, witnesses: cur };
    });
    setVisibleWitnesses((prev) => Math.max(1, prev - 1));
  };

  const handleAddChild = () => {
    setVisibleChildren((prev) => Math.min(CHILD_SLOTS, prev + 1));
  };
  const handleRemoveChild = (index: number) => {
    setData((p) => {
      const cur = [...p.children];
      cur.splice(index, 1);
      cur.push(emptyChild());
      return { ...p, children: cur };
    });
    setVisibleChildren((prev) => Math.max(1, prev - 1));
  };

  const handleAddRelative = () => {
    setVisibleRelatives((prev) => Math.min(RELATIVE_SLOTS, prev + 1));
  };
  const handleRemoveRelative = (index: number) => {
    setData((p) => {
      const cur = [...p.relatives];
      cur.splice(index, 1);
      cur.push(emptyRelative());
      return { ...p, relatives: cur };
    });
    setVisibleRelatives((prev) => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    if (!window.confirm("សម្អាតទិន្នន័យទាំងអស់?")) return;
    setData(emptyRequest());
    setVisibleDeceased(1);
    setVisibleApplicants(1);
    setVisibleWitnesses(1);
    setVisibleChildren(1);
    setVisibleRelatives(1);
    toast.success("បានសម្អាតទិន្នន័យ");
  };

  const handleSample = () => {
    const s = sampleRequest();
    setData(s);
    setVisibleDeceased(getLastFilledIndex(s.deceased));
    setVisibleApplicants(getLastFilledIndex(s.applicants));
    setVisibleWitnesses(getLastFilledIndex(s.witnesses));
    setVisibleChildren(getLastFilledIndex(s.children));
    setVisibleRelatives(getLastFilledIndex(s.relatives));
    toast.success("បានដាក់ទិន្នន័យគំរូ");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let res: InheritanceRequest;
      if (data.id) {
        res = await inheritanceApi.update(data.id, data);
        toast.success("បានធ្វើបច្ចុប្បន្នភាពក្នុង DB ជោគជ័យ!");
      } else {
        res = await inheritanceApi.create(data);
        toast.success("បានរក្សាទុកក្នុង DB ជោគជ័យ!");
      }
      const normalized = normalizeRequest(res);
      setData(normalized);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      fetchDbList();
    } catch (err) {
      console.error("Failed to save to DB", err);
      toast.error("មានបញ្ហាក្នុងការរក្សាទុកទៅ DB!");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    const empty = emptyRequest();
    setData(empty);
    localStorage.removeItem(STORAGE_KEY);
    setVisibleDeceased(1);
    setVisibleApplicants(1);
    setVisibleWitnesses(1);
    setVisibleChildren(1);
    setVisibleRelatives(1);
    toast.info("បានបង្កើតឯកសារថ្មី");
  };

  const handleLoad = (item: InheritanceRequest) => {
    const normalized = normalizeRequest(item);
    setData(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setVisibleDeceased(getLastFilledIndex(normalized.deceased));
    setVisibleApplicants(getLastFilledIndex(normalized.applicants));
    setVisibleWitnesses(getLastFilledIndex(normalized.witnesses));
    setVisibleChildren(getLastFilledIndex(normalized.children));
    setVisibleRelatives(getLastFilledIndex(normalized.relatives));
    setIsDbListOpen(false);
    toast.success("បានបើកឯកសារជោគជ័យ!");
  };

  const handleDeleteDb = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("តើអ្នកពិតជាចង់លុបឯកសារនេះពី DB ឬ?")) return;
    try {
      await inheritanceApi.remove(id);
      toast.success("បានលុបឯកសារពី DB រួចរាល់!");
      if (data.id === id) {
        setData((p) => ({ ...p, id: undefined }));
      }
      fetchDbList();
    } catch (err) {
      console.error(err);
      toast.error("មិនអាចលុបឯកសារបានទេ!");
    }
  };

  const filteredDbList = React.useMemo(() => {
    if (!searchFilter.trim()) return dbList;
    const term = searchFilter.toLowerCase();
    return dbList.filter((item) => {
      const decMatch = (item.deceased || []).some((d) =>
        d.name?.toLowerCase().includes(term),
      );
      const appMatch = (item.applicants || []).some((a) =>
        a.name?.toLowerCase().includes(term),
      );
      return (
        item.refNo?.toLowerCase().includes(term) ||
        item.title?.toLowerCase().includes(term) ||
        item.authorizedPerson?.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term) ||
        decMatch ||
        appMatch
      );
    });
  }, [dbList, searchFilter]);

  // Sync browser document title dynamically based on form title & refNo
  React.useEffect(() => {
    const mainTitle =
      !data.title || data.title === "ពាក្យស្នើសុំ"
        ? "ពាក្យស្នើសុំផ្ទេរសិទ្ធិកាន់កាប់អចលនវត្ថុជាមរតក"
        : data.title;
    const cleanRefNo = data.refNo?.replace(/[\\/:*?"<>|]/g, "-").trim();
    const refSuffix = cleanRefNo ? ` - លេខ ${cleanRefNo}` : "";
    document.title = `${mainTitle}${refSuffix}`;
  }, [data.title, data.refNo]);

  // Document title used when printing / downloading as PDF
  const printTitle = React.useMemo(() => {
    const mainTitle =
      !data.title || data.title === "ពាក្យស្នើសុំ"
        ? "ពាក្យស្នើសុំផ្ទេរសិទ្ធិកាន់កាប់អចលនវត្ថុជាមរតក"
        : data.title;
    const cleanRefNo = data.refNo?.replace(/[\\/:*?"<>|]/g, "-").trim();
    const parts = [
      mainTitle,
      cleanRefNo ? `លេខ ${cleanRefNo}` : "",
      pageFilter !== "all" ? `ទំព័រ ${pageFilter}` : "",
    ].filter(Boolean);
    return parts.join(" - ");
  }, [data.title, data.refNo, pageFilter]);

  const deceasedNamed = countNamed(data.deceased);
  const applicantsNamed = countNamed(data.applicants);
  const witnessesNamed = countNamed(data.witnesses);
  const childrenNamed = countNamed(data.children);
  const relativesNamed = countNamed(data.relatives || []);

  return (
    <div className="flex flex-col gap-4">
      {/* ── toolbar (never printed) ── */}
      <div className="no-print flex flex-col gap-3 rounded-xl border bg-muted/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              ខ្មោច {deceasedNamed}/{DECEASED_SLOTS}
            </Badge>
            <Badge variant="outline" className="text-xs">
              អ្នកស្នើសុំ {applicantsNamed}/{data.applicants.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              សាក្សី {witnessesNamed}/{data.witnesses.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              កូន {childrenNamed}/{CHILD_SLOTS}
            </Badge>
            <Badge variant="outline" className="text-xs">
              សាច់ញាតិ {relativesNamed}/{RELATIVE_SLOTS}
            </Badge>
            <Badge variant="secondary" className="text-xs font-semibold">
              សរុប ៥ ទំព័រ
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data.id ? (
              <Badge className="bg-emerald-600 text-white text-xs gap-1 py-1">
                <CheckIcon className="size-3" /> បានរក្សាទុកក្នុង DB
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-amber-600 border-amber-300 dark:border-amber-800 py-1"
              >
                ● សេចក្តីព្រាង (មិនទាន់ Save)
              </Badge>
            )}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-8 gap-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs"
            >
              {saving ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <CloudUploadIcon className="size-3.5" />
              )}
              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកក្នុង DB"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDbList();
                setIsDbListOpen(true);
              }}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <FolderOpenIcon className="size-3.5" />
              បញ្ជីក្នុង DB {dbList.length > 0 ? `(${dbList.length})` : ""}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNew}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <FilePlusIcon className="size-3.5" />
              ឯកសារថ្មី
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSample}
              className="h-8 gap-1.5 text-xs"
            >
              <SparklesIcon className="size-3.5" />
              ទិន្នន័យគំរូ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-1.5 text-xs"
            >
              <RotateCcwIcon className="size-3.5" />
              សម្អាត
            </Button>
            <Button
              size="sm"
              onClick={() =>
                printCleanDocument("printable-document", printTitle)
              }
              title="ទាញយកជា PDF ឬបោះពុម្ព (Download PDF / Print)"
              className="h-8 gap-1.5 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 cursor-pointer shadow-xs"
            >
              <PrinterIcon className="size-3.5" />
              {pageFilter === "all"
                ? "ទាញយក PDF / បោះពុម្ព"
                : `បោះពុម្ពទំព័រ ${pageFilter} (Print Page ${pageFilter})`}
            </Button>
          </div>
        </div>

        {/* Page navigation tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t pt-2.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            មើលទំព័រ៖
          </span>
          {[
            { id: "all", label: "ទាំងអស់ (៧ ទំព័រ)" },
            { id: 1, label: "ទំព័រ ១ (ពាក្យស្នើសុំ)" },
            { id: 2, label: "ទំព័រ ២ (ដំណរវង្ស)" },
            { id: 3, label: "ទំព័រ ៣ (ដំណរវង្ស-ត)" },
            { id: 4, label: "ទំព័រ ៤ (ព្រមព្រៀង)" },
            { id: 5, label: "ទំព័រ ៥ (ក្រុមប្រឹក្សាញាតិ)" },
            { id: 6, label: "ទំព័រ ៦ (បញ្ជាក់ទាយាទ)" },
            { id: 7, label: "ទំព័រ ៧ (កិច្ចសន្យាធានាអះអាង)" },
          ].map((tab) => {
            const active = pageFilter === tab.id;
            return (
              <button
                key={String(tab.id)}
                type="button"
                onClick={() => setPageFilter(tab.id as typeof pageFilter)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900"
                    : "bg-background text-muted-foreground border hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* editor on the left, A4 preview on the right; plain block when printing */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)] print:block print:p-0 print:m-0 print:gap-0">
        {/* ═══════════════ EDITOR (never printed) ═══════════════ */}
        <div className="no-print space-y-4">
          <Card title="ព័ត៌មានទូទៅ" hint="ព័ត៌មានលិខិត, និងអចលនវត្ថុ/ដី">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="លេខយោង"
                value={data.refNo}
                onChange={(v) => setField("refNo", v)}
              />
              <Field
                label="កាលបរិច្ឆេទ (ថ្ងៃ.ខែ.ឆ្នាំ)"
                value={data.date}
                onChange={(v) => setField("date", v)}
                placeholder="08.10.2026"
              />

              <div className="col-span-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                  ព័ត៌មានអចលនវត្ថុ / ដី
                </span>
              </div>

              <Field
                label="ប័ណ្ណសម្គាល់សិទ្ធិលេខ"
                value={data.titleDeedNo}
                onChange={(v) => {
                  const autoPlot = extractPlotNo(v);
                  setData((p) => {
                    const next = { ...p, titleDeedNo: v };
                    if (
                      autoPlot &&
                      (!p.plotNo || p.plotNo === extractPlotNo(p.titleDeedNo))
                    ) {
                      next.plotNo = autoPlot;
                    }
                    return next;
                  });
                }}
                placeholder="ឧ. 12060201-1608"
              />
              <Field
                label="ប្រភេទដី"
                value={data.propertyType}
                onChange={(v) => setField("propertyType", v)}
                placeholder="ឧ. លំនៅឋាន"
              />
              <Field
                label="ក្បាលដីលេខ (បំពេញស្វ័យប្រវត្តិ)"
                value={data.plotNo}
                onChange={(v) => setField("plotNo", v)}
                placeholder="ឧ. ១៦០៨"
              />
              <Field
                label="ទំហំ"
                value={data.area}
                onChange={(v) => setField("area", v)}
                placeholder="58 (ម២)"
              />
              <Field
                label="ផ្លូវលេខ"
                value={data.streetNo}
                onChange={(v) => {
                  setData((p) => {
                    const next = { ...p, streetNo: v };
                    next.location = buildAddressString({
                      streetNo: v,
                      village: next.village,
                      sangkat: next.sangkat,
                      khan: next.khan,
                      city: next.city,
                    });
                    return next;
                  });
                }}
                placeholder="ឧ. ១៩៣"
              />
              <Field
                label="ភូមិ"
                value={data.village}
                onChange={(v) => {
                  setData((p) => {
                    const next = { ...p, village: v };
                    next.location = buildAddressString({
                      streetNo: next.streetNo,
                      village: v,
                      sangkat: next.sangkat,
                      khan: next.khan,
                      city: next.city,
                    });
                    return next;
                  });
                }}
                placeholder="ឧ. ចំរើនផល"
              />
              <Field
                label="សង្កាត់"
                value={data.sangkat}
                onChange={(v) => {
                  setData((p) => {
                    const next = { ...p, sangkat: v };
                    next.location = buildAddressString({
                      streetNo: next.streetNo,
                      village: next.village,
                      sangkat: v,
                      khan: next.khan,
                      city: next.city,
                    });
                    return next;
                  });
                }}
                placeholder="ឧ. បឹងទំពុនទី១"
              />
              <Field
                label="ខណ្ឌ"
                value={data.khan}
                onChange={(v) => {
                  setData((p) => {
                    const next = { ...p, khan: v };
                    next.location = buildAddressString({
                      streetNo: next.streetNo,
                      village: next.village,
                      sangkat: next.sangkat,
                      khan: v,
                      city: next.city,
                    });
                    return next;
                  });
                }}
                placeholder="ឧ. មានជ័យ"
              />
            </div>
          </Card>

          <Card
            title={`សំបុត្រដំណរវង្សត្រកូលនៃខ្មោច (${deceasedNamed}/${DECEASED_SLOTS} នាក់)`}
            hint="ព័ត៌មានឪពុក-ម្តាយ ឬអ្នកចែកឋាន"
          >
            <div className="space-y-3">
              <Field
                label="នៅសង្កាត់ (នៃសំបុត្រមរណៈភាព)"
                value={data.deceasedSangkat}
                onChange={(v) => setField("deceasedSangkat", v)}
                placeholder="សង្កាត់..."
              />

              {data.deceased.slice(0, visibleDeceased).map((d, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {i + 1}
                      </span>
                      <span>
                        ខ្មោចទី {kh(i + 1)}
                        {d.name ? `: ${d.name}` : ""}
                      </span>
                    </span>
                    {visibleDeceased > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDeceased(i)}
                        className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        title="ដកចេញ"
                      >
                        <Trash2Icon className="size-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="ឈ្មោះខ្មោច"
                      value={d.name}
                      onChange={(v) => patchDeceased(i, { name: v })}
                      placeholder="ឈ្មោះ..."
                      className="col-span-2"
                    />
                    <Field
                      label="កើតនៅឆ្នាំ"
                      value={d.birthYear}
                      onChange={(v) => patchDeceased(i, { birthYear: v })}
                      placeholder="1955"
                    />
                    <Field
                      label="ស្លាប់នៅថ្ងៃ (dd.mm.yyyy)"
                      value={d.deathDate}
                      onChange={(v) => patchDeceased(i, { deathDate: v })}
                      placeholder="10.05.2020"
                    />
                    <Field
                      label="សំបុត្រមរណៈភាពលេខ"
                      value={d.deathCertNo}
                      onChange={(v) => patchDeceased(i, { deathCertNo: v })}
                      placeholder="លេខ..."
                    />
                    <Field
                      label="ចុះថ្ងៃ (dd.mm.yyyy)"
                      value={d.deathCertDate}
                      onChange={(v) => patchDeceased(i, { deathCertDate: v })}
                      placeholder="12.05.2020"
                    />
                  </div>
                </div>
              ))}

              {visibleDeceased < DECEASED_SLOTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDeceased}
                  className="w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  បន្ថែមខ្មោចទី {kh(visibleDeceased + 1)} (អតិបរមា{" "}
                  {kh(DECEASED_SLOTS)} នាក់)
                </Button>
              )}
            </div>
          </Card>

          <Card
            title={`អ្នកស្នើសុំ (${applicantsNamed}/${APPLICANT_SLOTS} នាក់)`}
            hint="ព័ត៌មានអ្នកស្នើសុំ"
          >
            <div className="space-y-3">
              <PropertyTypeSelect
                value={
                  data.applicantPropertyType ??
                  data.applicants[0]?.propertyType ??
                  ""
                }
                onChange={(v) => {
                  setData((p) => ({
                    ...p,
                    applicantPropertyType: v,
                    applicants: p.applicants.map((a) => ({
                      ...a,
                      propertyType: v,
                    })),
                  }));
                }}
              />

              {data.applicants.slice(0, visibleApplicants).map((a, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {i + 1}
                      </span>
                      <span>
                        អ្នកស្នើសុំទី {kh(i + 1)}
                        {a.name ? `: ${a.name}` : ""}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {a.gender && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {a.gender}
                        </Badge>
                      )}
                      {visibleApplicants > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveApplicant(i)}
                          className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          title="ដកចេញ"
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="ឈ្មោះ"
                      value={a.name}
                      onChange={(v) => patchApplicant(i, { name: v })}
                    />
                    <Field
                      label={
                        a.dob && calculateAgeFromDob(a.dob)
                          ? `ថ្ងៃ ខែ ឆ្នាំកំណើត (${calculateAgeFromDob(a.dob)})`
                          : "ថ្ងៃ ខែ ឆ្នាំកំណើត"
                      }
                      value={a.dob}
                      onChange={(v) => patchApplicant(i, { dob: v })}
                      placeholder="01.01.1949"
                    />
                    {/* ភេទ — dropdown select */}
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        ភេទ
                      </Label>
                      <select
                        value={a.gender || ""}
                        onChange={(e) =>
                          patchApplicant(i, { gender: e.target.value })
                        }
                        className="h-8 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-xs outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="ប្រុស">ប្រុស</option>
                        <option value="ស្រី">ស្រី</option>
                      </select>
                    </div>
                    <Field
                      label="ភូមិ (ទីលំនៅ)"
                      value={a.village || ""}
                      onChange={(v) => {
                        const full = buildAddressString({
                          village: v,
                          sangkat: a.sangkat || data.sangkat,
                          khan: a.khan || data.khan,
                        });
                        patchApplicant(i, { village: v, address: full });
                      }}
                      placeholder={
                        data.village ? `ឧ. ${data.village}` : "ភូមិ..."
                      }
                    />
                    <Field
                      label="សង្កាត់"
                      value={a.sangkat || ""}
                      onChange={(v) => {
                        const full = buildAddressString({
                          village: a.village || data.village,
                          sangkat: v,
                          khan: a.khan || data.khan,
                        });
                        patchApplicant(i, { sangkat: v, address: full });
                      }}
                      placeholder={
                        data.sangkat ? `ឧ. ${data.sangkat}` : "សង្កាត់..."
                      }
                    />
                    <Field
                      label="ខណ្ឌ"
                      value={a.khan || ""}
                      onChange={(v) => {
                        const full = buildAddressString({
                          village: a.village || data.village,
                          sangkat: a.sangkat || data.sangkat,
                          khan: v,
                        });
                        patchApplicant(i, { khan: v, address: full });
                      }}
                      placeholder={data.khan ? `ឧ. ${data.khan}` : "ខណ្ឌ..."}
                      className="col-span-2"
                    />

                    <Field
                      label="ឈ្មោះឪពុក"
                      value={a.fatherName}
                      onChange={(v) => patchApplicant(i, { fatherName: v })}
                    />
                    <Field
                      label="ឈ្មោះម្តាយ"
                      value={a.motherName}
                      onChange={(v) => patchApplicant(i, { motherName: v })}
                    />
                    <Field
                      label="ត្រូវជា (នៃខ្មោច)"
                      value={a.relationDeceased}
                      onChange={(v) =>
                        patchApplicant(i, { relationDeceased: v })
                      }
                      placeholder="ឧ. ប្រពន្ធ / ប្ដី / កូន"
                    />
                    <Field
                      label="និងជា (នៃយើងខ្ញុំ)"
                      value={a.relationHeirs}
                      onChange={(v) => patchApplicant(i, { relationHeirs: v })}
                      placeholder="ឧ. ម្ដាយ / ឪពុក / បង"
                    />
                  </div>
                </div>
              ))}

              {visibleApplicants < APPLICANT_SLOTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddApplicant}
                  className="w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  បន្ថែមអ្នកស្នើសុំទី {kh(visibleApplicants + 1)} (អតិបរមា{" "}
                  {kh(APPLICANT_SLOTS)} នាក់)
                </Button>
              )}
            </div>
          </Card>

          <Card
            title={`សាក្សី (${witnessesNamed}/${WITNESS_SLOTS} នាក់)`}
            hint="ព័ត៌មានសាក្សីបញ្ជាក់"
          >
            <div className="space-y-3">
              {data.witnesses.slice(0, visibleWitnesses).map((w, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {i + 1}
                      </span>
                      <span>
                        សាក្សីទី {kh(i + 1)}
                        {w.name ? `: ${w.name}` : ""}
                      </span>
                    </span>
                    {visibleWitnesses > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWitness(i)}
                        className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        title="ដកចេញ"
                      >
                        <Trash2Icon className="size-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="ឈ្មោះ"
                      value={w.name}
                      onChange={(v) => patchWitness(i, { name: v })}
                    />
                    <Field
                      label="ថ្ងៃ ខែ ឆ្នាំកំណើត"
                      value={w.dob}
                      onChange={(v) => patchWitness(i, { dob: v })}
                      placeholder="22.02.1980"
                    />
                    <Field
                      label="អត្តសញ្ញាណប័ណ្ណ"
                      value={w.idNumber}
                      onChange={(v) => patchWitness(i, { idNumber: v })}
                    />
                    <Field
                      label="អាសយដ្ឋាន"
                      value={w.address}
                      onChange={(v) => patchWitness(i, { address: v })}
                      placeholder="សង្កាត់… ខណ្ឌ… រាជធានី…"
                    />
                  </div>
                </div>
              ))}

              {visibleWitnesses < WITNESS_SLOTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddWitness}
                  className="w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  បន្ថែមសាក្សីទី {kh(visibleWitnesses + 1)} (អតិបរមា{" "}
                  {kh(WITNESS_SLOTS)} នាក់)
                </Button>
              )}
            </div>
          </Card>

          <Card
            title={`ឈ្មោះកូន (${childrenNamed}/${CHILD_SLOTS} នាក់)`}
            hint="សម្រាប់ទំព័រ ១–២ (បង្ហាញ ១–១០ នាក់)"
          >
            <div className="space-y-3">
              {data.children.slice(0, visibleChildren).map((c, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {i + 1}
                      </span>
                      <span>
                        កូនទី {kh(i + 1)}
                        {c.name ? `: ${c.name}` : ""}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {c.gender && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {c.gender}
                        </Badge>
                      )}
                      {visibleChildren > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChild(i)}
                          className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          title="ដកចេញ"
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Row 1: ឈ្មោះ, ភេទ, ថ្ងៃកំណើត, សម្គាល់ */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ឈ្មោះ
                      </Label>
                      <Input
                        value={c.name}
                        onChange={(e) =>
                          patchChild(i, { name: e.target.value })
                        }
                        placeholder="ឈ្មោះកូន"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ភេទ
                      </Label>
                      <select
                        value={c.gender}
                        onChange={(e) =>
                          patchChild(i, {
                            gender: e.target.value as Child["gender"],
                          })
                        }
                        className="h-8 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-xs outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="ប្រុស">ប្រុស</option>
                        <option value="ស្រី">ស្រី</option>
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ថ្ងៃ ខែ ឆ្នាំកំណើត
                      </Label>
                      <Input
                        value={c.dob}
                        onChange={(e) => patchChild(i, { dob: e.target.value })}
                        placeholder="dd.mm.yyyy"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        សម្គាល់
                      </Label>
                      <Input
                        value={c.note}
                        onChange={(e) =>
                          patchChild(i, { note: e.target.value })
                        }
                        placeholder="ស្លាប់…"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 2: birth certificate */}
                  <div className="grid grid-cols-12 gap-2 border-t border-dashed pt-2">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ថ្ងៃចុះសំបុត្រកំណើត
                      </Label>
                      <Input
                        value={c.birthCertDate}
                        onChange={(e) =>
                          patchChild(i, { birthCertDate: e.target.value })
                        }
                        placeholder="dd.mm.yyyy"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        លេខសំបុត្រកំណើត
                      </Label>
                      <Input
                        value={c.birthCertNo}
                        onChange={(e) =>
                          patchChild(i, { birthCertNo: e.target.value })
                        }
                        placeholder="លេខសំបុត្រ"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ឃុំ/សង្កាត់
                      </Label>
                      <Input
                        value={c.commune}
                        onChange={(e) =>
                          patchChild(i, { commune: e.target.value })
                        }
                        placeholder="ឃុំ/សង្កាត់"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ក្រុង/ស្រុក/ខណ្ឌ
                      </Label>
                      <Input
                        value={c.district}
                        onChange={(e) =>
                          patchChild(i, { district: e.target.value })
                        }
                        placeholder="ក្រុង/ស្រុក/ខណ្ឌ"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {visibleChildren < CHILD_SLOTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChild}
                  className="w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  បន្ថែមឈ្មោះកូនទី {kh(visibleChildren + 1)} (អតិបរមា{" "}
                  {kh(CHILD_SLOTS)} នាក់)
                </Button>
              )}
            </div>
          </Card>

          <Card
            title={`សាច់ញាតិ / ក្រុមប្រឹក្សាញាតិ (${relativesNamed}/${RELATIVE_SLOTS} នាក់)`}
            hint="សម្រាប់ទំព័រ ៤ (បង្ហាញ ១–៨ នាក់)"
          >
            <div className="space-y-3">
              {data.relatives.slice(0, visibleRelatives).map((rel, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {i + 1}
                      </span>
                      <span>
                        សាច់ញាតិទី {kh(i + 1)}
                        {rel.name ? `: ${rel.name}` : ""}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {rel.gender && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {rel.gender}
                        </Badge>
                      )}
                      {visibleRelatives > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRelative(i)}
                          className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          title="ដកចេញ"
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ឈ្មោះ
                      </Label>
                      <Input
                        value={rel.name}
                        onChange={(e) =>
                          patchRelative(i, { name: e.target.value })
                        }
                        placeholder="ឈ្មោះសាច់ញាតិ"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ភេទ
                      </Label>
                      <select
                        value={rel.gender}
                        onChange={(e) =>
                          patchRelative(i, {
                            gender: e.target.value as Relative["gender"],
                          })
                        }
                        className="h-8 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-xs outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="ប្រុស">ប្រុស</option>
                        <option value="ស្រី">ស្រី</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ឆ្នាំកំណើត
                      </Label>
                      <Input
                        value={rel.birthYear}
                        onChange={(e) =>
                          patchRelative(i, { birthYear: e.target.value })
                        }
                        placeholder="2010"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ទីលំនៅ
                      </Label>
                      <Input
                        value={rel.address}
                        onChange={(e) =>
                          patchRelative(i, { address: e.target.value })
                        }
                        placeholder="ទឹកល្អក់ទី១ ទួលគោក"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {visibleRelatives < RELATIVE_SLOTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRelative}
                  className="w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  បន្ថែមសាច់ញាតិទី {kh(visibleRelatives + 1)} (អតិបរមា{" "}
                  {kh(RELATIVE_SLOTS)} នាក់)
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* ═══════════════ PRINTABLE FORM (7 × A4) ═══════════════ */}
        <div id="printable-document" className="printable-area">
          <InheritanceRequestPrint data={data} pageFilter={pageFilter} />
        </div>
      </div>

      {/* ── Modal Dialog: List of Saved DB Records ── */}
      <Dialog open={isDbListOpen} onOpenChange={setIsDbListOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <FolderOpenIcon className="size-5 text-blue-600" />
              បញ្ជីពាក្យស្នើសុំដែលបានរក្សាទុកក្នុង DB ({dbList.length})
            </DialogTitle>
          </DialogHeader>

          <div className="relative mt-2">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="ស្វែងរកតាមលេខយោង, ឈ្មោះអ្នកស្នើសុំ, ឈ្មោះខ្មោច, ឬទីតាំង..."
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px] max-h-[450px]">
            {loadingDbList ? (
              <div className="flex h-32 items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2Icon className="size-4 animate-spin text-blue-600" />
                កំពុងទាញយកទិន្នន័យពី DB...
              </div>
            ) : filteredDbList.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-xs text-muted-foreground">
                <FolderOpenIcon className="size-8 text-muted-foreground/40 mb-2" />
                ពុំមានឯកសារនៅក្នុង DB ទេ
              </div>
            ) : (
              filteredDbList.map((item) => {
                const isCurrent = item.id === data.id;
                const decNames = (item.deceased || [])
                  .map((d) => d.name)
                  .filter(Boolean)
                  .join(", ");
                const appNames = (item.applicants || [])
                  .map((a) => a.name)
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={item.id}
                    onClick={() => handleLoad(item)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-xs hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
                      isCurrent &&
                        "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30",
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {item.refNo ? `លេខយោង៖ ${item.refNo}` : "គ្មានលេខយោង"}
                        </span>
                        {isCurrent && (
                          <Badge
                            variant="default"
                            className="text-[10px] bg-blue-600 py-0"
                          >
                            បច្ចុប្បន្ន
                          </Badge>
                        )}
                        {item.date && (
                          <span className="text-[11px] text-muted-foreground">
                            ចុះថ្ងៃ៖ {item.date}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3">
                        {appNames && (
                          <span>
                            អ្នកស្នើសុំ៖{" "}
                            <strong className="text-foreground">
                              {appNames}
                            </strong>
                          </span>
                        )}
                        {decNames && (
                          <span>
                            ខ្មោច៖{" "}
                            <strong className="text-foreground">
                              {decNames}
                            </strong>
                          </span>
                        )}
                        {item.location && <span>ទីតាំង៖ {item.location}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5 cursor-pointer hover:bg-blue-600 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoad(item);
                        }}
                      >
                        បើក
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="លុបចេញពី DB"
                        onClick={(e) => item.id && handleDeleteDb(item.id, e)}
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
