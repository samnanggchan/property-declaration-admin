"use client";

import * as React from "react";
import {
  PrinterIcon,
  DownloadIcon,
  RotateCwIcon,
  CheckIcon,
  SlidersHorizontalIcon,
  RotateCcwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, toKhmerNum } from "@/lib/utils";
import {
  dateStringToKhmerLunar,
  KhmerLunarDate,
} from "@/lib/khmer-lunar-calendar";

export interface PrintCalibrationSettings {
  bottomMargin: number;
  marginRight: number;
  gapLunarMonth: number;
  gapLunarYear: number;
  gapBuddhistEra: number;
  indentLine2: number;
  gapGregMonth: number;
  gapGregYear: number;
  shortYear: boolean;
  fillMode: boolean;
  showGuide: boolean;
}

export const DEFAULT_PRINT_CALIBRATION: PrintCalibrationSettings = {
  bottomMargin: 52,
  marginRight: 0,
  gapLunarMonth: 10,
  gapLunarYear: 10,
  gapBuddhistEra: 18,
  indentLine2: 28,
  gapGregMonth: 12,
  gapGregYear: 14,
  shortYear: true,
  fillMode: true,
  showGuide: true,
};

export interface PortraitCadastralData {
  /** Document / Issue Date (e.g. "04.10.2026") */
  documentDate?: string;
  issueLocation?: string;

  /** Parcel / Cadastral Info */
  certNumber?: string;
  parcelNumber?: string;
  sheetNumber?: string;
  area?: string;
  landType?: string;
  landUseNature?: string;
  location?: string;

  /** Owner 1 (Husband) */
  owner1Name?: string;
  owner1Dob?: string;
  owner1BirthPlace?: string;
  owner1IdNumber?: string;
  owner1Nationality?: string;
  owner1Status?: string;
  owner1Address?: string;
  owner1Father?: string;
  owner1Mother?: string;

  /** Owner 2 (Wife) */
  owner2Name?: string;
  owner2Dob?: string;
  owner2BirthPlace?: string;
  owner2IdNumber?: string;
  owner2Nationality?: string;
  owner2Status?: string;
  owner2Address?: string;
  owner2Father?: string;
  owner2Mother?: string;

  /** Property details */
  propertyType?: string;

  /** Transaction / Transfer */
  transferType?: string; // e.g. "ទិញ"
  transferDeedNo?: string;
  transferDeedDate?: string;
  transferDetails?: string;
  encumbrance?: string; // e.g. "គ្មាន"
  remarks?: string;

  /** Custom text in Column 2 (default: "មើលព័ត៌មាននៅខាងលើ") */
  col2CustomText?: string;

  /** Whether to include weekday (អាទិត្យ, ចន្ទ...) in the date line */
  includeWeekday?: boolean;
}

interface PortraitCadastralDocumentProps {
  data: PortraitCadastralData;
  className?: string;
  showPrintButton?: boolean;
}

