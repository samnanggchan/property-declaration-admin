"use client";

import * as React from "react";
import { A4Page } from "@/components/a4-page";
import {
  TransferApplication,
  SellerParty,
  BuyerParty,
  PersonData,
} from "@/lib/transfer-application-types";
import { toKhmerDigits as kh } from "@/lib/inheritance-request-types";
import { dateStringToKhmerLunar } from "@/lib/khmer-lunar-calendar";
import { calculateAgeFromDob, cn, toArabicNum } from "@/lib/utils";

/* ═════════════════════════ Unified Dotted Field Component ═════════════════════════ */

/** Clean name from accidental letter prefixes (e.g. "ខ. ឈូ ស៊ីសេង" -> "ឈូ ស៊ីសេង") */
function cleanPersonName(name?: string | null): string {
  if (!name) return "";
  return name.replace(/^[ក-អ]\.\s*/, "").trim();
}

/** Unified dotted line for all fields - matches the authentic official document */
function DotLine({
  value,
  className = "",
  placeholder,
}: {
  value?: string | number | null;
  className?: string;
  placeholder?: string;
}) {
  const text =
    value !== undefined && value !== null && String(value).trim() !== ""
      ? String(value).trim()
      : "";

  return (
    <span
      className={cn(
        "inline-flex items-baseline justify-center border-b-[1.5px] border-dotted border-black/80 px-1 min-h-[22px]",
        className,
      )}
    >
      {text ? (
        <span className="font-semibold text-black whitespace-nowrap leading-tight text-center truncate">
          {text}
        </span>
      ) : (
        <span className="inline-block w-full select-none opacity-0 text-[10px] pointer-events-none">
          &nbsp;
        </span>
      )}
    </span>
  );
}

