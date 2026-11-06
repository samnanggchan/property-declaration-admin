"use client";

import * as React from "react";
import { A4Page } from "@/components/a4-page";
import {
  TransferApplication,
  SellerParty,
  BuyerParty,
  PersonData,
} from "@/lib/transfer-application-types";
import {
  toKhmerDigits as kh,
  parseDateParts,
} from "@/lib/inheritance-request-types";
import { dateStringToKhmerLunar } from "@/lib/khmer-lunar-calendar";
import { calculateAgeFromDob, cn } from "@/lib/utils";

/* ═════════════════════════ Internal Print Kit Primitives ═════════════════════════ */

function PAGE({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-battambang text-[12pt] leading-[1.65] text-black w-full h-full flex flex-col justify-between selection:bg-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ROW({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-[7.4mm] flex items-baseline overflow-hidden leading-[7.4mm]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DOTS({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "border-b border-dotted border-black/60 inline-block align-baseline",
        className,
      )}
    />
  );
}

function L({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("shrink-0 whitespace-pre text-black", className)}>
      {children}
    </span>
  );
}

function D({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grow border-b border-dotted border-black/70 px-1 text-center font-semibold text-black inline-block truncate",
        className,
      )}
    >
      {children ?? <span className="opacity-0">.</span>}
    </span>
  );
}