const KHMER_GREGORIAN_MONTHS = [
  "",
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export function PortraitCadastralDocument({
  data,
  className,
  showPrintButton = true,
}: PortraitCadastralDocumentProps) {
  const [activePageTab, setActivePageTab] = React.useState<
    "all" | "page1" | "page2"
  >("all");
  const [page1Mode, setPage1Mode] = React.useState<"template" | "full">(
    "template",
  );
  const [calibration, setCalibration] =
    React.useState<PrintCalibrationSettings>(DEFAULT_PRINT_CALIBRATION);
  const [showCalibrationPanel, setShowCalibrationPanel] = React.useState(false);

  // Load saved calibration from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("cadastral_print_calibration_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCalibration((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateCalibration = (updates: Partial<PrintCalibrationSettings>) => {
    setCalibration((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(
          "cadastral_print_calibration_v1",
          JSON.stringify(next),
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetCalibration = () => {
    setCalibration(DEFAULT_PRINT_CALIBRATION);
    try {
      localStorage.removeItem("cadastral_print_calibration_v1");
    } catch {
      // ignore
    }
  };

  const docLunar: KhmerLunarDate | null = React.useMemo(() => {
    if (!data.documentDate) return null;
    return dateStringToKhmerLunar(data.documentDate);
  }, [data.documentDate]);

  const owner1Lunar: KhmerLunarDate | null = React.useMemo(() => {
    if (!data.owner1Dob) return null;
    return dateStringToKhmerLunar(data.owner1Dob);
  }, [data.owner1Dob]);

  const owner2Lunar: KhmerLunarDate | null = React.useMemo(() => {
    if (!data.owner2Dob) return null;
    return dateStringToKhmerLunar(data.owner2Dob);
  }, [data.owner2Dob]);

  const handlePrint = () => {
    setActivePageTab("all");
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Build combined owner name string
  const ownerNames = React.useMemo(() => {
    const p1 = data.owner1Name?.trim();
    const p2 = data.owner2Name?.trim();
    if (p1 && p2) return `${p1} និង ${p2}`;
    return p1 || p2 || "—";
  }, [data.owner1Name, data.owner2Name]);

  // Build ancestry string (សាវតារ)
  const ancestryText = React.useMemo(() => {
    const parts: string[] = [];
    if (data.owner1Father || data.owner1Mother) {
      parts.push(
        `ប្ដី: ឪ.${data.owner1Father || "—"} ម.${data.owner1Mother || "—"}`,
      );
    }
    if (data.owner2Father || data.owner2Mother) {
      parts.push(
        `ប្រពន្ធ: ឪ.${data.owner2Father || "—"} ម.${data.owner2Mother || "—"}`,
      );
    }
    return parts.join("\n");
  }, [
    data.owner1Father,
    data.owner1Mother,
    data.owner2Father,
    data.owner2Mother,
  ]);

  return (
    <div
      id="printable-document"
      className={cn(
        "flex flex-col items-center w-full printable-area print:p-0 print:m-0 print:w-full",
        className,
      )}
    >
      <div className="flex flex-col gap-6 w-full max-w-[210mm] items-center print:gap-0 print:w-full print:max-w-none print:m-0 print:p-0">
        {/* ── Calibration Toolbar Hidden ── */}
        <div className="hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={showCalibrationPanel ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowCalibrationPanel(!showCalibrationPanel)}
                className="h-8 gap-1.5 text-xs font-khmer font-medium"
              >
                <SlidersHorizontalIcon className="size-3.5 text-primary" />
                <span>កែសម្រួលគម្លាតក្រដាសពុម្ព (Spacing & Margins)</span>
                {showCalibrationPanel ? (
                  <ChevronUpIcon className="size-3.5" />
                ) : (
                  <ChevronDownIcon className="size-3.5" />
                )}
              </Button>

              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-khmer",
                  calibration.fillMode
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
                )}
              >
                {calibration.fillMode
                  ? "របៀប៖ បំពេញលើក្រដាសពុម្ពស្រាប់"
                  : "របៀប៖ បោះពុម្ពពេញលេញ"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={calibration.fillMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const nextFill = !calibration.fillMode;
                  updateCalibration({ fillMode: nextFill });
                  setPage1Mode(nextFill ? "template" : "full");
                }}
                className="h-7 text-xs px-2.5 font-khmer"
              >
                {calibration.fillMode ? "បំពេញលើក្រដាសពុម្ព" : "បោះពុម្ពពេញលេញ"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateCalibration({ showGuide: !calibration.showGuide })
                }
                className="h-7 text-xs px-2 font-khmer text-neutral-600 dark:text-neutral-400"
                title="បង្ហាញ/លាក់ អក្សរគំរូនៅលើអេក្រង់ (មិនប៉ះពាល់ការបោះពុម្ព)"
              >
                {calibration.showGuide ? (
                  <EyeIcon className="size-3.5 mr-1" />
                ) : (
                  <EyeOffIcon className="size-3.5 mr-1" />
                )}
                {calibration.showGuide
                  ? "បន្ទាត់គំរូ: បើក"
                  : "បន្ទាត់គំរូ: បិទ"}
              </Button>
            </div>
          </div>

          {/* Collapsible Calibration Controls */}
          {showCalibrationPanel && (
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3 font-khmer text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Bottom Margin */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>ទីតាំងបញ្ឈរ (បាតក្រោម)</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.bottomMargin} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          bottomMargin: Math.max(
                            0,
                            calibration.bottomMargin - 2,
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={calibration.bottomMargin}
                      onChange={(e) =>
                        updateCalibration({
                          bottomMargin: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          bottomMargin: calibration.bottomMargin + 2,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Right Margin */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>គម្លាតស្តាំ (Right Offset)</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.marginRight} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          marginRight: Math.max(
                            -20,
                            calibration.marginRight - 2,
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      step="1"
                      value={calibration.marginRight}
                      onChange={(e) =>
                        updateCalibration({
                          marginRight: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          marginRight: calibration.marginRight + 2,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Gap Lunar Month */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>ចន្លោះ "ខែ" ចន្ទគតិ</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.gapLunarMonth} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapLunarMonth: Math.max(
                            0,
                            calibration.gapLunarMonth - 1,
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={calibration.gapLunarMonth}
                      onChange={(e) =>
                        updateCalibration({
                          gapLunarMonth: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapLunarMonth: calibration.gapLunarMonth + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Gap Lunar Year */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>ចន្លោះ "ឆ្នាំ" ចន្ទគតិ</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.gapLunarYear} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapLunarYear: Math.max(
                            0,
                            calibration.gapLunarYear - 1,
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={calibration.gapLunarYear}
                      onChange={(e) =>
                        updateCalibration({
                          gapLunarYear: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapLunarYear: calibration.gapLunarYear + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Gap Buddhist Era */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>ចន្លោះ "ព.ស. ២៥"</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.gapBuddhistEra} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapBuddhistEra: Math.max(
                            0,
                            calibration.gapBuddhistEra - 1,
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={calibration.gapBuddhistEra}
                      onChange={(e) =>
                        updateCalibration({
                          gapBuddhistEra: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapBuddhistEra: calibration.gapBuddhistEra + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Line 2 Indent */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>រំកិលបន្ទាត់២ (Indent ថ្ងៃទី)</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.indentLine2} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          indentLine2: Math.max(0, calibration.indentLine2 - 1),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={calibration.indentLine2}
                      onChange={(e) =>
                        updateCalibration({
                          indentLine2: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          indentLine2: calibration.indentLine2 + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Gap Greg Month */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>ចន្លោះ ", ខែ" សកល</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.gapGregMonth} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapGregMonth: Math.max(
                            0,
                            calibration.gapGregMonth - 1,
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={calibration.gapGregMonth}
                      onChange={(e) =>
                        updateCalibration({
                          gapGregMonth: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapGregMonth: calibration.gapGregMonth + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Gap Greg Year */}
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 flex justify-between">
                    <span>ចន្លោះ "ឆ្នាំ២០" សកល</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {calibration.gapGregYear} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapGregYear: Math.max(0, calibration.gapGregYear - 1),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={calibration.gapGregYear}
                      onChange={(e) =>
                        updateCalibration({
                          gapGregYear: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        updateCalibration({
                          gapGregYear: calibration.gapGregYear + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Row options */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calibration.shortYear}
                    onChange={(e) =>
                      updateCalibration({ shortYear: e.target.checked })
                    }
                    className="rounded border-neutral-300 dark:border-neutral-700"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    ឆ្នាំកាត់ ២ខ្ទង់ (ឧ. ៧០ និង ២៦ ព្រោះលើក្រដាសមាន ព.ស. ២៥..
                    និង ឆ្នាំ២០..)
                  </span>
                </label>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCalibration}
                  className="h-7 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <RotateCcwIcon className="size-3 mr-1" />
                  កំណត់ឡើងវិញ (Reset)
                </Button>
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col items-center w-full a4-page-wrapper",
            activePageTab === "page2" ? "hidden print:block" : "flex",
          )}
        >
          <div
            className={cn(
              "w-full h-[297mm] max-w-[210mm] bg-white text-neutral-950 p-10 sm:p-12",
              "shadow-xl border border-neutral-300 dark:border-neutral-700",
              "font-khmer leading-relaxed select-text flex flex-col justify-between relative",
              "a4-page-sheet a4-page-1",
            )}
          >
            {page1Mode === "full" ? (
              /* Full Header Mode */
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-sm font-bold tracking-widest text-neutral-950">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </h2>
                  <h3 className="text-xs font-semibold text-neutral-800">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </h3>
                  <div className="flex justify-center items-center py-1">
                    <span className="inline-block w-24 h-[1.5px] bg-neutral-900"></span>
                  </div>
                  <p className="text-[11px] text-neutral-700">
                    ក្រសួងរៀបចំដែនដី នគរូបនីយកម្ម និងសំណង់
                  </p>
                  <p className="text-[11px] font-medium text-neutral-800">
                    អគ្គនាយកដ្ឋានសុរិយោដី និងភូមិសាស្ត្រ
                  </p>
                  <h1 className="text-base font-bold pt-2 text-neutral-950 underline decoration-neutral-900 underline-offset-4">
                    វិញ្ញាបនប័ត្រសម្គាល់ម្ចាស់អចលនវត្ថុ
                  </h1>
                </div>

                {/* Parcel Details */}
                <div className="border border-neutral-900 rounded-md p-4 text-xs bg-neutral-50/40">
                  <div className="font-bold text-neutral-950 border-b border-neutral-900 pb-1 mb-2.5 flex justify-between items-center">
                    <span>ព័ត៌មានក្បាលដី និងទីតាំងអចលនវត្ថុ</span>
                    <span className="font-mono text-[11px]">
                      វិញ្ញាបនបត្រលេខ៖ {data.certNumber || "១២០៩០៦០៥- ៤៥៧៥"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                    <div>
                      <span className="text-neutral-600">ក្បាលដីលេខ៖ </span>
                      <span className="font-bold font-mono">
                        {data.parcelNumber || "8480"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600">សន្លឹកផែនទីលេខ៖ </span>
                      <span className="font-bold font-mono">
                        {data.sheetNumber || "១២០៩០៦០៥"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600">ទំហំដី៖ </span>
                      <span className="font-bold">{data.area || "93 ម²"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-600">ប្រភេទដី៖ </span>
                      <span className="font-bold">
                        {data.landType || "សាងសង់"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px]">
                    <span className="text-neutral-600">ទីតាំងស្ថិតនៅ៖ </span>
                    <span className="font-medium">
                      {data.location ||
                        "រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១"}
                    </span>
                  </div>
                </div>

                {/* Owner Identification */}
                <div className="border border-neutral-900 rounded-md p-4 text-xs">
                  <div className="font-bold text-neutral-950 border-b border-neutral-900 pb-1 mb-3">
                    អត្តសញ្ញាណម្ចាស់កម្មសិទ្ធិ
                  </div>
                  <div className="space-y-1 mb-3 pb-2.5 border-b border-dashed border-neutral-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-950 text-xs">
                        ១. ប្ដី៖ {data.owner1Name || "ស៊ុន ពិសិដ្ឋ"}
                      </span>
                      <span className="text-[11px] text-neutral-600">
                        ស្ថានភាព៖ {data.owner1Status || "រៀបការ"} | សញ្ជាតិ៖{" "}
                        {data.owner1Nationality || "ខ្មែរ"}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-800">
                      <span className="text-neutral-600">
                        ថ្ងៃខែឆ្នាំកំណើត៖{" "}
                      </span>
                      <span className="font-mono">
                        {data.owner1Dob || "15.08.1982"}
                      </span>
                      {owner1Lunar && (
                        <span className="ml-1.5 text-neutral-700">
                          ({owner1Lunar.formatted})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-800">
                      <span className="text-neutral-600">
                        អត្តសញ្ញាណប័ណ្ណ៖{" "}
                      </span>
                      <span className="font-mono">
                        {data.owner1IdNumber || "010884912(01)/15.03.20"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-950 text-xs">
                        ២. ប្រពន្ធ៖ {data.owner2Name || "កែវ សោភា"}
                      </span>
                      <span className="text-[11px] text-neutral-600">
                        ស្ថានភាព៖ {data.owner2Status || "រៀបការ"} | សញ្ជាតិ៖{" "}
                        {data.owner2Nationality || "ខ្មែរ"}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-800">
                      <span className="text-neutral-600">
                        ថ្ងៃខែឆ្នាំកំណើត៖{" "}
                      </span>
                      <span className="font-mono">
                        {data.owner2Dob || "10.11.1986"}
                      </span>
                      {owner2Lunar && (
                        <span className="ml-1.5 text-neutral-700">
                          ({owner2Lunar.formatted})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-800">
                      <span className="text-neutral-600">
                        អត្តសញ្ញាណប័ណ្ណ៖{" "}
                      </span>
                      <span className="font-mono">
                        {data.owner2IdNumber || "010352372(02)/12.08.18"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Template Mode (Exact match of User Screenshot 1 - clean white sheet with bottom-right date block) */
              <div className="flex-1"></div>
            )}

            {/* Bottom Right: Official Date Block */}
            <div
              className="flex justify-end font-khmer transition-all"
              style={{
                paddingBottom: `${calibration.bottomMargin}mm`,
                paddingRight: `${calibration.marginRight}mm`,
              }}
            >
              <div className="space-y-1 mb-5">
                {docLunar ? (
                  calibration.fillMode ? (
                    /* Fill-in Pre-printed Form Mode (Precise spaces/margins for blanks) */
                    <>
                      {/* Line 1: Lunar Date Values */}
                      <div className="flex items-baseline justify-end font-medium text-neutral-950 text-[14px] print:text-[12pt] leading-relaxed tracking-wide whitespace-nowrap pr-20">
                        {/* Day + Phase (lands in blank after pre-printed ថ្ងៃ) */}
                        <span className="relative inline-block">
                          {docLunar.weekday.replace(/^ថ្ងៃ/, "")}{" "}
                          {toKhmerNum(docLunar.lunarDay)}
                          {docLunar.lunarPhase}
                        </span>

                        {/* Lunar Month (lands in blank after pre-printed ខែ) */}
                        <span
                          className="relative inline-block"
                          style={{ marginLeft: "8mm" }}
                        >
                          {docLunar.lunarMonthName}
                        </span>

                        {/* Zodiac Year + Sak (lands in blank after pre-printed ឆ្នាំ - compact to avoid overriding ព.ស.) */}

                        <span
                          className="relative inline-block"
                          style={{ marginLeft: "2.5mm" }}
                        >
                          {docLunar.zodiacYear} {docLunar.sakYear}
                        </span>

                        {/* Buddhist Era (lands in blank on dots after pre-printed ព.ស. ២៥..) */}
                        <span
                          className="relative inline-block"
                          style={{ marginLeft: "11mm" }}
                        >
                          {toKhmerNum(docLunar.buddhistEra).slice(-2)}
                        </span>
                      </div>

                      {/* Line 2: Gregorian Date Values */}
                      <div className="flex items-baseline justify-end font-medium text-neutral-950 text-[14px] print:text-[12pt] leading-relaxed tracking-wide whitespace-nowrap pr-20">
                        {/* Gregorian Day (lands in blank after pre-printed ធ្វើនៅ... ថ្ងៃទី) */}
                        <span
                          className="relative inline-block"
                          style={{ marginLeft: "28mm" }}
                        >
                          {toKhmerNum(docLunar.gregorianDay)}
                        </span>

                        {/* Gregorian Month (lands in blank after pre-printed , ខែ) */}
                        <span
                          className="relative inline-block"
                          style={{ marginLeft: "12mm" }}
                        >
                          {KHMER_GREGORIAN_MONTHS[docLunar.gregorianMonth]}
                        </span>

                        {/* Gregorian Year (lands in blank on dots after pre-printed ឆ្នាំ២០..) */}
                        <span
                          className="relative inline-block"
                          style={{ marginLeft: "16mm" }}
                        >
                          {toKhmerNum(docLunar.gregorianYear).slice(-2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Full Mode (Complete labels for blank paper) */
                    <>
                      <p className="font-medium text-neutral-950 text-[15px] print:text-[14pt] leading-relaxed tracking-wide text-right">
                        ថ្ងៃ{docLunar.weekday.replace(/^ថ្ងៃ/, "")}{" "}
                        {toKhmerNum(docLunar.lunarDay)}
                        {docLunar.lunarPhase} ខែ{docLunar.lunarMonthName} ឆ្នាំ
                        {docLunar.zodiacYear} {docLunar.sakYear} ព.ស.{" "}
                        {toKhmerNum(docLunar.buddhistEra)}
                      </p>
                      <p className="font-medium text-neutral-950 text-[15px] print:text-[14pt] leading-relaxed text-right">
                        ធ្វើនៅ{data.issueLocation || "រាជធានីភ្នំពេញ"} ថ្ងៃទី
                        {toKhmerNum(docLunar.gregorianDay)} ខែ{" "}
                        {KHMER_GREGORIAN_MONTHS[docLunar.gregorianMonth]} ឆ្នាំ
                        {toKhmerNum(docLunar.gregorianYear)}
                      </p>
                    </>
                  )
                ) : (
                  <>
                    <p className="font-bold text-neutral-950 text-[15px] print:text-[14pt] leading-relaxed tracking-widest text-right">
                      {
                        "ថ្ងៃ............ ខែ............ ឆ្នាំ............ ព.ស. ២៥......"
                      }
                    </p>
                    <p className="text-neutral-800 text-[15px] print:text-[14pt] leading-relaxed tracking-wider text-right">
                      {"ធ្វើនៅ"}
                      {data.issueLocation || "ភ្នំពេញ"}{" "}
                      {"ថ្ងៃទី............ ខែ............ ឆ្នាំ២០......"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col items-center w-full a4-page-wrapper",
            activePageTab === "page1" ? "hidden print:block" : "flex",
          )}
        >
          {/* A4 Portrait Sheet Container */}
          <div
            className={cn(
              "w-full h-[297mm] max-w-[210mm] bg-white text-neutral-950",
              "shadow-xl border border-neutral-300 dark:border-neutral-700",
              "font-khmer select-text relative overflow-hidden flex items-center justify-center",
              "a4-page-sheet a4-page-2",
            )}
          >
            {/* Rotated Table Container (-90 degrees) */}
            <div
              className="w-[275mm] h-[190mm] flex flex-col justify-start p-2"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center center",
              }}
            >
              {/* Official Table (Exact match of User Screenshot 2) */}
              <div className="w-full overflow-hidden border-2 border-neutral-900 bg-white">
                <table className="w-full border-collapse text-xs text-neutral-900 table-fixed">
                  <thead>
                    {/* Master Section Headers */}
                    <tr className="border-b-2 border-neutral-900 text-center font-bold">
                      <th
                        colSpan={3}
                        className="w-[43%] border-r-2 border-neutral-900 py-2 px-2 text-sm tracking-wide bg-neutral-50/70"
                      >
                        អត្រានុកូលដ្ឋានម្ចាស់អចលនវត្ថុ
                      </th>
                      <th
                        colSpan={2}
                        className="w-[43%] border-r-2 border-neutral-900 py-2 px-2 text-sm tracking-wide bg-neutral-50/70"
                      >
                        ការផ្លាស់ប្តូរ
                      </th>
                      <th className="w-[14%] py-2 px-2 bg-neutral-50/70"></th>
                    </tr>

                    {/* Detailed Column Titles */}
                    <tr className="border-b-2 border-neutral-900 text-center font-semibold text-[11px] leading-tight">
                      {/* Col 1: Diagonal Header */}
                      <th className="w-[20%] border-r border-neutral-900 p-0 relative h-14 align-top">
                        <div className="absolute inset-0">
                          <svg
                            className="w-full h-full"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 100"
                          >
                            <line
                              x1="0"
                              y1="100"
                              x2="100"
                              y2="0"
                              stroke="#171717"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full p-1.5 text-[10px]">
                          <div className="text-left font-semibold text-neutral-950">
                            តាមត្រកូល និង នាមខ្លួន
                          </div>
                          <div className="text-right font-semibold text-neutral-950">
                            ប្រភេទទ្រព្យ
                          </div>
                        </div>
                      </th>

                      {/* Col 2 */}
                      <th className="w-[11%] border-r border-neutral-900 px-1 py-1.5 align-middle">
                        ថ្ងៃ ខែ ឆ្នាំ <br />
                        និង <br />
                        ទីកន្លែងកំណើត
                      </th>

                      {/* Col 3 */}
                      <th className="w-[12%] border-r-2 border-neutral-900 px-1 py-1.5 align-middle">
                        សាវតារ
                      </th>

                      {/* Col 4 */}
                      <th className="w-[30%] border-r border-neutral-900 px-2 py-1.5 align-middle">
                        លេខចារឹកដោយសង្ខេបនៃ <br />
                        លិខិតសញ្ញា ឬ សាលក្រមតុលាការ
                      </th>

                      {/* Col 5 */}
                      <th className="w-[13%] border-r-2 border-neutral-900 px-1 py-1.5 align-middle">
                        បន្ទុកលើអចលនវត្ថុ
                      </th>

                      {/* Col 6 */}
                      <th className="w-[14%] px-1 py-1.5 align-middle">
                        សេចក្តីផ្សេងៗ
                      </th>
                    </tr>

                    {/* Row of Column Numbers (១ ២ ៣ ៤ ៥ ៦) */}
                    <tr className="border-b-2 border-neutral-900 text-center font-bold text-xs bg-neutral-100/70">
                      <th className="border-r border-neutral-900 py-0.5">១</th>
                      <th className="border-r border-neutral-900 py-0.5">២</th>
                      <th className="border-r-2 border-neutral-900 py-0.5">
                        ៣
                      </th>
                      <th className="border-r border-neutral-900 py-0.5">៤</th>
                      <th className="border-r-2 border-neutral-900 py-0.5">
                        ៥
                      </th>
                      <th className="py-0.5">៦</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Primary Record Row */}
                    <tr className="border-b border-dashed border-neutral-400 align-top min-h-[64px]">
                      {/* Col 1: Names and Property Type */}
                      <td className="border-r border-neutral-900 p-2 text-[11px] leading-relaxed">
                        <div className="font-semibold text-neutral-950">
                          {ownerNames}
                        </div>
                        <div className="mt-0.5 text-neutral-600 text-[10px]">
                          {data.propertyType || "ទ្រព្យសម្បត្តិរួម"}
                        </div>
                      </td>

                      {/* Col 2: "មើលព័ត៌មាននៅខាងលើ" */}
                      <td className="border-r border-neutral-900 p-2 text-center text-[10px] leading-relaxed">
                        <div className="font-medium underline decoration-neutral-400 underline-offset-2">
                          {data.col2CustomText || "មើលព័ត៌មាននៅខាងលើ"}
                        </div>
                      </td>

                      {/* Col 3: Ancestry */}
                      <td className="border-r-2 border-neutral-900 p-2 text-[10px] whitespace-pre-line leading-relaxed">
                        {ancestryText || "—"}
                      </td>

                      {/* Col 4: Acquisition Deed (e.g. "ទិញ") */}
                      <td className="border-r border-neutral-900 p-2 text-[11px] leading-relaxed">
                        <div className="font-bold text-neutral-950">
                          {data.transferType || "ទិញ"}
                        </div>
                        {data.transferDetails && (
                          <div className="mt-0.5 text-[10px] text-neutral-700">
                            {data.transferDetails}
                          </div>
                        )}
                      </td>

                      {/* Col 5: Encumbrance */}
                      <td className="border-r-2 border-neutral-900 p-2 text-center text-[10px]">
                        {data.encumbrance || "គ្មាន"}
                      </td>

                      {/* Col 6: Remarks */}
                      <td className="p-2 text-center text-[10px] text-neutral-600">
                        {data.remarks || "—"}
                      </td>
                    </tr>

                    {/* Empty Dashed Ledger Rows down the table */}
                    {Array.from({ length: 14 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-dashed border-neutral-400 h-8"
                      >
                        <td className="border-r border-neutral-900"></td>
                        <td className="border-r border-neutral-900"></td>
                        <td className="border-r-2 border-neutral-900"></td>
                        <td className="border-r border-neutral-900"></td>
                        <td className="border-r-2 border-neutral-900"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
