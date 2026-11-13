"use client";

import * as React from "react";
import { FinalSaleDeed } from "@/lib/final-sale-deed-types";
import { cn } from "@/lib/utils";

interface FinalSaleDeedPrintProps {
  data: FinalSaleDeed;
  paperSize?: "original" | "a4";
  fillOnly?: boolean;
}

export function FinalSaleDeedPrint({
  data,
  paperSize = "original",
  fillOnly = false,
}: FinalSaleDeedPrintProps) {
  const isOriginal = paperSize === "original";
  // Exact calibrated margins for 195mm x 297mm preprinted paper
  const pagePadding = isOriginal
    ? "12mm 15mm 12mm 15mm"
    : "14mm 20mm 14mm 20mm";

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
      {/* ════════════════════════════════════════════════════════════════════════
          PAGE 1: Official Final Sale Deed (VENTE DEFINITIVE) - Form No. 6
          ════════════════════════════════════════════════════════════════════════ */}
      <section
        className={cn(
          "custom-sheet a4-sheet bg-white text-black shadow-md print:shadow-none print:border-none relative flex flex-col justify-between font-battambang text-[13px] leading-[1.65]",
          isOriginal ? "w-[195mm] min-h-[297mm]" : "w-[210mm] min-h-[297mm]",
        )}
        style={{
          padding: pagePadding,
          boxSizing: "border-box",
        }}
      >
        <div>
          {/* Top Header Row (Left: Drafter Ref, Center: Title, Right: Box ក្រដាសពុម្ពលេខ 6) */}
          <div className="flex items-start justify-between pt-1">
            {/* Left Column: អ្នកតែងលិខិត & លេខ */}
            <div className="w-[32%] text-left">
              <div
                className={cn(
                  "font-bold text-[13.5px] text-black leading-tight",
                  fillOnly && "invisible",
                )}
              >
                អ្នកតែងលិខិត
              </div>
              <div className="mt-2 flex items-baseline w-full">
                <span
                  className={cn(
                    "font-semibold mr-1.5 shrink-0 text-[13px]",
                    fillOnly && "invisible",
                  )}
                >
                  លេខ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 text-center font-bold text-[13px] px-1 pb-[1px] min-h-[19px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.drafterRefNo || "\u00A0"}
                </span>
              </div>
            </div>

            {/* Center Column: លក់ផ្តាច់ / VENTE DEFINITIVE */}
            <div className="w-[36%] text-center pt-0.5">
              <h1
                className={cn(
                  "font-moul text-[19px] tracking-wide text-black font-normal leading-tight",
                  fillOnly && "invisible",
                )}
              >
                លក់ផ្តាច់
              </h1>
              <h2
                className={cn(
                  "font-sans font-bold text-[13.5px] tracking-[0.22em] text-black mt-1",
                  fillOnly && "invisible",
                )}
              >
                VENTE DEFINITIVE
              </h2>
            </div>

            {/* Right Column: ក្រដាសពុម្ពលេខ 6 / ទីទុកឯកសារ Boxed Frame with double bottom line */}
            <div className="w-[32%] flex justify-end">
              <div
                className={cn(
                  "w-[145px] h-[64px] border-l-2 border-b-2 border-black p-2 flex flex-col justify-start text-left bg-transparent relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:border-b-2 after:border-black",
                  fillOnly && "border-transparent after:border-transparent",
                )}
              >
                <div
                  className={cn(
                    "font-semibold text-[13px] text-black leading-tight",
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
          </div>

          {/* Seller Paragraph (អ្នកលក់) - Continuous full-width dotted lines */}
          <div className="mt-5 space-y-2">
            <div className="flex items-baseline w-full text-[13px] leading-[2]">
              <span
                className={cn(
                  "font-semibold shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                អ្នកលក់-ឈ្មោះ:
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 min-w-[140px] px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.name || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 ml-2 mr-1",
                  fillOnly && "invisible",
                )}
              >
                អាយុ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.age || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 ml-1 mr-1",
                  fillOnly && "invisible",
                )}
              >
                ឆ្នាំ ជាតិ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-16 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.nationality || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 ml-2 mr-1",
                  fillOnly && "invisible",
                )}
              >
                ទីលំនៅៗភូមិ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 min-w-[90px] px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.village || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full text-[13px] leading-[2]">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 pl-6",
                  fillOnly && "invisible",
                )}
              >
                ឃុំ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.commune || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-2",
                  fillOnly && "invisible",
                )}
              >
                ស្រុក
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.district || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-2",
                  fillOnly && "invisible",
                )}
              >
                ខេត្ត
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.seller.province || "\u00A0"}
              </span>
            </div>

            {/* Optional 2nd Seller Line (matching authentic Image 1) */}
            {data.sellerExtraLine && (
              <div className="pt-0.5 text-[12.5px] font-bold text-black pl-4 leading-relaxed">
                {data.sellerExtraLine}
              </div>
            )}

            {/* Optional Seller ID & Capacity Note (matching authentic Image 1) */}
            {data.sellerCapacityNote && (
              <div className="pt-0.5 text-[11.5px] font-bold text-black flex items-baseline justify-between tracking-tight leading-normal">
                {data.sellerCapacityNote}
              </div>
            )}
          </div>

          {/* Clause 1: សុខចិត្តព្រមលក់ដាច់ឥតមានសញ្ញាអ្វីឡើយ */}
          <div className="my-3.5 text-center">
            <span
              className={cn(
                "font-moul text-[13.5px] text-black tracking-wide font-normal",
                fillOnly && "invisible",
              )}
            >
              សុខចិត្តព្រមលក់ដាច់ឥតមានសញ្ញាអ្វីឡើយ
            </span>
          </div>

          {/* Buyer Paragraph (អ្នកទិញ) - Continuous full-width dotted lines */}
          <div className="space-y-2">
            <div className="flex items-baseline w-full text-[13px] leading-[2]">
              <span
                className={cn(
                  "font-semibold shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                អ្នកទិញ-ឈ្មោះ:
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 min-w-[140px] px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.name || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 ml-2 mr-1",
                  fillOnly && "invisible",
                )}
              >
                អាយុ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.age || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 ml-1 mr-1",
                  fillOnly && "invisible",
                )}
              >
                ឆ្នាំ ជាតិ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-16 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.nationality || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 ml-2 mr-1",
                  fillOnly && "invisible",
                )}
              >
                ទីលំនៅៗភូមិ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 min-w-[90px] px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.village || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full text-[13px] leading-[2]">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 pl-6",
                  fillOnly && "invisible",
                )}
              >
                ឃុំ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.commune || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-2",
                  fillOnly && "invisible",
                )}
              >
                ស្រុក
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.district || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-2",
                  fillOnly && "invisible",
                )}
              >
                ខេត្ត
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyer.province || "\u00A0"}
              </span>
            </div>
          </div>

          {/* Buyer's Civil Status Section (អត្រានុកូលដ្ឋាន) - Authentic preprinted layout */}
          <div className="mt-4">
            <div className="mb-1 flex items-baseline justify-between">
              <span
                className={cn(
                  "font-bold text-[13px] text-black border-b border-black pb-[1px] inline-block",
                  fillOnly && "invisible",
                )}
              >
                អត្រានុកូលដ្ឋាន
              </span>
              {/* Optional Buyer ID & Capacity Note (matching Image 1) */}
              {data.buyerCapacityNote && (
                <span className="font-bold text-[11px] text-black tracking-tight">
                  {data.buyerCapacityNote}
                </span>
              )}
            </div>

            {/* Authentic 2-Column with single center vertical bar, NO outer table box */}
            <div className="w-[320px] text-[12px] space-y-1">
              {/* Column Headers: ប្ដី | ប្រពន្ធ */}
              <div className="flex items-center">
                <div className="w-[52%] pr-2 text-center">
                  <span
                    className={cn(
                      "font-bold text-black",
                      fillOnly && "invisible",
                    )}
                  >
                    ប្ដី
                  </span>
                </div>
                <div
                  className={cn(
                    "w-px h-4 bg-black/80 shrink-0",
                    fillOnly && "bg-transparent",
                  )}
                />
                <div className="w-[48%] pl-2 text-center">
                  <span
                    className={cn(
                      "font-bold text-black",
                      fillOnly && "invisible",
                    )}
                  >
                    ប្រពន្ធ
                  </span>
                </div>
              </div>

              {/* Row 1: ឆ្នាំកំណើត */}
              <div className="flex items-baseline">
                <div className="w-[52%] pr-2 flex items-baseline">
                  <span
                    className={cn(
                      "font-medium shrink-0 mr-1 w-[55px] text-left",
                      fillOnly && "invisible",
                    )}
                  >
                    ឆ្នាំកំណើត
                  </span>
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.husband.birthYear || "\u00A0"}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-px self-stretch bg-black/80 shrink-0",
                    fillOnly && "bg-transparent",
                  )}
                />
                <div className="w-[48%] pl-2 flex items-baseline">
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 w-full text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.wife.birthYear || "\u00A0"}
                  </span>
                </div>
              </div>

              {/* Row 2: ឃុំ */}
              <div className="flex items-baseline">
                <div className="w-[52%] pr-2 flex items-baseline">
                  <span
                    className={cn(
                      "font-medium shrink-0 mr-1 w-[55px] text-left",
                      fillOnly && "invisible",
                    )}
                  >
                    ឃុំ
                  </span>
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.husband.birthCommune || "\u00A0"}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-px self-stretch bg-black/80 shrink-0",
                    fillOnly && "bg-transparent",
                  )}
                />
                <div className="w-[48%] pl-2 flex items-baseline">
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 w-full text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.wife.birthCommune || "\u00A0"}
                  </span>
                </div>
              </div>

              {/* Row 3: ឪពុក */}
              <div className="flex items-baseline">
                <div className="w-[52%] pr-2 flex items-baseline">
                  <span
                    className={cn(
                      "font-medium shrink-0 mr-1 w-[55px] text-left",
                      fillOnly && "invisible",
                    )}
                  >
                    ឪពុក
                  </span>
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.husband.fatherName || "\u00A0"}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-px self-stretch bg-black/80 shrink-0",
                    fillOnly && "bg-transparent",
                  )}
                />
                <div className="w-[48%] pl-2 flex items-baseline">
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 w-full text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.wife.fatherName || "\u00A0"}
                  </span>
                </div>
              </div>

              {/* Row 4: ម្ដាយ */}
              <div className="flex items-baseline">
                <div className="w-[52%] pr-2 flex items-baseline">
                  <span
                    className={cn(
                      "font-medium shrink-0 mr-1 w-[55px] text-left",
                      fillOnly && "invisible",
                    )}
                  >
                    ម្ដាយ
                  </span>
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.husband.motherName || "\u00A0"}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-px self-stretch bg-black/80 shrink-0",
                    fillOnly && "bg-transparent",
                  )}
                />
                <div className="w-[48%] pl-2 flex items-baseline">
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 w-full text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.wife.motherName || "\u00A0"}
                  </span>
                </div>
              </div>

              {/* Marriage Certificate Details */}
              <div className="pt-1.5 space-y-1">
                <div className="flex items-baseline w-full">
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
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.marriageCert.certNo || "\u00A0"}
                  </span>
                </div>

                <div className="flex items-baseline w-full">
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
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.marriageCert.certDate || "\u00A0"}
                  </span>
                  <span
                    className={cn(
                      "font-medium shrink-0 mx-1.5 text-[12px]",
                      fillOnly && "invisible",
                    )}
                  >
                    ឃុំ
                  </span>
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.marriageCert.certCommune || "\u00A0"}
                  </span>
                </div>

                <div className="flex items-baseline w-full">
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium shrink-0 mx-1.5 text-[12px]",
                      fillOnly && "invisible",
                    )}
                  >
                    ស្រុក
                  </span>
                  <span
                    className={cn(
                      "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                      fillOnly && "border-transparent",
                    )}
                  >
                    {data.marriageCert.certDistrict || "\u00A0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clause 2: សុខចិត្តព្រមទិញជាស្រេចឥតមានលក្ខខណ្ឌអ្វីឡើយ (Matching Image 1) */}
          <div className="my-3.5 text-center">
            <span
              className={cn(
                "font-moul text-[13.5px] text-black tracking-wide font-normal",
                fillOnly && "invisible",
              )}
            >
              សុខចិត្តព្រមទិញជាស្រេចឥតមានលក្ខខណ្ឌអ្វីឡើយ
            </span>
          </div>

          {/* Sale Price Section (តម្លៃជាប្រាក់) - 2 Full-width dotted lines */}
          <div className="mt-2 space-y-1.5 text-[13px]">
            <div className="flex items-baseline w-full leading-[2]">
              <span
                className={cn(
                  "font-semibold shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                តម្លៃជាប្រាក់
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.priceKhmer || "\u00A0"}
              </span>
            </div>
            <div className="flex items-baseline w-full leading-[2]">
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-full px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.priceNumber || "\u00A0"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Left = Taxes/Fees, Right = Original Receipt */}
        <div className="mt-6 pt-1 grid grid-cols-2 gap-6 text-[12px] leading-[1.9]">
          {/* Left: Tax & Fees Breakdown (Matching Image 1 exactly) */}
          <div className="space-y-1">
            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 w-[65px]",
                  fillOnly && "invisible",
                )}
              >
                តែមប្រែ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.stampFee || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                ប្រគាប់ត្រា
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.registrationFee || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                បង្កាន់ដៃលេខ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-16 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.taxReceiptNo || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ចុះថ្ងៃ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-20 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.taxReceiptDate || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 w-[65px]",
                  fillOnly && "invisible",
                )}
              >
                រង្វាន់លិខិត
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.cadastralFee || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ដ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-14 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.cadastralFeeD1 || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ដ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-14 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.cadastralFeeD2 || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 w-[65px]",
                  fillOnly && "invisible",
                )}
              >
                ប.ស.អ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.surveyFee || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ដ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-14 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.surveyFeeD1 || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ដ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-14 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.surveyFeeD2 || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 w-[65px]",
                  fillOnly && "invisible",
                )}
              >
                បូករួម
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.totalFee || "\u00A0"}
              </span>
            </div>
          </div>

          {/* Right: Original Deed Receipt */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div
              className={cn(
                "font-bold text-[13px] text-black",
                fillOnly && "invisible",
              )}
            >
              បានទទួលសំបុត្រដើម
            </div>
            <div className="w-full flex items-baseline">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 text-[12px]",
                  fillOnly && "invisible",
                )}
              >
                នៅថ្ងៃ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.receivedDate || "\u00A0"}
              </span>
            </div>
            <div className="w-full flex items-baseline">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1 text-[12px]",
                  fillOnly && "invisible",
                )}
              >
                ឈ្មោះ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 text-center font-bold pb-[1px] min-h-[18px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.receiverName || "\u00A0"}
              </span>
            </div>
            <div
              className={cn(
                "font-medium text-[12px] text-black pt-2 text-right w-full pr-8",
                fillOnly && "invisible",
              )}
            >
              ផ្តិតមេដៃស្តាំ
            </div>
            <div className="h-10" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          PAGE 2: Parcel Table, Boundaries, Witness & Signatures Certification
          ════════════════════════════════════════════════════════════════════════ */}
      <section
        className={cn(
          "custom-sheet a4-sheet bg-white text-black shadow-md print:shadow-none print:border-none relative flex flex-col justify-between font-battambang text-[13px] leading-[1.65]",
          isOriginal ? "w-[195mm] min-h-[297mm]" : "w-[210mm] min-h-[297mm]",
        )}
        style={{
          padding: pagePadding,
          boxSizing: "border-box",
        }}
      >
        <div>
          {/* Location Header */}
          <div className="pt-2 mb-3 flex items-baseline w-full text-[13px] leading-[2]">
            <span
              className={cn(
                "font-semibold mr-1 shrink-0",
                fillOnly && "invisible",
              )}
            >
              ក្បាលដី និងអចលនវត្ថុ ដូចមានខាងក្រោមនេះ នៅក្នុងឃុំ
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.propertyCommune || "\u00A0"}
            </span>
            <span
              className={cn(
                "font-semibold mx-2 shrink-0",
                fillOnly && "invisible",
              )}
            >
              ស្រុក
            </span>
            <span
              className={cn(
                "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                fillOnly && "border-transparent",
              )}
            >
              {data.propertyDistrict || "\u00A0"}
            </span>
          </div>

          {/* Official Land & Boundary 7-Column Table */}
          <div
            className={cn(
              "border border-black font-battambang relative",
              fillOnly && "border-transparent",
            )}
          >
            <table className="w-full border-collapse text-[11.5px] leading-tight">
              <thead>
                <tr
                  className={cn(
                    "border-b border-black text-center font-bold bg-neutral-50/50",
                    fillOnly && "border-transparent",
                  )}
                >
                  <th
                    rowSpan={2}
                    className={cn(
                      "w-[23%] border-r border-black p-1 align-middle",
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
                      "w-[9%] border-r border-black p-1 align-middle",
                      fillOnly && "border-transparent invisible",
                    )}
                  >
                    ទំហំ
                  </th>
                  <th
                    rowSpan={2}
                    className={cn(
                      "w-[12%] border-r border-black p-1 align-middle",
                      fillOnly && "border-transparent invisible",
                    )}
                  >
                    ប្រភេទដី
                  </th>
                  <th
                    colSpan={4}
                    className={cn(
                      "w-[42%] border-r border-black p-0.5 align-middle border-b",
                      fillOnly && "border-transparent invisible",
                    )}
                  >
                    ព្រំប្រទល់
                  </th>
                  <th
                    rowSpan={2}
                    className={cn(
                      "w-[14%] p-1 align-middle",
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
                    "border-b border-black text-center font-semibold text-[10.5px]",
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
                      "h-[32px] border-b border-black last:border-b-0",
                      fillOnly && "border-transparent",
                    )}
                  >
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center font-semibold align-middle truncate max-w-[120px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.indexOrSheet || ""}
                    </td>
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center font-semibold align-middle truncate max-w-[50px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.area || ""}
                    </td>
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center font-medium align-middle truncate max-w-[65px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.landType || ""}
                    </td>
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center align-middle text-[11px] truncate max-w-[65px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.boundaryNorth || ""}
                    </td>
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center align-middle text-[11px] truncate max-w-[65px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.boundarySouth || ""}
                    </td>
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center align-middle text-[11px] truncate max-w-[65px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.boundaryEast || ""}
                    </td>
                    <td
                      className={cn(
                        "border-r border-black px-1 text-center align-middle text-[11px] truncate max-w-[65px]",
                        fillOnly && "border-transparent",
                      )}
                    >
                      {row.boundaryWest || ""}
                    </td>
                    <td className="px-1 text-center align-middle text-[11px] truncate max-w-[75px]">
                      {row.encumbrance || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Crossed-out diagonal line across empty rows 2-6 (matching authentic Image 2) */}
            {rows.slice(1).every((r) => !r.indexOrSheet) && (
              <svg
                className={cn(
                  "absolute left-0 bottom-0 pointer-events-none w-full",
                  fillOnly && "invisible",
                )}
                style={{ height: `${5 * 32}px` }}
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1="1"
                  y1="98"
                  x2="99"
                  y2="2"
                  stroke="black"
                  strokeWidth="1.2"
                />
              </svg>
            )}
          </div>

          {/* Statement / Certification Clause (ធ្វើជាពីរច្បាប់ ថ្ងៃ...) */}
          <div className="mt-4 space-y-1.5 text-[13px] leading-[2]">
            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                ធ្វើជាពីរច្បាប់ ថ្ងៃ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.contractDateDay || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ខែ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-20 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.contractDateMonth || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1",
                  fillOnly && "invisible",
                )}
              >
                ឆ្នាំ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 w-16 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.contractDateYear || "\u00A0"}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0 mx-1.5",
                  fillOnly && "invisible",
                )}
              >
                នៅចំពោះមុខយើង
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.officialTitleAndName || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                បានឃើញឈ្មោះ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.sellerVerifiedNames || "\u00A0"}
              </span>
            </div>

            <div className="flex items-baseline w-full">
              <span
                className={cn(
                  "font-medium shrink-0 mr-1",
                  fillOnly && "invisible",
                )}
              >
                និងឈ្មោះ
              </span>
              <span
                className={cn(
                  "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[19px]",
                  fillOnly && "border-transparent",
                )}
              >
                {data.buyerVerifiedNames || "\u00A0"}
              </span>
            </div>

            {/* Full Legal Clause Text */}
            <p
              className={cn(
                "text-justify leading-relaxed mt-1 text-[12.5px]",
                fillOnly && "invisible",
              )}
            >
              ដែលយើងបានសួរបញ្ជាក់ដល់សាមីខ្លួនទាំងនេះ
              ឃើញថាពិតប្រាកដជាសាមីខ្លួនដែលជាគូភាគីត្រឹមត្រូវតាមសេចក្តីលិខិតនេះ
              ហើយយើងបានអាន សេចក្តីលិខិតទាំងស្រុងដោយក្បោះក្បាយឱ្យគូភាគីស្តាប់
              គូភាគីបានទទួលយល់ព្រមថាត្រឹមត្រូវ
              និងចុះហត្ថលេខានៅខាងក្រោមសេចក្តីលិខិតនេះ ឬផ្តិតមេដៃហើយ ។
            </p>
          </div>

          {/* Witnesses Section (សាក្សី) */}
          <div className="mt-5 space-y-1">
            {/* Witness ID Cards Header (matching Image 2) */}
            {(data.witness1IdCard || data.witness2IdCard) && (
              <div className="flex justify-between items-baseline text-[11.5px] font-bold text-black px-4 mb-0.5">
                <span>{data.witness1IdCard || ""}</span>
                <span>{data.witness2IdCard || ""}</span>
              </div>
            )}

            <div
              className={cn(
                "text-center font-bold text-[13px] text-black",
                fillOnly && "invisible",
              )}
            >
              បានអានសេចក្តីនៃលិខិតនេះឱ្យគូភាគីស្តាប់ចំពោះមុខ
            </div>

            <div className="space-y-1.5 text-[12.5px] mt-2 leading-[2]">
              {/* Witness 1 */}
              <div className="flex items-baseline w-full">
                <span
                  className={cn(
                    "font-medium shrink-0 mr-1",
                    fillOnly && "invisible",
                  )}
                >
                  សាក្សី - ឈ្មោះ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness1.name || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 ml-1.5 mr-1",
                    fillOnly && "invisible",
                  )}
                >
                  អាយុ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness1.age || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 ml-1 mr-1.5",
                    fillOnly && "invisible",
                  )}
                >
                  ឆ្នាំ ទីលំនៅៗឃុំ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness1.commune || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 mx-1.5",
                    fillOnly && "invisible",
                  )}
                >
                  ស្រុក
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness1.district || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 mx-1.5",
                    fillOnly && "invisible",
                  )}
                >
                  ខេត្ត
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness1.province || "\u00A0"}
                </span>
              </div>

              {/* Witness 2 */}
              <div className="flex items-baseline w-full">
                <span
                  className={cn(
                    "font-medium shrink-0 mr-1 pl-12",
                    fillOnly && "invisible",
                  )}
                >
                  ឈ្មោះ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness2.name || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 ml-1.5 mr-1",
                    fillOnly && "invisible",
                  )}
                >
                  អាយុ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 w-12 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness2.age || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 ml-1 mr-1.5",
                    fillOnly && "invisible",
                  )}
                >
                  ឆ្នាំ ទីលំនៅៗឃុំ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness2.commune || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 mx-1.5",
                    fillOnly && "invisible",
                  )}
                >
                  ស្រុក
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness2.district || "\u00A0"}
                </span>
                <span
                  className={cn(
                    "font-medium shrink-0 mx-1.5",
                    fillOnly && "invisible",
                  )}
                >
                  ខេត្ត
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 flex-1 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.witness2.province || "\u00A0"}
                </span>
              </div>
            </div>

            {/* Thumbprint & Certification Registration Number */}
            <div className="flex justify-between items-baseline pt-2 text-[12.5px]">
              <span className={cn("font-medium", fillOnly && "invisible")}>
                ផ្តិតមេដៃស្តាំ
              </span>
              <div className="flex items-baseline">
                <span
                  className={cn(
                    "font-medium shrink-0 mr-1",
                    fillOnly && "invisible",
                  )}
                >
                  បញ្ជាក់ចុះលេខ
                </span>
                <span
                  className={cn(
                    "border-b border-dotted border-black/85 w-32 px-1 text-center font-bold pb-[1px] min-h-[18px]",
                    fillOnly && "border-transparent",
                  )}
                >
                  {data.certRegistrationNo || "\u00A0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signatures (4 Columns) matching Image 2 */}
        <div className="mt-6 pt-3 border-t border-black/30 grid grid-cols-4 gap-2 text-center text-[12px] pb-2">
          <div>
            <div
              className={cn("font-bold text-[13px]", fillOnly && "invisible")}
            >
              អ្នកលក់
            </div>
            <div className="h-16 flex flex-col items-center justify-end pb-1">
              <span className="text-[12px] font-bold text-black tracking-wide">
                {data.seller.name
                  ? data.seller.name.replace(/^\(\d+\)\s*/, "") +
                    (data.sellerExtraLine ? "   ស៊ិន ស៊ីថាវាត" : "")
                  : "ស៊ិន វិសិដ្ឋ   ស៊ិន ស៊ីថាវាត"}
              </span>
            </div>
          </div>

          <div>
            <div
              className={cn("font-bold text-[13px]", fillOnly && "invisible")}
            >
              អ្នកទិញ
            </div>
            <div className="h-16 flex flex-col items-center justify-end pb-1">
              <span className="text-[12px] font-bold text-black tracking-wide">
                {data.buyer.name || "ជង់ វិទូរ"}
              </span>
            </div>
          </div>

          <div>
            <div
              className={cn("font-bold text-[13px]", fillOnly && "invisible")}
            >
              សាក្សី
            </div>
            <div className="h-16 flex flex-col items-center justify-end pb-1">
              <span className="text-[12px] font-bold text-black tracking-wide">
                {data.witness1.name && data.witness2.name
                  ? `${data.witness1.name}   ${data.witness2.name}`
                  : data.witness1.name || "នាង ឃុន សុជាតា   សុខ សឿន"}
              </span>
            </div>
          </div>

          <div>
            <div
              className={cn("font-bold text-[12px]", fillOnly && "invisible")}
            >
              ហត្ថលេខានិងត្រាត្រឹមត្រូវដែលបញ្ជាក់
            </div>
            <div className="h-16" />
          </div>
        </div>
      </section>
    </div>
  );
}
