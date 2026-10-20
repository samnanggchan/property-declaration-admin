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

/* ═══════════════════════════════════════════════════════════════════════
 *  EDIT THIS SECTION BY HAND
 * ═══════════════════════════════════════════════════════════════════════ */

const FORM = {
  /** "ក្រដាសលេខ ៥" in the top-right box */
  paperNo: "៥",
  /** logo in the top-right box (file in /public) */
  logo: "/mtpp.png",
  logoAlt: "មន្ទីរ ដ.ន.ស.ស រាជធានីភ្នំពេញ",
  /** how many children fit on page 1; the rest continue on page 2 */
  pageOneChildren: 7,
};

/** Footnotes printed at the bottom of each page – fix the wording here if needed. */
const FOOTNOTES_PAGE_1 = [
  "១- នាមត្រកូល និងនាមខ្លួននៃអ្នកដែលស្លាប់ឥតមានសំបុត្របណ្តាំ។",
  "២- បើមានប្តី ឬប្រពន្ធដើមនៅរស់ ឲ្យដាក់ឈ្មោះ អាយុ ទីលំនៅផង បើគ្មានឲ្យធ្វូតចោល ឯប្រពន្ធចុងមិនចុះឈ្មោះទេ ឲ្យចុះឈ្មោះកូន បើមាន។",
  "៣- មានកូនប្រុសប៉ុន្មានឲ្យចុះឈ្មោះឲ្យគ្រប់ នៅរស់ ឬស្លាប់ ទោះកើតពីប្រពន្ធទី១ ឬទី២ក្តី។",
];
const ARTICLE_LINE = "(មាត្រា.............................ក្រមរដ្ឋប្បវេណី)";

const FOOTNOTES_PAGE_2 = [
  "១- នាមត្រកូល និងនាមខ្លួនអ្នកដែលស្លាប់។",
  "២- នាមត្រកូល និងនាមខ្លួនអ្នកដែលបញ្ជាក់។",
  "៣- សង្កាត់ ថ្ងៃ ខែ និងឆ្នាំលេខបញ្ជាក់។",
  "(មាត្រា.............................ក្រមរដ្ឋប្បវេណី)"
];

/* ═══════════════════════════════════════════════════════════════════════
 *  helpers
 * ═══════════════════════════════════════════════════════════════════════ */

/** one printed line: labels never shrink, dotted blanks share the rest */
const ROW = "flex min-h-[8mm] items-baseline gap-x-1.5 whitespace-nowrap";

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

/** Free-text address → ឃុំ/សង្កាត់, ក្រុង/ស្រុក/ខណ្ឌ, រាជធានី/ខេត្ត */
function splitAddress(address: string) {
  const a = (address || "").trim();
  if (!a) return { commune: "", district: "", city: "" };
  const pick = (re: RegExp, prefix: RegExp) => {
    const m = a.match(re);
    return m ? m[0].replace(prefix, "").trim() : "";
  };
  const commune = pick(/(សង្កាត់|ឃុំ)[^\s,]+/, /^(សង្កាត់|ឃុំ)/);
  const district = pick(/(ខណ្ឌ|ស្រុក|ក្រុង)[^\s,]+/, /^(ខណ្ឌ|ស្រុក|ក្រុង)/);
  const city = pick(/(រាជធានី|ខេត្ត)[^\s,]+/, /^(រាជធានី|ខេត្ត)/);
  // nothing recognised → keep the whole text in the first blank
  if (!commune && !district && !city)
    return { commune: a, district: "", city: "" };
  return { commune, district, city };
}

