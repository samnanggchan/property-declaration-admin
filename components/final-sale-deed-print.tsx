"use client";

import * as React from "react";
import { FinalSaleDeed } from "@/lib/final-sale-deed-types";
import { cn } from "@/lib/utils";

interface FinalSaleDeedPrintProps {
  data: FinalSaleDeed;
  paperSize?: "original" | "a4";
  fillOnly?: boolean;
}

function IdCardStacked({
  prefix = "អត្ត:",
  idNumber,
  date,
  fillOnly = false,
  className = "",
}: {
  prefix?: string;
  idNumber?: string;
  date?: string;
  fillOnly?: boolean;
  className?: string;
}) {
  if (!idNumber && !date) return null;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 leading-none text-black",
        className,
      )}
    >
      {prefix && (
        <span className="font-bold text-[12px] select-none shrink-0 text-black">
          {prefix}
        </span>
      )}
      <div className="inline-flex flex-col items-center min-w-[76px]">
        <span className="font-bold text-[12px] px-1 pb-[1px] leading-tight text-center whitespace-nowrap text-black">
          {idNumber || "\u00A0"}
        </span>
        <div className="w-full border-b border-black shrink-0 my-[1px]" />
        <span className="font-semibold text-[11px] px-1 pt-[1px] leading-tight text-center whitespace-nowrap text-black">
          {date || "\u00A0"}
        </span>
      </div>
    </div>
  );
}

function formatCadastralCell(val: string) {
  if (!val) return "\u00A0";
  const trimmed = val.trim();
  if (trimmed.includes("\n")) {
    const [line1, ...rest] = trimmed.split("\n");
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className="text-[12px] font-medium">{line1}</span>
        <span className="text-[13px] font-bold">{rest.join(" ")}</span>
      </div>
    );
  }
  if (trimmed.startsWith("ប័ណ្ណលេខ")) {
    const rest = trimmed.replace(/^ប័ណ្ណលេខ\s*/, "");
    if (rest) {
      return (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-[13px] font-bold">ប័ណ្ណលេខ</span>
          <span className="text-[13px] font-bold">{rest}</span>
        </div>
      );
    }
  }
  if (trimmed.startsWith("ក្បាលដី")) {
    const rest = trimmed.replace(/^ក្បាលដី\s*/, "");
    if (rest) {
      return (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-[12px] font-medium">ក្បាលដី</span>
          <span className="text-[13px] font-bold">{rest}</span>
        </div>
      );
    }
  }
  return trimmed;
}