/** Parses address string into Cambodian administrative components using lookahead regex */
function parseKhmerAddress(address: string | undefined | null) {
  if (!address) {
    return {
      house: "",
      street: "",
      village: "",
      sangkat: "",
      khan: "",
      city: "",
    };
  }
  const clean = address.trim();

  const houseMatch = clean.match(
    /(?:ផ្ទះលេខ|ផ្ទះ|№)\s*:?\s*(.*?)(?=\s*(?:ផ្លូវ|វិថី|ភូមិ|ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const streetMatch = clean.match(
    /(?:ផ្លូវលេខ|ផ្លូវ|វិថី)\s*:?\s*(.*?)(?=\s*(?:ភូមិ|ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const villageMatch = clean.match(
    /ភូមិ\s*:?\s*(.*?)(?=\s*(?:ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const sangkatMatch = clean.match(
    /(?:សង្កាត់|ឃុំ)\s*:?\s*(.*?)(?=\s*(?:ស្រុក|ខណ្ឌ|ក្រុង|រាជធានី|ខេត្ត)|$|,)/i,
  );
  const khanMatch = clean.match(
    /(?:ខណ្ឌ|ស្រុក|ក្រុង)\s*:?\s*(.*?)(?=\s*(?:រាជធានី|ខេត្ត)|$|,)/i,
  );
  const cityMatch = clean.match(/(?:រាជធានី|ខេត្ត)\s*:?\s*(.*?)(?=$|,)/i);

  return {
    house: houseMatch ? houseMatch[1].trim() : "",
    street: streetMatch ? streetMatch[1].trim() : "",
    village: villageMatch ? villageMatch[1].trim() : "",
    sangkat: sangkatMatch ? sangkatMatch[1].trim() : "",
    khan: khanMatch ? khanMatch[1].trim() : "",
    city:
      cityMatch && cityMatch[1].trim()
        ? cityMatch[1].trim()
        : clean.includes("ភ្នំពេញ")
          ? "ភ្នំពេញ"
          : "",
  };
}

/** Splits date into Day, Month, Year */
function parseDateParts(dateStr: string | undefined | null) {
  if (!dateStr) return { day: "", month: "", year: "" };
  const clean = dateStr.trim();
  const parts = clean.split(/[./\-\s]/);
  if (parts.length >= 3) {
    return {
      day: kh(parts[0]),
      month: kh(parts[1]),
      year: kh(parts[2]),
    };
  }
  return { day: "", month: "", year: kh(clean) };
}

/** Extracts age number in Khmer numerals calculated from dob */
function ageNumber(dob?: string): string {
  if (!dob) return "";
  const raw = calculateAgeFromDob(dob);
  if (raw) {
    const digitsOnly = raw.replace(/[^\d០-៩]/g, "").trim();
    if (digitsOnly) return kh(digitsOnly);
  }
  const clean = dob.trim();
  const digits = clean.replace(/[^\d០-៩]/g, "");
  if (digits.length === 4) {
    const y = parseInt(toArabicNum(digits), 10);
    const currY = new Date().getFullYear();
    if (y > 1900 && y <= currY) {
      return kh(currY - y);
    }
  }
  if (digits.length > 0 && digits.length <= 3) {
    return kh(digits);
  }
  return "";
}

function getPartyPersons(party?: SellerParty | BuyerParty) {
  if (!party) {
    return {
      primary: {
        name: "",
        gender: "",
        dob: "",
        pob: "",
        fatherName: "",
        motherName: "",
        address: "",
        idNumber: "",
      },
      spouse: null as PersonData | null,
    };
  }

  const isLegalEntity =
    ("buyer_type" in party && party.buyer_type === "LEGAL_ENTITY") ||
    ("seller_type" in party && party.seller_type === "LEGAL_ENTITY");

  if (isLegalEntity) {
    const le = party.legal_entity;
    return {
      primary: {
        name: le.entity_name,
        gender: "",
        dob: le.representative_dob,
        pob: le.representative_pob,
        fatherName: le.representative_father,
        motherName: le.representative_mother,
        address: le.head_office_address,
        idNumber: le.charter_number,
      },
      spouse: null,
    };
  }

  if (
    party.marital_status === "MARRIED" &&
    (party.husband.full_name || party.wife.full_name)
  ) {
    const h = party.husband;
    const w = party.wife;
    const primary = h.full_name ? h : w;
    const spouse = h.full_name && w.full_name ? w : null;
    return {
      primary: {
        name: primary.full_name,
        gender: primary.gender || (primary === h ? "ប្រុស" : "ស្រី"),
        dob: primary.dob,
        pob: primary.pob,
        fatherName: primary.father_name,
        motherName: primary.mother_name,
        address:
          primary.current_address ||
          (primary === h ? w.current_address : h.current_address),
        idNumber: primary.id_card_number,
      },
      spouse: spouse
        ? {
            full_name: spouse.full_name,
            gender: spouse.gender || "ស្រី",
            dob: spouse.dob,
            pob: spouse.pob,
            father_name: spouse.father_name,
            mother_name: spouse.mother_name,
            current_address: spouse.current_address,
            id_card_number: spouse.id_card_number,
            nationality: spouse.nationality || "ខ្មែរ",
          }
        : null,
    };
  }

  const p = party.person.full_name
    ? party.person
    : party.husband.full_name
      ? party.husband
      : party.wife;
  return {
    primary: {
      name: p.full_name,
      gender: p.gender || "",
      dob: p.dob,
      pob: p.pob,
      fatherName: p.father_name,
      motherName: p.mother_name,
      address: p.current_address,
      idNumber: p.id_card_number,
    },
    spouse: p.spouse_name
      ? {
          full_name: p.spouse_name,
          gender: "",
          dob: "",
          pob: "",
          father_name: "",
          mother_name: "",
          current_address: "",
          id_card_number: "",
          nationality: "ខ្មែរ",
        }
      : null,
  };
}

export type PrintPageFilter = "all" | 1 | 2 | "annexBuyers" | "annexSellers";

interface TransferPrintProps {
  data: TransferApplication;
  pageFilter?: PrintPageFilter;
}

/* ═════════════════════════ Official Transfer Application Print ═════════════════════════ */

export function TransferApplicationPrint({
  data,
  pageFilter = "all",
}: TransferPrintProps) {
  // First Party = Buyer (បុគ្គលមានសិទ្ធិចុះបញ្ជី)
  const { primary: primaryBuyer, spouse: buyerSpouse } = getPartyPersons(
    data.buyers[0],
  );
  // Second Party = Seller (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី)
  const { primary: primarySeller, spouse: sellerSpouse } = getPartyPersons(
    data.sellers[0],
  );

  const buyerAddr = parseKhmerAddress(primaryBuyer.address);
  const sellerAddr = parseKhmerAddress(primarySeller.address);

  // Fallback to parcel address if seller doesn't have house/street
  if (!sellerAddr.street && data.parcel_and_property.streetNo) {
    sellerAddr.street = data.parcel_and_property.streetNo;
  }
  if (!sellerAddr.village && data.parcel_and_property.village) {
    sellerAddr.village = data.parcel_and_property.village;
  }
  if (!sellerAddr.sangkat && data.parcel_and_property.sangkat) {
    sellerAddr.sangkat = data.parcel_and_property.sangkat;
  }
  if (!sellerAddr.khan && data.parcel_and_property.khan) {
    sellerAddr.khan = data.parcel_and_property.khan;
  }
  if (!sellerAddr.city && data.parcel_and_property.city) {
    sellerAddr.city = data.parcel_and_property.city;
  }

  const appCity =
    data.parcel_and_property.city ||
    sellerAddr.city ||
    buyerAddr.city ||
    "រាជធានីភ្នំពេញ";

  // Transfer Date
  const transferDateStr = data.causeDate || data.date || "20.05.2025";
  const transferDate = parseDateParts(transferDateStr);

  const lunar = data.date ? dateStringToKhmerLunar(data.date) : null;
  const lunarLine = lunar?.officialLunarLine || lunar?.formatted || "";

  const hasMultipleBuyers = data.buyers.length > 1;
  const hasMultipleSellers = data.sellers.length > 1;

  const showP1 = pageFilter === "all" || pageFilter === 1;
  const showP2 = pageFilter === "all" || pageFilter === 2;
  const showAnnexBuyers =
    (pageFilter === "all" && hasMultipleBuyers) || pageFilter === "annexBuyers";
  const showAnnexSellers =
    (pageFilter === "all" && hasMultipleSellers) ||
    pageFilter === "annexSellers";

  // Causes check
  const isSale = data.cause === "sale";
  const isGift = data.cause === "gift";
  const isExchange = data.cause === "exchange";
  const isSuccession = data.cause === "succession";
  const isInheritanceSplit = data.cause === "inheritanceSplit";
  const isBequest = data.cause === "bequest";
  const isJudgment = data.cause === "judgment";
  const isCoSplit = data.cause === "coSplit";
  const isRenounce = data.cause === "renounce";
  const isOther =
    data.cause === "other" ||
    (!isSale &&
      !isGift &&
      !isExchange &&
      !isSuccession &&
      !isInheritanceSplit &&
      !isBequest &&
      !isJudgment &&
      !isCoSplit &&
      !isRenounce);

  // Purposes check
  const isPurposeWhole = data.purpose === "whole";
  const isPurposePart = data.purpose === "part";
  const isPurposeCoWhole = data.purpose === "coWhole";
  const isPurposeCoPart = data.purpose === "coPart";

  return (
    <section
      id="printable-document"
      className="printable-area space-y-6 print:space-y-0"
    >
      {/* ═════════════════════════════════════════════════════════════════════════
          PAGE 1 (A4 FORMATTED) - Exact Match to Original Document Photo
          ═════════════════════════════════════════════════════════════════════════ */}
      {showP1 && (
        <A4Page
          mode="fixed"
          className="bg-white text-black font-battambang text-[16px] leading-[1.85] flex flex-col justify-between pt-3 pb-3 px-8 print:shadow-none shadow-md mb-8 print:mb-0 print:border-none"
        >
          <div className="space-y-2.5">
            {/* Header: Kingdom of Cambodia + Right Department */}
            <div className="relative text-center pt-1">
              <h1 className="font-moul text-[16px] tracking-wide text-black">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h1>
              <h2 className="font-moul text-[14px] tracking-wide text-black mt-1">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </h2>

              <div className="my-1 flex items-center justify-center">
                <img
                  src="/symbol-3.png"
                  alt="symbol"
                  className="h-6 w-auto object-contain"
                />
              </div>

              {/* Department on Top-Right */}
              <div className="absolute right-0 bottom-0 text-right">
                {appCity.includes("ភ្នំពេញ") ? (
                  <img
                    src="/mtpp.png"
                    alt="មន្ទីរ ដ.ន.ស.ស រាជធានីភ្នំពេញ"
                    className="h-8 w-auto object-contain inline-block"
                  />
                ) : (
                  <span className="font-moul text-[14px] text-blue-900 tracking-wide whitespace-nowrap block">
                    មន្ទីរ ដ.ន.ស.ស {appCity}
                  </span>
                )}
              </div>
            </div>

            {/* Document Main Title */}
            <div className="pt-2 pb-1 text-center">
              <h2 className="font-moul text-[16px] text-black tracking-wide">
                ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
              </h2>
            </div>

            {/* 7-Line Applicant Paragraph (Exact match to original page 1) */}
            <div className="w-full space-y-1 text-[16px] leading-[1.85] font-battambang text-black">
              {/* Line 1: Buyer (បុគ្គលមានសិទ្ធិចុះបញ្ជី) */}
              <div className="flex items-baseline w-full">
                <span className="w-10 shrink-0 inline-block" />
                <span className="shrink-0">ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ</span>
                <DotLine
                  value={cleanPersonName(primaryBuyer.name) || null}
                  className="flex-1 mx-1.5"
                />
                <span className="shrink-0 ml-1">ភេទ</span>
                <DotLine
                  value={primaryBuyer.gender || null}
                  className="w-16 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">អាយុ</span>
                <DotLine
                  value={ageNumber(primaryBuyer.dob)}
                  className="w-14 mx-1 text-center"
                />
                <span className="shrink-0 ml-0.5 text-[16px]">
                  ឆ្នាំ
                  <sup className="text-[11px] font-normal leading-none">
                    (១)
                  </sup>
                </span>
                <span className="shrink-0 ml-2">អាសយដ្ឋានបច្ចុប្បន្ន</span>
              </div>

              {/* Line 2 */}
              <div className="flex items-baseline w-full">
                <span className="shrink-0">នៅផ្ទះលេខ</span>
                <DotLine
                  value={buyerAddr.house ? kh(buyerAddr.house) : null}
                  className="w-20 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ផ្លូវលេខ</span>
                <DotLine
                  value={buyerAddr.street ? kh(buyerAddr.street) : null}
                  className="w-20 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ភូមិ</span>
                <DotLine
                  value={buyerAddr.village ? kh(buyerAddr.village) : null}
                  className="w-24 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ឃុំ/សង្កាត់</span>
                <DotLine
                  value={buyerAddr.sangkat || null}
                  className="flex-1 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ក្រុង/ស្រុក/ខណ្ឌ</span>
              </div>

              {/* Line 3 */}
              <div className="flex items-baseline w-full">
                <DotLine
                  value={buyerAddr.khan || null}
                  className="flex-1 mr-1.5 text-center"
                />
                <span className="shrink-0">រាជធានី/ខេត្ត</span>
                <DotLine
                  value={
                    buyerAddr.city ||
                    (primaryBuyer.address?.includes("ភ្នំពេញ")
                      ? "ភ្នំពេញ"
                      : null) ||
                    appCity
                  }
                  className="flex-1 mx-1.5 text-center"
                />
                <span className="shrink-0 ml-1">ប្តី/ប្រពន្ធឈ្មោះ</span>
                <DotLine
                  value={cleanPersonName(buyerSpouse?.full_name) || null}
                  className="flex-1 ml-1.5 text-center"
                />
              </div>

              {/* Line 4: Seller Intro (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី) */}
              <div className="flex items-baseline w-full">
                <span className="shrink-0 font-semibold text-black">
                  (បុគ្គលមានសិទ្ធិចុះបញ្ជី)
                </span>
                <span className="shrink-0 ml-1.5">និង ឈ្មោះ</span>
                <DotLine
                  value={cleanPersonName(primarySeller.name) || null}
                  className="flex-1 mx-1.5"
                />
                <span className="shrink-0 ml-1">ភេទ</span>
                <DotLine
                  value={primarySeller.gender || null}
                  className="w-16 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">អាយុ</span>
                <DotLine
                  value={ageNumber(primarySeller.dob)}
                  className="w-14 mx-1 text-center"
                />
                <span className="shrink-0 ml-0.5 text-[16px]">ឆ្នាំ</span>
              </div>

              {/* Line 5 */}
              <div className="flex items-baseline w-full">
                <span className="shrink-0 font-semibold text-black">
                  <sup className="text-[11px] font-normal leading-none">
                    (២)
                  </sup>
                </span>
                <span className="w-8 shrink-0 inline-block" />
                <span className="shrink-0">អាសយដ្ឋានបច្ចុប្បន្នផ្ទះលេខ</span>
                <DotLine
                  value={sellerAddr.house ? kh(sellerAddr.house) : null}
                  className="w-20 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ផ្លូវលេខ</span>
                <DotLine
                  value={sellerAddr.street ? kh(sellerAddr.street) : null}
                  className="w-20 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ភូមិ</span>
                <DotLine
                  value={sellerAddr.village ? kh(sellerAddr.village) : null}
                  className="flex-1 mx-1 text-center"
                />
                <span className="shrink-0 ml-1">ឃុំ/</span>
              </div>

              {/* Line 6 */}
              <div className="flex items-baseline w-full">
                <span className="shrink-0">សង្កាត់</span>
                <DotLine
                  value={sellerAddr.sangkat || null}
                  className="flex-1 mx-1.5 text-center"
                />
                <span className="shrink-0 ml-1">ក្រុង/ស្រុក/ខណ្ឌ</span>
                <DotLine
                  value={sellerAddr.khan || null}
                  className="flex-1 mx-1.5 text-center"
                />
                <span className="shrink-0 ml-1">រាជធានី/ខេត្ត</span>
                <DotLine
                  value={
                    sellerAddr.city ||
                    (primarySeller.address?.includes("ភ្នំពេញ")
                      ? "ភ្នំពេញ"
                      : null) ||
                    appCity
                  }
                  className="flex-1 mx-1.5 text-center"
                />
                <span className="shrink-0 ml-1">ប្តី/ប្រពន្ធ</span>
              </div>

              {/* Line 7 */}
              <div className="flex items-baseline w-full">
                <span className="shrink-0">ឈ្មោះ</span>
                <DotLine
                  value={cleanPersonName(sellerSpouse?.full_name) || null}
                  className="w-72 mx-2 text-center"
                />
                <span className="shrink-0 font-semibold text-black">
                  (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី)។
                </span>
              </div>
            </div>

            {/* Salutation */}
            <div className="pt-2 text-center leading-relaxed font-moul">
              <h3 className="text-[14px] text-black underline">សូមគោរពជូន</h3>
              <p className="text-[14px] text-black mt-1">
                លោកប្រធានមន្ទីររៀបចំដែនដី នគរូបនីយកម្ម សំណង់ និងសុរិយោដី{" "}
                {appCity}
              </p>
            </div>

            {/* Subject & Reference */}
            <div className="pt-1 space-y-1 text-[16px] leading-[1.8] font-battambang">
              <div className="flex items-start gap-1">
                <span className="font-moul shrink-0 w-24 underline text-[14px]">
                  កម្មវត្ថុ
                </span>
                <div className="flex-1">
                  <span>: សំណើសុំចុះបញ្ជីអំពីការផ្ទេរ</span>
                  <DotLine
                    value={
                      data.purpose
                        ? isPurposeWhole
                          ? "កម្មសិទ្ធិទាំងមូល"
                          : isPurposePart
                            ? "កម្មសិទ្ធិមួយផ្នែក"
                            : isPurposeCoWhole
                              ? "ចំណែកកម្មសិទ្ធិអវិភាគទាំងមូល"
                              : "ចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែក"
                        : null
                    }
                    className="flex-1 mx-1.5 font-semibold text-black"
                  />
                  <span className="text-[16px] text-black/80">
                    (កម្មសិទ្ធិទាំងមូល ឬកម្មសិទ្ធិមួយផ្នែក
                    ឬចំណែកកម្មសិទ្ធិអវិភាគទាំងមូល
                    ឬចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែក)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-1">
                <span className="font-moul shrink-0 w-24 underline text-[14px]">
                  យោង
                </span>
                <div className="flex-1 flex items-baseline">
                  <span className="shrink-0">: មូលហេតុ និងកាលបរិច្ឆេទ</span>
                  <DotLine
                    value={
                      data.cause
                        ? `${
                            isSale
                              ? "កិច្ចសន្យាលក់ទិញ"
                              : isGift
                                ? "ប្រទានកម្ម"
                                : isExchange
                                  ? "ការដូរ"
                                  : isSuccession
                                    ? "សន្តតិកម្ម"
                                    : isInheritanceSplit
                                      ? "ការបែងចែកមត៌ក"
                                      : isBequest
                                        ? "អច្ច័យទាន"
                                        : isJudgment
                                          ? "សាលក្រម/សាលដីកា"
                                          : isCoSplit
                                            ? "ការបែងចែកកម្មសិទ្ធិអវិភាគ"
                                            : isRenounce
                                              ? "ការលះបង់ចំណែកកម្មសិទ្ធិអវិភាគ"
                                              : data.causeOther || "ផ្សេងៗ"
                          }${data.causeDate ? ` ចុះថ្ងៃទី ${data.causeDate}` : ""}`
                        : null
                    }
                    className="flex-1 ml-1.5 font-semibold text-black"
                  />
                </div>
              </div>
            </div>

            {/* Intro Sentence */}
            <div className="pt-1 text-[16px] font-battambang">
              <p className="indent-8 font-medium">
                តាមកម្មវត្ថុ និងយោងខាងលើ
                យើងខ្ញុំសូមស្នើសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិដូចខាងក្រោម ៖
              </p>
            </div>

            {/* Section ក: គោលបំណងនៃការចុះបញ្ជី */}
            <div className="text-[16px] leading-relaxed font-battambang">
              <h4 className="text-black">ក- គោលបំណងនៃការចុះបញ្ជី ៖</h4>
              <div className="ml-6 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-4 text-center">
                    {isPurposeWhole ? "✓" : "–"}
                  </span>
                  <span>ការផ្ទេរកម្មសិទ្ធិទាំងមូល ឬ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-4 text-center">
                    {isPurposePart ? "✓" : "–"}
                  </span>
                  <span>ការផ្ទេរកម្មសិទ្ធិមួយផ្នែក</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isPurposeCoWhole ? "✓" : "–"}
                  </span>
                  <span>
                    ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគទាំងមូលរបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ
                  </span>
                  <DotLine
                    value={data.coOwnerName || null}
                    className="w-48 text-center"
                  />
                  <span>នៃលេខ</span>
                  <DotLine
                    value={data.coOwnerNo || null}
                    className="w-32 text-center"
                  />
                  <span>ឬ</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isPurposeCoPart ? "✓" : "–"}
                  </span>
                  <span>
                    ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែករបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ
                  </span>
                  <DotLine
                    value={data.coOwnerName || null}
                    className="w-48 text-center"
                  />
                  <span>នៃលេខ</span>
                  <DotLine
                    value={data.coOwnerNo || null}
                    className="w-32 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Section ខ: មូលហេតុ (First 3 on page 1) */}
            <div className="text-[16px] leading-relaxed font-battambang">
              <h4 className="text-black">ខ- មូលហេតុ ៖</h4>
              <div className="ml-6 space-y-0.5">
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isSale ? "✓" : "–"}
                  </span>
                  <span>ការលក់ទិញ ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isSale ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isSale ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isSale ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isGift ? "✓" : "–"}
                  </span>
                  <span>ប្រទានកម្ម ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isGift ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isGift ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isGift ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isExchange ? "✓" : "–"}
                  </span>
                  <span>ការដូរ ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isExchange ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isExchange ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isExchange ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footnotes at Bottom of Page 1 (Exact match to Photo 1) */}
          <div className="mt-2 pt-1 text-[12px] leading-[1.45] text-neutral-800 space-y-1 border-t border-black/70 font-battambang">
            <div className="flex items-start gap-1">
              <span className="shrink-0 font-bold">
                – <sup>(៣)</sup>
              </span>
              <span>
                ក្នុងករណីពាក្យសុំចុះបញ្ជីដាក់នៅរដ្ឋបាលសុរិយោដី ក្រុង/ស្រុក/ខណ្ឌ
                ត្រូវសរសេរបន្ថែមថា ៖ "តាមរយៈ លោកប្រធានការិយាល័យរៀបចំដែនដី
                នគរូបនីយកម្ម សំណង់ និងភូមិបាល
                ក្រុង/ស្រុក/ខណ្ឌ...................................................."
              </span>
            </div>
            <div className="flex items-start gap-1">
              <span className="shrink-0 font-bold underline">ចំណាំ៖</span>
              <span className="text-justify">
                សូមជម្រាបថា
                ដើម្បីជៀសវាងការយឺតយ៉ាវក្នុងការទទួលបាននូវលំដាប់អាទិភាពដោយសារហេតុ
                ម្ចាស់សិទ្ធិអាចដាក់ពាក្យសុំចុះបញ្ជីទៅរដ្ឋបាលសុរិយោដីរាជធានី/ខេត្ត
                ដោយផ្ទាល់តែម្តងក៏បានដែរ ( សូមមើលប្រការ ៥ ដល់ប្រការ ៨
                នៃប្រកាសអន្តរក្រសួងស្តីពីនីតិវិធីនៃការចុះបញ្ជីនៃសិទ្ធិប្រត្យក្សទាក់ទងនឹងក្រមរដ្ឋប្បវេណីលេខ
                ៣០ កយដនស-ប្រក/១៣ ចុះថ្ងៃទី ២៩ ខែមករា ឆ្នាំ២០១៣)។
              </span>
            </div>
          </div>
        </A4Page>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          PAGE 2 (A4 FORMATTED) - Exact Match to Original Document Photo
          ═════════════════════════════════════════════════════════════════════════ */}
      {showP2 && (
        <A4Page
          mode="fixed"
          className="bg-white text-black font-battambang text-[16px] leading-[1.85] flex flex-col justify-between pt-4 pb-4 px-8 print:shadow-none shadow-md mb-8 print:mb-0 print:border-none"
        >
          <div className="space-y-3 font-battambang text-[16px]">
            {/* Continuation of Section ខ from Page 1 (Exact match to Photo 2) */}
            <div className="text-[16px] leading-relaxed">
              <div className="ml-6 space-y-0.5">
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isSuccession ? "✓" : "–"}
                  </span>
                  <span>សន្តតិកម្ម ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isSuccession ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isSuccession ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isSuccession ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isInheritanceSplit ? "✓" : "–"}
                  </span>
                  <span>ការបែងចែកមរតកតាមការព្រមព្រៀង ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isInheritanceSplit ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isInheritanceSplit ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isInheritanceSplit ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isBequest ? "✓" : "–"}
                  </span>
                  <span>អច្ច័យទាន ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isBequest ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isBequest ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isBequest ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isJudgment ? "✓" : "–"}
                  </span>
                  <span>សាលក្រម ឬសាលដីកាស្ថាពរ ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isJudgment ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isJudgment ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isJudgment ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isCoSplit ? "✓" : "–"}
                  </span>
                  <span>ការបែងចែកកម្មសិទ្ធិអវិភាគ ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isCoSplit ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isCoSplit ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isCoSplit ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isRenounce ? "✓" : "–"}
                  </span>
                  <span>
                    ការបោះបង់ចំណែករបស់ម្ចាស់កម្មសិទ្ធិអវិភាគ ចុះថ្ងៃទី
                  </span>
                  <DotLine
                    value={isRenounce ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isRenounce ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isRenounce ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>ឬ</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="font-bold w-4 text-center">
                    {isOther ? "✓" : "–"}
                  </span>
                  <span>មូលហេតុផ្សេងទៀត</span>
                  <DotLine
                    value={data.causeOther || null}
                    className="w-48 text-center"
                  />
                  <span>ចុះថ្ងៃទី</span>
                  <DotLine
                    value={isOther ? transferDate.day : null}
                    className="w-14 text-center"
                  />
                  <span>ខែ</span>
                  <DotLine
                    value={isOther ? transferDate.month : null}
                    className="w-16 text-center"
                  />
                  <span>ឆ្នាំ</span>
                  <DotLine
                    value={isOther ? transferDate.year : null}
                    className="w-20 text-center"
                  />
                  <span>។</span>
                </div>
              </div>
            </div>

            {/* Section គ: ព័ត៌មានបុគ្គល (Exact match to Photo 2) */}
            <div className="text-[16px] leading-[1.75]">
              <h4 className="text-black mb-1">គ- បុគ្គលមានសិទ្ធិចុះបញ្ជី</h4>

              {/* Buyer / Transferee (បុគ្គលមានសិទ្ធិចុះបញ្ជី) */}
              <div className="ml-6 space-y-1">
                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">ឈ្មោះ</span>
                  <DotLine
                    value={cleanPersonName(primaryBuyer.name) || null}
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">
                    ថ្ងៃ ខែ ឆ្នាំកំណើត និងទីកន្លែងកំណើត
                  </span>
                  <DotLine
                    value={
                      primaryBuyer.dob
                        ? `${kh(primaryBuyer.dob)}${primaryBuyer.pob ? ` នៅ ${primaryBuyer.pob}` : ""}`
                        : null
                    }
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">ឈ្មោះឪពុក</span>
                  <DotLine
                    value={primaryBuyer.fatherName || null}
                    className="flex-1 ml-1 mr-3"
                  />
                  <span className="shrink-0">ឈ្មោះម្តាយ</span>
                  <DotLine
                    value={primaryBuyer.motherName || null}
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">អាសយដ្ឋាន</span>
                  <DotLine
                    value={primaryBuyer.address || null}
                    className="flex-1 ml-1"
                  />
                </div>
              </div>

              {/* Seller / Transferor (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី) */}
              <h4 className=" text-black mt-3 mb-1">
                – បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី
              </h4>

              <div className="ml-6 space-y-1">
                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">ឈ្មោះ</span>
                  <DotLine
                    value={cleanPersonName(primarySeller.name) || null}
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">
                    ថ្ងៃ ខែ ឆ្នាំកំណើត និងទីកន្លែងកំណើត
                  </span>
                  <DotLine
                    value={
                      primarySeller.dob
                        ? `${kh(primarySeller.dob)}${primarySeller.pob ? ` នៅ ${primarySeller.pob}` : ""}`
                        : null
                    }
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">ឈ្មោះឪពុក</span>
                  <DotLine
                    value={primarySeller.fatherName || null}
                    className="flex-1 ml-1 mr-3"
                  />
                  <span className="shrink-0">ឈ្មោះម្តាយ</span>
                  <DotLine
                    value={primarySeller.motherName || null}
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">អាសយដ្ឋាន</span>
                  <DotLine
                    value={primarySeller.address || null}
                    className="flex-1 ml-1"
                  />
                </div>
              </div>
            </div>

            {/* Section ឃ: ចំណុចផ្សេងៗទៀតដែលត្រូវចុះបញ្ជី (Exact match to Photo 2) */}
            <div className="text-[16px] leading-[1.9]">
              <h4 className=" text-black mb-1">
                ឃ- ចំណុចផ្សេងៗទៀតដែលត្រូវចុះបញ្ជី
              </h4>
              <div className="ml-6 space-y-1">
                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">
                    ចំណែករបស់អ្នកសុំសិទ្ធិអវិភាគថ្មី
                    (ប្រសិនបើជាកម្មសិទ្ធិអវិភាគ)
                  </span>
                  <DotLine
                    value={data.newCoOwnerShare || null}
                    className="flex-1 ml-1"
                  />
                </div>
              </div>
            </div>

            {/* Section ង: អត្តសញ្ញាណ នៃអចលនវត្ថុ (Exact match to Photo 2) */}
            <div className="text-[16px] leading-[1.9]">
              <h4 className="text-black mb-1">ង- អត្តសញ្ញាណ នៃអចលនវត្ថុ</h4>
              <div className="ml-6 space-y-1">
                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">ទីតាំងដី</span>
                  <DotLine
                    value={data.parcel_and_property.location || null}
                    className="flex-1 ml-1"
                  />
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold mr-2">–</span>
                  <span className="shrink-0">លេខក្បាលដី ឬលេខប័ណ្ណ</span>
                  <DotLine
                    value={
                      data.parcel_and_property.parcel_number
                        ? kh(data.parcel_and_property.parcel_number)
                        : null
                    }
                    className="flex-1 ml-1"
                  />
                </div>
              </div>
            </div>

            {/* Closing Request (Exact match to Photo 2) */}
            <div className="pt-2 text-[16px] text-justify leading-relaxed indent-8 font-battambang">
              អាស្រ័យហេតុនេះ សូមលោក
              <span className="font-moul text-[14px]">ប្រធានមន្ទីរ</span>{" "}
              មេត្តាពិនិត្យ និងសម្រេចអនុញ្ញាតឱ្យចុះបញ្ជីតាមសំណើខាងលើដោយអនុគ្រោះ។
            </div>

            {/* Signatures and Date (Exact match to Photo 2 - Clean layout, no dashed boxes) */}
            <div className="pt-4 grid grid-cols-2 gap-4 text-center font-battambang">
              {/* Left: Buyer / Transferee */}
              <div>
                <p className="font-semibold text-black text-[15px]">
                  អ្នកមានសិទ្ធិចុះបញ្ជី ឬតំណាង
                </p>
                <p className="italic text-neutral-600 text-[13px] mt-0.5">
                  (ស្នាមមេដៃស្តាំ)
                </p>

                {/* Clean open space for physical thumbprint */}
                <div className="h-16 flex items-center justify-center" />

                <div className="font-semibold text-black text-[16px]">
                  {cleanPersonName(primaryBuyer.name) || ""}
                  {buyerSpouse?.full_name &&
                    ` និង ${cleanPersonName(buyerSpouse.full_name)}`}
                </div>
              </div>

              {/* Right: Seller / Transferor + Official Dates */}
              <div>
                {lunarLine ? (
                  <p className="italic text-neutral-800 text-[13px]">
                    {lunarLine}
                  </p>
                ) : (
                  <p className="text-neutral-700 text-[13px]">
                    ថ្ងៃ {transferDate.day || "............."} ខែ{" "}
                    {transferDate.month || "............."} ឆ្នាំ{" "}
                    {transferDate.year || "................"} ព.ស ២៥.......
                  </p>
                )}
                <p className="text-black font-medium text-[14px] mt-0.5">
                  {appCity} ថ្ងៃទី {transferDate.day || "........."} ខែ{" "}
                  {transferDate.month || "..........."} ឆ្នាំ២០
                  {transferDate.year ? transferDate.year.slice(-2) : "......."}
                </p>

                <p className="font-semibold text-black text-[15px] mt-1.5">
                  អ្នកមានកាតព្វកិច្ចចុះបញ្ជី ឬតំណាង
                </p>
                <p className="italic text-neutral-600 text-[13px] mt-0.5">
                  (ស្នាមមេដៃស្តាំ)
                </p>

                {/* Clean open space for physical thumbprint */}
                <div className="h-16 flex items-center justify-center" />

                <div className="font-semibold text-black text-[16px]">
                  {cleanPersonName(primarySeller.name) || ""}
                  {sellerSpouse?.full_name &&
                    ` និង ${cleanPersonName(sellerSpouse.full_name)}`}
                </div>
              </div>
            </div>

            {/* Bottom Enclosures (Exact match to Photo 2) */}
            <div className="pt-2 text-[14px] font-battambang flex items-baseline">
              <span className="shrink-0 font-medium">ឯកសារភ្ជាប់ ៖</span>
              <DotLine
                value={data.attachments || null}
                className="flex-1 ml-1"
              />
            </div>
          </div>
        </A4Page>
      )}

      {/* ══════════════ BUYER ANNEX PAGE (When > 1 Buyers) ══════════════ */}
      {showAnnexBuyers && (
        <A4Page
          mode="fixed"
          className="bg-white text-black print:shadow-none shadow-md mb-8 print:mb-0 print:border-none"
        >
          <div className="justify-between text-[14px] pt-3 pb-3 px-6 h-full flex flex-col font-battambang">
            <div className="space-y-2">
              <div className="text-center space-y-1">
                <span className="text-[13px] block text-neutral-600">
                  ឧបសម្ព័ន្ធភ្ជាប់ជាមួយពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
                </span>
                <h2 className="font-moul text-[16px] text-black">
                  តារាងបញ្ជីឈ្មោះភាគីទទួល (បុគ្គលមានសិទ្ធិចុះបញ្ជី)
                </h2>
                <p className="text-[14px] text-neutral-700">
                  ក្បាលដីលេខ ៖{" "}
                  <strong>
                    {data.parcel_and_property.parcel_number || "—"}
                  </strong>{" "}
                  | ទីតាំង ៖ {data.parcel_and_property.location || "—"}
                </p>
              </div>

              {/* 6-Column Official Annex Table */}
              <div className="border border-black overflow-hidden mt-2">
                <table className="w-full text-left border-collapse text-[13px] font-battambang">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-center font-semibold">
                      <th className="border-r border-black p-1 w-8">ល.រ</th>
                      <th className="border-r border-black p-1 w-32">
                        ឈ្មោះ / ភេទ / អាយុ
                      </th>
                      <th className="border-r border-black p-1 w-36">
                        ថ្ងៃខែកំណើត / ទីកន្លែងកំណើត
                      </th>
                      <th className="border-r border-black p-1 w-36">
                        ឪពុក / ម្តាយ / ប្តីប្រពន្ធ
                      </th>
                      <th className="border-r border-black p-1">
                        អាសយដ្ឋានបច្ចុប្បន្ន
                      </th>
                      <th className="p-1 w-20 text-center">ស្នាមមេដៃ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.buyers.map((b, idx) => {
                      const { primary: p, spouse } = getPartyPersons(b);
                      return (
                        <tr
                          key={idx}
                          className="h-[20mm] max-h-[20mm] border-b border-black last:border-b-0 leading-tight"
                        >
                          <td className="border-r border-black p-1 text-center font-bold align-middle">
                            {kh(idx + 1)}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div className="font-bold text-[14px]">
                              {cleanPersonName(p.name) || "—"}
                            </div>
                            <div className="text-neutral-700">
                              {p.gender && `ភេទ ៖ ${p.gender}`}{" "}
                              {p.dob && `(${ageNumber(p.dob)} ឆ្នាំ)`}
                            </div>
                            {p.idNumber && (
                              <div className="text-[11px] text-neutral-600">
                                អត្ត. ៖ {p.idNumber}
                              </div>
                            )}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div>{p.dob ? `កើត ៖ ${p.dob}` : "—"}</div>
                            <div className="text-[11px] text-neutral-700 truncate max-w-[135px]">
                              {p.pob || ""}
                            </div>
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5 text-[12px]">
                            <div>ឪ. {p.fatherName || "—"}</div>
                            <div>ម្ត. {p.motherName || "—"}</div>
                            <div>
                              ប្តី/ប្រពន្ធ ៖{" "}
                              {cleanPersonName(spouse?.full_name) || "—"}
                            </div>
                          </td>
                          <td className="border-r border-black p-1 align-top text-[12px]">
                            {p.address || "—"}
                          </td>
                          <td className="p-1 text-center align-middle">
                            <div className="w-14 h-14 mx-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-end pt-2 text-[12px] border-t border-black/40 font-battambang">
              <span className="italic text-neutral-600">
                បញ្ជាក់ ៖
                តារាងឧបសម្ព័ន្ធនេះជាផ្នែកមួយមិនអាចខ្វះបាននៃពាក្យសុំចុះបញ្ជីផ្ទេរកម្មសិទ្ធិខាងលើ។
              </span>
              <span>
                {appCity}, ថ្ងៃទី {data.date ? kh(data.date) : "........"}
              </span>
            </div>
          </div>
        </A4Page>
      )}

      {/* ══════════════ SELLER ANNEX PAGE (When > 1 Sellers) ══════════════ */}
      {showAnnexSellers && (
        <A4Page
          mode="fixed"
          className="bg-white text-black print:shadow-none shadow-md mb-8 print:mb-0 print:border-none"
        >
          <div className="justify-between text-[14px] pt-3 pb-3 px-6 h-full flex flex-col font-battambang">
            <div className="space-y-2">
              <div className="text-center space-y-1">
                <span className="text-[13px] block text-neutral-600">
                  ឧបសម្ព័ន្ធភ្ជាប់ជាមួយពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ
                </span>
                <h2 className="font-moul text-[16px] text-black">
                  តារាងបញ្ជីឈ្មោះភាគីប្រគល់ (បុគ្គលមានកាតព្វកិច្ចចុះបញ្ជី)
                </h2>
                <p className="text-[14px] text-neutral-700">
                  ក្បាលដីលេខ ៖{" "}
                  <strong>
                    {data.parcel_and_property.parcel_number || "—"}
                  </strong>{" "}
                  | ទីតាំង ៖ {data.parcel_and_property.location || "—"}
                </p>
              </div>

              {/* 6-Column Official Annex Table */}
              <div className="border border-black overflow-hidden mt-2">
                <table className="w-full text-left border-collapse text-[13px] font-battambang">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-center font-semibold">
                      <th className="border-r border-black p-1 w-8">ល.រ</th>
                      <th className="border-r border-black p-1 w-32">
                        ឈ្មោះ / ភេទ / អាយុ
                      </th>
                      <th className="border-r border-black p-1 w-36">
                        ថ្ងៃខែកំណើត / ទីកន្លែងកំណើត
                      </th>
                      <th className="border-r border-black p-1 w-36">
                        ឪពុក / ម្តាយ / ប្តីប្រពន្ធ
                      </th>
                      <th className="border-r border-black p-1">
                        អាសយដ្ឋានបច្ចុប្បន្ន
                      </th>
                      <th className="p-1 w-20 text-center">ស្នាមមេដៃ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sellers.map((s, idx) => {
                      const { primary: p, spouse } = getPartyPersons(s);
                      return (
                        <tr
                          key={idx}
                          className="h-[20mm] max-h-[20mm] border-b border-black last:border-b-0 leading-tight"
                        >
                          <td className="border-r border-black p-1 text-center font-bold align-middle">
                            {kh(idx + 1)}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div className="font-bold text-[14px]">
                              {cleanPersonName(p.name) || "—"}
                            </div>
                            <div className="text-neutral-700">
                              {p.gender && `ភេទ ៖ ${p.gender}`}{" "}
                              {p.dob && `(${ageNumber(p.dob)} ឆ្នាំ)`}
                            </div>
                            {p.idNumber && (
                              <div className="text-[11px] text-neutral-600">
                                អត្ត. ៖ {p.idNumber}
                              </div>
                            )}
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5">
                            <div>{p.dob ? `កើត ៖ ${p.dob}` : "—"}</div>
                            <div className="text-[11px] text-neutral-700 truncate max-w-[135px]">
                              {p.pob || ""}
                            </div>
                          </td>
                          <td className="border-r border-black p-1 align-top space-y-0.5 text-[12px]">
                            <div>ឪ. {p.fatherName || "—"}</div>
                            <div>ម្ត. {p.motherName || "—"}</div>
                            <div>
                              ប្តី/ប្រពន្ធ ៖{" "}
                              {cleanPersonName(spouse?.full_name) || "—"}
                            </div>
                          </td>
                          <td className="border-r border-black p-1 align-top text-[12px]">
                            {p.address || "—"}
                          </td>
                          <td className="p-1 text-center align-middle">
                            <div className="w-14 h-14 mx-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-end pt-2 text-[12px] border-t border-black/40 font-battambang">
              <span className="italic text-neutral-600">
                បញ្ជាក់ ៖
                តារាងឧបសម្ព័ន្ធនេះជាផ្នែកមួយមិនអាចខ្វះបាននៃពាក្យសុំចុះបញ្ជីផ្ទេរកម្មសិទ្ធិខាងលើ។
              </span>
              <span>
                {appCity}, ថ្ងៃទី {data.date ? kh(data.date) : "........"}
              </span>
            </div>
          </div>
        </A4Page>
      )}
    </section>
  );
}
