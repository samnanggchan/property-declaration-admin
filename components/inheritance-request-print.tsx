"use client";

import * as React from "react";
import { A4Page } from "@/components/a4-page";
import { KHMER_GREGORIAN_MONTHS } from "@/components/cis-date-fill";
import { cn, calculateAgeFromDob, toKhmerNum } from "@/lib/utils";
import {
  dateStringToKhmerLunar,
  KhmerLunarDate,
} from "@/lib/khmer-lunar-calendar";
import {
  Child,
  InheritanceRequest,
  parseDateParts,
  toKhmerDigits as kh,
} from "@/lib/inheritance-request-types";

const FORM = {
  /** "ក្រដាសលេខ ៥" in the top-right box */
  paperNo: "៥",
  /** logo in the top-right box (file in /public) */
  logo: "/mtpp.png",
  logoAlt: "មន្ទីរ ដ.ន.ស.ស រាជធានីភ្នំពេញ",
  /** how many children fit on page 1; the rest continue on page 2 */
  pageOneChildren: 8,
};

/** Footnotes printed at the bottom of each page */
const FOOTNOTES_PAGE_1 = [
  "១- នាមត្រកូល និងនាមខ្លួននៃអ្នកដែលស្លាប់ឥតមានសំបុត្របណ្តាំ។",
  "២- បើមានប្តី ឬប្រពន្ធដើមនៅរស់ ឲ្យដាក់ឈ្មោះ អាយុ ទីលំនៅផង បើគ្មានឲ្យធ្វូតចោល ឯប្រពន្ធចុងមិនចុះឈ្មោះទេ ឲ្យចុះឈ្មោះកូន បើមាន។",
  "៣- មានកូនប្រុសប៉ុន្មានឲ្យចុះឈ្មោះឲ្យគ្រប់ នៅរស់ ឬស្លាប់ ទោះកើតពីប្រពន្ធទី១ ឬទី២ក្តី។",
];

const FOOTNOTES_PAGE_2 = [
  "១- នាមត្រកូល និងនាមខ្លួនអ្នកដែលស្លាប់។",
  "២- នាមត្រកូល និងនាមខ្លួនអ្នកដែលបញ្ជាក់។",
  "៣- សង្កាត់ ថ្ងៃ ខែ និងឆ្នាំលេខបញ្ជាក់។",
];

const ROW = "flex h-[7.4mm] items-baseline gap-x-1.5 whitespace-nowrap";

/** printed label */
function L({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("shrink-0", className)}>{children}</span>;
}

/** dotted blank. `grow` = share of the free width on the line. */
function D({ v, grow = 1 }: { v?: string; grow?: number }) {
  return (
    <span
      className="min-w-0 border-b-[1.2px] border-dotted border-neutral-700 px-0.5 text-center font-semibold text-neutral-950"
      style={{ flex: `${grow} 1 0%` }}
    >
      {v || "\u00A0"}
    </span>
  );
}

/** "43 ឆ្នាំ" → "៤៣" */
function ageNumber(dob: string) {
  if (!dob?.trim()) return "";
  const a = calculateAgeFromDob(dob);
  if (!a || a === "—") return "";
  return kh(
    String(a)
      .replace(/\s*ឆ្នាំ\s*$/, "")
      .trim(),
  );
}

/** "08.10.2026" → day / Khmer month name / year (in Khmer digits) */
function dateParts(value: string) {
  const p = parseDateParts(value);
  const m = Number(p.month);
  return {
    day: kh(p.day),
    month: m >= 1 && m <= 12 ? KHMER_GREGORIAN_MONTHS[m] : kh(p.month),
    year: kh(p.year),
  };
}

/** Free-text address → ភូមិ, ឃុំ/សង្កាត់, ក្រុង/ស្រុក/ខណ្ឌ, រាជធានី/ខេត្ត */
function splitAddress(address: string) {
  const a = (address || "").trim();
  if (!a) return { village: "", commune: "", district: "", city: "" };
  const pick = (re: RegExp, prefix: RegExp) => {
    const m = a.match(re);
    return m ? m[0].replace(prefix, "").trim() : "";
  };
  const village = pick(/(ភូមិ)[^\s,]+/, /^(ភូមិ)/);
  const commune = pick(/(សង្កាត់|ឃុំ)[^\s,]+/, /^(សង្កាត់|ឃុំ)/);
  const district = pick(/(ខណ្ឌ|ស្រុក|ក្រុង)[^\s,]+/, /^(ខណ្ឌ|ស្រុក|ក្រុង)/);
  const city = pick(/(រាជធានី|ខេត្ត)[^\s,]+/, /^(រាជធានី|ខេត្ត)/);
  if (!village && !commune && !district && !city)
    return { village: "", commune: a, district: "", city: "" };
  return { village, commune, district, city };
}

function Ornament() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/symbol-rs.png"
      alt="symbol"
      className="mx-auto my-1.5 h-[8mm] w-auto object-contain"
    />
  );
}