export function FinalSaleDeedPrint({
  data,
  paperSize = "original",
  fillOnly = false,
}: FinalSaleDeedPrintProps) {
  const isOriginal = paperSize === "original";
  const leftBase = isOriginal ? 10 : 17.5; // mm from left edge
  const contentWidth = 175; // mm content width matching preprinted paper

  // Ensure 6 rows for Page 2 parcel table
  const rows = [...(data.parcelRows || [])];
  while (rows.length < 6) {
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

  return (
    <div
      id="printable-document"
      className="printable-area print:p-0 print:m-0 flex flex-col items-center gap-6"
    >
      <section
        className={cn(
          "custom-sheet a4-sheet bg-white text-black shadow-md print:shadow-none print:border-none relative overflow-hidden font-battambang text-[15px] leading-none",
          isOriginal ? "w-[195mm] h-[297mm]" : "w-[210mm] h-[297mm]",
        )}
        style={{
          width: isOriginal ? "195mm" : "210mm",
          height: "297mm",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <div
          className="absolute"
          style={{
            top: "12.5mm",
            left: `${leftBase}mm`,
            width: "50mm",
          }}
        >
          <div
            className={cn(
              "font-bold text-[15px] text-black",
              fillOnly && "invisible",
            )}
          >
            អ្នកតែងលិខិត
          </div>
        </div>

        {/* Left: លេខ................... */}
        <div
          className="absolute flex items-baseline text-[15px]"
          style={{
            top: "28.5mm",
            left: `${leftBase}mm`,
            width: "55mm",
            height: "7mm",
          }}
        >
          <span
            className={cn(
              "font-semibold mr-1.5 shrink-0 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            លេខ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold text-[15px] px-1 pb-[1px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.drafterRefNo || "\u00A0"}
          </span>
        </div>

        {/* Center: លក់ផ្តាច់ / VENTE DEFINITIVE */}
        <div
          className="absolute text-center"
          style={{
            top: "11.5mm",
            left: `${leftBase + 55}mm`,
            width: "65mm",
          }}
        >
          <h1
            className={cn(
              "font-moul text-[19px] tracking-wide text-black font-normal",
              fillOnly && "invisible",
            )}
          >
            លក់ផ្តាច់
          </h1>
          <h2
            className={cn(
              "font-sans font-bold text-[14px] tracking-[0.22em] text-black mt-1.5",
              fillOnly && "invisible",
            )}
          >
            VENTE DEFINITIVE
          </h2>
        </div>

        {/* Right: Box ក្រដាសពុម្ពលេខ ៦ / ទីទុកឯកសារ */}
        <div
          className="absolute flex justify-end"
          style={{
            top: "6.0mm",
            left: `${leftBase + 122}mm`,
            width: "53mm",
          }}
        >
          <div
            className={cn(
              "w-[145px] h-[64px] border-l-2 border-b-2 border-black p-2 flex flex-col justify-start text-left bg-transparent relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:border-b-2 after:border-black",
              fillOnly && "border-transparent after:border-transparent",
            )}
          >
            <div
              className={cn(
                "font-semibold text-[14px] text-black leading-tight",
                fillOnly && "invisible",
              )}
            >
              ក្រដាសពុម្ពលេខ {data.paperNo || "6"}
            </div>
            <div
              className={cn(
                "font-medium text-[12px] text-black mt-1 leading-tight",
                fillOnly && "invisible",
              )}
            >
              ទីទុកឯកសារ
            </div>
          </div>
        </div>

        {/* ─── Seller Section (អ្នកលក់) ─── */}
        {/* Seller Line 1 (Y ≈ 43.0mm -> baseline 46.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "43.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-semibold shrink-0 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            អ្នកលក់-ឈ្មោះ:
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[130px] px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.name || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-2 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            អាយុ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.age || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-1 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឆ្នាំ ជាតិ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-16 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.nationality || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-2 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ទីលំនៅៗភូមិ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[90px] px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.village || "\u00A0"}
          </span>
        </div>

        {/* Seller Line 2: ឃុំ... ស្រុក... ខេត្ត... (Y ≈ 51.5mm -> baseline 54.5mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "51.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 pl-6 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.commune || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-2 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ស្រុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.district || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-2 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ខេត្ត
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.seller.province || "\u00A0"}
          </span>
        </div>

        {/* Seller Line 3: Optional 2nd Seller Info (Y ≈ 61.0mm) */}
        {data.sellerExtraLine && (
          <div
            className="absolute flex items-baseline text-[14px] font-bold text-black pl-4 leading-none"
            style={{
              top: "61.0mm",
              left: `${leftBase}mm`,
              width: `${contentWidth}mm`,
              height: "8mm",
            }}
          >
            {data.sellerExtraLine}
          </div>
        )}

        {/* Seller Line 4: Stacked IDs & Capacity Text (Y ≈ 70.5mm) */}
        {(data.seller1IdNumber ||
          data.seller2IdNumber ||
          data.sellerCapacityText ||
          data.sellerCapacityNote) && (
          <div
            className="absolute flex items-center justify-between text-black leading-none"
            style={{
              top: "70.5mm",
              left: `${leftBase}mm`,
              width: `${contentWidth}mm`,
              height: "10mm",
            }}
          >
            {data.seller1IdNumber ? (
              <IdCardStacked
                prefix="(១) អត្ត:"
                idNumber={data.seller1IdNumber}
                date={data.seller1IdDate}
                fillOnly={fillOnly}
              />
            ) : (
              <span />
            )}
            <span className="font-bold text-[13px] text-black px-1 text-center">
              {data.sellerCapacityText ||
                (data.sellerCapacityNote
                  ? data.sellerCapacityNote
                  : "• បំពេញកិច្ចនូវទ្រព្យរួមជាម្ចាស់សិទ្ធិអវិភាគ")}
            </span>
            {data.seller2IdNumber ? (
              <IdCardStacked
                prefix="(២) អត្ត:"
                idNumber={data.seller2IdNumber}
                date={data.seller2IdDate}
                fillOnly={fillOnly}
              />
            ) : (
              <span />
            )}
          </div>
        )}

        {/* ─── Clause 1: សុខចិត្តព្រមលក់ដាច់ឥតមានសញ្ញាអ្វីឡើយ (Y ≈ 83.5mm -> baseline 86.0mm) ─── */}
        <div
          className="absolute text-center"
          style={{
            top: "83.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
          }}
        >
          <span
            className={cn(
              "font-moul text-[14px] text-black tracking-wide font-normal",
              fillOnly && "invisible",
            )}
          >
            សុខចិត្តព្រមលក់ដាច់ឥតមានសញ្ញាអ្វីឡើយ
          </span>
        </div>

        {/* ─── Buyer Section (អ្នកទិញ) ─── */}
        {/* Buyer Line 1 (Y ≈ 116.0mm -> baseline 119.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "116.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-semibold shrink-0 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            អ្នកទិញ-ឈ្មោះ:
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[130px] px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.name || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-2 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            អាយុ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.age || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-1 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឆ្នាំ ជាតិ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-16 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.nationality || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-2 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ទីលំនៅៗភូមិ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[90px] px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.village || "\u00A0"}
          </span>
        </div>

        {/* Buyer Line 2: ឃុំ... ស្រុក... ខេត្ត... (Y ≈ 124.5mm -> baseline 127.5mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "124.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 pl-6 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.commune || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-2 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ស្រុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.district || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-2 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ខេត្ត
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyer.province || "\u00A0"}
          </span>
        </div>

        <div
          className="absolute flex items-center justify-between text-[15px] leading-none text-black"
          style={{
            top: "136.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "10mm",
          }}
        >
          <div className="flex items-center gap-2 font-bold text-black text-[15px]">
            <span
              className={cn(
                "font-bold text-[15px] text-black border-b border-black pb-[1px] shrink-0 mr-2",
                fillOnly && "invisible",
              )}
            >
              អត្រានុកូលដ្ឋាន
            </span>
            {data.buyerIdNumber ? (
              <IdCardStacked
                prefix="អត្ត:"
                idNumber={data.buyerIdNumber}
                date={data.buyerIdDate}
                fillOnly={fillOnly}
              />
            ) : null}
            {data.buyerCapacityText ? (
              <span className="text-[13px] font-bold ml-1">
                {data.buyerCapacityText}
              </span>
            ) : null}
          </div>
          {data.buyerStatusText ? (
            <span className="text-[13.5px] font-bold text-black">
              {data.buyerStatusText}
            </span>
          ) : data.buyerCapacityNote && !data.buyerIdNumber ? (
            <span className="text-[13px]">{data.buyerCapacityNote}</span>
          ) : null}
        </div>

        {/* ─── Civil Status 2-Column Table (ប្ដី | ប្រពន្ធ) ─── */}
        {/* Header: ប្ដី | ប្រពន្ធ (Y ≈ 147.0mm) */}
        <div
          className="absolute flex items-center text-[13px]"
          style={{
            top: "147.0mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <div className="w-[52%] pr-2 text-center">
            <span
              className={cn(
                "font-bold text-black text-[13px]",
                fillOnly && "invisible",
              )}
            >
              ប្ដី
            </span>
          </div>
          <div
            className={cn(
              "w-px h-3.5 bg-black/80 shrink-0",
              fillOnly && "bg-transparent",
            )}
          />
          <div className="w-[48%] pl-2 text-center">
            <span
              className={cn(
                "font-bold text-black text-[13px]",
                fillOnly && "invisible",
              )}
            >
              ប្រពន្ធ
            </span>
          </div>
        </div>

        {/* Row 1: ឆ្នាំកំណើត (Y ≈ 153.5mm -> baseline 157.0mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "153.5mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ឆ្នាំកំណើត
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-[42%] text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.husband.birthYear || "\u00A0"}
          </span>
          <div
            className={cn(
              "w-px h-3 bg-black/80 shrink-0 mx-1",
              fillOnly && "bg-transparent",
            )}
          />
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.wife.birthYear || "\u00A0"}
          </span>
        </div>

        {/* Row 2: ឃុំ (Y ≈ 160.0mm -> baseline 163.5mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "160.0mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 pl-4 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-[42%] text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.husband.birthCommune || "\u00A0"}
          </span>
          <div
            className={cn(
              "w-px h-3 bg-black/80 shrink-0 mx-1",
              fillOnly && "bg-transparent",
            )}
          />
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.wife.birthCommune || "\u00A0"}
          </span>
        </div>

        {/* Row 3: ឪពុក (Y ≈ 166.5mm -> baseline 170.0mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "166.5mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 pl-3 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ឪពុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-[42%] text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.husband.fatherName || "\u00A0"}
          </span>
          <div
            className={cn(
              "w-px h-3 bg-black/80 shrink-0 mx-1",
              fillOnly && "bg-transparent",
            )}
          />
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.wife.fatherName || "\u00A0"}
          </span>
        </div>

        {/* Row 4: ម្តាយ (Y ≈ 173.0mm -> baseline 176.5mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "173.0mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 pl-4 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ម្តាយ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-[42%] text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.husband.motherName || "\u00A0"}
          </span>
          <div
            className={cn(
              "w-px h-3 bg-black/80 shrink-0 mx-1",
              fillOnly && "bg-transparent",
            )}
          />
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.wife.motherName || "\u00A0"}
          </span>
        </div>

        {/* Row 5: សំបុត្រអាពាហ៍ពិពាហ៍លេខ (Y ≈ 179.5mm -> baseline 183.0mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "179.5mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            សំបុត្រអាពាហ៍ពិពាហ៍លេខ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.marriageCert.certNo || "\u00A0"}
          </span>
        </div>

        {/* Row 6: ចុះថ្ងៃ... ឃុំ (Y ≈ 186.0mm -> baseline 189.5mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "186.0mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ចុះថ្ងៃ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-14 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.marriageCert.certDate || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.marriageCert.certCommune || "\u00A0"}
          </span>
        </div>

        {/* Row 7: ... ស្រុក (Y ≈ 192.5mm -> baseline 196.0mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "192.5mm",
            left: `${leftBase}mm`,
            width: "68mm",
          }}
        >
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-20 min-h-[14px]",
              fillOnly && "border-transparent",
            )}
          />
          <span
            className={cn(
              "font-medium shrink-0 mx-1 text-[12px]",
              fillOnly && "invisible",
            )}
          >
            ស្រុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.marriageCert.certDistrict || "\u00A0"}
          </span>
        </div>

        {/* ─── Clause 2: សុខចិត្តព្រមទិញជាស្រេចឥតមានលក្ខខណ្ឌអ្វីឡើយ (Y ≈ 200.5mm -> baseline 203.5mm) ─── */}
        <div
          className="absolute text-center"
          style={{
            top: "200.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
          }}
        >
          <span
            className={cn(
              "font-moul text-[14px] text-black tracking-wide font-normal",
              fillOnly && "invisible",
            )}
          >
            សុខចិត្តព្រមទិញជាស្រេចឥតមានលក្ខខណ្ឌអ្វីឡើយ
          </span>
        </div>

        {/* ─── Sale Price Section (តម្លៃជាប្រាក់) ─── */}
        {/* Price Line 1 (Y ≈ 213.0mm -> baseline 216.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "213.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-semibold shrink-0 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            តម្លៃជាប្រាក់
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.priceKhmer || "\u00A0"}
          </span>
        </div>

        {/* Price Line 2: Continued Dotted Line (Y ≈ 221.5mm -> baseline 224.5mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "221.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-full px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.priceNumber || "\u00A0"}
          </span>
        </div>

        {/* ─── Bottom Section: Taxes & Fees (Left) & Original Receipt (Right) ─── */}
        {/* Bottom Line 1: តែមប្រែ / បានទទួលសំបុត្រដើម (Y ≈ 235.5mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "235.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "7mm",
          }}
        >
          <div className="w-[50%] flex items-baseline pr-4">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 pl-12 text-[14px]",
                fillOnly && "invisible",
              )}
            >
              តែមប្រែ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.stampFee || "\u00A0"}
            </span>
          </div>

          <div className="w-[50%] flex justify-center pl-6">
            <span
              className={cn(
                "font-bold text-[14px] text-black",
                fillOnly && "invisible",
              )}
            >
              បានទទួលសំបុត្រដើម
            </span>
          </div>
        </div>

        {/* Bottom Line 2: ប្រគាប់ត្រា... / នៅថ្ងៃ... (Y ≈ 244.0mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "244.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "7mm",
          }}
        >
          <div className="w-[50%] flex items-baseline pr-4">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 text-[13px]",
                fillOnly && "invisible",
              )}
            >
              ប្រគាប់ត្រា
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.registrationFee || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-medium shrink-0 mx-1 text-[12px]",
                fillOnly && "invisible",
              )}
            >
              បង្កាន់ដៃលេខ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-14 text-center font-bold pb-[1px] text-[13px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.taxReceiptNo || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-medium shrink-0 mx-1 text-[12px]",
                fillOnly && "invisible",
              )}
            >
              ចុះថ្ងៃ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-16 text-center font-bold pb-[1px] text-[13px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.taxReceiptDate || "\u00A0"}
            </span>
          </div>

          <div className="w-[50%] flex items-baseline pl-6">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 pl-4 text-[14px]",
                fillOnly && "invisible",
              )}
            >
              នៅថ្ងៃ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.receivedDate || "\u00A0"}
            </span>
          </div>
        </div>

        {/* Bottom Line 3: រង្វាន់លិខិត... / ឈ្មោះ... (Y ≈ 252.5mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "252.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "7mm",
          }}
        >
          <div className="w-[50%] flex items-baseline pr-4">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 text-[13px]",
                fillOnly && "invisible",
              )}
            >
              រង្វាន់លិខិត
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.cadastralFee || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-medium shrink-0 mx-1 text-[12px]",
                fillOnly && "invisible",
              )}
            >
              ដ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-12 text-center font-bold pb-[1px] text-[13px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.cadastralFeeD1 || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-medium shrink-0 mx-1 text-[12px]",
                fillOnly && "invisible",
              )}
            >
              ដ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-12 text-center font-bold pb-[1px] text-[13px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.cadastralFeeD2 || "\u00A0"}
            </span>
          </div>

          <div className="w-[50%] flex items-baseline pl-6">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 pl-6 text-[14px]",
                fillOnly && "invisible",
              )}
            >
              ឈ្មោះ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.receiverName || "\u00A0"}
            </span>
          </div>
        </div>

        {/* Bottom Line 4: ប.ស.អ... / ផ្តិតមេដៃស្តាំ (Y ≈ 260.5mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "260.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "7mm",
          }}
        >
          <div className="w-[50%] flex items-baseline pr-4">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 pl-4 text-[13px]",
                fillOnly && "invisible",
              )}
            >
              ប.ស.អ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.surveyFee || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-medium shrink-0 mx-1 text-[12px]",
                fillOnly && "invisible",
              )}
            >
              ដ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-12 text-center font-bold pb-[1px] text-[13px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.surveyFeeD1 || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-medium shrink-0 mx-1 text-[12px]",
                fillOnly && "invisible",
              )}
            >
              ដ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-12 text-center font-bold pb-[1px] text-[13px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.surveyFeeD2 || "\u00A0"}
            </span>
          </div>

          <div className="w-[50%] flex justify-center pl-6">
            <span
              className={cn(
                "font-medium text-[13px] text-black",
                fillOnly && "invisible",
              )}
            >
              ផ្តិតមេដៃស្តាំ
            </span>
          </div>
        </div>

        {/* Bottom Line 5: បូករួម... (Y ≈ 269.0mm) */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "269.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "7mm",
          }}
        >
          <div className="w-[50%] flex items-baseline pr-4">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 pl-3 text-[14px]",
                fillOnly && "invisible",
              )}
            >
              បូករួម
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] text-[14px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.totalFee || "\u00A0"}
            </span>
          </div>
        </div>

        {/* Thumbprint Placeholder Box at bottom right */}
        <div
          className="absolute flex justify-center items-center"
          style={{
            top: "267.0mm",
            left: `${leftBase + 128}mm`,
            width: "35mm",
            height: "22mm",
          }}
        >
          <div
            className={cn(
              "w-8 h-10 border border-dashed border-black/30 rounded",
              fillOnly && "border-transparent",
            )}
          />
        </div>
      </section>

      <section
        className={cn(
          "custom-sheet a4-sheet bg-white text-black shadow-md print:shadow-none print:border-none relative overflow-hidden font-battambang text-[15px] leading-none",
          isOriginal ? "w-[195mm] h-[297mm]" : "w-[210mm] h-[297mm]",
        )}
        style={{
          width: isOriginal ? "195mm" : "210mm",
          height: "297mm",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Page 2 Top Line: ក្បាលដី និងអចលនវត្ថុ... (Y ≈ 13.0mm -> baseline 16.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "13.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-semibold shrink-0 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ក្បាលដី និងអចលនវត្ថុ ដូចមានខាងក្រោមនេះ នៅក្នុងឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.propertyCommune || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-semibold mx-2 shrink-0 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ស្រុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.propertyDistrict || "\u00A0"}
          </span>
        </div>

        {/* ─── 7-Column Cadastral Table (Y ≈ 20.0mm to 128.6mm) ─── */}
        <div
          className={cn(
            "absolute border border-black font-battambang overflow-hidden",
            fillOnly && "border-transparent",
          )}
          style={{
            top: "20.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "108.6mm",
          }}
        >
          <table className="w-full h-full border-collapse text-[12px] leading-tight">
            <thead>
              <tr
                className={cn(
                  "border-b border-black text-center font-bold bg-neutral-50/50 h-[9.5mm]",
                  fillOnly && "border-transparent",
                )}
              >
                <th
                  rowSpan={2}
                  className={cn(
                    "w-[23%] border-r border-black p-0.5 align-middle text-[12px]",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  លេខរៀងនិងលេខផែនទី
                  <br />
                  ឬលេខបណ្ណឹង
                </th>
                <th
                  rowSpan={2}
                  className={cn(
                    "w-[9%] border-r border-black p-0.5 align-middle text-[12px]",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ទំហំ
                </th>
                <th
                  rowSpan={2}
                  className={cn(
                    "w-[12%] border-r border-black p-0.5 align-middle text-[12px]",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ប្រភេទដី
                </th>
                <th
                  colSpan={4}
                  className={cn(
                    "w-[42%] border-r border-black p-0.5 align-middle border-b text-[12px]",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ព្រំប្រទល់
                </th>
                <th
                  rowSpan={2}
                  className={cn(
                    "w-[14%] p-0.5 align-middle text-[12px]",
                    fillOnly && "invisible",
                  )}
                >
                  បន្ទុកដែលជាប់
                  <br />
                  ទូទាំងអចលនវត្ថុ
                </th>
              </tr>
              <tr
                className={cn(
                  "border-b border-black text-center font-semibold text-[11px] h-[8.5mm]",
                  fillOnly && "border-transparent",
                )}
              >
                <th
                  className={cn(
                    "w-[10.5%] border-r border-black p-0.5",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ខាងជើង
                </th>
                <th
                  className={cn(
                    "w-[10.5%] border-r border-black p-0.5",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ខាងត្បូង
                </th>
                <th
                  className={cn(
                    "w-[10.5%] border-r border-black p-0.5",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ខាងកើត
                </th>
                <th
                  className={cn(
                    "w-[10.5%] border-r border-black p-0.5",
                    fillOnly && "border-transparent invisible",
                  )}
                >
                  ខាងលិច
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    "h-[15.1mm] border-b border-black last:border-b-0",
                    fillOnly && "border-transparent",
                  )}
                >
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center font-semibold align-middle truncate max-w-[120px] text-[13px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {formatCadastralCell(row.indexOrSheet)}
                  </td>
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center font-semibold align-middle truncate max-w-[50px] text-[13px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {row.area || ""}
                  </td>
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center font-medium align-middle truncate max-w-[65px] text-[12px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {row.landType || ""}
                  </td>
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center align-middle text-[12px] truncate max-w-[65px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {row.boundaryNorth || ""}
                  </td>
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center align-middle text-[12px] truncate max-w-[65px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {row.boundarySouth || ""}
                  </td>
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center align-middle text-[12px] max-w-[65px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {formatCadastralCell(row.boundaryEast)}
                  </td>
                  <td
                    className={cn(
                      "border-r border-black px-1 text-center align-middle text-[12px] max-w-[65px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {formatCadastralCell(row.boundaryWest)}
                  </td>
                  <td className="px-1 text-center align-middle text-[12px] truncate max-w-[75px]">
                    {row.encumbrance || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "134.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ធ្វើជាពីរច្បាប់ ថ្ងៃ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.contractDateDay || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ខែ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-20 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.contractDateMonth || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឆ្នាំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-16 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.contractDateYear || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            នៅចំពោះមុខយើង
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {"\u00A0"}
          </span>
        </div>

        {/* Line 2: [Officer Title] (Left ~42%) | បានឃើញឈ្មោះ (Center) | [Seller Verified Names] (Right) (Y ≈ 142.5mm -> baseline 145.5mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "142.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-[42%] px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.officialTitleAndName || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 px-2 text-center text-[15px]",
              fillOnly && "invisible",
            )}
          >
            បានឃើញឈ្មោះ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.sellerVerifiedNames || "\u00A0"}
          </span>
        </div>

        {/* Line 3: Blank dotted line (Left ~42%) | និងឈ្មោះ (Center) | [Buyer Verified Names] (Right) (Y ≈ 150.0mm -> baseline 153.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "150.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-[42%] px-1 text-center pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {"\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 px-2 text-center text-[15px]",
              fillOnly && "invisible",
            )}
          >
            និងឈ្មោះ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.buyerVerifiedNames || "\u00A0"}
          </span>
        </div>

        {/* Line 4: Dotted line before legal clause (Y ≈ 157.5mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "157.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "6mm",
          }}
        >
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-full",
              fillOnly && "border-transparent",
            )}
          />
        </div>

        {/* Legal Clause Paragraph (Y ≈ 163.5mm -> baseline 167.0mm) */}
        <div
          className="absolute text-justify leading-relaxed text-[13.5px] text-black"
          style={{
            top: "163.5mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
          }}
        >
          <p className={cn(fillOnly && "invisible")}>
            ដែលយើងបានសួរបញ្ជាក់ដល់សាមីខ្លួនទាំងនេះ
            ឃើញថាពិតប្រាកដជាសាមីខ្លួនដែលជាភាគីត្រឹមត្រូវតាមសេចក្តីលិខិតនេះ
            ហើយយើងបានអាន សេចក្តីលិខិតទាំងស្រុងដោយឮក្បោះក្បាយឱ្យភាគីស្តាប់
            គូភាគីបានទទួលយល់ព្រមថាតាមត្រឹមត្រូវ
            និងចុះហត្ថលេខានៅខាងក្រោមសេចក្តីលិខិតនេះ ឬផ្តិតមេដៃហើយ ។
          </p>
        </div>

        {/* ─── Witnesses Section (សាក្សី) ─── */}
        {/* Witness Header Row: Witness 1 ID (Left) | Text (Center) | Witness 2 ID (Right) (Y ≈ 203.0mm) */}
        {/* Note: prefix="អត្ត:" is always visible for both witnesses */}
        <div
          className="absolute flex justify-between items-center text-[12px] leading-none"
          style={{
            top: "203.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "10mm",
          }}
        >
          <div className="w-[30%] flex justify-start">
            {data.witness1IdNumber ? (
              <IdCardStacked
                prefix="អត្ត:"
                idNumber={data.witness1IdNumber}
                date={data.witness1IdDate}
                fillOnly={fillOnly}
              />
            ) : data.witness1IdCard ? (
              <span className="text-[12px] font-bold text-black">
                {data.witness1IdCard}
              </span>
            ) : null}
          </div>

          <div
            className={cn(
              "w-[40%] text-center font-bold text-[14px] text-black whitespace-nowrap",
              fillOnly && "invisible",
            )}
          >
            បានអានសេចក្តីនៃលិខិតនេះឱ្យគូភាគីស្តាប់ចំពោះមុខ
          </div>

          <div className="w-[30%] flex justify-end">
            {data.witness2IdNumber ? (
              <IdCardStacked
                prefix="អត្ត:"
                idNumber={data.witness2IdNumber}
                date={data.witness2IdDate}
                fillOnly={fillOnly}
              />
            ) : data.witness2IdCard ? (
              <span className="text-[12px] font-bold text-black">
                {data.witness2IdCard}
              </span>
            ) : null}
          </div>
        </div>

        {/* Witness Line 1 (Y ≈ 216.0mm -> baseline 219.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "216.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            សាក្សី - ឈ្មោះ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[34mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness1.name || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-1.5 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            អាយុ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-10 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness1.age || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-1 mr-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឆ្នាំ ទីលំនៅៗឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[22mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness1.commune || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ស្រុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[20mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness1.district || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ខេត្ត
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[20mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness1.province || "\u00A0"}
          </span>
        </div>

        {/* Witness Line 2 (Y ≈ 224.0mm -> baseline 227.0mm) */}
        <div
          className="absolute flex items-baseline text-[15px] leading-none text-black"
          style={{
            top: "224.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn(
              "font-medium shrink-0 mr-1 pl-12 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឈ្មោះ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[34mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness2.name || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-1.5 mr-1 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            អាយុ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 w-10 px-1 text-center font-bold pb-[1px] text-[15px]",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness2.age || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 ml-1 mr-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ឆ្នាំ ទីលំនៅៗឃុំ
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[22mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness2.commune || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ស្រុក
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[20mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness2.district || "\u00A0"}
          </span>
          <span
            className={cn(
              "font-medium shrink-0 mx-1.5 text-[15px]",
              fillOnly && "invisible",
            )}
          >
            ខេត្ត
          </span>
          <span
            className={cn(
              "border-b border-dotted border-black/85 flex-1 min-w-[20mm] px-1 text-center font-bold pb-[1px] text-[15px] whitespace-nowrap",
              fillOnly && "border-transparent",
            )}
          >
            {data.witness2.province || "\u00A0"}
          </span>
        </div>

        {/* Thumbprint & Certification Registration Number (Y ≈ 232.0mm -> baseline 235.0mm) */}
        <div
          className="absolute flex justify-between items-baseline text-[15px] leading-none text-black"
          style={{
            top: "232.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
            height: "8mm",
          }}
        >
          <span
            className={cn("font-medium text-[15px]", fillOnly && "invisible")}
          >
            ផ្តិតមេដៃស្តាំ
          </span>
          <div className="flex items-baseline">
            <span
              className={cn(
                "font-medium shrink-0 mr-1 text-[15px]",
                fillOnly && "invisible",
              )}
            >
              បញ្ជាក់ចុះលេខ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 w-32 px-1 text-center font-bold pb-[1px] text-[15px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.certRegistrationNo || "\u00A0"}
            </span>
          </div>
        </div>

        {/* ─── Footer Signatures Section (Page 2) ─── */}
        {/* 1. Header Labels (Y ≈ 250.0mm -> baseline 253.5mm) */}
        {/* No horizontal line as requested by user ("remove line") */}
        <div
          className="absolute flex items-start text-center text-[14px] leading-tight text-black"
          style={{
            top: "250.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
          }}
        >
          <div className="w-[28%] text-center">
            <span
              className={cn(
                "font-bold text-[14px] text-black",
                fillOnly && "invisible",
              )}
            >
              អ្នកលក់
            </span>
          </div>
          <div className="w-[22%] text-center">
            <span
              className={cn(
                "font-bold text-[14px] text-black",
                fillOnly && "invisible",
              )}
            >
              អ្នកទិញ
            </span>
          </div>
          <div className="w-[28%] text-center">
            <span
              className={cn(
                "font-bold text-[14px] text-black",
                fillOnly && "invisible",
              )}
            >
              សាក្សី
            </span>
          </div>
          <div className="w-[22%] text-center">
            <span
              className={cn(
                "font-bold text-[13px] text-black block",
                fillOnly && "invisible",
              )}
            >
              ហត្ថលេខានិងត្រាត្រឹមត្រូវដែលបញ្ជាក់
            </span>
          </div>
        </div>

        {/* 2. Printed Signature Names at the VERY BOTTOM (Y ≈ 282.0mm -> baseline 286.0mm) */}
        {/* Positioned "under more" exactly into the bottom rectangle from user screenshot */}
        <div
          className="absolute flex items-baseline text-[14px] leading-none text-black"
          style={{
            top: "282.0mm",
            left: `${leftBase}mm`,
            width: `${contentWidth}mm`,
          }}
        >
          {/* Seller Names: width 30% to fit both names cleanly on 1 line */}
          <div className="w-[30%] text-center">
            <span className="text-[14px] font-bold text-black tracking-wide whitespace-nowrap">
              {data.sellerSignatureNames || "ស៊ិន វិសិដ្ឋ   ស៊ិន ស៊ីថាវាត"}
            </span>
          </div>

          {/* Buyer Name: width 20% */}
          <div className="w-[20%] text-center">
            <span className="text-[14px] font-bold text-black tracking-wide whitespace-nowrap">
              {data.buyerSignatureNames || "ជង់ វិទូរ"}
            </span>
          </div>

          {/* Witness Names: width 34% to fit both names cleanly without wrapping */}
          <div className="w-[34%] text-center">
            <span className="text-[14px] font-bold text-black tracking-wide whitespace-nowrap">
              {data.witnessSignatureNames || "នាង យុន សុជាតា   សុខ សឿន"}
            </span>
          </div>

          {/* Officer Stamp Area */}
          <div className="w-[16%] text-center">
            <span>{"\u00A0"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
