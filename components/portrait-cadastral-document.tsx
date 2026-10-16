"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, toKhmerNum } from "@/lib/utils";
import {
  dateStringToKhmerLunar,
  KhmerLunarDate,
} from "@/lib/khmer-lunar-calendar";
import {
  CadastralDateFill,
  DATE_BLOCK,
  KHMER_GREGORIAN_MONTHS,
} from "@/components/cis-date-fill";
import { CisLedgerTable, LedgerValues } from "@/components/cis-ledger-table";

export interface PortraitCadastralData {
  documentDate?: string;
  issueLocation?: string;

  certNumber?: string;
  parcelNumber?: string;
  sheetNumber?: string;
  area?: string;
  landType?: string;
  landUseNature?: string;
  location?: string;

  owner1Name?: string;
  owner1Dob?: string;
  owner1BirthPlace?: string;
  owner1IdNumber?: string;
  owner1Nationality?: string;
  owner1Status?: string;
  owner1Address?: string;
  owner1Father?: string;
  owner1Mother?: string;

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

  remarksRed?: string;
  remarksBlack?: string;
  page2Col1Text?: string;
  page2Col3Text?: string;

  col2CustomText?: string;

  /** Whether to include weekday (អាទិត្យ, ចន្ទ...) in the date line */
  includeWeekday?: boolean;
}

interface PortraitCadastralDocumentProps {
  data: PortraitCadastralData;
  className?: string;
  showPrintButton?: boolean;
}

export function PortraitCadastralDocument({
  data,
  className,
}: PortraitCadastralDocumentProps) {
  const [fillMode, setFillMode] = React.useState(true);
  const [showGuide, setShowGuide] = React.useState(true);

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

  // Combined owner names (empty string when neither is set – nothing is printed)
  const ownerNames = React.useMemo(() => {
    const p1 = data.owner1Name?.trim();
    const p2 = data.owner2Name?.trim();
    if (p1 && p2) return `${p1} និង ${p2}`;
    return p1 || p2 || "";
  }, [data.owner1Name, data.owner2Name]);

  // Ancestry string (សាវតារ)
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

  const ledgerValues: LedgerValues = React.useMemo(
    () => ({
      col1: data.page2Col1Text || ownerNames,
      col1Sub: data.page2Col1Text ? "" : data.propertyType,
      col2: data.col2CustomText,
      col3: data.page2Col3Text || (ownerNames ? ancestryText : ""),
      col4: data.transferType,
      col4Sub: data.transferDetails,
      col5: data.encumbrance,
      remarksRed: data.remarksRed,
      remarksBlack: data.remarksBlack,
      remarks: data.remarks,
    }),
    [
      data.page2Col1Text,
      ownerNames,
      data.propertyType,
      data.col2CustomText,
      data.page2Col3Text,
      ancestryText,
      data.transferType,
      data.transferDetails,
      data.encumbrance,
      data.remarksRed,
      data.remarksBlack,
      data.remarks,
    ],
  );

  return (
    <div
      id="printable-document"
      className={cn(
        "flex flex-col items-center w-full printable-area print:p-0 print:m-0 print:w-full",
        className,
      )}
    >
      <div className="flex flex-col gap-6 w-full max-w-[210mm] items-center print:gap-0 print:w-full print:max-w-none print:m-0 print:p-0">
        {/* ── Screen-only switches (never printed) ── */}
        <div className="print:hidden flex w-full items-center gap-2">
          <Button
            variant={fillMode ? "default" : "outline"}
            size="sm"
            onClick={() => setFillMode((v) => !v)}
            className="h-7 text-xs px-2.5 font-khmer"
          >
            {fillMode ? "បំពេញលើក្រដាសពុម្ព" : "បោះពុម្ពពេញលេញ"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide((v) => !v)}
            className="h-7 text-xs px-2 font-khmer text-neutral-600 dark:text-neutral-400"
            title="បង្ហាញ/លាក់ អក្សរពុម្ពប្រផេះ តារាង និងស៊ុតចំណុច នៅលើអេក្រង់ — មិនបោះពុម្ព"
          >
            {showGuide ? (
              <EyeIcon className="size-3.5 mr-1" />
            ) : (
              <EyeOffIcon className="size-3.5 mr-1" />
            )}
            {showGuide ? "អក្សរគំរូ: បើក" : "អក្សរគំរូ: បិទ"}
          </Button>
        </div>

        {/* ───────────────────────── PAGE 1 ───────────────────────── */}
        <div className="flex flex-col items-center w-full a4-page-wrapper">
          <div
            className={cn(
              "w-full h-[297mm] max-w-[210mm] bg-white text-neutral-950 p-10 sm:p-12",
              "shadow-xl border border-neutral-300 dark:border-neutral-700",
              "font-khmer leading-relaxed select-text flex flex-col justify-between relative",
              "a4-page-sheet a4-page-1",
            )}
          >
            {!fillMode ? (
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
              /* Template Mode: clean white sheet with bottom-right date block */
              <div className="flex-1"></div>
            )}

            {/* Bottom Right: Official Date Block */}
            <div
              className="flex justify-end font-khmer"
              style={{
                paddingBottom: `${DATE_BLOCK.bottom}mm`,
                paddingRight: `${DATE_BLOCK.right}mm`,
              }}
            >
              <div className="space-y-1 mb-5">
                {docLunar ? (
                  fillMode ? (
                    <CadastralDateFill lunar={docLunar} showGuide={showGuide} />
                  ) : (
                    /* Full Mode (Complete labels for blank paper) */
                    <>
                      <p className="font-medium text-blue-950 text-[15px] print:text-[14pt] leading-relaxed tracking-wide text-right">
                        ថ្ងៃ{docLunar.weekday.replace(/^ថ្ងៃ/, "")}{" "}
                        {toKhmerNum(docLunar.lunarDay)}
                        {docLunar.lunarPhase} ខែ{docLunar.lunarMonthName} ឆ្នាំ
                        {docLunar.zodiacYear} {docLunar.sakYear} ព.ស.{" "}
                        {toKhmerNum(docLunar.buddhistEra)}
                      </p>
                      <p className="font-medium text-blue-950 text-[15px] print:text-[14pt] leading-relaxed text-right">
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

        {/* ───────────────────────── PAGE 2 ───────────────────────── */}
        <div className="flex flex-col items-center w-full a4-page-wrapper">
          <div
            className={cn(
              "w-full h-[297mm] max-w-[210mm] bg-white text-neutral-950",
              "shadow-xl border border-neutral-300 dark:border-neutral-700",
              "font-khmer select-text relative overflow-hidden",
              "a4-page-sheet a4-page-2",
            )}
          >
            <CisLedgerTable
              values={ledgerValues}
              fillMode={fillMode}
              showGuide={showGuide}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