function Ornament({
  src = "/symbol-3.png",
  alt = "Ornament",
  className,
  width = 75,
  height = 14,
}: {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className={cn("flex justify-center my-1", className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain h-3.5 w-auto"
      />
    </div>
  );
}

function ageNumber(dob?: string): string {
  if (!dob) return "";
  const raw = calculateAgeFromDob(dob);
  const match = raw.match(/\d+/);
  return match ? kh(match[0]) : "";
}

export type PrintPageFilter = "all" | 1 | 2 | "annexSellers" | "annexBuyers";

interface TransferPrintProps {
  data: TransferApplication;
  pageFilter?: PrintPageFilter;
}

function getPrimaryPerson(party?: SellerParty | BuyerParty): {
  name: string;
  gender: string;
  dob: string;
  idNumber: string;
  spouseName: string;
  address: string;
  fatherName: string;
  motherName: string;
  pob: string;
} {
  if (!party) {
    return {
      name: "",
      gender: "",
      dob: "",
      idNumber: "",
      spouseName: "",
      address: "",
      fatherName: "",
      motherName: "",
      pob: "",
    };
  }

  // If Legal Entity
  const isLegalEntity =
    ("buyer_type" in party && party.buyer_type === "LEGAL_ENTITY") ||
    ("seller_type" in party && party.seller_type === "LEGAL_ENTITY");

  if (isLegalEntity) {
    const le = party.legal_entity;
    return {
      name: le.entity_name,
      gender: "",
      dob: le.representative_dob,
      idNumber: le.charter_number,
      spouseName: le.representative_name ? `តំណាង ៖ ${le.representative_name}` : "",
      address: le.head_office_address,
      fatherName: le.representative_father,
      motherName: le.representative_mother,
      pob: le.representative_pob,
    };
  }

  // If married couple
  if (party.marital_status === "MARRIED" && party.husband.full_name) {
    const h = party.husband;
    const w = party.wife;
    return {
      name: h.full_name,
      gender: h.gender || "ប្រុស",
      dob: h.dob,
      idNumber: h.id_card_number,
      spouseName: w.full_name || "",
      address: h.current_address || w.current_address,
      fatherName: h.father_name,
      motherName: h.mother_name,
      pob: h.pob,
    };
  }

  // Single person
  const p = party.person.full_name ? party.person : party.husband;
  return {
    name: p.full_name,
    gender: p.gender || "",
    dob: p.dob,
    idNumber: p.id_card_number,
    spouseName: p.spouse_name || "",
    address: p.current_address,
    fatherName: p.father_name,
    motherName: p.mother_name,
    pob: p.pob,
  };
}

export function TransferApplicationPrint({
  data,
  pageFilter = "all",
}: TransferPrintProps) {
  const s0 = getPrimaryPerson(data.sellers[0]);
  const b0 = getPrimaryPerson(data.buyers[0]);

  const hasMultipleSellers = data.sellers.length > 1;
  const hasMultipleBuyers = data.buyers.length > 1;

  const showP1 = pageFilter === "all" || pageFilter === 1;
  const showP2 = pageFilter === "all" || pageFilter === 2;
  const showAnnexSellers =
    (pageFilter === "all" && hasMultipleSellers) || pageFilter === "annexSellers";
  const showAnnexBuyers =
    (pageFilter === "all" && hasMultipleBuyers) || pageFilter === "annexBuyers";

  const appCity = data.parcel_and_property.city || "រាជធានីភ្នំពេញ";

  return (
    <div id="printable-document" className="printable-area space-y-6 print:space-y-0">
      {/* ══════════════ OFFICIAL PAGE 1 ══════════════ */}
      {showP1 && (
        <A4Page mode="fixed" className="bg-white text-black print:shadow-none shadow-md">
          <PAGE className="justify-between text-[11.5pt] leading-normal pt-2 pb-3 px-8">
            <div className="space-y-1">
              {/* Header: Kingdom Centered + Department on Bottom-Right */}
              <div className="relative pt-1 pb-1">
                <div className="text-center">
                  <h1 className="font-moul text-base tracking-wide text-neutral-950">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </h1>
                  <h2 className="font-moul text-sm tracking-wide text-neutral-950 mt-1">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </h2>
                  <div className="my-1.5 flex justify-center">
                    <Ornament width={75} height={14} />
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 text-right">
                  <span className="font-moul text-xs text-blue-800 tracking-wide whitespace-nowrap block">
                    មន្ទីរ ដ.ន.ស.ស {appCity}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-2 pb-1">
                <h1 className="font-moul text-[14pt] text-black">
                  ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
                </h1>
              </div>

              {/* 7-Line Paragraph matching official form */}
              <div className="space-y-0 text-black">
                {/* Line 1: Seller */}
                <ROW>
                  <L>ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ</L>
                  <D className="font-semibold">{s0.name || ""}</D>
                  {hasMultipleSellers && (
                    <span className="italic text-[10pt] px-1 font-normal">
                      (មើលឧបសម្ព័ន្ធ)
                    </span>
                  )}
                  <L>ភេទ</L>
                  <D className="max-w-[45px]">{s0.gender || ""}</D>
                  <L>អាយុ</L>
                  <D className="max-w-[45px]">{ageNumber(s0.dob)}</D>
                  <L className="text-[9pt] align-super">ឆ្នាំ(១)</L>
                  <L> អាសយដ្ឋានបច្ចុប្បន្ន</L>
                </ROW>

                {/* Line 2 */}
                <ROW>
                  <L>នៅផ្ទះលេខ</L>
                  <D className="max-w-[65px]">{data.parcel_and_property.streetNo ? "" : ""}</D>
                  <L>ផ្លូវលេខ</L>
                  <D className="max-w-[65px]">{data.parcel_and_property.streetNo || ""}</D>
                  <L>ភូមិ</L>
                  <D className="max-w-[120px]">{data.parcel_and_property.village || ""}</D>
                  <L>ឃុំ/សង្កាត់</L>
                  <D className="max-w-[140px]">{data.parcel_and_property.sangkat || ""}</D>
                  <L>ក្រុង/ស្រុក/ខណ្ឌ</L>
                  <D>{data.parcel_and_property.khan || ""}</D>
                </ROW>

                {/* Line 3 */}
                <ROW>
                  <L>រាជធានី/ខេត្ត</L>
                  <D className="max-w-[170px]">{appCity}</D>
                  <L>ប្តី/ប្រពន្ធឈ្មោះ</L>
                  <D>{s0.spouseName || ""}</D>
                </ROW>

                {/* Line 4: Buyer */}
                <ROW>
                  <L className="font-semibold">(បុគ្គលមានសិទ្ធិចុះបញ្ជី)</L>
                  <L> និង ឈ្មោះ</L>
                  <D className="font-semibold">{b0.name || ""}</D>
                  {hasMultipleBuyers && (
                    <span className="italic text-[10pt] px-1 font-normal">
                      (មើលឧបសម្ព័ន្ធ)
                    </span>
                  )}
                  <L>ភេទ</L>
                  <D className="max-w-[45px]">{b0.gender || ""}</D>
                  <L>អាយុ</L>
                  <D className="max-w-[45px]">{ageNumber(b0.dob)}</D>
                  <L>ឆ្នាំ</L>
                </ROW>

                {/* Line 5 */}
                <ROW>
                  <L className="text-[9pt] align-super">(២)</L>
                  <L> អាសយដ្ឋានបច្ចុប្បន្ន ៖</L>
                  <D className="font-normal text-xs">{b0.address || ""}</D>
                </ROW>

                {/* Line 6 */}
                <ROW>
                  <L>ប្តី/ប្រពន្ធឈ្មោះ</L>
                  <D>{b0.spouseName || ""}</D>
                  <L className="font-semibold">(បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី)។</L>
                </ROW>
              </div>

              {/* Salutation */}
              <div className="pt-2 text-center space-y-0.5">
                <span className="font-moul text-[12pt] block">សូមគោរពជូន</span>
                <span className="font-battambang font-bold text-[12pt] block">
                  លោកប្រធានមន្ទីររៀបចំដែនដី នគរូបនីយកម្ម សំណង់ និងសុរិយោដី {appCity}
                </span>
              </div>

              {/* Subject & Reference */}
              <div className="space-y-1 pt-1 text-[11.5pt]">
                <div className="flex items-baseline">
                  <span className="font-moul text-[11pt] shrink-0 w-20">កម្មវត្ថុ ៖</span>
                  <span className="leading-snug">
                    សំណើសុំចុះបញ្ជីអំពីការផ្ទេរ{" "}
                    <strong>
                      {data.purpose === "whole"
                        ? "កម្មសិទ្ធិទាំងមូល"
                        : data.purpose === "part"
                        ? "កម្មសិទ្ធិមួយផ្នែក"
                        : data.purpose === "coWhole"
                        ? "ចំណែកកម្មសិទ្ធិអវិភាគទាំងមូល"
                        : "ចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែក"}
                    </strong>
                    {data.parcel_and_property.parcel_number
                      ? ` លើក្បាលដីលេខ ${data.parcel_and_property.parcel_number}`
                      : ""}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-moul text-[11pt] shrink-0 w-20">យោង ៖</span>
                  <span className="leading-snug">
                    មូលហេតុ និងកាលបរិច្ឆេទ ៖{" "}
                    <strong>
                      {data.cause === "sale"
                        ? "កិច្ចសន្យាលក់ទិញ"
                        : data.cause === "gift"
                        ? "ប្រទានកម្ម"
                        : data.cause === "exchange"
                        ? "ការដូរ"
                        : data.cause === "succession"
                        ? "សន្តតិកម្ម"
                        : data.cause === "inheritanceSplit"
                        ? "ការបែងចែកមត៌ក"
                        : data.cause === "bequest"
                        ? "អច្ច័យទាន"
                        : data.cause === "judgment"
                        ? "សាលក្រម/សាលដីកា"
                        : data.cause === "coSplit"
                        ? "ការបែងចែកកម្មសិទ្ធិអវិភាគ"
                        : data.cause === "renounce"
                        ? "ការលះបង់ចំណែកកម្មសិទ្ធិអវិភាគ"
                        : data.causeOther || "ផ្សេងៗ"}
                    </strong>
                    {data.causeDate ? ` ចុះថ្ងៃទី ${data.causeDate}` : ""}
                  </span>
                </div>

                <div className="pt-1">
                  <p className="leading-normal">
                    តាមកម្មវត្ថុ និងយោងខាងលើ យើងខ្ញុំសូមគោរពស្នើសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិដូចខាងក្រោម ៖
                  </p>
                </div>

                {/* Section ក: គោលបំណងនៃការចុះបញ្ជី */}
                <div className="space-y-0.5 pt-0.5">
                  <span className="font-semibold block">ក- គោលបំណងនៃការចុះបញ្ជី ៖</span>

                  <ROW className="pl-4">
                    <span className="w-5 text-center shrink-0 font-bold">
                      {data.purpose === "whole" ? "✓" : "–"}
                    </span>
                    <L>ការផ្ទេរកម្មសិទ្ធិទាំងមូល ឬ</L>
                  </ROW>

                  <ROW className="pl-4">
                    <span className="w-5 text-center shrink-0 font-bold">
                      {data.purpose === "part" ? "✓" : "–"}
                    </span>
                    <L>ការផ្ទេរកម្មសិទ្ធិមួយផ្នែក</L>
                  </ROW>

                  <ROW className="pl-4">
                    <span className="w-5 text-center shrink-0 font-bold">
                      {data.purpose === "coWhole" ? "✓" : "–"}
                    </span>
                    <L>ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគទាំងមូលរបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ</L>
                    <D className="max-w-[140px]">
                      {data.purpose === "coWhole" ? data.coOwnerName || "" : ""}
                    </D>
                    <L>នៃលេខ</L>
                    <D>{data.purpose === "coWhole" ? data.coOwnerNo || "" : ""}</D>
                    <L> ឬ</L>
                  </ROW>

                  <ROW className="pl-4">
                    <span className="w-5 text-center shrink-0 font-bold">
                      {data.purpose === "coPart" ? "✓" : "–"}
                    </span>
                    <L>ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែករបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ</L>
                    <D className="max-w-[140px]">
                      {data.purpose === "coPart" ? data.coOwnerName || "" : ""}
                    </D>
                    <L>នៃលេខ</L>
                    <D>{data.purpose === "coPart" ? data.coOwnerNo || "" : ""}</D>
                  </ROW>
                </div>

                {/* Section ខ: មូលហេតុ (First causes on page 1) */}
                <div className="space-y-0.5 pt-1">
                  <span className="font-semibold block">ខ- មូលហេតុ ៖</span>
                  {(() => {
                    const cd = data.causeDate ? parseDateParts(data.causeDate) : null;
                    const isSale = data.cause === "sale";
                    const isGift = data.cause === "gift";
                    const isExchange = data.cause === "exchange";

                    return (
                      <>
                        <ROW className="pl-4">
                          <span className="w-5 text-center shrink-0 font-bold">
                            {isSale ? "✓" : "–"}
                          </span>
                          <L>ការលក់ទិញ ចុះថ្ងៃទី</L>
                          <D className="max-w-[45px]">{isSale && cd ? kh(cd.day) : ""}</D>
                          <L>ខែ</L>
                          <D className="max-w-[90px]">{isSale && cd ? kh(cd.month) : ""}</D>
                          <L>ឆ្នាំ</L>
                          <D className="max-w-[65px]">{isSale && cd ? kh(cd.year) : ""}</D>
                          <L>ឬ</L>
                        </ROW>

                        <ROW className="pl-4">
                          <span className="w-5 text-center shrink-0 font-bold">
                            {isGift ? "✓" : "–"}
                          </span>
                          <L>ប្រទានកម្ម ចុះថ្ងៃទី</L>
                          <D className="max-w-[45px]">{isGift && cd ? kh(cd.day) : ""}</D>
                          <L>ខែ</L>
                          <D className="max-w-[90px]">{isGift && cd ? kh(cd.month) : ""}</D>
                          <L>ឆ្នាំ</L>
                          <D className="max-w-[65px]">{isGift && cd ? kh(cd.year) : ""}</D>
                          <L>ឬ</L>
                        </ROW>

                        <ROW className="pl-4">
                          <span className="w-5 text-center shrink-0 font-bold">
                            {isExchange ? "✓" : "–"}
                          </span>
                          <L>ការដូរ ចុះថ្ងៃទី</L>
                          <D className="max-w-[45px]">{isExchange && cd ? kh(cd.day) : ""}</D>
                          <L>ខែ</L>
                          <D className="max-w-[90px]">{isExchange && cd ? kh(cd.month) : ""}</D>
                          <L>ឆ្នាំ</L>
                          <D className="max-w-[65px]">{isExchange && cd ? kh(cd.year) : ""}</D>
                          <L>ឬ</L>
                        </ROW>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Pinned Footnotes */}
            <div className="border-t border-black/70 pt-2 text-[8.5pt] leading-tight space-y-1 text-black/90">
              <p>
                - <sup>(១) និង (២)</sup> ក្នុងករណីបុគ្គលមានសិទ្ធិចុះបញ្ជី ឬបុគ្គលមានកាតព្វកិច្ចចុះបញ្ជីជានីតិបុគ្គល ត្រូវសរសេរតាមកាល និងអាសយដ្ឋានដែលជាទីស្នាក់ការរបស់នីតិបុគ្គលនោះ។
              </p>
              <p>
                - <sup>(៣)</sup> ក្នុងករណីពាក្យសុំចុះបញ្ជីដាក់នៅរដ្ឋបាលសុរិយោដី ក្រុង/ស្រុក/ខណ្ឌ ត្រូវសរសេរបន្ថែម ៖ “តាមរយៈ លោកប្រធានការិយាល័យរៀបចំដែនដី នគរូបនីយកម្ម សំណង់ និងភូមិបាល ក្រុង/ស្រុក/ខណ្ឌ....................”
              </p>
              <p>
                - <span className="underline font-semibold">ចំណាំ ៖</span> សូមជម្រាបថា ដើម្បីជៀសវាងការយឺតយ៉ាវក្នុងការទទួលបាននូវលិខិតធានាដោយថាហេតុ ម្ចាស់សិទ្ធិអាចដាក់ពាក្យ សុំចុះបញ្ជីនៅរដ្ឋបាលសុរិយោដីរាជធានី/ខេត្ត ដោយផ្ទាល់តែម្តងក៏បានដែរ។
              </p>
            </div>
          </PAGE>
        </A4Page>
      )}

      {/* ══════════════ OFFICIAL PAGE 2 ══════════════ */}
      {showP2 && (
        <A4Page mode="fixed" className="bg-white text-black print:shadow-none shadow-md">
          <PAGE className="justify-between text-[11.5pt] leading-normal pt-4 pb-4 px-8">
            <div className="space-y-1 text-black">
              {/* Remaining causes */}
              {(() => {
                const cd = data.causeDate ? parseDateParts(data.causeDate) : null;
                const matchCause = (k: string) => data.cause === k;
                return (
                  <div className="space-y-0.5">
                    <ROW className="pl-4">
                      <span className="w-5 text-center shrink-0 font-bold">
                        {matchCause("succession") ? "✓" : "–"}
                      </span>
                      <L>សន្តតិកម្ម ចុះថ្ងៃទី</L>
                      <D className="max-w-[45px]">{matchCause("succession") && cd ? kh(cd.day) : ""}</D>
                      <L>ខែ</L>
                      <D className="max-w-[90px]">{matchCause("succession") && cd ? kh(cd.month) : ""}</D>
                      <L>ឆ្នាំ</L>
                      <D className="max-w-[65px]">{matchCause("succession") && cd ? kh(cd.year) : ""}</D>
                      <L>ឬ</L>
                    </ROW>

                    <ROW className="pl-4">
                      <span className="w-5 text-center shrink-0 font-bold">
                        {matchCause("inheritanceSplit") ? "✓" : "–"}
                      </span>
                      <L>ការបែងចែកមត៌ក ចុះថ្ងៃទី</L>
                      <D className="max-w-[45px]">{matchCause("inheritanceSplit") && cd ? kh(cd.day) : ""}</D>
                      <L>ខែ</L>
                      <D className="max-w-[90px]">{matchCause("inheritanceSplit") && cd ? kh(cd.month) : ""}</D>
                      <L>ឆ្នាំ</L>
                      <D className="max-w-[65px]">{matchCause("inheritanceSplit") && cd ? kh(cd.year) : ""}</D>
                      <L>ឬ</L>
                    </ROW>

                    <ROW className="pl-4">
                      <span className="w-5 text-center shrink-0 font-bold">
                        {matchCause("other") ? "✓" : "–"}
                      </span>
                      <L>ផ្សេងៗ</L>
                      <D className="max-w-[160px]">{matchCause("other") ? data.causeOther || "" : ""}</D>
                      <L>ចុះថ្ងៃទី</L>
                      <D className="max-w-[45px]">{matchCause("other") && cd ? kh(cd.day) : ""}</D>
                      <L>ខែ</L>
                      <D className="max-w-[90px]">{matchCause("other") && cd ? kh(cd.month) : ""}</D>
                      <L>ឆ្នាំ</L>
                      <D className="max-w-[65px]">{matchCause("other") && cd ? kh(cd.year) : ""}</D>
                    </ROW>
                  </div>
                );
              })()}

              {/* Section គ: បុគ្គលមានសិទ្ធិចុះបញ្ជី និង បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី */}
              <div className="pt-2 space-y-1">
                <span className="font-semibold block">
                  គ- ព័ត៌មានបុគ្គលមានសិទ្ធិចុះបញ្ជី និង បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី ៖
                </span>

                <ROW className="pl-2">
                  <L>១. បុគ្គលមានសិទ្ធិចុះបញ្ជី ៖ ឈ្មោះ</L>
                  <D className="font-semibold max-w-[180px]">{s0.name || ""}</D>
                  <L>ភេទ</L>
                  <D className="max-w-[45px]">{s0.gender || ""}</D>
                  <L>ថ្ងៃខែឆ្នាំកំណើត</L>
                  <D className="max-w-[110px]">{s0.dob || ""}</D>
                </ROW>

                <ROW className="pl-2">
                  <L>២. បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី ៖ ឈ្មោះ</L>
                  <D className="font-semibold max-w-[180px]">{b0.name || ""}</D>
                  <L>ភេទ</L>
                  <D className="max-w-[45px]">{b0.gender || ""}</D>
                  <L>ថ្ងៃខែឆ្នាំកំណើត</L>
                  <D className="max-w-[110px]">{b0.dob || ""}</D>
                </ROW>
              </div>

              {/* Section ឃ & ង */}
              <div className="pt-1 space-y-1">
                <ROW>
                  <L className="font-semibold">ឃ- ចំណែកកម្មសិទ្ធិអវិភាគរបស់ម្ចាស់កម្មសិទ្ធិអវិភាគថ្មី ៖</L>
                  <D>{data.newCoOwnerShare || ""}</D>
                </ROW>

                <div className="space-y-0.5">
                  <span className="font-semibold block">ង- អចលនវត្ថុដែលត្រូវផ្ទេរ ៖</span>
                  <ROW className="pl-2">
                    <L>- វិញ្ញាបនប័ត្រសម្គាល់ម្ចាស់អចលនវត្ថុ ឬប័ណ្ណសម្គាល់សិទ្ធិកាន់កាប់អចលនវត្ថុលេខ</L>
                    <D className="font-semibold max-w-[170px]">
                      {data.parcel_and_property.parcel_number || ""}
                    </D>
                    <L>ទំហំ</L>
                    <D className="max-w-[80px]">
                      {data.parcel_and_property.property_characteristics.size || ""}
                    </D>
                  </ROW>
                  <ROW className="pl-2">
                    <L>- ទីតាំងអចលនវត្ថុស្ថិតនៅ ៖</L>
                    <D className="font-semibold">{data.parcel_and_property.location || ""}</D>
                  </ROW>
                </div>
              </div>

              {/* Closing Sentence */}
              <div className="pt-2 text-justify">
                <p className="indent-8 leading-relaxed">
                  យើងខ្ញុំសូមសន្យា និងទទួលខុសត្រូវទាំងស្រុងចំពោះមុខច្បាប់ថា ពុំមានការក្លែងបន្លំ ឬលួចលាក់ព័ត៌មានណាមួយឡើយ ហើយរាល់ព័ត៌មានដែលបានផ្តល់ជូនខាងលើគឺពិតជាត្រឹមត្រូវពិតប្រាកដមែន។
                </p>
              </div>

              {/* Signature Area */}
              {(() => {
                const appDate = data.date ? parseDateParts(data.date) : null;
                const lunar = data.date ? dateStringToKhmerLunar(data.date) : null;
                const lunarLine = lunar?.officialLunarLine || lunar?.formatted || "";

                return (
                  <div className="pt-3 grid grid-cols-2 gap-4 text-center">
                    {/* Left: Seller Thumbprint */}
                    <div className="flex flex-col items-center justify-between min-h-[145px]">
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-[11pt]">
                          ស្នាមមេដៃបុគ្គលមានសិទ្ធិចុះបញ្ជី
                        </span>
                        <span className="text-[10pt] text-neutral-600 block">
                          (ស្នាមមេដៃស្តាំ)
                        </span>
                      </div>
                      <div className="border border-dashed border-black/40 w-24 h-24 rounded-lg flex items-center justify-center text-[10pt] text-neutral-400">
                        ស្នាមមេដៃ
                      </div>
                      <span className="font-semibold text-[11pt] pt-1">{s0.name || ""}</span>
                    </div>

                    {/* Right: Date + Buyer Thumbprint */}
                    <div className="flex flex-col items-center justify-between min-h-[145px]">
                      <div className="space-y-0.5 text-[10.5pt]">
                        {lunarLine && <div className="italic text-neutral-800">{lunarLine}</div>}
                        <div>
                          {appCity}, ថ្ងៃទី {appDate ? kh(appDate.day) : "...."} ខែ{" "}
                          {appDate ? kh(appDate.month) : "...."} ឆ្នាំ{" "}
                          {appDate ? kh(appDate.year) : "២០...."}
                        </div>
                        <span className="font-semibold block text-[11pt] pt-0.5">
                          ស្នាមមេដៃបុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី
                        </span>
                      </div>
                      <div className="border border-dashed border-black/40 w-24 h-24 rounded-lg flex items-center justify-center text-[10pt] text-neutral-400">
                        ស្នាមមេដៃ
                      </div>
                      <span className="font-semibold text-[11pt] pt-1">{b0.name || ""}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Witnesses */}
              {(data.witnesses[0]?.full_name || data.witnesses[1]?.full_name) && (
                <div className="pt-2 border-t border-black/30 text-[10.5pt] space-y-1">
                  <span className="font-semibold block">សាក្សី ៖</span>
                  {data.witnesses.map((w, i) => {
                    if (!w.full_name) return null;
                    return (
                      <ROW key={i} className="pl-3 text-[10.5pt]">
                        <L>{kh(i + 1)}. ឈ្មោះ</L>
                        <D className="font-semibold max-w-[170px]">{w.full_name}</D>
                        <L>អត្តសញ្ញាណប័ណ្ណលេខ</L>
                        <D className="max-w-[130px]">{w.id_card_number || ""}</D>
                        <L>អាសយដ្ឋាន</L>
                        <D>{w.residence_address || ""}</D>
                      </ROW>
                    );
                  })}
                </div>
              )}

              {/* Attachments */}
              {data.attachments && (
                <div className="pt-1 text-[10.5pt]">
                  <span className="font-semibold">ឯកសារភ្ជាប់ ៖ </span>
                  <span>{data.attachments}</span>
                </div>
              )}
            </div>
          </PAGE>
        </A4Page>
      )}

      {/* ══════════════ SELLER ANNEX PAGE ══════════════ */}
      {showAnnexSellers && (
        <A4Page mode="fixed" className="bg-white text-black print:shadow-none shadow-md">
          <PAGE className="justify-between text-[10.5pt] pt-3 pb-3 px-6">
            <div className="space-y-2">
              <div className="text-center space-y-1">
                <span className="text-[10pt] block text-neutral-600">
                  ឧបសម្ព័ន្ធភ្ជាប់ជាមួយពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
                </span>
                <h2 className="font-moul text-[13pt] text-black">
                  តារាងបញ្ជីឈ្មោះភាគីប្រគល់ (បុគ្គលមានសិទ្ធិចុះបញ្ជី)
                </h2>
                <p className="text-[10pt] text-neutral-700">
                  ក្បាលដីលេខ ៖ <strong>{data.parcel_and_property.parcel_number || "—"}</strong> | ទីតាំង ៖{" "}
                  {data.parcel_and_property.location || "—"}
                </p>
              </div>

              {/* 6-Column Official Annex Table */}
              <div className="border border-black overflow-hidden mt-2">
                <table className="w-full text-left border-collapse text-[9.5pt]">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-center font-semibold">
                      <th className="border-r border-black p-1 w-8">ល.រ</th>
                      <th className="border-r border-black p-1 w-32">ឈ្មោះ / ភេទ / អាយុ</th>
                      <th className="border-r border-black p-1 w-36">ថ្ងៃខែកំណើត / ទីកន្លែងកំណើត</th>
                      <th className="border-r border-black p-1 w-36">ឪពុក / ម្តាយ / ប្តីប្រពន្ធ</th>
                      <th className="border-r border-black p-1">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                      <th className="p-1 w-20 text-center">ស្នាមមេដៃ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sellers.map((s, idx) => {
                      const p = getPrimaryPerson(s);
                      return (
                        <tr
                          key={idx}
                          className="h-[20mm] max-h-[20mm] border-b border-black last:border-b-0 leading-tight"
                        >
                          <td className="border-r border-black p-1 text-center font-bold align-middle">
                            {kh(idx + 1)}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div className="font-bold text-[10pt]">{p.name || "—"}</div>
                            <div className="text-neutral-700">
                              {p.gender && `ភេទ ៖ ${p.gender}`} {p.dob && `(${ageNumber(p.dob)} ឆ្នាំ)`}
                            </div>
                            {p.idNumber && (
                              <div className="text-[8.5pt] text-neutral-600">អត្ត. ៖ {p.idNumber}</div>
                            )}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div>{p.dob ? `កើត ៖ ${p.dob}` : "—"}</div>
                            <div className="text-[8.5pt] text-neutral-700 truncate max-w-[135px]">
                              {p.pob || ""}
                            </div>
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5 text-[9pt]">
                            <div>ឪ. {p.fatherName || "—"}</div>
                            <div>ម្ត. {p.motherName || "—"}</div>
                            <div>ប្តី/ប្រពន្ធ ៖ {p.spouseName || "—"}</div>
                          </td>
                          <td className="border-r border-black p-1 align-top text-[9pt]">
                            {p.address || "—"}
                          </td>
                          <td className="p-1 text-center align-middle">
                            <div className="border border-dashed border-black/40 w-14 h-14 mx-auto rounded flex items-center justify-center text-[7.5pt] text-neutral-400">
                              មេដៃ
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-end pt-2 text-[9pt] border-t border-black/40">
              <span className="italic text-neutral-600">
                បញ្ជាក់ ៖ តារាងឧបសម្ព័ន្ធនេះជាផ្នែកមួយមិនអាចខ្វះបាននៃពាក្យសុំចុះបញ្ជីផ្ទេរកម្មសិទ្ធិខាងលើ។
              </span>
              <span>{appCity}, ថ្ងៃទី {data.date ? kh(data.date) : "........"}</span>
            </div>
          </PAGE>
        </A4Page>
      )}

      {/* ══════════════ BUYER ANNEX PAGE ══════════════ */}
      {showAnnexBuyers && (
        <A4Page mode="fixed" className="bg-white text-black print:shadow-none shadow-md">
          <PAGE className="justify-between text-[10.5pt] pt-3 pb-3 px-6">
            <div className="space-y-2">
              <div className="text-center space-y-1">
                <span className="text-[10pt] block text-neutral-600">
                  ឧបសម្ព័ន្ធភ្ជាប់ជាមួយពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
                </span>
                <h2 className="font-moul text-[13pt] text-black">
                  តារាងបញ្ជីឈ្មោះភាគីទទួល (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី)
                </h2>
                <p className="text-[10pt] text-neutral-700">
                  ក្បាលដីលេខ ៖ <strong>{data.parcel_and_property.parcel_number || "—"}</strong> | ទីតាំង ៖{" "}
                  {data.parcel_and_property.location || "—"}
                </p>
              </div>

              {/* 6-Column Official Annex Table */}
              <div className="border border-black overflow-hidden mt-2">
                <table className="w-full text-left border-collapse text-[9.5pt]">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-center font-semibold">
                      <th className="border-r border-black p-1 w-8">ល.រ</th>
                      <th className="border-r border-black p-1 w-32">ឈ្មោះ / ភេទ / អាយុ</th>
                      <th className="border-r border-black p-1 w-36">ថ្ងៃខែកំណើត / ទីកន្លែងកំណើត</th>
                      <th className="border-r border-black p-1 w-36">ឪពុក / ម្តាយ / ប្តីប្រពន្ធ</th>
                      <th className="border-r border-black p-1">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                      <th className="p-1 w-20 text-center">ស្នាមមេដៃ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.buyers.map((b, idx) => {
                      const p = getPrimaryPerson(b);
                      return (
                        <tr
                          key={idx}
                          className="h-[20mm] max-h-[20mm] border-b border-black last:border-b-0 leading-tight"
                        >
                          <td className="border-r border-black p-1 text-center font-bold align-middle">
                            {kh(idx + 1)}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div className="font-bold text-[10pt]">{p.name || "—"}</div>
                            <div className="text-neutral-700">
                              {p.gender && `ភេទ ៖ ${p.gender}`} {p.dob && `(${ageNumber(p.dob)} ឆ្នាំ)`}
                            </div>
                            {p.idNumber && (
                              <div className="text-[8.5pt] text-neutral-600">អត្ត. ៖ {p.idNumber}</div>
                            )}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div>{p.dob ? `កើត ៖ ${p.dob}` : "—"}</div>
                            <div className="text-[8.5pt] text-neutral-700 truncate max-w-[135px]">
                              {p.pob || ""}
                            </div>
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5 text-[9pt]">
                            <div>ឪ. {p.fatherName || "—"}</div>
                            <div>ម្ត. {p.motherName || "—"}</div>
                            <div>ប្តី/ប្រពន្ធ ៖ {p.spouseName || "—"}</div>
                          </td>
                          <td className="border-r border-black p-1 align-top text-[9pt]">
                            {p.address || "—"}
                          </td>
                          <td className="p-1 text-center align-middle">
                            <div className="border border-dashed border-black/40 w-14 h-14 mx-auto rounded flex items-center justify-center text-[7.5pt] text-neutral-400">
                              មេដៃ
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-end pt-2 text-[9pt] border-t border-black/40">
              <span className="italic text-neutral-600">
                បញ្ជាក់ ៖ តារាងឧបសម្ព័ន្ធនេះជាផ្នែកមួយមិនអាចខ្វះបាននៃពាក្យសុំចុះបញ្ជីផ្ទេរកម្មសិទ្ធិខាងលើ។
              </span>
              <span>{appCity}, ថ្ងៃទី {data.date ? kh(data.date) : "........"}</span>
            </div>
          </PAGE>
        </A4Page>
      )}
    </div>
  );
}