function Ornament() {
  return (
    <svg
      viewBox="0 0 120 12"
      className="mx-auto my-1.5 h-[4.5mm] w-[46mm] text-neutral-800"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${i * 20 + 2} 6 c3 -7 8 -7 8 -1 c0 4 -5 4 -4 0 M${i * 20 + 10} 6 c3 4 6 4 9 0`}
        />
      ))}
    </svg>
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

function Footnotes({ notes, article }: { notes: string[]; article?: string }) {
  return (
    <div className="mt-auto pt-3">
      <div className="mb-1 w-[165mm] border-t border-neutral-900" />
      <div className="space-y-0.5 text-[8.5pt] leading-snug text-neutral-800">
        {notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
        {article && <p className="pt-0.5 text-center text-[9pt]">{article}</p>}
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

/* ═══════════════════════════════════════════════════════════════════════
 *  the two printed pages
 * ═══════════════════════════════════════════════════════════════════════ */

export function InheritanceRequestPrint({
  data,
}: {
  data: InheritanceRequest;
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

  // lunar + gregorian date of signing (from the editor's date field)
  const lunar: KhmerLunarDate | null = React.useMemo(() => {
    if (!data.date) return null;
    try {
      return dateStringToKhmerLunar(data.date);
    } catch {
      return null;
    }
  }, [data.date]);

  const sign = parseDateParts(data.date);

  return (
    <div className="flex flex-col gap-6 print:block">
      {/* ═══════════════════════════ PAGE 1 ═══════════════════════════ */}
      <A4Page className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950">
        {/* header: storage number + logo box */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-0.5 pt-1">
            <div className={ROW}>
              <L className="font-moul text-[10.5pt]">តំកល់ទុក</L>
              <L className="font-moul text-[10.5pt] underline underline-offset-4">
                លេខ
              </L>
              <D v={kh(data.refNo)} grow={1} />
            </div>
            <div className={ROW}>
              <L>អ្នកតែងលិខិត</L>
              <D grow={1} />
            </div>
            {(data.location || data.area) && (
              <p className="pt-1 text-[9pt] leading-snug text-neutral-700">
                {data.location && <>ទីតាំង៖ {data.location}</>}
                {data.location && data.area && " · "}
                {data.area && <>ទំហំ៖ {kh(data.area)}</>}
              </p>
            )}
          </div>

          <div className="w-[58mm] shrink-0 border-b border-l border-neutral-800 pb-1 pl-2 text-[9.5pt] leading-tight">
            <p>ក្រដាសលេខ {FORM.paperNo}</p>
            <p>លេខទីទុកឯកសារ</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FORM.logo}
              alt={FORM.logoAlt}
              className="mt-1 h-9 w-auto object-contain"
            />
          </div>
        </div>

        {/* title + deceased */}
        <div className="mt-4">
          <div className={ROW}>
            <L className="font-moul text-[11pt]">
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

          <p className="my-1.5 text-center font-moul text-[10pt] font-normal">
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

        {/* surviving spouse (left to fill by hand) */}
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
              <D grow={2.4} />
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

        <Footnotes notes={FOOTNOTES_PAGE_1} article={ARTICLE_LINE} />
      </A4Page>

      {/* ═══════════════════════════ PAGE 2 ═══════════════════════════ */}
      <A4Page className="flex flex-col font-battambang text-[10.5pt] leading-[1.5] text-neutral-950">
        {/* children – continued */}
        <div>
          {p2Children.map((c, i) => (
            <ChildBlock key={i} child={c} first={false} />
          ))}
        </div>

        {/* witnesses */}
        <div className="mt-5">
          <div className={ROW}>
            <L>យើងជាសាក្សីឈ្មោះ (២)</L>
            <D v={w1.name} grow={3} />
            <L>អាយុ</L>
            <D v={ageNumber(w1.dob)} grow={0.8} />
            <L>ឆ្នាំ ទីលំនៅឃុំ/សង្កាត់</L>
            <D v={w1Addr.commune} grow={2.4} />
          </div>
          <div className={ROW}>
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
            <D v={w2Addr.city} grow={2} />
          </div>
          <div className={ROW}>
            <L>បានពិនិត្យបញ្ជាក់ថា សំបុត្រដំណរវង្សត្រកូលនៃខ្មោចឈ្មោះ (១)</L>
            <D v={deceasedNames} grow={1} />
          </div>
          <div className={ROW}>
            <L>ដែលអនិច្ចកម្មឥតមានសំបុត្របណ្ដាំ។</L>
          </div>
        </div>

        {/* commune chief */}
        <div className="mt-4">
          <div className={ROW}>
            <L className="pl-[10mm]">យើង (២)</L>
            <D grow={2.5} />
            <L>ចៅសង្កាត់</L>
            <D grow={2} />
            <L>បានពិនិត្យបញ្ជាក់</L>
          </div>
          <div className={ROW}>
            <L>សំបុត្រនេះដែលមានសាក្សី ២នាក់ ដូចមានឈ្មោះខាងលើនេះបានបញ្ជាក់ហើយ</L>
          </div>
          <div className={ROW}>
            <L>យើងឃើញពិតត្រឹមត្រូវប្រាកដមែន តាមបញ្ជីរាយឈ្មោះ ដែលឈ្មោះ (២)</L>
            <D v={a1.name} grow={2} />
            <L>អាយុ</L>
            <D v={ageNumber(a1.dob)} grow={0.6} />
            <L>ឆ្នាំ</L>
          </div>
          <div className={ROW}>
            <L>ប្រពន្ធ ឈ្មោះ</L>
            <D v={a2.name} grow={2.5} />
            <L>នៅសង្កាត់</L>
            <D v={a1Addr.commune} grow={2} />
            <L>យកមកប្តឹងយើង។</L>
          </div>
        </div>

        {/* date */}
        <div className="ml-auto mt-4 w-[125mm]">
          <div className={ROW}>
            <L>ថ្ងៃ</L>
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
            <div className="mt-1 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="font-moul text-[9.5pt] font-normal">អ្នកប្តឹង</p>
                {data.applicants.map((a, i) => (
                  <p key={i} className="mt-10 font-semibold">
                    {a.name || "\u00A0"}
                  </p>
                ))}
              </div>
              <div>
                <p className="font-moul text-[9.5pt] font-normal">សាក្សី</p>
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
            <p className="mt-1">ហត្ថលេខា និងត្រាចៅសង្កាត់ដែលបញ្ជាក់</p>
          </div>
        </div>

        <Footnotes notes={FOOTNOTES_PAGE_2} />
      </A4Page>
    </div>
  );
}
