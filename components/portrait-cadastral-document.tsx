"use client";

import * as React from "react";
import { PrinterIcon, DownloadIcon, RotateCwIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, toKhmerNum } from "@/lib/utils";
import {
  dateStringToKhmerLunar,
  KhmerLunarDate,
} from "@/lib/khmer-lunar-calendar";

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

/**
 * PortraitCadastralDocument
 *
 * Implements the exact 2-Page Portrait Cadastral Registry Document:
 * - Page 1: Official Portrait page with bottom-right date block (matching user screenshot 1)
 * - Page 2: Official Table rotated -90deg on A4 Portrait sheet (matching user screenshot 2)
 *
 * Both pages print seamlessly on 2 pages of A4 portrait (`@page { size: A4 portrait; }`).
 */
export function PortraitCadastralDocument({
  data,
  className,
  showPrintButton = true,
}: PortraitCadastralDocumentProps) {
  const [activePageTab, setActivePageTab] = React.useState<
    "all" | "page1" | "page2"
  >("all");
  const [page1Mode, setPage1Mode] = React.useState<"template" | "full">(
    "template"
  );

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
        `ប្ដី: ឪ.${data.owner1Father || "—"} ម.${data.owner1Mother || "—"}`
      );
    }
    if (data.owner2Father || data.owner2Mother) {
      parts.push(
        `ប្រពន្ធ: ឪ.${data.owner2Father || "—"} ម.${data.owner2Mother || "—"}`
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
        className
      )}
    >
      {/* ── Printable & Preview Pages ──────────────────────────────────────── */}
      <div className="flex flex-col gap-8 w-full max-w-[210mm] items-center print:gap-0 print:w-full print:max-w-none print:m-0 print:p-0">
        {/* ================================================================= */}
        {/* PAGE 1: EXACT MATCH OF USER SCREENSHOT 1                           */}
        {/* ================================================================= */}
        <div
          className={cn(
            "flex flex-col items-center w-full a4-page-wrapper",
            activePageTab === "page2" ? "hidden print:block" : "flex"
          )}
        >

          <div
            className={cn(
              "w-full h-[297mm] max-w-[210mm] bg-white text-neutral-950 p-10 sm:p-12",
              "shadow-xl border border-neutral-300 dark:border-neutral-700",
              "font-khmer leading-relaxed select-text flex flex-col justify-between relative",
              "a4-page-sheet a4-page-1"
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
                        <span className="font-bold">{data.landType || "សាងសង់"}</span>
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
                        <span className="text-neutral-600">ថ្ងៃខែឆ្នាំកំណើត៖ </span>
                        <span className="font-mono">{data.owner1Dob || "15.08.1982"}</span>
                        {owner1Lunar && (
                          <span className="ml-1.5 text-neutral-700">
                            ({owner1Lunar.formatted})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-800">
                        <span className="text-neutral-600">អត្តសញ្ញាណប័ណ្ណ៖ </span>
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
                        <span className="text-neutral-600">ថ្ងៃខែឆ្នាំកំណើត៖ </span>
                        <span className="font-mono">{data.owner2Dob || "10.11.1986"}</span>
                        {owner2Lunar && (
                          <span className="ml-1.5 text-neutral-700">
                            ({owner2Lunar.formatted})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-800">
                        <span className="text-neutral-600">អត្តសញ្ញាណប័ណ្ណ៖ </span>
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

              {/* Bottom Right: Official Date Block (Matching User Screenshot 1) */}
              <div className="pb-6 sm:pb-8 pr-2 sm:pr-4 flex justify-end text-right text-xs leading-loose font-khmer">
                <div className="space-y-1.5 max-w-[440px]">
                  {docLunar ? (
                    <>
                      <p className="font-semibold text-neutral-950 text-[13px] tracking-wide">
                        ថ្ងៃ{docLunar.weekday.replace(/^ថ្ងៃ/, "")} {toKhmerNum(docLunar.lunarDay)}{docLunar.lunarPhase} ខែ{docLunar.lunarMonthName} ឆ្នាំ{docLunar.zodiacYear} {docLunar.sakYear} ព.ស. {toKhmerNum(docLunar.buddhistEra)}
                      </p>
                      <p className="text-neutral-800 text-[13px]">
                        ធ្វើនៅ{data.issueLocation || "រាជធានីភ្នំពេញ"} ថ្ងៃទី{toKhmerNum(docLunar.gregorianDay)} ខែ{" "}
                        {KHMER_GREGORIAN_MONTHS[docLunar.gregorianMonth]}{" "}
                        ឆ្នាំ{toKhmerNum(docLunar.gregorianYear)}
                      </p>
                    </>

                  ) : (
                    <>
                      <p className="font-semibold text-neutral-950 text-[13px] tracking-widest">
                        ថ្ងៃ............ ខែ............ ឆ្នាំ............ ព.ស. ២៥......
                      </p>
                      <p className="text-neutral-800 text-[13px] tracking-wider">
                        ធ្វើនៅ{data.issueLocation || "ភ្នំពេញ"} ថ្ងៃទី............ ខែ............ ឆ្នាំ២០......
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* ================================================================= */}
        {/* PAGE 2: EXACT MATCH OF USER SCREENSHOT 2                           */}
        {/* (Rotated Table -90deg on A4 Portrait sheet)                       */}
        {/* ================================================================= */}
        <div
          className={cn(
            "flex flex-col items-center w-full a4-page-wrapper",
            activePageTab === "page1" ? "hidden print:block" : "flex"
          )}
        >

          {/* A4 Portrait Sheet Container */}
          <div
            className={cn(
              "w-full h-[297mm] max-w-[210mm] bg-white text-neutral-950",
              "shadow-xl border border-neutral-300 dark:border-neutral-700",
              "font-khmer select-text relative overflow-hidden flex items-center justify-center",
              "a4-page-sheet a4-page-2"
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
                        <th className="border-r-2 border-neutral-900 py-0.5">៣</th>
                        <th className="border-r border-neutral-900 py-0.5">៤</th>
                        <th className="border-r-2 border-neutral-900 py-0.5">៥</th>
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
