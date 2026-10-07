"use client";

import * as React from "react";
import {
  CalendarDaysIcon,
  DownloadIcon,
  RotateCcwIcon,
  SparklesIcon,
  FileTextIcon,
  ColumnsIcon,
  EyeIcon,
  LayoutGridIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { KhmerCalendarInputCard } from "@/components/khmer-calendar-input-card";
import {
  PortraitCadastralDocument,
  PortraitCadastralData,
} from "@/components/portrait-cadastral-document";
import { cn } from "@/lib/utils";

// Initial sample data focused strictly on official print-fill requirements
const DEFAULT_FORM_DATA: PortraitCadastralData = {
  // Page 1: Official Issue Date (Dynamic Calculation)
  documentDate: "08.10.2026",
  issueLocation: "រាជធានីភ្នំពេញ",

  // Page 2: Dynamic Cadastral Register Data (All blank except active remarks)
  remarksRed: "មកពី",
  remarksBlue: "ក្បាលដីលេខ ៤២១ (បំបែកក្បាលដី)",
  page2Col1Text: "",
  col2CustomText: "",
  page2Col3Text: "",
  transferType: "",
  transferDeedNo: "",
  transferDeedDate: "",
  transferDetails: "",
  encumbrance: "",
  remarks: "",

  // Blank defaults for unused fields
  owner1Name: "",
  owner1Dob: "",
  owner1BirthPlace: "",
  owner1IdNumber: "",
  owner1Nationality: "ខ្មែរ",
  owner1Status: "",
  owner1Father: "",
  owner1Mother: "",

  owner2Name: "",
  owner2Dob: "",
  owner2BirthPlace: "",
  owner2IdNumber: "",
  owner2Nationality: "ខ្មែរ",
  owner2Status: "",
  owner2Father: "",
  owner2Mother: "",

  propertyType: "",
  parcelNumber: "",
  sheetNumber: "",
  location: "",
};

export default function CisPage() {
  const [formData, setFormData] =
    React.useState<PortraitCadastralData>(DEFAULT_FORM_DATA);
  const [viewMode, setViewMode] = React.useState<"split" | "form" | "preview">(
    "split",
  );

  const updateField = (key: keyof PortraitCadastralData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleClear = () => {
    setFormData({
      documentDate: "",
      issueLocation: "រាជធានីភ្នំពេញ",
      remarksRed: "",
      remarksBlue: "",
      page2Col1Text: "",
      col2CustomText: "",
      page2Col3Text: "",
      transferType: "",
      transferDeedNo: "",
      transferDeedDate: "",
      transferDetails: "",
      encumbrance: "",
      remarks: "",
      owner1Name: "",
      owner1Dob: "",
      owner1BirthPlace: "",
      owner1IdNumber: "",
      owner1Nationality: "ខ្មែរ",
      owner1Status: "",
      owner1Father: "",
      owner1Mother: "",
      owner2Name: "",
      owner2Dob: "",
      owner2BirthPlace: "",
      owner2IdNumber: "",
      owner2Nationality: "ខ្មែរ",
      owner2Status: "",
      owner2Father: "",
      owner2Mother: "",
      propertyType: "",
      parcelNumber: "",
      sheetNumber: "",
      location: "",
    });
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 print:p-0 print:m-0 print:block print:w-full">
      {/* ── Page Header & Controls ────────────────────────────────────────── */}
      <div className="no-print flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-foreground font-khmer">
              ប្រព័ន្ធព័ត៌មានសុរិយោដី (CIS)
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-medium"
            >
              A4 Portrait • ២ ទំព័រ
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-khmer">
            ទម្រង់បំពេញទិន្នន័យលើប័ណ្ណកម្មសិទ្ធិ & សៀវភៅគោលបញ្ជីដីធ្លី
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
            <Button
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("split")}
              className="h-7 px-2.5 text-xs gap-1"
              title="បង្ហាញទាំងទម្រង់បញ្ចូល និងឯកសារ"
            >
              <ColumnsIcon className="size-3.5" />
              <span className="hidden sm:inline">ទិដ្ឋភាពទន្ទឹម (Split)</span>
            </Button>
            <Button
              variant={viewMode === "form" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("form")}
              className="h-7 px-2.5 text-xs gap-1"
              title="បង្ហាញតែទម្រង់បញ្ចូលទិន្នន័យ"
            >
              <FileTextIcon className="size-3.5" />
              <span className="hidden sm:inline">ទម្រង់បញ្ចូល (Form)</span>
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="h-7 px-2.5 text-xs gap-1"
              title="បង្ហាញតែឯកសារបញ្ឈរ"
            >
              <EyeIcon className="size-3.5" />
              <span className="hidden sm:inline">មើលឯកសារ (Preview)</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            title="ទាញទិន្នន័យគំរូដើម"
          >
            <SparklesIcon className="size-3.5 text-primary" />
            <span className="hidden md:inline">ទិន្នន័យគំរូ</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive"
            title="ជម្រះទិន្នន័យទាំងអស់"
          >
            <RotateCcwIcon className="size-3.5" />
            <span className="hidden md:inline">ជម្រះ</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 gap-1.5 bg-neutral-900 px-3.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
            title="ទាញយកជា PDF ឬបោះពុម្ព (Save as PDF)"
          >
            <DownloadIcon className="size-3.5" />
            <span>ទាញយក PDF / បោះពុម្ព</span>
          </Button>
        </div>
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "grid gap-6 items-start print:block print:w-full print:p-0 print:m-0",
          viewMode === "split"
            ? "grid-cols-1 lg:grid-cols-12"
            : viewMode === "form"
              ? "grid-cols-1 max-w-4xl mx-auto w-full"
              : "grid-cols-1",
        )}
      >
        {/* ── Section 1: Form Inputs ────────────────────────────────────────── */}
        {(viewMode === "split" || viewMode === "form") && (
          <div
            className={cn(
              "space-y-5 rounded-xl border border-border/80 bg-card p-5 shadow-xs no-print",
              viewMode === "split" ? "lg:col-span-6" : "w-full",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <LayoutGridIcon className="size-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground font-khmer">
                  ទម្រង់បញ្ចូលទិន្នន័យបោះពុម្ព (Print Fill-In Form)
                </h2>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/20"
              >
                ទិន្នន័យជាក់ស្តែង
              </Badge>
            </div>

            {/* ── Card 1: Page 1 Document Issue Date (Matching User Screenshot) ── */}
            <div className="rounded-xl border border-border/70 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 space-y-3 font-khmer shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="size-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">
                    កាលបរិច្ឆេទធ្វើលិខិតផ្លូវការ (Document Issue Date)
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <KhmerCalendarInputCard
                  label="កាលបរិច្ឆេទធ្វើលិខិត"
                  value={formData.documentDate || ""}
                  onChange={(v) => updateField("documentDate", v)}
                  issueLocation={formData.issueLocation || "រាជធានីភ្នំពេញ"}
                  placeholder="04.10.2026"
                />
              </div>
            </div>

            {/* ── Card 2: Page 2 Dynamic Cadastral Register Data ──────────────── */}
            <div className="rounded-xl border border-border/70 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 space-y-4 font-khmer shadow-2xs">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">
                    ទំព័រទី២ — សៀវភៅគោលបញ្ជីដីធ្លី
                  </h3>
                </div>
              </div>

              {/* ── Column 6: សេចក្តីផ្សេងៗ (Remarks: Red line + Blue line) ── */}
              <div className="rounded-lg border border-border/80 bg-white dark:bg-neutral-950 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      ជួរឈរទី៦ — សេចក្តីផ្សេងៗ (Col 6 Remarks / Notes)
                    </Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {/* Line 1: Red Text */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block size-2 rounded-full bg-red-600 ring-2 ring-red-200 dark:ring-red-950" />
                        <Label className="text-xs font-semibold text-red-600 dark:text-red-400">
                          បន្ទាត់ទី១ (ពណ៌ក្រហម • Bold Red Text)
                        </Label>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        ជួរខាងលើគេ
                      </span>
                    </div>
                    <Input
                      value={formData.remarksRed ?? ""}
                      onChange={(e) =>
                        updateField("remarksRed", e.target.value)
                      }
                      placeholder="ឧ. មកពី"
                      className="h-9 text-xs border-red-300 dark:border-red-900/50 focus-visible:ring-red-500 font-bold text-red-600 dark:text-red-400 bg-red-50/20 dark:bg-neutral-950"
                    />
                  </div>

                  {/* Line 2: Blue Text (wraps under Red) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block size-2 rounded-full bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-950" />
                        <Label className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          បន្ទាត់ទី២ (ពណ៌ខៀវ រុំចុះក្រោម • Blue Text)
                        </Label>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        រុំចុះក្រោមបន្ទាត់ទី១
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.remarksBlue ?? ""}
                      onChange={(e) =>
                        updateField("remarksBlue", e.target.value)
                      }
                      placeholder="ឧ. ក្បាលដីលេខ ៤២១ (បំបែកក្បាលដី)"
                      className="flex w-full rounded-md border border-blue-300 dark:border-blue-900/50 bg-blue-50/20 dark:bg-neutral-950 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-none font-khmer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 2: Portrait Cadastral Document Preview ───────────────── */}
        <div
          className={cn(
            "flex flex-col items-center print:block print:w-full",
            viewMode === "split"
              ? "lg:col-span-6"
              : viewMode === "preview"
                ? "w-full"
                : "hidden print:block print:w-full",
          )}
        >
          <PortraitCadastralDocument
            data={formData}
            className="w-full"
            showPrintButton={false}
          />
        </div>
      </div>
    </div>
  );
}