function Brace({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 40"
      className={cn("text-neutral-800", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      preserveAspectRatio="none"
    >
      <path d="M10 1 C4 1 5 8 5 14 C5 18 3 19 0 20 C3 21 5 22 5 26 C5 32 4 39 10 39" />
    </svg>
  );
}

/** Pinned to the bottom margin of the sheet */
function Footnotes({
  notes,
  withArticle,
}: {
  notes: string[];
  withArticle?: boolean;
}) {
  return (
    <div className="absolute bottom-[var(--paper-pad-bottom)] left-[var(--paper-pad-x)] right-[var(--paper-pad-x)]">
      <div className="border-t border-neutral-900" />
      <div className="mt-1 space-y-0.5 text-[9pt] leading-[1.45] text-neutral-900">
        {notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
        {withArticle && (
          <p className="flex items-baseline justify-center gap-1 pt-1">
            <span>(មាត្រា</span>
            <span className="inline-block w-[45mm] border-b-[1.2px] border-dotted border-neutral-700">
              &nbsp;
            </span>
            <span>ក្រមរដ្ឋប្បវេណី)</span>
          </p>
        )}
      </div>
    </div>
  );
}

/** two printed lines per child */
function ChildBlock({ child, first }: { child: Child; first: boolean }) {
  const label =
    child.gender === "ប្រុស"
      ? "កូនប្រុស"
      : child.gender === "ស្រី"
        ? "កូនស្រី"
        : first
          ? "កូនប្រុស-ស្រី"
          : "";
  const cert = dateParts(child.birthCertDate);

  return (
    <div>
      <div className={ROW}>
        <L className="w-[24mm]">{label}</L>
        <L>ឈ្មោះ</L>
        <D v={child.name} grow={3} />
        <L>អាយុ</L>
        <D v={ageNumber(child.dob)} grow={0.8} />
        <L>ឆ្នាំ</L>
        {child.note && <L className="font-semibold">({child.note})</L>}
        <L>ដូចមានសំបុត្រកំណើត លេខ</L>
        <D v={kh(child.birthCertNo)} grow={1.6} />
      </div>
      <div className={cn(ROW, "pl-[20mm]")}>
        <L>ចុះថ្ងៃ</L>
        <D v={cert.day} grow={0.8} />
        <L>ខែ</L>
        <D v={cert.month} grow={1.1} />
        <L>ឆ្នាំ</L>
        <D v={cert.year} grow={1} />
        <L>នៅឃុំ/សង្កាត់</L>
        <D v={child.commune} grow={2} />
        <L>ក្រុង/ស្រុក/ខណ្ឌ</L>
        <D v={child.district} grow={2} />
      </div>
    </div>
  );
}

export function InheritanceRequestPrint({
  data,
  pageFilter = "all",
}: {
  data: InheritanceRequest;
  pageFilter?: "all" | 1 | 2 | 3 | 4 | 5;
}) {
  const [d1, d2] = [data.deceased[0], data.deceased[1]];
  const [a1, a2] = [data.applicants[0], data.applicants[1]];
  const [w1, w2] = [data.witnesses[0], data.witnesses[1]];

  const deceasedNames = data.deceased
    .map((d) => d.name.trim())
    .filter(Boolean)
    .join(" និង ");

  const p1Children = data.children.slice(0, FORM.pageOneChildren);
  const p2Children = data.children.slice(FORM.pageOneChildren);

  const w1Addr = splitAddress(w1.address);
  const w2Addr = splitAddress(w2.address);
  const a1Addr = splitAddress(a1.address);

  // Address and property fallbacks
  const loc = splitAddress(data.location);
  const village = data.village || loc.village || "";
  const sangkat = data.sangkat || data.deceasedSangkat || loc.commune || "";
  const khan = data.khan || loc.district || "";
  const titleDeedNo = data.titleDeedNo || data.refNo || "";
  const authPerson = data.authorizedPerson || a1.name || "";
  const authRelDeceased = data.authorizedRelationDeceased || "ប្រពន្ធ";
  const authRelHeirs = data.authorizedRelationHeirs || "ម្ដាយ";

  // lunar + gregorian date of signing
  const lunar: KhmerLunarDate | null = React.useMemo(() => {
    if (!data.date) return null;
    try {
      return dateStringToKhmerLunar(data.date);
    } catch {
      return null;
    }
  }, [data.date]);

  const sign = parseDateParts(data.date);

  // Deceased date parts
  const d1DeathParts = parseDateParts(d1.deathDate);
  const d2DeathParts = parseDateParts(d2.deathDate);
  const d1CertParts = parseDateParts(d1.deathCertDate);
  const d2CertParts = parseDateParts(d2.deathCertDate);

  const showP1 = pageFilter === "all" || pageFilter === 1;
  const showP2 = pageFilter === "all" || pageFilter === 2;
  const showP3 = pageFilter === "all" || pageFilter === 3;
  const showP4 = pageFilter === "all" || pageFilter === 4;
  const showP5 = pageFilter === "all" || pageFilter === 5;

  return (
    <div className="flex flex-col gap-6 print:block print:p-0 print:m-0 print:gap-0">
      {/* ═══════════════════════════ PAGE 1 ═══════════════════════════ */}
      {showP1 && (
        <A4Page
          mode="fixed"
          className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950"
        >
          {/* header: storage line centred on the page, logo box on the right */}
          <div className="relative h-[28mm]">
            <div className="absolute inset-x-0 top-[1mm] flex justify-center">
              <div className={cn(ROW, "w-[68mm]")}>
                <L className="font-moul text-[10.5pt]">តំកល់ទុក</L>
                <L className="font-moul text-[10.5pt] underline underline-offset-4">
                  លេខ
                </L>
                <D v={kh(data.refNo)} grow={1} />
              </div>
            </div>

            <div className="absolute left-0 top-[10mm] w-[68mm]">
              <div className={ROW}>
                <L>អ្នកតែងលិខិត</L>
                <D grow={1} />
              </div>
            </div>
            {(data.location || data.area) && (
              <p className="absolute left-0 top-[19mm] w-[118mm] text-[9pt] leading-snug text-neutral-700">
                {data.location && <>ទីតាំង៖ {data.location}</>}
                {data.location && data.area && " · "}
                {data.area && <>ទំហំ៖ {kh(data.area)}</>}
              </p>
            )}

            <div className="absolute right-0 top-0 w-[54mm] border-b border-l border-neutral-800 pb-1 pl-2 text-[9.5pt] leading-tight">
              <p>ក្រដាសលេខ {FORM.paperNo}</p>
              <p>លេខទីទុកឯកសារ</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FORM.logo}
                alt={FORM.logoAlt}
                className="mt-1 h-9 w-auto max-w-full object-contain"
              />
            </div>
          </div>

          {/* title + deceased */}
          <div className="mt-2">
            <div className={ROW}>
              <L className="pl-[18mm] font-battambang font-bold text-[12pt]">
                សំបុត្រដំណរវង្សត្រកូលនៃខ្មោច (១)
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>កើតនៅឆ្នាំ</L>
              <D v={kh(d1.birthYear)} grow={1} />
              <L>និងឆ្នាំ</L>
              <D v={kh(d2.birthYear)} grow={1} />
              <L>ស្លាប់នៅថ្ងៃ</L>
              <D v={kh(d1.deathDate)} grow={1.5} />
              <L>និងថ្ងៃ</L>
              <D v={kh(d2.deathDate)} grow={1.5} />
              <L>តាមសំបុត្រ</L>
            </div>
            <div className={ROW}>
              <L>មរណៈភាពលេខ</L>
              <D v={kh(d1.deathCertNo)} grow={1} />
              <L>និងលេខ</L>
              <D v={kh(d2.deathCertNo)} grow={1} />
              <L>ចុះថ្ងៃ</L>
              <D v={kh(d1.deathCertDate)} grow={1.5} />
              <L>និងថ្ងៃ</L>
              <D v={kh(d2.deathCertDate)} grow={1.5} />
              <L>នៅសង្កាត់</L>
              <D v={data.deceasedSangkat} grow={1.5} />
            </div>

            <p className="my-1.5 text-center font-battambang text-[12pt] font-bold">
              ដែលអនិច្ចកម្មឥតមានសំបុត្របណ្ដាំ ហើយមានសាច់លោហិតតមក
            </p>

            <div className={ROW}>
              <L>ធ្វើជារណបនៃសំបុត្រកិច្ចសញ្ញា</L>
              <D grow={2} />
              <L>លេខ</L>
              <D grow={1} />
              <L>ចុះថ្ងៃទី</L>
              <D grow={1.4} />
            </div>
          </div>

          <Ornament />

          {/* surviving spouse */}
          <div className="flex items-stretch gap-1.5">
            <div className="w-[34mm] shrink-0 self-center text-center leading-tight">
              <p>ប្ដីពោះម៉ាយ (២)</p>
              <p>ឬ</p>
              <p>ប្រពន្ធមេម៉ាយ (១)</p>
            </div>
            <Brace className="h-[17mm] w-[4mm] shrink-0 self-center" />
            <div className="min-w-0 flex-1">
              <div className={ROW}>
                <L>ឈ្មោះ</L>
                <D grow={3} />
                <L>អាយុ</L>
                <D grow={1} />
                <L>ឆ្នាំ ជាប្ដី ឬប្រពន្ធដើមនៃខ្មោចឈ្មោះ</L>
              </div>
              <div className={ROW}>
                <D grow={2} />
                <L>ដូចមានសំបុត្រអាពាហ៍ពិពាហ៍លេខ</L>
                <D grow={2} />
              </div>
            </div>
          </div>
          <div className={ROW}>
            <L>ចុះថ្ងៃ</L>
            <D grow={0.8} />
            <L>ខែ</L>
            <D grow={1.1} />
            <L>ឆ្នាំ</L>
            <D grow={1} />
            <L>នៅឃុំ/សង្កាត់</L>
            <D grow={2} />
            <L>ក្រុង/ស្រុក/ខណ្ឌ</L>
            <D grow={2} />
            <L>រាជធានី/ខេត្ត</L>
            <D grow={1.6} />
          </div>

          {/* parents of the children */}
          <div className={cn(ROW, "mt-1 pl-[18mm]")}>
            <L>ជាឪពុក ឬម្ដាយបង្កើតនៃឈ្មោះដូចខាងក្រោមនេះ និងឈ្មោះ (១)</L>
            <D v={deceasedNames} grow={1} />
          </div>

          {/* children – first part */}
          <div className="mt-0.5">
            {p1Children.map((c, i) => (
              <ChildBlock key={i} child={c} first={i === 0} />
            ))}
          </div>

          <Footnotes notes={FOOTNOTES_PAGE_1} withArticle />
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 2 ═══════════════════════════ */}
      {showP2 && (
        <A4Page
          mode="fixed"
          className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950"
        >
          {/* children – continued */}
          <div>
            {p2Children.map((c, i) => (
              <ChildBlock key={i} child={c} first={false} />
            ))}
          </div>

          {/* witnesses */}
          <div className="mt-5">
            <div className={cn(ROW, "mt-1 pl-[18mm]")}>
              <L>យើងជាកសិណសាក្សីឈ្មោះ (២)</L>
              <D v={w1.name} grow={3} />
              <L>អាយុ</L>
              <D v={ageNumber(w1.dob)} grow={0.8} />
              <L>ឆ្នាំ ទីលំនៅឃុំ/សង្កាត់</L>
            </div>
            <div className={ROW}>
              <D v={w1Addr.commune} grow={2.4} />
              <L>ក្រុង/ស្រុក/ខណ្ឌ</L>
              <D v={w1Addr.district} grow={2} />
              <L>រាជធានី/ខេត្ត</L>
              <D v={w1Addr.city} grow={2} />
              <L>និងឈ្មោះ</L>
              <D v={w2.name} grow={3} />
            </div>
            <div className={ROW}>
              <L>អាយុ</L>
              <D v={ageNumber(w2.dob)} grow={0.8} />
              <L>ឆ្នាំ ទីលំនៅឃុំ/សង្កាត់</L>
              <D v={w2Addr.commune} grow={2} />
              <L>ក្រុង/ស្រុក/ខណ្ឌ</L>
              <D v={w2Addr.district} grow={2} />
              <L>រាជធានី/ខេត្ត</L>
            </div>
            <div className={ROW}>
              <D v={w2Addr.city} grow={2} />
              <L>បានពិនិត្យបញ្ជាក់ថា សំបុត្រដំណរវង្សត្រកូលនៃខ្មោចឈ្មោះ (១)</L>
              <D v={deceasedNames} grow={2} />
            </div>
            <div className={ROW}>
              <L>ដែលអនិច្ចកម្មឥតមានសំបុត្របណ្ដាំ។</L>
            </div>
          </div>

          {/* commune chief */}
          <div className="mt-4">
            <div className={ROW}>
              <L className="pl-[18mm]">យើង (២)</L>
              <D grow={2.5} />
              <L>ចៅសង្កាត់</L>
              <D grow={2} />
              <L>បានពិនិត្យ</L>
            </div>
            <div className={ROW} style={{ letterSpacing: "1.4px" }}>
              <L>
                បញ្ជាក់នូវសំបុត្រនេះដែលមានសាក្សី ២នាក់
                ដូចមានឈ្មោះខាងលើនេះបានបញ្ជាក់ហើយនោះ ឃើញពិតត្រឹមត្រូវ
              </L>
            </div>
            <div className={ROW}>
              <L>ប្រាកដមែន តាមបញ្ជីរាយឈ្មោះ ដែលឈ្មោះ (២)</L>
              <D v={a1.name} grow={2} />
              <L>អាយុ</L>
              <D v={ageNumber(a1.dob)} grow={0.6} />
              <L>ឆ្នាំប្រពន្ធ</L>
            </div>
            <div className={ROW}>
              <L>ឈ្មោះ</L>
              <D v={a2.name} grow={2.5} />
              <L>នៅសង្កាត់</L>
              <D v={a1Addr.commune} grow={2} />
              <L>យកមកប្តឹងយើង។</L>
            </div>
          </div>

          {/* date */}
          <div className="ml-auto mt-4 w-[125mm]">
            <div className={ROW}>
              <L className="pl-[22mm]">ថ្ងៃ</L>
              <D
                v={
                  lunar
                    ? `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`
                    : ""
                }
                grow={2.2}
              />
              <L>ខែ</L>
              <D v={lunar?.lunarMonthName} grow={1.4} />
              <L>ឆ្នាំ</L>
              <D
                v={lunar ? `${lunar.zodiacYear} ${lunar.sakYear}` : ""}
                grow={2}
              />
              <L>ព.ស.</L>
              <D v={lunar ? toKhmerNum(lunar.buddhistEra) : ""} grow={1} />
            </div>
            <div className={ROW}>
              <L>ធ្វើនៅសង្កាត់ (៣)</L>
              <D grow={2} />
              <L>នៅថ្ងៃទី</L>
              <D v={dateParts(data.date).day} grow={0.8} />
              <L>ខែ</L>
              <D v={dateParts(data.date).month} grow={1.2} />
              <L>ឆ្នាំ</L>
              <D v={sign.year ? kh(sign.year) : ""} grow={1} />
            </div>
          </div>

          {/* signatures */}
          <div className="mt-4 grid grid-cols-[1.15fr_1fr] gap-6 break-inside-avoid">
            <div>
              <p className="text-center">ហត្ថលេខា ឬ ស្នាមមេដៃស្តាំ</p>
              <div className="mt-1 pl-[20mm] grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="font-battambang text-[10.5pt] font-normal">
                    អ្នកប្តឹង
                  </p>
                  {data.applicants.map((a, i) => (
                    <p key={i} className="mt-10 font-semibold">
                      {a.name || "\u00A0"}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-battambang text-[10.5pt] font-normal">
                    កសិណ
                  </p>
                  {data.witnesses.map((w, i) => (
                    <p key={i} className="mt-10 font-semibold">
                      {w.name || "\u00A0"}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className={cn(ROW, "justify-center")}>
                <L>បញ្ជាក់ចុះលេខ</L>
                <D grow={1} />
              </div>
              <p className="pl-[30mm]">ហត្ថលេខា និងត្រាចៅសង្កាត់ដែលបញ្ជាក់</p>
            </div>
          </div>

          <Footnotes notes={FOOTNOTES_PAGE_2} />
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 3 ═══════════════════════════ */}
      {/* សេចក្តីព្រមព្រៀង និងអនុញ្ញាត (Agreement & Authorization of Heirs) */}
      {showP3 && (
        <A4Page
          mode="fixed"
          className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950"
        >
          {/* Header */}
          <div className="relative">
            <div className="absolute right-0 top-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FORM.logo}
                alt={FORM.logoAlt}
                className="h-6 w-auto object-contain"
              />
            </div>

            <div className="text-center pt-1">
              <h2 className="font-moul text-[13pt] text-neutral-900">
                សេចក្តីព្រមព្រៀង និងអនុញ្ញាត
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/symbol-rs.png"
                alt="divider"
                className="mx-auto my-1.5 h-[6mm] w-auto object-contain"
              />
            </div>
          </div>

          {/* Intro lines */}
          <div className="mt-1">
            <div className={ROW}>
              <L className="pl-[8mm]">
                ឱ្យផ្ទេរសិទ្ធិកាន់កាប់នូវមរតករបស់ខ្មោច (ខាង)(១)
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>យើងខ្ញុំទាំងអស់គ្នាជាទាយាទរបស់ខ្មោច (ខាង) (២)</L>
              <D v={deceasedNames} grow={1} />
            </div>
            <p className="text-[9.5pt] text-neutral-800 leading-snug">
              (សរសេរតែឈ្មោះកូនដែលមានអាយុពី១៨ឆ្នាំឡើងទៅ
              ឬកូនដែលបានទទួលអត្ថាធិនភាពហើយ)
            </p>
          </div>

          {/* 8 Heirs List */}
          <div className="mt-1.5 space-y-0.5">
            {Array.from({ length: 8 }, (_, i) => {
              const child = data.children[i];
              const numKh = kh(i + 1);
              return (
                <div key={i} className={ROW}>
                  <L className="w-[18mm]">{numKh}- ឈ្មោះ</L>
                  <D v={child?.name} grow={3.5} />
                  <L>ភេទ</L>
                  <D v={child?.gender} grow={1} />
                  <L>អាយុ</L>
                  <D v={child ? ageNumber(child.dob) : ""} grow={1} />
                  <L>ឆ្នាំ,</L>
                </div>
              );
            })}
          </div>

          {/* Authorization Statement */}
          <div className="mt-2.5">
            <div className={ROW}>
              <L className="pl-[8mm]">
                សូមប្រកាសព្រមព្រៀង និងអនុញ្ញាតឱ្យឈ្មោះ (ខាង)(៣)
              </L>
              <D v={authPerson} grow={1} />
            </div>
            <div className={ROW}>
              <L>ដែលត្រូវជា(៤)</L>
              <D v={authRelDeceased} grow={1.2} />
              <L>នៃខ្មោច និងជា(៥)</L>
              <D v={authRelHeirs} grow={1.2} />
              <L>នៃយើងខ្ញុំទាំងអស់គ្នា បានចាត់ចែង</L>
              <D v="ផ្ទេរសិទ្ធិ" grow={1.5} />
            </div>
            <div className={ROW}>
              <L>អចលនវត្ថុដែលមានក្នុងប័ណ្ណសម្គាល់សិទ្ធិកាន់កាប់អចលនវត្ថុលេខ</L>
              <D v={kh(titleDeedNo)} grow={1} />
            </div>
            <div className={ROW}>
              <L>ទំហំផ្ទៃ</L>
              <D v={kh(data.area)} grow={1.2} />
              <L>ស្ថិតនៅក្នុងភូមិ</L>
              <D v={village} grow={1.5} />
              <L>សង្កាត់</L>
              <D v={sangkat} grow={1.5} />
              <L>ខណ្ឌ</L>
              <D v={khan} grow={1.5} />
            </div>
            <div className={ROW}>
              <L>រាជធានីភ្នំពេញ តាមមរតករបស់ខ្មោច</L>
              <D v={deceasedNames} grow={1} />
              <L>យើងខ្ញុំ។</L>
            </div>
          </div>

          <p className="mt-2 text-center font-medium">
            យើងខ្ញុំទាំងអស់គ្នាសូមផ្តិតមេដៃស្តាំទុកជាភស្តុតាងស្រាប់។
          </p>

          {/* Footnotes & Thumbprint */}
          <div className="mt-2.5 grid grid-cols-2 gap-4">
            <div className="text-[9pt] leading-tight text-neutral-800 space-y-0.5">
              <p>(១)-(២) ចុះឈ្មោះសហព័ទ្ធដែលស្លាប់</p>
              <p>(៣) ចុះឈ្មោះសហព័ទ្ធដែលរស់</p>
              <p>(៤) ប្តី ឬប្រពន្ធ</p>
              <p>(៥) ឪពុក ឬម្តាយ</p>
            </div>
            <div className="text-center">
              <p className="font-medium">ស្នាមមេដៃស្តាំ</p>
            </div>
          </div>

          <div className={cn(ROW, "mt-1")}>
            <L>ឈ្មោះ</L>
            <D grow={1} />
          </div>

          {/* Sangkat Chief statement */}
          <div className="mt-2 text-center text-[10pt] leading-[1.6]">
            <p>ស្នាមមេដៃទាំងនេះបានផ្ដិតនៅចំពោះមុខយើង</p>
            <p>ដែលយើងបានសួរត្រួតសេចក្តីខាងលើនេះយ៉ាងក្បោះក្បាយ</p>
            <p>ហើយអានខ្លាំងៗអោយទាយាទទាំងអស់ស្តាប់មុនពេលផ្តិតមេដៃយល់ព្រម។</p>
            <div className="mt-1.5 flex justify-center">
              <div className="w-[125mm]">
                <div className={ROW}>
                  <L className="pl-[16mm]">ថ្ងៃ</L>
                  <D
                    v={
                      lunar
                        ? `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`
                        : ""
                    }
                    grow={2}
                  />
                  <L>ខែ</L>
                  <D v={lunar?.lunarMonthName} grow={1.3} />
                  <L>ឆ្នាំ</L>
                  <D
                    v={lunar ? `${lunar.zodiacYear} ${lunar.sakYear}` : ""}
                    grow={1.8}
                  />
                  <L>ព.ស.</L>
                  <D v={lunar ? toKhmerNum(lunar.buddhistEra) : ""} grow={1} />
                </div>
                <div className={cn(ROW, "mt-0.5")}>
                  <L className="pl-[22mm]">រាជធានីភ្នំពេញ ថ្ងៃទី</L>
                  <D v={dateParts(data.date).day} grow={0.8} />
                  <L>ខែ</L>
                  <D v={dateParts(data.date).month} grow={1.2} />
                  <L>ឆ្នាំ២០</L>
                  <D
                    v={
                      sign.year ? kh(String(sign.year).replace(/^20/, "")) : ""
                    }
                    grow={0.8}
                  />
                </div>
              </div>
            </div>
            <p className="mt-2 font-moul text-[10.5pt]">ចៅសង្កាត់</p>
            <p className="mt-7 font-semibold">
              {data.communeChiefName || "\u00A0"}
            </p>
          </div>
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 4 ═══════════════════════════ */}
      {/* សំបុត្រអនុញ្ញាតពីក្រុមប្រឹក្សាញាតិ (Family Council Authorization Letter) */}
      {showP4 && (
        <A4Page
          mode="fixed"
          className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950"
        >
          {/* Header */}
          <div className="relative">
            <div className="absolute right-0 top-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FORM.logo}
                alt={FORM.logoAlt}
                className="h-6 w-auto object-contain"
              />
            </div>

            <div className="text-center pt-1">
              <h2 className="font-moul text-[13pt] text-neutral-900">
                សំបុត្រអនុញ្ញាតពីក្រុមប្រឹក្សាញាតិ
              </h2>
            </div>
          </div>

          <div className="mt-1">
            <div className={ROW}>
              <L className="pl-[16mm]">នៃខ្មោច (ខាង)</L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L className="text-[9.5pt]">
                (លិខិតដំណាលរបស់លិខិតសញ្ញាលក់ផ្ដាច់លេខ
              </L>
              <D v={kh(data.letterRefNo)} grow={1.5} />
              <L className="text-[9.5pt]">ចុះថ្ងៃទី</L>
              <D v={kh(data.letterRefDate)} grow={1.2} />
              <L className="text-[9.5pt]">)</L>
            </div>
          </div>

          <p className="mt-1.5 text-center font-moul text-[13pt]">
            យើងខ្ញុំទាំងអស់គ្នា
          </p>

          {/* 8 Council Member rows */}
          <div className="mt-1 space-y-0.5">
            {Array.from({ length: 8 }, (_, i) => {
              const member =
                i < data.witnesses.length ? data.witnesses[i] : null;
              const child =
                !member && i - data.witnesses.length < data.children.length
                  ? data.children[i - data.witnesses.length]
                  : null;

              const name = member ? member.name : child ? child.name : "";
              const gender = child ? child.gender : "";
              const dobYear = member
                ? parseDateParts(member.dob).year
                : child
                  ? parseDateParts(child.dob).year
                  : "";
              const address = member
                ? member.address
                : child
                  ? `${child.commune || ""} ${child.district || ""}`.trim()
                  : "";

              const numKh = kh(i + 1);
              return (
                <div key={i} className={ROW}>
                  <L className="w-[18mm]">{numKh}- ឈ្មោះ</L>
                  <D v={name} grow={3} />
                  <L>ភេទ</L>
                  <D v={gender} grow={0.8} />
                  <L>ឆ្នាំកំណើត</L>
                  <D v={kh(dobYear)} grow={1} />
                  <L>ទីលំនៅ</L>
                  <D v={address} grow={3.5} />
                </div>
              );
            })}
          </div>

          {/* Statement */}
          <div className="mt-2.5">
            <div className={ROW}>
              <L className="pl-[8mm]">
                ជាសាច់សារលោហិត និងជាក្រុមប្រឹក្សាញាតិរបស់ខ្មោច
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>
                ដែលបានស្លាប់ទៅ ដោយឥតមានបណ្ដាំ ហើយបន្សល់ទុកនូវកេរ្តិ៍មរតកជាដី
              </L>
              <D v="លំនៅដ្ឋាន" grow={1.2} />
              <L>ទំហំ</L>
              <D v={kh(data.area)} grow={1} />
            </div>
            <div className={ROW}>
              <L>តាមប័ណ្ណសម្គាល់សិទ្ធិកាន់កាប់អចលនវត្ថុលេខ(២)</L>
              <D v={kh(titleDeedNo)} grow={1.5} />
              <L>ស្ថិតនៅក្បាលដីលេខ</L>
              <D v={kh(data.plotNo)} grow={1} />
              <L>ផ្លូវ</L>
              <D v={kh(data.streetNo)} grow={1} />
            </div>
            <div className={ROW}>
              <L className="pl-[8mm]">ភូមិ</L>
              <D v={village} grow={1.5} />
              <L>សង្កាត់</L>
              <D v={sangkat} grow={1.5} />
              <L>ខណ្ឌ</L>
              <D v={khan} grow={1.5} />
              <L>រាជធានីភ្នំពេញ។</L>
            </div>
            <div className={ROW}>
              <L>ដោយសម្គាល់ឃើញថាឈ្មោះ (ខាង)</L>
              <D v={deceasedNames} grow={1.8} />
              <L>បានព្រមព្រៀងគ្នាយកឈ្មោះ</L>
              <D v={authPerson} grow={1.8} />
            </div>
            <div className={ROW}>
              <L className="pl-[8mm]">
                ដែលនៅរស់មានសិទ្ធិចាត់ចែងនូវមរតករបស់ខ្មោច(ខាង)
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>តាមសេចក្តីត្រូវការក្នុងការដោះស្រាយជីវភាពក្នុងគ្រួសារតទៅ។</L>
            </div>
          </div>

          {/* Date and Thumbprint */}
          <div className="mt-2.5 flex justify-end">
            <div className="w-[110mm] text-center">
              <div className={ROW}>
                <L>ថ្ងៃ</L>
                <D
                  v={
                    lunar
                      ? `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`
                      : ""
                  }
                  grow={1.8}
                />
                <L>ខែ</L>
                <D v={lunar?.lunarMonthName} grow={1.2} />
                <L>ឆ្នាំ</L>
                <D
                  v={lunar ? `${lunar.zodiacYear} ${lunar.sakYear}` : ""}
                  grow={1.5}
                />
                <L>ព.ស២៥</L>
                <D
                  v={
                    lunar
                      ? toKhmerNum(String(lunar.buddhistEra).replace(/^25/, ""))
                      : ""
                  }
                  grow={0.8}
                />
              </div>
              <div className={cn(ROW, "mt-0.5 justify-center")}>
                <L>ធ្វើនៅថ្ងៃទី</L>
                <D v={dateParts(data.date).day} grow={0.8} />
                <L>ខែ</L>
                <D v={dateParts(data.date).month} grow={1.2} />
                <L>ឆ្នាំ២០</L>
                <D
                  v={sign.year ? kh(String(sign.year).replace(/^20/, "")) : ""}
                  grow={0.8}
                />
              </div>
              <p className="mt-2 font-medium">ស្នាមមេដៃស្តាំ</p>
            </div>
          </div>

          {/* Footnotes & verification */}
          <div className="mt-auto grid grid-cols-2 gap-4 pb-2">
            <div className="text-[8.5pt] leading-relaxed text-neutral-800">
              <p className="font-semibold">បញ្ជាក់៖</p>
              <p>(១) បើទ្រព្យBC ឱ្យសរសេរកែ/bនៃទំហំប័ណ្ណសម្គាល់សិទ្ធិ</p>
              <p>
                (២) ចំពោះប័ណ្ណសម្គាល់សិទ្ធិដែលមិនត្រូវកែផ្ទេរសិទ្ធិ
                ពុំឱ្យសរសេរចូលឡើយ
              </p>
              <p>
                (៣) អ្នកដែលនៅរស់ត្រូវជាប្ដីឬប្រពន្ធ ឬកូននៃខ្មោចហើយជាអាណាព្យាបាល
                និងជាមេគ្រួសារនៅ។
              </p>
            </div>

            <div className="text-center text-[9.5pt]">
              <p className="font-medium">បានឃើញ និងបញ្ជាក់ថាត្រឹមត្រូវ</p>
              <div className={ROW}>
                <L>ថ្ងៃ</L>
                <D
                  v={
                    lunar
                      ? `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`
                      : ""
                  }
                  grow={1.8}
                />
                <L>ខែ</L>
                <D v={lunar?.lunarMonthName} grow={1.2} />
                <L>ឆ្នាំ</L>
                <D
                  v={lunar ? `${lunar.zodiacYear} ${lunar.sakYear}` : ""}
                  grow={1.5}
                />
                <L>ព.ស២៥</L>
                <D
                  v={
                    lunar
                      ? toKhmerNum(String(lunar.buddhistEra).replace(/^25/, ""))
                      : ""
                  }
                  grow={0.8}
                />
              </div>
              <div className={cn(ROW, "mt-0.5 justify-center")}>
                <L>ថ្ងៃទី</L>
                <D v={dateParts(data.date).day} grow={0.8} />
                <L>ខែ</L>
                <D v={dateParts(data.date).month} grow={1.2} />
                <L>ឆ្នាំ២០</L>
                <D
                  v={sign.year ? kh(String(sign.year).replace(/^20/, "")) : ""}
                  grow={0.8}
                />
              </div>
              <p className="mt-2 font-moul text-[10pt]">ចៅសង្កាត់</p>
              <p className="mt-7 font-semibold">
                {data.communeChiefName || "\u00A0"}
              </p>
            </div>
          </div>
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 5 ═══════════════════════════ */}
      {/* សំបុត្របញ្ជាក់ទាយាទ (Heir Certification Letter) */}
      {showP5 && (
        <A4Page
          mode="fixed"
          className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950"
        >
          {/* Kingdom Header */}
          <div className="relative">
            <div className="absolute right-0 top-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FORM.logo}
                alt={FORM.logoAlt}
                className="h-6 w-auto object-contain"
              />
            </div>

            <div className="text-center pt-1">
              <h1 className="font-moul text-[13.5pt] tracking-wide text-neutral-900">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h1>
              <h2 className="font-moul text-[11.5pt] tracking-wide text-neutral-900 mt-1">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/symbol-3.png"
                alt="divider"
                className="mx-auto my-1.5 h-[5mm] w-auto object-contain"
              />
            </div>

            <div className="mt-1 w-[65mm] space-y-1 text-[10pt]">
              <p className="font-semibold">រាជធានីភ្នំពេញ</p>
              <div className={ROW}>
                <L>ខណ្ឌ :</L>
                <D v={khan} grow={1} />
              </div>
              <div className={ROW}>
                <L>សង្កាត់ :</L>
                <D v={sangkat} grow={1} />
              </div>
            </div>
          </div>

          <div className="text-center mt-2.5">
            <h3 className="font-moul text-[13.5pt] text-neutral-900">
              សំបុត្របញ្ជាក់ទាយាទ
            </h3>
          </div>

          {/* Commune statement */}
          <div className="mt-2.5">
            <div className={ROW}>
              <L className="pl-[8mm]">យើង</L>
              <D v={data.communeChiefName} grow={2} />
              <L>ចៅសង្កាត់</L>
              <D v={sangkat} grow={1.5} />
              <L>សូមបញ្ជាក់ និងប្រកាស</L>
            </div>
            <div className={ROW}>
              <L>ដល់ អាជ្ញាធរមានសមត្ថកិច្ចថា៖ ខ្មោចឈ្មោះ</L>
              <D v={d1.name} grow={2.5} />
              <L>និងខ្មោចខាង</L>
            </div>
            <div className={ROW}>
              <D v={d2.name} grow={2} />
              <L>កើតឆ្នាំ</L>
              <D v={kh(d1.birthYear)} grow={1} />
              <L>និងឆ្នាំ</L>
              <D v={kh(d2.birthYear)} grow={1} />
              <L>ស្លាប់ថ្ងៃទី</L>
              <D v={kh(d1DeathParts.day || d1.deathDate)} grow={1.2} />
            </div>
            <div className={ROW}>
              <L>ខែ</L>
              <D v={kh(d1DeathParts.month || d2DeathParts.month)} grow={1.2} />
              <L>ឆ្នាំ</L>
              <D v={kh(d1DeathParts.year || d2DeathParts.year)} grow={1.2} />
              <L>នៅសង្កាត់</L>
              <D v={data.deceasedSangkat || sangkat} grow={1.8} />
              <L>និង</L>
            </div>
            <div className={ROW}>
              <L>សង្កាត់</L>
              <D v={data.deceasedSangkat || sangkat} grow={1.8} />
              <L>ដូចមានសំបុត្រមរណភាពលេខ</L>
              <D
                v={[d1.deathCertNo, d2.deathCertNo]
                  .filter(Boolean)
                  .map(kh)
                  .join(" និង ")}
                grow={1.5}
              />
              <L>ចុះថ្ងៃទី</L>
              <D v={kh(d1CertParts.day || d1.deathCertDate)} grow={1.2} />
            </div>
            <div className={ROW}>
              <L>ខែ</L>
              <D v={kh(d1CertParts.month || d2CertParts.month)} grow={1.2} />
              <L>ឆ្នាំ</L>
              <D v={kh(d1CertParts.year || d2CertParts.year)} grow={1.2} />
              <L>។</L>
            </div>
          </div>

          <p className="mt-2 font-semibold text-center">
            ដែលអនិច្ចកម្មឥតមានបណ្ដាំ ហើយបានបន្សល់ទុកទាយាទដូចមានរាយនាមខាងក្រោមនេះ
            ៖
          </p>

          {/* 8 Heirs list */}
          <div className="mt-1.5 space-y-0.5">
            {Array.from({ length: 8 }, (_, i) => {
              const child = data.children[i];
              const numKh = kh(i + 1);
              return (
                <div key={i} className={ROW}>
                  <L className="w-[18mm]">{numKh}- ឈ្មោះ</L>
                  <D v={child?.name} grow={3.5} />
                  <L>ភេទ</L>
                  <D v={child?.gender} grow={1} />
                  <L>អាយុ</L>
                  <D v={child ? ageNumber(child.dob) : ""} grow={1} />
                  <L>ឆ្នាំត្រូវជាកូនទី{numKh}នៃខ្មោច</L>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5">
            <div className={ROW}>
              <L className="pl-[8mm]">
                ដែលជាទាយាទមានសិទ្ធិក្នុងចំណែកមរតកនៃខ្មោចឈ្មោះ
              </L>
              <D v={d1.name} grow={2} />
              <L>និងខ្មោចខាង</L>
            </div>
            <div className={ROW}>
              <D v={d2.name} grow={1} />
              <L>។</L>
            </div>
            <p className="mt-1 text-[10pt]">
              សេចក្តីបញ្ជាក់នេះចេញឱ្យទាយាទប្រើប្រាស់តាមការដែលអាចប្រើបាន។
            </p>
          </div>

          <div className="mt-3 flex justify-end">
            <div className="w-[110mm] text-center">
              <div className={cn(ROW, "justify-center")}>
                <L className="font-moul">លេខ:</L>
                <D v={kh(data.heirCertNo)} grow={1} />
              </div>
              <div className={cn(ROW, "mt-1")}>
                <L>ថ្ងៃ</L>
                <D
                  v={
                    lunar
                      ? `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`
                      : ""
                  }
                  grow={1.8}
                />
                <L>ខែ</L>
                <D v={lunar?.lunarMonthName} grow={1.2} />
                <L>ឆ្នាំ</L>
                <D
                  v={lunar ? `${lunar.zodiacYear} ${lunar.sakYear}` : ""}
                  grow={1.5}
                />
                <L>ព.ស.</L>
                <D v={lunar ? toKhmerNum(lunar.buddhistEra) : ""} grow={1} />
              </div>
              <div className={cn(ROW, "mt-0.5 justify-center")}>
                <L>រាជធានីភ្នំពេញ ថ្ងៃទី</L>
                <D v={dateParts(data.date).day} grow={0.8} />
                <L>ខែ</L>
                <D v={dateParts(data.date).month} grow={1.2} />
                <L>ឆ្នាំ២០</L>
                <D
                  v={sign.year ? kh(String(sign.year).replace(/^20/, "")) : ""}
                  grow={0.8}
                />
              </div>
              <p className="mt-2.5 font-moul text-[11pt]">ចៅសង្កាត់</p>
              <p className="mt-8 font-semibold">
                {data.communeChiefName || "\u00A0"}
              </p>
            </div>
          </div>
        </A4Page>
      )}
    </div>
  );
}
