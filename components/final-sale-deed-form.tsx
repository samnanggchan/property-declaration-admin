"use client";

import * as React from "react";
import {
  FileTextIcon,
  PrinterIcon,
  RotateCcwIcon,
  SparklesIcon,
  SaveIcon,
  FolderOpenIcon,
  PencilIcon,
  Trash2Icon,
  CopyIcon,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  XIcon,
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  FinalSaleDeed,
  FinalSaleDeedParcelRow,
  emptyFinalSaleDeed,
  sampleFinalSaleDeed,
  finalSaleDeedStorage,
} from "@/lib/final-sale-deed-types";
import { FinalSaleDeedPrint } from "@/components/final-sale-deed-print";
import { printCleanDocument } from "@/lib/print-service";
import { cn } from "@/lib/utils";

/* ═════════════════════════ Reusable Editor Card ═════════════════════════ */
function EditorCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
      <div className="flex items-baseline justify-between gap-2 border-b border-border/50 pb-2">
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
      <Label className="text-[11px] font-medium text-foreground/80">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-xs"
      />
    </div>
  );
}

export function FinalSaleDeedForm() {
  const [data, setData] = React.useState<FinalSaleDeed>(sampleFinalSaleDeed());
  const [paperSize, setPaperSize] = React.useState<"original" | "a4">(
    "original",
  );
  const [fillOnly, setFillOnly] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<
    "parties" | "civil" | "fees" | "property" | "cert"
  >("parties");

  // Records / DB Store dialog
  const [recordsOpen, setRecordsOpen] = React.useState(false);
  const [savedRecords, setSavedRecords] = React.useState<FinalSaleDeed[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  // Load draft & records on mount
  React.useEffect(() => {
    document.title = "Final Sale Deed | ក្រដាសពុម្ពលេខ ៦";
    const draft = finalSaleDeedStorage.getDraft();
    if (
      draft &&
      (draft.seller?.name || draft.buyer?.name || draft.drafterRefNo)
    ) {
      setData(draft);
    } else {
      setData(sampleFinalSaleDeed());
    }
    setSavedRecords(finalSaleDeedStorage.listRecords());
  }, []);

  // Auto-save draft on data changes
  React.useEffect(() => {
    finalSaleDeedStorage.saveDraft(data);
  }, [data]);

  // Handlers
  const handleNew = () => {
    if (window.confirm("តើអ្នកចង់បង្កើតឯកសារថ្មីទទេមែនទេ?")) {
      const fresh = emptyFinalSaleDeed();
      setData(fresh);
      finalSaleDeedStorage.saveDraft(fresh);
      toast.info("បានបង្កើតឯកសារថ្មី");
    }
  };

  const handleFillSample = () => {
    const sample = sampleFinalSaleDeed();
    setData(sample);
    finalSaleDeedStorage.saveDraft(sample);
    toast.success("បានបំពេញទិន្នន័យគំរូលក់ផ្តាច់ (ក្រដាសពុម្ពលេខ ៦) រួចរាល់!");
  };

  const handleSave = () => {
    if (!data.seller.name && !data.buyer.name) {
      toast.error("សូមបញ្ចូលឈ្មោះអ្នកលក់ ឬអ្នកទិញជាមុន");
      return;
    }
    const updated = finalSaleDeedStorage.saveRecord(data);
    setSavedRecords(updated);
    toast.success("បានរក្សាទុកឯកសារក្នុងមូលដ្ឋានទិន្នន័យជោគជ័យ!");
  };

  const handleLoadRecord = (record: FinalSaleDeed) => {
    setData(record);
    finalSaleDeedStorage.saveDraft(record);
    setRecordsOpen(false);
    toast.success("បានបើកឯកសារ!");
  };

  const handleDeleteRecord = (id: string) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?")) return;
    const updated = finalSaleDeedStorage.deleteRecord(id);
    setSavedRecords(updated);
    toast.success("បានលុបឯកសារជោគជ័យ");
  };

  const handleDuplicateRecord = (id: string) => {
    const copy = finalSaleDeedStorage.duplicateRecord(id);
    if (copy) {
      setSavedRecords(finalSaleDeedStorage.listRecords());
      toast.success("បានចម្លងឯកសារជោគជ័យ");
    }
  };

  const handlePrint = () => {
    const isOriginal = paperSize === "original";
    printCleanDocument("printable-document", {
      documentTitle: `Final-Sale-Deed-${data.parcelRows?.[0]?.indexOrSheet || data.seller.name || "Deed"}`,
      pageSize: isOriginal ? "195mm 297mm" : "A4 portrait",
      pageWidth: isOriginal ? "195mm" : "210mm",
      pageHeight: "297mm",
      pagePadding: "0",
    });
  };

  // Parcel row helpers
  const handleParcelRowChange = (
    index: number,
    field: keyof FinalSaleDeedParcelRow,
    value: string,
  ) => {
    setData((prev) => {
      const rows = [...(prev.parcelRows || [])];
      while (rows.length <= index) {
        rows.push({
          indexOrSheet: "",
          area: "",
          landType: "",
          boundaryNorth: "",
          boundarySouth: "",
          boundaryEast: "",
          boundaryWest: "",
          encumbrance: "",
        });
      }
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, parcelRows: rows };
    });
  };

  const addParcelRow = () => {
    setData((prev) => ({
      ...prev,
      parcelRows: [
        ...(prev.parcelRows || []),
        {
          indexOrSheet: "",
          area: "",
          landType: "លំនៅឋាន",
          boundaryNorth: "",
          boundarySouth: "",
          boundaryEast: "",
          boundaryWest: "",
          encumbrance: "គ្មាន",
        },
      ],
    }));
  };

  const removeParcelRow = (index: number) => {
    setData((prev) => ({
      ...prev,
      parcelRows: (prev.parcelRows || []).filter((_, i) => i !== index),
    }));
  };

  // Filtered records for search
  const filteredRecords = savedRecords.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.seller.name.toLowerCase().includes(q) ||
      r.buyer.name.toLowerCase().includes(q) ||
      r.drafterRefNo.toLowerCase().includes(q) ||
      r.parcelRows?.some((row) => row.indexOrSheet.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-4 font-battambang">
      {/* ─── Top Header & Global Actions ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileTextIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground font-moul tracking-wide">
              Final Sale Deed (លក់ផ្តាច់)
            </h1>
            <p className="text-xs text-muted-foreground">
              ទម្រង់កិច្ចសន្យាទិញ-លក់ផ្តាច់អចលនវត្ថុផ្លូវការ (ក្រដាសពុម្ពលេខ ៦ -
              Vente Definitive)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNew}
            className="h-8 gap-1.5"
          >
            <RotateCcwIcon className="size-3.5" />
            ឯកសារថ្មី
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillSample}
            className="h-8 gap-1.5 text-primary border-primary/25 hover:bg-primary/10"
          >
            <SparklesIcon className="size-3.5 text-primary" />
            បំពេញគំរូ
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRecordsOpen(true)}
            className="h-8 gap-1.5 relative"
          >
            <FolderOpenIcon className="size-3.5" />
            ឯកសាររក្សាទុក
            {savedRecords.length > 0 && (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[10px] ml-0.5"
              >
                {savedRecords.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="h-8 gap-1.5 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <SaveIcon className="size-3.5" />
            រក្សាទុក
          </Button>
        </div>
      </div>

      {/* ─── Main 2-Column Split: Form Editor (Left) & Live Preview (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form Editor (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Editor Segmented Tabs */}
          <div className="grid grid-cols-5 gap-1 rounded-xl border bg-muted/50 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("parties")}
              className={cn(
                "rounded-lg py-1.5 px-1 text-center font-medium transition-all truncate text-[11px]",
                activeTab === "parties"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ១. ភាគី
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("civil")}
              className={cn(
                "rounded-lg py-1.5 px-1 text-center font-medium transition-all truncate text-[11px]",
                activeTab === "civil"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ២. អត្រានុកូល
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fees")}
              className={cn(
                "rounded-lg py-1.5 px-1 text-center font-medium transition-all truncate text-[11px]",
                activeTab === "fees"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ៣. តម្លៃ & ពន្ធ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("property")}
              className={cn(
                "rounded-lg py-1.5 px-1 text-center font-medium transition-all truncate text-[11px]",
                activeTab === "property"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ៤. ក្បាលដី
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cert")}
              className={cn(
                "rounded-lg py-1.5 px-1 text-center font-medium transition-all truncate text-[11px]",
                activeTab === "cert"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ៥. បញ្ជាក់
            </button>
          </div>

          {/* ════════ Tab 1: Header & Parties (Page 1) ════════ */}
          {activeTab === "parties" && (
            <div className="space-y-4">
              {/* Header Info */}
              <EditorCard
                title="ក្បាលលិខិត & ក្រដាសពុម្ព"
                hint="អ្នកតែងលិខិត និងប្រអប់ស្តាំ"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="អ្នកតែងលិខិត លេខ"
                    value={data.drafterRefNo}
                    onChange={(v) =>
                      setData((p) => ({ ...p, drafterRefNo: v }))
                    }
                    placeholder="១២/២០២៦"
                  />
                  <Field
                    label="ក្រដាសពុម្ពលេខ"
                    value={data.paperNo}
                    onChange={(v) => setData((p) => ({ ...p, paperNo: v }))}
                    placeholder="6"
                  />
                </div>
              </EditorCard>

              {/* Seller (អ្នកលក់) */}
              <EditorCard
                title="ភាគីអ្នកលក់ (Seller)"
                hint="ឈ្មោះ អាយុ ជាតិ និងទីលំនៅ"
              >
                <div className="space-y-2.5">
                  <Field
                    label="អ្នកលក់-ឈ្មោះ *"
                    value={data.seller.name}
                    onChange={(v) =>
                      setData((p) => ({
                        ...p,
                        seller: { ...p.seller, name: v },
                      }))
                    }
                    placeholder="ឧ. ឈូ ស៊ីសេង និង ហេង ណាវី"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="អាយុ (ឆ្នាំ)"
                      value={data.seller.age}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          seller: { ...p.seller, age: v },
                        }))
                      }
                      placeholder="៥១"
                    />
                    <Field
                      label="ជាតិ"
                      value={data.seller.nationality}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          seller: { ...p.seller, nationality: v },
                        }))
                      }
                      placeholder="ខ្មែរ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="ទីលំនៅៗភូមិ"
                      value={data.seller.village}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          seller: { ...p.seller, village: v },
                        }))
                      }
                      placeholder="ភូមិ..."
                    />
                    <Field
                      label="ឃុំ/សង្កាត់"
                      value={data.seller.commune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          seller: { ...p.seller, commune: v },
                        }))
                      }
                      placeholder="ឃុំ/សង្កាត់..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="ស្រុក/ខណ្ឌ"
                      value={data.seller.district}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          seller: { ...p.seller, district: v },
                        }))
                      }
                      placeholder="ស្រុក/ខណ្ឌ..."
                    />
                    <Field
                      label="ខេត្ត/រាជធានី"
                      value={data.seller.province}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          seller: { ...p.seller, province: v },
                        }))
                      }
                      placeholder="ខេត្ត/រាជធានី..."
                    />
                  </div>
                  <Field
                    label="ព័ត៌មានអ្នកលក់ទី២ (បើមាន/ម្ចាស់សិទ្ធិអវិភាគ)"
                    value={data.sellerExtraLine || ""}
                    onChange={(v) =>
                      setData((p) => ({ ...p, sellerExtraLine: v }))
                    }
                    placeholder="ឧ. (២) ឈ្មោះ នាង ស៊ិន ស៊ីថាវាត អាយុ ២៦ ឆ្នាំ..."
                  />

                  {/* Seller Stacked National IDs & Capacity */}
                  <div className="rounded-lg border bg-muted/20 p-2.5 space-y-2.5">
                    <span className="text-xs font-bold text-foreground">
                      អត្តសញ្ញាណប័ណ្ណ & កិច្ចសន្យាអ្នកលក់ (Stacked IDs)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Field
                        label="(១) អត្ត: លេខប័ណ្ណ"
                        value={data.seller1IdNumber || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, seller1IdNumber: v }))
                        }
                        placeholder="០១០៥៤៧៥៩ (០១)"
                      />
                      <Field
                        label="ចុះថ្ងៃ (Date)"
                        value={data.seller1IdDate || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, seller1IdDate: v }))
                        }
                        placeholder="០៦.១០.២០២០"
                      />
                    </div>
                    <Field
                      label="កំណត់សម្គាល់សិទ្ធិអ្នកលក់ (កណ្តាល)"
                      value={data.sellerCapacityText || ""}
                      onChange={(v) =>
                        setData((p) => ({ ...p, sellerCapacityText: v }))
                      }
                      placeholder="• បំពេញកិច្ចនូវទ្រព្យរួមជាម្ចាស់សិទ្ធិអវិភាគ"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Field
                        label="(២) អត្ត: លេខប័ណ្ណ"
                        value={data.seller2IdNumber || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, seller2IdNumber: v }))
                        }
                        placeholder="០១០៣៣៣៣៦ (០២)"
                      />
                      <Field
                        label="ចុះថ្ងៃ (Date)"
                        value={data.seller2IdDate || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, seller2IdDate: v }))
                        }
                        placeholder="០២.០៩.២០២២"
                      />
                    </div>
                  </div>

                  <Field
                    label="កំណត់សម្គាល់សិទ្ធិអ្នកលក់ (ជម្រើសទូទៅ/អត្ថបទផ្ទាល់)"
                    value={data.sellerCapacityNote || ""}
                    onChange={(v) =>
                      setData((p) => ({ ...p, sellerCapacityNote: v }))
                    }
                    placeholder="ឧ. (១) អត្ត: ០១០៥៤៧៥៩... បំពេញកិច្ចនូវទ្រព្យរួមជាម្ចាស់សិទ្ធិអវិភាគ..."
                  />
                </div>
              </EditorCard>

              {/* Buyer (អ្នកទិញ) */}
              <EditorCard
                title="ភាគីអ្នកទិញ (Buyer)"
                hint="ឈ្មោះ អាយុ ជាតិ និងទីលំនៅ"
              >
                <div className="space-y-2.5">
                  <Field
                    label="អ្នកទិញ-ឈ្មោះ *"
                    value={data.buyer.name}
                    onChange={(v) =>
                      setData((p) => ({ ...p, buyer: { ...p.buyer, name: v } }))
                    }
                    placeholder="ឧ. ឡឹក សុផា និង នួន ស្រីពៅ"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="អាយុ (ឆ្នាំ)"
                      value={data.buyer.age}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          buyer: { ...p.buyer, age: v },
                        }))
                      }
                      placeholder="៣៨"
                    />
                    <Field
                      label="ជាតិ"
                      value={data.buyer.nationality}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          buyer: { ...p.buyer, nationality: v },
                        }))
                      }
                      placeholder="ខ្មែរ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="ទីលំនៅៗភូមិ"
                      value={data.buyer.village}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          buyer: { ...p.buyer, village: v },
                        }))
                      }
                      placeholder="ភូមិ..."
                    />
                    <Field
                      label="ឃុំ/សង្កាត់"
                      value={data.buyer.commune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          buyer: { ...p.buyer, commune: v },
                        }))
                      }
                      placeholder="ឃុំ/សង្កាត់..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="ស្រុក/ខណ្ឌ"
                      value={data.buyer.district}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          buyer: { ...p.buyer, district: v },
                        }))
                      }
                      placeholder="ស្រុក/ខណ្ឌ..."
                    />
                    <Field
                      label="ខេត្ត/រាជធានី"
                      value={data.buyer.province}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          buyer: { ...p.buyer, province: v },
                        }))
                      }
                      placeholder="ខេត្ត/រាជធានី..."
                    />
                  </div>
                  {/* Buyer Stacked National ID & Status */}
                  <div className="rounded-lg border bg-muted/20 p-2.5 space-y-2.5">
                    <span className="text-xs font-bold text-foreground">
                      អត្តសញ្ញាណប័ណ្ណ & ស្ថានភាពអ្នកទិញ (Stacked ID & Status)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Field
                        label="អត្ត: លេខប័ណ្ណ"
                        value={data.buyerIdNumber || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, buyerIdNumber: v }))
                        }
                        placeholder="១៩០៥០០៧១៤"
                      />
                      <Field
                        label="ចុះថ្ងៃ (Date)"
                        value={data.buyerIdDate || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, buyerIdDate: v }))
                        }
                        placeholder="០២.០៥.២០១៩"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field
                        label="កិច្ចសន្យាអ្នកទិញ"
                        value={data.buyerCapacityText || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, buyerCapacityText: v }))
                        }
                        placeholder="• បំពេញកិច្ចនូវទ្រព្យផ្ទាល់ខ្លួន"
                      />
                      <Field
                        label="ស្ថានភាព (ពោះម៉ាយ/លែងលះ...)"
                        value={data.buyerStatusText || ""}
                        onChange={(v) =>
                          setData((p) => ({ ...p, buyerStatusText: v }))
                        }
                        placeholder="(ពោះម៉ាយលែងលះពីនាង លឹម ស៊ីវ៉ី)"
                      />
                    </div>
                  </div>

                  <Field
                    label="កំណត់សម្គាល់ស្ថានភាពអ្នកទិញ (ជម្រើសទូទៅ/អត្ថបទផ្ទាល់)"
                    value={data.buyerCapacityNote || ""}
                    onChange={(v) =>
                      setData((p) => ({ ...p, buyerCapacityNote: v }))
                    }
                    placeholder="ឧ. អត្ត: ១៩០៥០០៧១៤... បំពេញកិច្ចនូវទ្រព្យផ្ទាល់ខ្លួន (ពោះម៉ាយ...)"
                  />
                </div>
              </EditorCard>
            </div>
          )}

          {/* ════════ Tab 2: Civil Status & Price (Page 1) ════════ */}
          {activeTab === "civil" && (
            <div className="space-y-4">
              {/* Buyer Civil Status Table */}
              <EditorCard
                title="អត្រានុកូលដ្ឋានអ្នកទិញ"
                hint="តារាងព័ត៌មានប្ដី និងប្រពន្ធ (ទំព័រទី១)"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Husband */}
                  <div className="rounded-lg border bg-muted/20 p-2.5 space-y-2">
                    <span className="text-xs font-bold text-foreground">
                      ប្ដី (Husband)
                    </span>
                    <Field
                      label="ឆ្នាំកំណើត"
                      value={data.husband.birthYear}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          husband: { ...p.husband, birthYear: v },
                        }))
                      }
                      placeholder="១៩៨៦"
                    />
                    <Field
                      label="ឃុំកំណើត"
                      value={data.husband.birthCommune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          husband: { ...p.husband, birthCommune: v },
                        }))
                      }
                      placeholder="ឃុំ..."
                    />
                    <Field
                      label="ឈ្មោះឪពុក"
                      value={data.husband.fatherName}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          husband: { ...p.husband, fatherName: v },
                        }))
                      }
                      placeholder="ឈ្មោះឪពុក"
                    />
                    <Field
                      label="ឈ្មោះម្តាយ"
                      value={data.husband.motherName}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          husband: { ...p.husband, motherName: v },
                        }))
                      }
                      placeholder="ឈ្មោះម្តាយ"
                    />
                  </div>

                  {/* Wife */}
                  <div className="rounded-lg border bg-muted/20 p-2.5 space-y-2">
                    <span className="text-xs font-bold text-foreground">
                      ប្រពន្ធ (Wife)
                    </span>
                    <Field
                      label="ឆ្នាំកំណើត"
                      value={data.wife.birthYear}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          wife: { ...p.wife, birthYear: v },
                        }))
                      }
                      placeholder="១៩៨៩"
                    />
                    <Field
                      label="ឃុំកំណើត"
                      value={data.wife.birthCommune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          wife: { ...p.wife, birthCommune: v },
                        }))
                      }
                      placeholder="ឃុំ..."
                    />
                    <Field
                      label="ឈ្មោះឪពុក"
                      value={data.wife.fatherName}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          wife: { ...p.wife, fatherName: v },
                        }))
                      }
                      placeholder="ឈ្មោះឪពុក"
                    />
                    <Field
                      label="ឈ្មោះម្តាយ"
                      value={data.wife.motherName}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          wife: { ...p.wife, motherName: v },
                        }))
                      }
                      placeholder="ឈ្មោះម្តាយ"
                    />
                  </div>
                </div>

                {/* Marriage Certificate */}
                <div className="pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold text-foreground">
                    សំបុត្រអាពាហ៍ពិពាហ៍
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
                    <Field
                      label="លេខ"
                      value={data.marriageCert.certNo}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          marriageCert: { ...p.marriageCert, certNo: v },
                        }))
                      }
                      placeholder="១២៤/០៨"
                    />
                    <Field
                      label="ចុះថ្ងៃ"
                      value={data.marriageCert.certDate}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          marriageCert: { ...p.marriageCert, certDate: v },
                        }))
                      }
                      placeholder="១៥.០៣.២០១០"
                    />
                    <Field
                      label="ឃុំ"
                      value={data.marriageCert.certCommune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          marriageCert: { ...p.marriageCert, certCommune: v },
                        }))
                      }
                      placeholder="ឃុំ..."
                    />
                    <Field
                      label="ស្រុក"
                      value={data.marriageCert.certDistrict}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          marriageCert: { ...p.marriageCert, certDistrict: v },
                        }))
                      }
                      placeholder="ស្រុក..."
                    />
                  </div>
                </div>
              </EditorCard>

              {/* Price */}
              <EditorCard
                title="តម្លៃជាប្រាក់ (Sale Price)"
                hint="ជាអក្សរ និងជាលេខ"
              >
                <div className="space-y-2.5">
                  <Field
                    label="តម្លៃជាប្រាក់ (ជាអក្សរ) *"
                    value={data.priceKhmer}
                    onChange={(v) => setData((p) => ({ ...p, priceKhmer: v }))}
                    placeholder="ឧ. ដប់ប្រាំម៉ឺនដុល្លារអាមេរិកគត់"
                  />
                  <Field
                    label="តម្លៃជាលេខ / រូបិយប័ណ្ណ"
                    value={data.priceNumber}
                    onChange={(v) => setData((p) => ({ ...p, priceNumber: v }))}
                    placeholder="ឧ. 150,000 $ ឬ ៦០០,០០០,០០០ រៀល"
                  />
                </div>
              </EditorCard>
            </div>
          )}

          {/* ════════ Tab 3: Fees & Receipt (Page 1) ════════ */}
          {activeTab === "fees" && (
            <div className="space-y-4">
              <EditorCard
                title="ពន្ធ និងកម្រៃសេវា"
                hint="ផ្នែកខាងក្រោមឆ្វេង (ទំព័រទី១)"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label="តែមប្រៃ"
                    value={data.stampFee}
                    onChange={(v) => setData((p) => ({ ...p, stampFee: v }))}
                    placeholder="២,០០០ រៀល"
                  />
                  <Field
                    label="ប្រាប់ត្រា"
                    value={data.registrationFee}
                    onChange={(v) =>
                      setData((p) => ({ ...p, registrationFee: v }))
                    }
                    placeholder="៤,០០០,០០០ រៀល"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label="បង្កាន់ដៃលេខ"
                    value={data.taxReceiptNo}
                    onChange={(v) =>
                      setData((p) => ({ ...p, taxReceiptNo: v }))
                    }
                    placeholder="០៤៨៥២១"
                  />
                  <Field
                    label="ចុះថ្ងៃ (បង្កាន់ដៃ)"
                    value={data.taxReceiptDate}
                    onChange={(v) =>
                      setData((p) => ({ ...p, taxReceiptDate: v }))
                    }
                    placeholder="១៥.១០.២០២៦"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label="រង្វាន់លិខិត"
                    value={data.cadastralFee}
                    onChange={(v) =>
                      setData((p) => ({ ...p, cadastralFee: v }))
                    }
                    placeholder="២០,០០០"
                  />
                  <Field
                    label="ដ"
                    value={data.cadastralFeeD1}
                    onChange={(v) =>
                      setData((p) => ({ ...p, cadastralFeeD1: v }))
                    }
                    placeholder="១០,០០០"
                  />
                  <Field
                    label="ដ"
                    value={data.cadastralFeeD2}
                    onChange={(v) =>
                      setData((p) => ({ ...p, cadastralFeeD2: v }))
                    }
                    placeholder="១០,០០០"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label="ប.ស.អ"
                    value={data.surveyFee}
                    onChange={(v) => setData((p) => ({ ...p, surveyFee: v }))}
                    placeholder="១០,០០០"
                  />
                  <Field
                    label="ដ"
                    value={data.surveyFeeD1}
                    onChange={(v) => setData((p) => ({ ...p, surveyFeeD1: v }))}
                    placeholder="៥,០០០"
                  />
                  <Field
                    label="ដ"
                    value={data.surveyFeeD2}
                    onChange={(v) => setData((p) => ({ ...p, surveyFeeD2: v }))}
                    placeholder="៥,០០០"
                  />
                </div>
                <Field
                  label="បូករួម (សរុប)"
                  value={data.totalFee}
                  onChange={(v) => setData((p) => ({ ...p, totalFee: v }))}
                  placeholder="៤,០៣២,០០០ រៀល"
                  className="font-bold"
                />
              </EditorCard>

              <EditorCard
                title="ការទទួលសំបុត្រដើម"
                hint="ផ្នែកខាងក្រោមស្តាំ (ទំព័រទី១)"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label="នៅថ្ងៃ (Received Date)"
                    value={data.receivedDate}
                    onChange={(v) =>
                      setData((p) => ({ ...p, receivedDate: v }))
                    }
                    placeholder="២០ តុលា ២០២៦"
                  />
                  <Field
                    label="ឈ្មោះអ្នកទទួល"
                    value={data.receiverName}
                    onChange={(v) =>
                      setData((p) => ({ ...p, receiverName: v }))
                    }
                    placeholder="ឈ្មោះអ្នកទទួល"
                  />
                </div>
              </EditorCard>
            </div>
          )}

          {/* ════════ Tab 4: Property & 7-Col Table (Page 2) ════════ */}
          {activeTab === "property" && (
            <div className="space-y-4">
              <EditorCard
                title="ទីតាំងអចលនវត្ថុ (ទំព័រទី២)"
                hint="ក្បាលដី និងអចលនវត្ថុ នៅក្នុង..."
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="នៅក្នុងឃុំ/សង្កាត់"
                    value={data.propertyCommune}
                    onChange={(v) =>
                      setData((p) => ({ ...p, propertyCommune: v }))
                    }
                    placeholder="ចោមចៅទី១"
                  />
                  <Field
                    label="ស្រុក/ខណ្ឌ"
                    value={data.propertyDistrict}
                    onChange={(v) =>
                      setData((p) => ({ ...p, propertyDistrict: v }))
                    }
                    placeholder="ពោធិ៍សែនជ័យ"
                  />
                </div>
              </EditorCard>

              <EditorCard
                title="តារាងក្បាលដី និងព្រំប្រទល់ (៧ ជួរឈរ)"
                hint="ក្បាលដី ទំហំ ប្រភេទដី ព្រំប្រទល់ ៤ ទិស"
              >
                <div className="space-y-3">
                  {(data.parcelRows || []).map((row, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border bg-muted/20 p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-xs font-bold text-foreground">
                          ជួរទី {idx + 1}
                        </span>
                        {(data.parcelRows || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParcelRow(idx)}
                            className="h-5 text-destructive text-[10px] gap-1 hover:bg-destructive/10"
                          >
                            <Trash2Icon className="size-3" />
                            លុបជួរនេះ
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Field
                          label="លេខរៀង/ផែនទី/បណ្ណឹង"
                          value={row.indexOrSheet}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "indexOrSheet", v)
                          }
                          placeholder="១. ប័ណ្ណលេខ ១២..."
                        />
                        <Field
                          label="ទំហំ"
                          value={row.area}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "area", v)
                          }
                          placeholder="១៥៧ m²"
                        />
                        <Field
                          label="ប្រភេទដី"
                          value={row.landType}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "landType", v)
                          }
                          placeholder="លំនៅឋាន"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <Field
                          label="ខាងជើង"
                          value={row.boundaryNorth}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "boundaryNorth", v)
                          }
                          placeholder="ខាងជើង"
                        />
                        <Field
                          label="ខាងត្បូង"
                          value={row.boundarySouth}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "boundarySouth", v)
                          }
                          placeholder="ខាងត្បូង"
                        />
                        <Field
                          label="ខាងកើត"
                          value={row.boundaryEast}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "boundaryEast", v)
                          }
                          placeholder="ខាងកើត"
                        />
                        <Field
                          label="ខាងលិច"
                          value={row.boundaryWest}
                          onChange={(v) =>
                            handleParcelRowChange(idx, "boundaryWest", v)
                          }
                          placeholder="ខាងលិច"
                        />
                      </div>

                      <Field
                        label="បន្ទុកដែលជាប់ ទូទាំងអចលនវត្ថុ"
                        value={row.encumbrance}
                        onChange={(v) =>
                          handleParcelRowChange(idx, "encumbrance", v)
                        }
                        placeholder="គ្មាន"
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParcelRow}
                    className="w-full h-8 text-xs gap-1 border-dashed"
                  >
                    <PlusIcon className="size-3" />
                    បន្ថែមជួរដីថ្មី
                  </Button>
                </div>
              </EditorCard>
            </div>
          )}

          {/* ════════ Tab 5: Certification & Witnesses (Page 2) ════════ */}
          {activeTab === "cert" && (
            <div className="space-y-4">
              <EditorCard
                title="សេចក្តីបញ្ជាក់របស់អាជ្ញាធរ"
                hint="ធ្វើជាពីរច្បាប់ ថ្ងៃ... ខែ... ឆ្នាំ..."
              >
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label="ថ្ងៃទី"
                    value={data.contractDateDay}
                    onChange={(v) =>
                      setData((p) => ({ ...p, contractDateDay: v }))
                    }
                    placeholder="២០"
                  />
                  <Field
                    label="ខែ"
                    value={data.contractDateMonth}
                    onChange={(v) =>
                      setData((p) => ({ ...p, contractDateMonth: v }))
                    }
                    placeholder="តុលា"
                  />
                  <Field
                    label="ឆ្នាំ"
                    value={data.contractDateYear}
                    onChange={(v) =>
                      setData((p) => ({ ...p, contractDateYear: v }))
                    }
                    placeholder="២០២៦"
                  />
                </div>
                <Field
                  label="នៅចំពោះមុខយើង (Officer Title & Name)"
                  value={data.officialTitleAndName}
                  onChange={(v) =>
                    setData((p) => ({ ...p, officialTitleAndName: v }))
                  }
                  placeholder="ប្រធានការិយាល័យរៀបចំដែនដី..."
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label="បានឃើញឈ្មោះ (អ្នកលក់)"
                    value={data.sellerVerifiedNames}
                    onChange={(v) =>
                      setData((p) => ({ ...p, sellerVerifiedNames: v }))
                    }
                    placeholder="ឈ្មោះអ្នកលក់"
                  />
                  <Field
                    label="និងឈ្មោះ (អ្នកទិញ)"
                    value={data.buyerVerifiedNames}
                    onChange={(v) =>
                      setData((p) => ({ ...p, buyerVerifiedNames: v }))
                    }
                    placeholder="ឈ្មោះអ្នកទិញ"
                  />
                </div>
              </EditorCard>

              <EditorCard
                title="សាក្សី (២ នាក់) & បញ្ជាក់ចុះលេខ"
                hint="បានអានសេចក្តីនៃលិខិតនេះ..."
              >
                {/* Witness 1 */}
                <div className="rounded-lg border bg-muted/20 p-2.5 space-y-2">
                  <span className="text-xs font-bold text-foreground">
                    សាក្សីទី១
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="ឈ្មោះ"
                      value={data.witness1.name}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness1: { ...p.witness1, name: v },
                        }))
                      }
                      placeholder="ឈ្មោះសាក្សីទី១"
                    />
                    <Field
                      label="អាយុ (ឆ្នាំ)"
                      value={data.witness1.age}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness1: { ...p.witness1, age: v },
                        }))
                      }
                      placeholder="២២"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field
                      label="ឃុំ"
                      value={data.witness1.commune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness1: { ...p.witness1, commune: v },
                        }))
                      }
                      placeholder="ឃុំ..."
                    />
                    <Field
                      label="ស្រុក"
                      value={data.witness1.district}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness1: { ...p.witness1, district: v },
                        }))
                      }
                      placeholder="ស្រុក..."
                    />
                    <Field
                      label="ខេត្ត"
                      value={data.witness1.province}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness1: { ...p.witness1, province: v },
                        }))
                      }
                      placeholder="ខេត្ត..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="អត្ត: លេខប័ណ្ណ (Stacked)"
                      value={data.witness1IdNumber || ""}
                      onChange={(v) =>
                        setData((p) => ({ ...p, witness1IdNumber: v }))
                      }
                      placeholder="០១០៦៥៤៧០៦ (០១)"
                    />
                    <Field
                      label="ចុះថ្ងៃ (Date)"
                      value={data.witness1IdDate || ""}
                      onChange={(v) =>
                        setData((p) => ({ ...p, witness1IdDate: v }))
                      }
                      placeholder="០១.១២.២០២៥"
                    />
                  </div>
                  <Field
                    label="អត្តសញ្ញាណប័ណ្ណសាក្សីទី១ (ជម្រើសទូទៅ/អត្ថបទផ្ទាល់)"
                    value={data.witness1IdCard || ""}
                    onChange={(v) =>
                      setData((p) => ({ ...p, witness1IdCard: v }))
                    }
                    placeholder="ឧ. អត្ត: ០១០៦៥៤៧០៦ (០១) / ០១.១២.២០២៥"
                  />
                </div>

                {/* Witness 2 */}
                <div className="rounded-lg border bg-muted/20 p-2.5 space-y-2">
                  <span className="text-xs font-bold text-foreground">
                    សាក្សីទី២
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="ឈ្មោះ"
                      value={data.witness2.name}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness2: { ...p.witness2, name: v },
                        }))
                      }
                      placeholder="ឈ្មោះសាក្សីទី២"
                    />
                    <Field
                      label="អាយុ (ឆ្នាំ)"
                      value={data.witness2.age}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness2: { ...p.witness2, age: v },
                        }))
                      }
                      placeholder="២៩"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field
                      label="ឃុំ"
                      value={data.witness2.commune}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness2: { ...p.witness2, commune: v },
                        }))
                      }
                      placeholder="ឃុំ..."
                    />
                    <Field
                      label="ស្រុក"
                      value={data.witness2.district}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness2: { ...p.witness2, district: v },
                        }))
                      }
                      placeholder="ស្រុក..."
                    />
                    <Field
                      label="ខេត្ត"
                      value={data.witness2.province}
                      onChange={(v) =>
                        setData((p) => ({
                          ...p,
                          witness2: { ...p.witness2, province: v },
                        }))
                      }
                      placeholder="ខេត្ត..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="អត្ត: លេខប័ណ្ណ (Stacked)"
                      value={data.witness2IdNumber || ""}
                      onChange={(v) =>
                        setData((p) => ({ ...p, witness2IdNumber: v }))
                      }
                      placeholder="០១១១៥២៩០២ (០១)"
                    />
                    <Field
                      label="ចុះថ្ងៃ (Date)"
                      value={data.witness2IdDate || ""}
                      onChange={(v) =>
                        setData((p) => ({ ...p, witness2IdDate: v }))
                      }
                      placeholder="២០.០២.២០២៦"
                    />
                  </div>
                  <Field
                    label="អត្តសញ្ញាណប័ណ្ណសាក្សីទី២ (ជម្រើសទូទៅ/អត្ថបទផ្ទាល់)"
                    value={data.witness2IdCard || ""}
                    onChange={(v) =>
                      setData((p) => ({ ...p, witness2IdCard: v }))
                    }
                    placeholder="ឧ. អត្ត: ០១១១៥២៩០២ (០១) / ២០.០២.២០២៦"
                  />
                </div>

                <Field
                  label="បញ្ជាក់ចុះលេខ"
                  value={data.certRegistrationNo}
                  onChange={(v) =>
                    setData((p) => ({ ...p, certRegistrationNo: v }))
                  }
                  placeholder="១០៨/២៦"
                />
              </EditorCard>

              {/* Page 2 Signatures Block Names */}
              <EditorCard
                title="ហត្ថលេខា និងឈ្មោះនៅខាងក្រោម (ទំព័រទី២)"
                hint="ឈ្មោះបោះពុម្ពក្រោមស្នាមមេដៃ/ហត្ថលេខា"
              >
                <Field
                  label="ឈ្មោះក្រោមអ្នកលក់ (Seller Names)"
                  value={data.sellerSignatureNames || ""}
                  onChange={(v) =>
                    setData((p) => ({ ...p, sellerSignatureNames: v }))
                  }
                  placeholder="ស៊ិន វិសិដ្ឋ   ស៊ិន ស៊ីថាវាត"
                />
                <Field
                  label="ឈ្មោះក្រោមអ្នកទិញ (Buyer Names)"
                  value={data.buyerSignatureNames || ""}
                  onChange={(v) =>
                    setData((p) => ({ ...p, buyerSignatureNames: v }))
                  }
                  placeholder="ជង់ វិទូរ"
                />
                <Field
                  label="ឈ្មោះក្រោមសាក្សី (Witness Names)"
                  value={data.witnessSignatureNames || ""}
                  onChange={(v) =>
                    setData((p) => ({ ...p, witnessSignatureNames: v }))
                  }
                  placeholder="នាង យុន សុជាតា   សុខ សឿន"
                />
              </EditorCard>
            </div>
          )}
        </div>

        {/* Right Column: Live Document Preview (7 cols on large screens) */}
        <div className="lg:col-span-7 sticky top-4 space-y-3">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-2.5 shadow-2xs text-xs">
            {/* Paper Size Switcher */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
              <span className="px-1 text-[11px] font-medium text-muted-foreground">
                ទំហំក្រដាស:
              </span>
              <button
                type="button"
                onClick={() => setPaperSize("original")}
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                  paperSize === "original"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ក្រដាសពុម្ពដើម (195×297mm)
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("a4")}
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                  paperSize === "a4"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                A4 (210×297mm)
              </button>
            </div>

            {/* Print Mode Switcher */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setFillOnly(false)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                  !fillOnly
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <EyeIcon className="size-3" />
                បោះពុម្ពពេញលេញ
              </button>
              <button
                type="button"
                onClick={() => setFillOnly(true)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                  fillOnly
                    ? "bg-amber-600 text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <EyeOffIcon className="size-3" />
                បំពេញលើក្រដាសពុម្ព
              </button>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="h-7 text-xs gap-1"
            >
              <PrinterIcon className="size-3" />
              បោះពុម្ព
            </Button>
          </div>

          {/* Hint for Pre-printed Stationery fill mode */}
          {fillOnly && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-2 text-center text-xs text-amber-800 dark:text-amber-300">
              ⚠️ <strong>របៀបបំពេញលើក្រដាសពុម្ពដើម:</strong> អត្ថបទពុម្ព
              និងតារាងត្រូវបានលាក់ ដើម្បីបោះពុម្ពតែទិន្នន័យលើក្រដាសពុម្ពលេខ ៦
              ចំចន្លោះគូសចំណុច។
            </div>
          )}

          {/* Scaled Live Document Container */}
          <div className="overflow-x-auto rounded-xl border bg-muted/10 p-4 max-h-[80vh] overflow-y-auto">
            <FinalSaleDeedPrint
              data={data}
              paperSize={paperSize}
              fillOnly={fillOnly}
            />
          </div>
        </div>
      </div>

      {/* ─── Saved Records DB Store Dialog (Matching declarations-view UI) ─── */}
      <Dialog open={recordsOpen} onOpenChange={setRecordsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col font-battambang">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold">
                  បញ្ជីឯកសារលក់ផ្តាច់ (Final Sale Deed Records)
                </DialogTitle>
                <DialogDescription className="text-xs">
                  គ្រប់គ្រង បើកកែសម្រួល បោះពុម្ព
                  ឬចម្លងឯកសារលក់ផ្តាច់ដែលបានរក្សាទុក
                </DialogDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                សរុប: {savedRecords.length}
              </Badge>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="ស្វែងរកតាមឈ្មោះអ្នកលក់ អ្នកទិញ លេខអ្នកតែង ឬលេខក្បាលដី..."
                className="pl-9 h-8 text-xs"
              />
            </div>
          </DialogHeader>

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {paginatedRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                មិនមានទិន្នន័យឯកសារលក់ផ្តាច់ដែលត្រូវស្វែងរកឡើយ
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-10 text-center">ល.រ</TableHead>
                      <TableHead>ក្បាលដី / លេខប័ណ្ណ</TableHead>
                      <TableHead>ភាគីអ្នកលក់</TableHead>
                      <TableHead>ភាគីអ្នកទិញ</TableHead>
                      <TableHead>តម្លៃជាប្រាក់</TableHead>
                      <TableHead>ក្រឡាផ្ទៃ</TableHead>
                      <TableHead>កាលបរិច្ឆេទ</TableHead>
                      <TableHead className="text-right">សកម្មភាព</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((r, idx) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-center font-mono text-[11px]">
                          {(page - 1) * pageSize + idx + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {r.parcelRows?.[0]?.indexOrSheet ||
                            r.drafterRefNo ||
                            "—"}
                        </TableCell>
                        <TableCell className="truncate max-w-[130px]">
                          {r.seller.name || "—"}
                        </TableCell>
                        <TableCell className="truncate max-w-[130px]">
                          {r.buyer.name || "—"}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-700 dark:text-emerald-400">
                          {r.priceNumber || r.priceKhmer || "—"}
                        </TableCell>
                        <TableCell>{r.parcelRows?.[0]?.area || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-[11px]">
                          {r.receivedDate || r.contractDateDay
                            ? `${r.contractDateDay}.${r.contractDateMonth}.${r.contractDateYear}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleLoadRecord(r)}
                            title="បើកកែសម្រួល"
                            className="size-7"
                          >
                            <PencilIcon className="size-3.5 text-primary" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDuplicateRecord(r.id)}
                            title="ចម្លងឯកសារ"
                            className="size-7"
                          >
                            <CopyIcon className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteRecord(r.id)}
                            title="លុបឯកសារ"
                            className="size-7 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>
                ទំព័រ {page} នៃ {totalPages} (សរុប {filteredRecords.length}{" "}
                ឯកសារ)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="size-7"
                >
                  <ChevronsLeftIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="size-7"
                >
                  <ChevronLeftIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="size-7"
                >
                  <ChevronRightIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="size-7"
                >
                  <ChevronsRightIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
