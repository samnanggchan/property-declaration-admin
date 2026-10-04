"use client";

import * as React from "react";
import {
  CalendarDaysIcon,
  PrinterIcon,
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

// Initial sample data matching user screenshot media_1791100916152.png
const DEFAULT_FORM_DATA: PortraitCadastralData = {
  documentDate: "04.10.2026",
  issueLocation: "រាជធានីភ្នំពេញ",

  // Owner 1 (Husband)
  owner1Name: "ស៊ុន ពិសិដ្ឋ",
  owner1Dob: "15.08.1982",
  owner1BirthPlace: "ភ្នំពេញ",
  owner1IdNumber: "010884912(01)/15.03.20",
  owner1Nationality: "ខ្មែរ",
  owner1Status: "រៀបការ",
  owner1Father: "ស៊ុន សុផល",
  owner1Mother: "ម៉ម សុវណ្ណ",

  // Owner 2 (Wife)
  owner2Name: "កែវ សោភា",
  owner2Dob: "10.11.1986",
  owner2BirthPlace: "កណ្តាល",
  owner2IdNumber: "010352372(02)/12.08.18",
  owner2Nationality: "ខ្មែរ",
  owner2Status: "រៀបការ",
  owner2Father: "កែវ គឹមសាន",
  owner2Mother: "អ៊ុច ផល្លា",

  // Property & Transaction
  propertyType: "ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)",
  parcelNumber: "8480",
  sheetNumber: "១២០៩០៦០៥",
  location: "រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១",
  transferType: "ទិញ",
  transferDeedNo: "០១/២៦.ស.រ.អ",
  transferDeedDate: "04.10.2026",
  transferDetails: "កិច្ចសន្យាទិញ-លក់ផ្តាច់",
  encumbrance: "គ្មាន",
  remarks: "—",
  col2CustomText: "មើលព័ត៌មាននៅខាងលើ",
};

export default function CisPage() {
  const [formData, setFormData] =
    React.useState<PortraitCadastralData>(DEFAULT_FORM_DATA);
  const [viewMode, setViewMode] = React.useState<"split" | "form" | "preview">(
    "split"
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
      propertyType: "ទ្រព្យសម្បត្តិរួម",
      parcelNumber: "",
      sheetNumber: "",
      location: "",
      transferType: "ទិញ",
      transferDeedNo: "",
      transferDeedDate: "",
      transferDetails: "",
      encumbrance: "គ្មាន",
      remarks: "—",
      col2CustomText: "មើលព័ត៌មាននៅខាងលើ",
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
            អត្រានុកូលដ្ឋានម្ចាស់អចលនវត្ថុ & ប្រតិទិនចន្ទគតិខ្មែរ
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
              : "grid-cols-1"
        )}
      >
        {/* ── Section 1: Form Inputs (Matching media_1791100916152.png) ──────── */}
        {(viewMode === "split" || viewMode === "form") && (
          <div
            className={cn(
              "space-y-6 rounded-xl border border-border/80 bg-card p-5 shadow-xs no-print",
              viewMode === "split" ? "lg:col-span-6" : "w-full"
            )}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <LayoutGridIcon className="size-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground font-khmer">
                  ទម្រង់បញ្ចូលកាលបរិច្ឆេទ & អត្តសញ្ញាណ (Date & Owner Inputs)
                </h2>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Live Dynamic Calculation
              </span>
            </div>

            {/* 3-Column Grid (Direct match of media_1791100916152.png) */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                ព័ត៌មានម្ចាស់កម្មសិទ្ធិ (កាលបរិច្ឆេទចន្ទគតិស្វ័យប្រវត្តិ)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Column 1: Husband DOB + Status */}
                <div className="space-y-3">
                  <KhmerCalendarInputCard
                    label="ថ្ងៃខែឆ្នាំកំណើត (ប្តី)"
                    value={formData.owner1Dob || ""}
                    onChange={(v) => updateField("owner1Dob", v)}
                    placeholder="15.08.1982"
                  />

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ស្ថានភាព
                    </Label>
                    <Input
                      value={formData.owner1Status || ""}
                      onChange={(e) =>
                        updateField("owner1Status", e.target.value)
                      }
                      placeholder="រៀបការ"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs dark:bg-neutral-900/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ឈ្មោះប្តី (Husband Name)
                    </Label>
                    <Input
                      value={formData.owner1Name || ""}
                      onChange={(e) => updateField("owner1Name", e.target.value)}
                      placeholder="ស៊ុន ពិសិដ្ឋ"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs font-medium dark:bg-neutral-900/80"
                    />
                  </div>
                </div>

                {/* Column 2: ID Number + Nationality + Issue Date */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      អត្តសញ្ញាណប័ណ្ណលេខ
                    </Label>
                    <Input
                      value={formData.owner1IdNumber || ""}
                      onChange={(e) =>
                        updateField("owner1IdNumber", e.target.value)
                      }
                      placeholder="010884912(01)/15.03.20"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-sm font-mono tracking-wide text-neutral-900 dark:bg-neutral-900/80 dark:text-neutral-100"
                    />
                    <div className="min-h-[76px] rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-2.5 flex items-center justify-center text-center dark:border-neutral-800 dark:bg-neutral-900/30">
                      <p className="text-[11px] text-muted-foreground">
                        លេខអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      សញ្ជាតិ
                    </Label>
                    <Input
                      value={formData.owner1Nationality || ""}
                      onChange={(e) =>
                        updateField("owner1Nationality", e.target.value)
                      }
                      placeholder="ខ្មែរ"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs dark:bg-neutral-900/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ទីតាំងធ្វើឯកសារ
                    </Label>
                    <Input
                      value={formData.issueLocation || ""}
                      onChange={(e) =>
                        updateField("issueLocation", e.target.value)
                      }
                      placeholder="រាជធានីភ្នំពេញ"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs dark:bg-neutral-900/80"
                    />
                  </div>
                </div>

                {/* Column 3: Wife DOB + Status */}
                <div className="space-y-3">
                  <KhmerCalendarInputCard
                    label="ថ្ងៃខែឆ្នាំកំណើត (ប្រពន្ធ)"
                    value={formData.owner2Dob || ""}
                    onChange={(v) => updateField("owner2Dob", v)}
                    placeholder="10.11.1986"
                  />

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ស្ថានភាព
                    </Label>
                    <Input
                      value={formData.owner2Status || ""}
                      onChange={(e) =>
                        updateField("owner2Status", e.target.value)
                      }
                      placeholder="រៀបការ"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs dark:bg-neutral-900/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ឈ្មោះប្រពន្ធ (Wife Name)
                    </Label>
                    <Input
                      value={formData.owner2Name || ""}
                      onChange={(e) => updateField("owner2Name", e.target.value)}
                      placeholder="កែវ សោភា"
                      className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs font-medium dark:bg-neutral-900/80"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Date with Live Khmer Lunar Preview */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
              <div className="text-xs font-semibold text-foreground">
                កាលបរិច្ឆេទធ្វើលិខិតផ្លូវការ (Document Issue Date)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KhmerCalendarInputCard
                  label="កាលបរិច្ឆេទធ្វើលិខិត"
                  value={formData.documentDate || ""}
                  onChange={(v) => updateField("documentDate", v)}
                  issueLocation={formData.issueLocation || "រាជធានីភ្នំពេញ"}
                  placeholder="04.10.2026"
                />
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    អត្ថបទជួរឈរទី២ (Col 2 Remark)
                  </Label>
                  <Input
                    value={formData.col2CustomText || ""}
                    onChange={(e) =>
                      updateField("col2CustomText", e.target.value)
                    }
                    placeholder="មើលព័ត៌មាននៅខាងលើ"
                    className="h-10 rounded-full border-neutral-200/90 bg-neutral-100/80 px-4 text-xs dark:bg-neutral-900/80"
                  />
                  <div className="min-h-[76px] rounded-xl border border-neutral-200/80 bg-white p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 flex items-center">
                    <span>
                      នឹងបង្ហាញក្នុងជួរឈរលេខ ២: «{formData.col2CustomText || "មើលព័ត៌មាននៅខាងលើ"}»
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ancestry & Property Details */}
            <div className="space-y-4 pt-2 border-t">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                សាវតារ និងព័ត៌មានកិច្ចសន្យា (Ancestry & Deed Info)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/80">
                    ឪពុក-ម្តាយប្តី (Father & Mother)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.owner1Father || ""}
                      onChange={(e) =>
                        updateField("owner1Father", e.target.value)
                      }
                      placeholder="ឪពុក"
                      className="h-9 text-xs"
                    />
                    <Input
                      value={formData.owner1Mother || ""}
                      onChange={(e) =>
                        updateField("owner1Mother", e.target.value)
                      }
                      placeholder="ម្តាយ"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/80">
                    ឪពុក-ម្តាយប្រពន្ធ (Father & Mother)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.owner2Father || ""}
                      onChange={(e) =>
                        updateField("owner2Father", e.target.value)
                      }
                      placeholder="ឪពុក"
                      className="h-9 text-xs"
                    />
                    <Input
                      value={formData.owner2Mother || ""}
                      onChange={(e) =>
                        updateField("owner2Mother", e.target.value)
                      }
                      placeholder="ម្តាយ"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Parcel & Location Details (Shown on Page 1) */}
              <div className="space-y-3 pt-2 border-t">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                  ព័ត៌មានក្បាលដី និងទីតាំង (Parcel & Location - Page 1)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      វិញ្ញាបនបត្រលេខ
                    </Label>
                    <Input
                      value={formData.certNumber || ""}
                      onChange={(e) => updateField("certNumber", e.target.value)}
                      placeholder="១២០៩០៦០៥- ៤៥៧៥"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ក្បាលដីលេខ
                    </Label>
                    <Input
                      value={formData.parcelNumber || ""}
                      onChange={(e) => updateField("parcelNumber", e.target.value)}
                      placeholder="8480"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      សន្លឹកផែនទីលេខ
                    </Label>
                    <Input
                      value={formData.sheetNumber || ""}
                      onChange={(e) => updateField("sheetNumber", e.target.value)}
                      placeholder="១២០៩០៦០៥"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ទំហំដី
                    </Label>
                    <Input
                      value={formData.area || ""}
                      onChange={(e) => updateField("area", e.target.value)}
                      placeholder="93 ម²"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ប្រភេទដី
                    </Label>
                    <Input
                      value={formData.landType || ""}
                      onChange={(e) => updateField("landType", e.target.value)}
                      placeholder="សាងសង់"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">
                      ទីតាំងស្ថិតនៅ
                    </Label>
                    <Input
                      value={formData.location || ""}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/80">
                    ប្រភេទទ្រព្យ (Property Type)
                  </Label>
                  <Input
                    value={formData.propertyType || ""}
                    onChange={(e) => updateField("propertyType", e.target.value)}
                    placeholder="ទ្រព្យសម្បត្តិរួម"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/80">
                    ការផ្លាស់ប្តូរ (Deed Type)
                  </Label>
                  <Input
                    value={formData.transferType || ""}
                    onChange={(e) => updateField("transferType", e.target.value)}
                    placeholder="ទិញ"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/80">
                    បន្ទុកលើអចលនវត្ថុ
                  </Label>
                  <Input
                    value={formData.encumbrance || ""}
                    onChange={(e) => updateField("encumbrance", e.target.value)}
                    placeholder="គ្មាន"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">
                  លេខចារឹកដោយសង្ខេបនៃលិខិតសញ្ញា ឬ សាលក្រមតុលាការ
                </Label>
                <Input
                  value={formData.transferDetails || ""}
                  onChange={(e) =>
                    updateField("transferDetails", e.target.value)
                  }
                  placeholder="កិច្ចសន្យាទិញ-លក់ផ្តាច់"
                  className="h-9 text-xs"
                />
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
                : "hidden print:block print:w-full"
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
