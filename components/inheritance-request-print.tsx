"use client";

import * as React from "react";
import { A4Page } from "@/components/a4-page";
import { KHMER_GREGORIAN_MONTHS } from "@/components/cis-date-fill";
import { cn, calculateAgeFromDob, toArabicNum, toKhmerNum } from "@/lib/utils";
import {
  dateStringToKhmerLunar,
  KhmerLunarDate,
} from "@/lib/khmer-lunar-calendar";
import {
  Child,
  emptyRelative,
  extractPlotNo,
  InheritanceRequest,
  parseDateParts,
  Relative,
  RELATIVE_SLOTS,
  toKhmerDigits as kh,
} from "@/lib/inheritance-request-types";

const FORM = {
  paperNo: "៥",
  logo: "/mtpp.png",
  logoAlt: "មន្ទីរ ដ.ន.ស.ស រាជធានីភ្នំពេញ",
  ornament: "/symbol-rs.png",
  divider: "/symbol-3.png",
  pageOneChildren: 8,
  minHeirRows: 8,
  adultsOnly: true,
  defaults: {
    relationToDeceased: "ប្រពន្ធ",
    relationToHeirs: "ម្ដាយ",
    action: "ផ្ទេរសិទ្ធិ",
    landKind: "លំនៅដ្ឋាន",
  },
};

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

const NOTES_CONSENT = [
  "(១)-(២) ចុះឈ្មោះសហព័ទ្ធដែលស្លាប់",
  "(៣) ចុះឈ្មោះសហព័ទ្ធដែលរស់",
  "(៤) ប្តី ឬប្រពន្ធ",
  "(៥) ឪពុក ឬម្តាយ",
];

/** page 4 – សំបុត្រអនុញ្ញាតពីក្រុមប្រឹក្សាញាតិ (line 1 is a best guess – check it against the paper form) */
const NOTES_COUNCIL = [
  "(១) បើទ្រព្យBC ឱ្យសរសេរតែ១/២នៃទំហំប័ណ្ណសម្គាល់សិទ្ធិ",
  "(២) ចំពោះប័ណ្ណសម្គាល់សិទ្ធិដែលមិនត្រូវកែផ្ទេរសិទ្ធិ ពុំឱ្យសរសេរចូលឡើយ",
  "(៣) អ្នកដែលនៅរស់ត្រូវជាប្ដីឬប្រពន្ធ ឬកូននៃមតកជនហើយជាអាណាព្យាបាល និងជាមេគ្រួសារនៅ។",
];

/** fields the print needs beyond the base form – optional, so it compiles with or without them */
interface PrintExtras {
  village: string;
  sangkat: string;
  khan: string;
  titleDeedNo: string;
  plotNo: string;
  streetNo: string;
  houseNo?: string;
  authorizedPerson: string;
  authorizedRelationDeceased: string;
  authorizedRelationHeirs: string;
  communeChiefName: string;
  letterRefNo: string;
  letterRefDate: string;
  heirCertNo: string;
  applicantPropertyType?: string;
}

const PAGE =
  "flex flex-col font-battambang text-[16px] leading-[1.5] text-neutral-950";
const ROW = "flex h-[7.4mm] items-baseline gap-x-1.5 whitespace-nowrap";

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
function D({
  v,
  grow = 1,
  className,
}: {
  v?: string;
  grow?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "border-b-[1.2px] border-dotted border-neutral-700 px-0.5 text-center font-semibold text-neutral-950",
        v ? "min-w-fit whitespace-nowrap" : "min-w-0",
        className,
      )}
      style={{ flex: `${grow} 1 0%` }}
    >
      {v || "\u00A0"}
    </span>
  );
}

/** two blanks separated by "/" – used for the two deceased */
function Pair({ a, b, grow = 1 }: { a?: string; b?: string; grow?: number }) {
  return (
    <>
      <D v={a} grow={grow} />
      <L>/</L>
      <D v={b} grow={grow} />
    </>
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

/** Extracts birth year in Khmer digits (e.g. "01.01.1949" -> "១៩៤៩", "1974" -> "១៩៧៤") */
function getBirthYear(dob?: string) {
  if (!dob?.trim()) return "";
  const parts = parseDateParts(dob);
  if (parts.year) return kh(parts.year);
  const match = dob.match(/\b(19\d\d|20\d\d)\b/);
  return match ? kh(match[1]) : "";
}

/** Parses child age as a number from DOB, date, year, or age string */
function parseChildAge(c: Child): number | null {
  if (!c.dob?.trim()) return null;
  const clean = c.dob.trim();
  const normalized = toArabicNum(clean);

  const dmyMatch = normalized.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  const ymdMatch = normalized.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  const yearOnlyMatch = normalized.match(/^(\d{4})$/);

  let birthDate: Date | null = null;
  if (dmyMatch) {
    birthDate = new Date(
      parseInt(dmyMatch[3], 10),
      parseInt(dmyMatch[2], 10) - 1,
      parseInt(dmyMatch[1], 10),
    );
  } else if (ymdMatch) {
    birthDate = new Date(
      parseInt(ymdMatch[1], 10),
      parseInt(ymdMatch[2], 10) - 1,
      parseInt(ymdMatch[3], 10),
    );
  } else if (yearOnlyMatch) {
    const year = parseInt(yearOnlyMatch[1], 10);
    if (year >= 1900 && year <= new Date().getFullYear()) {
      birthDate = new Date(year, 0, 1);
    }
  }

  if (birthDate && !Number.isNaN(birthDate.getTime())) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age >= 0 && age < 130) {
      return age;
    }
  }

  const numMatch = normalized.match(/\b(\d{1,3})\b/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (n < 130) return n;
  }

  return null;
}

/**
 * Filter for Page 4: "សរសេរតែឈ្មោះកូនដែលមានអាយុពី១៨ឆ្នាំឡើងទៅ ឬកូនដែលបានទទួលអត្ថាធិនភាពហើយ"
 * Excludes children under 18 unless emancipated (អត្ថាធិនភាព).
 */
function isAdultOrEmancipated(c: Child): boolean {
  // If child has received emancipation (អត្ថាធិនភាព / អត្ថាធីនភាព), allow regardless of age
  const note = (c.note || "").toLowerCase();
  if (
    note.includes("អត្ថាធិន") ||
    note.includes("អត្ថាធីន") ||
    note.includes("emancipat")
  ) {
    return true;
  }

  const age = parseChildAge(c);
  if (age !== null) {
    return age >= 18;
  }

  return true;
}

const EMPTY_CHILD: Child = {
  name: "",
  gender: "",
  dob: "",
  birthCertDate: "",
  birthCertNo: "",
  commune: "",
  district: "",
  note: "",
};

/** pad a list with blank rows up to `min` (never cuts rows off) */
function padRows(list: Child[], min: number): Child[] {
  return [
    ...list,
    ...Array.from(
      { length: Math.max(0, min - list.length) },
      () => EMPTY_CHILD,
    ),
  ];
}

/** Formats area into Khmer standard notation with unit (e.g. "58" -> "៥៨ (ម២)") */
function formatLandArea(raw: string | undefined | null): string {
  if (!raw || !raw.trim()) return "";
  const trimmed = raw.trim();
  if (trimmed.includes("ម²")) {
    return kh(trimmed);
  }
  const cleaned = trimmed
    .replace(/\s*(ម[²]|ម²|m[2²]|ម៉ែត្រការ៉េ)\s*$/i, "")
    .trim();
  const khDigits = kh(cleaned);
  if (khDigits) {
    return `${khDigits} ម²`;
  }
  return kh(trimmed);
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
  const village = pick(/ភូមិ[^\s,]+/, /^ភូមិ/);
  const commune = pick(/(សង្កាត់|ឃុំ)[^\s,]+/, /^(សង្កាត់|ឃុំ)/);
  const district = pick(/(ខណ្ឌ|ស្រុក|ក្រុង)[^\s,]+/, /^(ខណ្ឌ|ស្រុក|ក្រុង)/);
  const city = pick(/(រាជធានី|ខេត្ត)[^\s,]+/, /^(រាជធានី|ខេត្ត)/);
  if (!village && !commune && !district && !city)
    return { village: "", commune: a, district: "", city: "" };
  return { village, commune, district, city };
}

/** every date string the pages need, built once */
interface SignDates {
  lunarDay: string;
  lunarMonth: string;
  lunarYear: string;
  era: string;
  eraShort: string; // ព.ស ២៥__
  day: string;
  month: string;
  year: string;
  yearShort: string; // ឆ្នាំ ២០__
}

function Img({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={src} alt={alt} className={cn("object-contain", className)} />
  );
}

function Ornament({
  src = FORM.ornament,
  className = "h-[8mm]",
}: {
  src?: string;
  className?: string;
}) {
  return (
    <Img
      src={src}
      alt="ornament"
      className={cn("mx-auto my-1.5 w-auto", className)}
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
    <div className="absolute bottom-[var(--paper-pad-bottom)] left-[var(--paper-pad-left,var(--paper-pad-x))] right-[var(--paper-pad-right,var(--paper-pad-x))]">
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

/** title (Moul) with the logo on the right – pages 3 and 4 */
function TitleBar({
  title,
  withOrnament,
}: {
  title: string;
  withOrnament?: boolean;
}) {
  return (
    <div className="relative pt-1 text-center">
      <Img
        src={FORM.logo}
        alt={FORM.logoAlt}
        className="absolute right-0 top-2 h-[7mm] w-auto"
      />
      <h2 className="font-moul text-[13pt] font-normal text-neutral-900">
        {title}
      </h2>
      {withOrnament && <Ornament className="h-[6mm]" />}
    </div>
  );
}

/** ថ្ងៃ … ខែ … ឆ្នាំ … ព.ស. … (lunar date line) */
function LunarLine({
  d,
  shortEra,
  indentClass,
}: {
  d: SignDates;
  shortEra?: boolean;
  indentClass?: string;
}) {
  return (
    <div className={ROW}>
      <L className={indentClass}>ថ្ងៃ</L>
      <D v={d.lunarDay} grow={2} />
      <L>ខែ</L>
      <D v={d.lunarMonth} grow={1.3} />
      <L>ឆ្នាំ</L>
      <D v={d.lunarYear} grow={1.8} />
      <L>{shortEra ? "ព.ស២៥" : "ព.ស."}</L>
      <D v={shortEra ? d.eraShort : d.era} grow={shortEra ? 0.8 : 1} />
    </div>
  );
}

/** រាជធានីភ្នំពេញ ថ្ងៃទី … ខែ … ឆ្នាំ២០… */
function PlaceDateLine({
  d,
  label = "រាជធានីភ្នំពេញ ថ្ងៃទី",
  indentClass,
}: {
  d: SignDates;
  label?: string;
  indentClass?: string;
}) {
  return (
    <div className={ROW}>
      <L className={indentClass}>{label}</L>
      <D v={d.day} grow={0.8} />
      <L>ខែ</L>
      <D v={d.month} grow={1.2} />
      <L>ឆ្នាំ២០</L>
      <D v={d.yearShort} grow={0.8} />
    </div>
  );
}

/** "ចៅសង្កាត់" + name under it */
function ChiefSign({ name, className }: { name?: string; className?: string }) {
  return (
    <div className={cn("text-center", className)}>
      <p className="font-moul text-[10.5pt]">ចៅសង្កាត់</p>
      <p className="mt-7 font-semibold">{name || "\u00A0"}</p>
    </div>
  );
}

/** two printed lines per child (pages 1–2) */
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
  const note = child.note?.replace(/[()]/g, "").trim();

  return (
    <div>
      <div className={cn(ROW, "gap-x-1")}>
        <span className="w-[16mm] shrink-0 whitespace-nowrap">{label}</span>
        <L>ឈ្មោះ:</L>
        <D v={child.name} grow={3} />
        <L>អាយុ</L>
        <D v={ageNumber(child.dob)} grow={0.8} />
        <L>ឆ្នាំ</L>
        <L>ដូចមានសំបុត្រកំណើត លេខ</L>
        <D v={kh(child.birthCertNo)} grow={1.6} />
        {note && (
          <span className="shrink-0 font-semibold text-neutral-900">
            ({note})
          </span>
        )}
      </div>
      <div className={cn(ROW, "gap-x-1")}>
        <span className="w-[16mm] shrink-0" />
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
  pageFilter?: "all" | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}) {
  const x = data as InheritanceRequest & Partial<PrintExtras>;
  const [d1, d2] = [data.deceased[0], data.deceased[1]];
  const [a1, a2] = [data.applicants[0], data.applicants[1]];
  const [w1, w2] = [data.witnesses[0], data.witnesses[1]];
  const show = (n: 1 | 2 | 3 | 4 | 5 | 6 | 7) =>
    pageFilter === "all" || pageFilter === n;

  const deceasedNames = data.deceased
    .map((d) => d.name.trim())
    .filter(Boolean)
    .join(" និង ");

  /* active applicants & witnesses for signatures */
  const activeApplicants = data.applicants.filter((a) => a.name?.trim());
  const activeWitnesses = data.witnesses.filter((w) => w.name?.trim());

  /* surviving spouse (page 1) */
  const spouseApplicant =
    data.applicants.find(
      (a) =>
        a.relationDeceased?.includes("ប្រពន្ធ") ||
        a.relationDeceased?.includes("ប្ដី") ||
        a.relationHeirs?.includes("ម្ដាយ") ||
        a.relationHeirs?.includes("ឪពុក"),
    ) ||
    (data.authorizedRelationDeceased?.includes("ប្រពន្ធ") ||
    data.authorizedRelationDeceased?.includes("ប្ដី")
      ? { name: data.authorizedPerson, dob: "", address: "" }
      : null) ||
    data.applicants.find((a) => a.name?.trim()) ||
    data.applicants[0];

  const spouseName = (
    (data as unknown as { spouseName?: string }).spouseName ||
    spouseApplicant?.name ||
    data.authorizedPerson ||
    ""
  ).trim();

  const spouseAge =
    (data as unknown as { spouseAge?: string }).spouseAge ||
    (spouseApplicant?.dob
      ? ageNumber(spouseApplicant.dob)
      : a1?.dob
        ? ageNumber(a1.dob)
        : "");

  /* children */
  const p1Children = data.children.slice(0, FORM.pageOneChildren);
  const p2Children = data.children.slice(FORM.pageOneChildren);
  const named = data.children.filter((c) => c.name.trim());
  const heirs = padRows(named, FORM.minHeirRows);
  const adultNamed = named.filter(isAdultOrEmancipated);
  const adultHeirs = padRows(adultNamed, FORM.minHeirRows);
  /* adult heirs who consent and sign on page 4 */
  const consentHeirs = adultNamed.filter((c) => c.name?.trim());

  /* addresses + property */
  const w1Addr = splitAddress(w1.address);
  const w2Addr = splitAddress(w2.address);
  const a1Addr = splitAddress(a1.address);
  const loc = splitAddress(data.location);
  const village = x.village || loc.village;
  const sangkat = x.sangkat || data.deceasedSangkat || loc.commune;
  const khan = x.khan || loc.district;
  const titleDeedNo = kh(x.titleDeedNo || data.refNo);
  const plotNo = kh(x.plotNo || extractPlotNo(x.titleDeedNo));
  const area = formatLandArea(data.area);

  /* applicant address parts (falls back to property address) */
  const a1Village = a1.village || a1Addr.village || village;
  const a1Sangkat = a1.sangkat || a1Addr.commune || sangkat;
  const a1Khan = a1.khan || a1Addr.district || khan;
  const a1City = a1.city || a1Addr.city || x.city || "រាជធានីភ្នំពេញ";
  const a1CityClean =
    (a1City || "").replace(/^(រាជធានី|ខេត្ត)\s*/, "").trim() ||
    a1City ||
    "ភ្នំពេញ";

  /* page 6: កិច្ចសន្យាធានាអះអាង variables */
  const a1HouseMatch = (a1.address || "").match(/(?:ផ្ទះលេខ|ផ្ទះ)\s*([^\s,]+)/);
  const a1HouseNo =
    a1.houseNo || x.houseNo || (a1HouseMatch ? a1HouseMatch[1] : "");

  const a1StreetMatch = (a1.address || "").match(
    /(?:ផ្លូវលេខ|ផ្លូវ)\s*([^\s,]+)/,
  );
  const a1StreetNo =
    a1.streetNo || x.streetNo || (a1StreetMatch ? a1StreetMatch[1] : "");

  const declarantGender =
    a1.gender ||
    (a1.relationDeceased?.includes("ប្រពន្ធ") ||
    a1.relationHeirs?.includes("ម្ដាយ")
      ? "ស្រី"
      : a1.relationDeceased?.includes("ប្ដី") ||
          a1.relationHeirs?.includes("ឪពុក")
        ? "ប្រុស"
        : "");

  const declarantAge = a1.dob ? ageNumber(a1.dob) : spouseAge;
  const declarantRelation =
    a1.relationDeceased || FORM.defaults.relationToDeceased;
  const childCountKh =
    named.length > 0 ? kh(String(named.length).padStart(2, "0")) : "";
  const affidavitChildren = padRows(named, 7);

  /* council members = 8 relatives for page 4 */
  const councilRelatives = Array.from(
    { length: RELATIVE_SLOTS },
    (_, i) => data.relatives?.[i] || emptyRelative(),
  );

  const wrapPropType = (t?: string) => {
    const clean = (t || "").trim();
    if (!clean) return "";
    return clean.startsWith("(") && clean.endsWith(")") ? clean : `(${clean})`;
  };

  const sharedPropertyType = (
    x.applicantPropertyType ||
    (data as unknown as { applicantPropertyType?: string })
      .applicantPropertyType ||
    a1.propertyType ||
    a2.propertyType ||
    ""
  ).trim();

  const applicantNames =
    activeApplicants.length >= 2
      ? activeApplicants
          .map((a) =>
            a.gender === "ស្រី" ? `នាង ${a.name.trim()}` : a.name.trim(),
          )
          .join(" និង ")
      : (() => {
          const n = a1.name?.trim() || "";
          return n && a1.gender === "ស្រី" ? `នាង ${n}` : n;
        })();

  /* the person(s) who are authorised on page 3 */
  let authPerson = "";
  if (x.authorizedPerson) {
    const pt = wrapPropType(sharedPropertyType);
    authPerson = pt ? `${x.authorizedPerson} ${pt}` : x.authorizedPerson;
  } else if (applicantNames) {
    const pt = wrapPropType(sharedPropertyType);
    authPerson = pt ? `${applicantNames} ${pt}` : applicantNames;
  }

  const relDeceased =
    x.authorizedRelationDeceased ||
    (activeApplicants.length >= 2
      ? activeApplicants
          .map((a) => a.relationDeceased?.trim())
          .filter(Boolean)
          .join(" និង ")
      : a1.relationDeceased) ||
    FORM.defaults.relationToDeceased;

  const relHeirs =
    x.authorizedRelationHeirs ||
    (activeApplicants.length >= 2
      ? activeApplicants
          .map((a) => a.relationHeirs?.trim())
          .filter(Boolean)
          .join(" និង ")
      : a1.relationHeirs) ||
    FORM.defaults.relationToHeirs;

  /* deceased dates (pairs "d1 / d2") */
  const death1 = dateParts(d1.deathDate);
  const death2 = dateParts(d2.deathDate);
  const cert1 = dateParts(d1.deathCertDate);
  const cert2 = dateParts(d2.deathCertDate);
  const hasDeceased2 = Boolean(d2.name?.trim());
  const deathSangkat = data.deceasedSangkat || sangkat;
  const deathSangkat2 = hasDeceased2 ? data.deceasedSangkat || sangkat : "";
  const certNumbers = [d1.deathCertNo, d2.deathCertNo]
    .filter(Boolean)
    .map(kh)
    .join(" / ");

  /* signing date */
  const lunar: KhmerLunarDate | null = React.useMemo(() => {
    if (!data.date) return null;
    try {
      return dateStringToKhmerLunar(data.date);
    } catch {
      return null;
    }
  }, [data.date]);

  const signDate = dateParts(data.date);
  const sign = parseDateParts(data.date);
  const sd: SignDates = {
    lunarDay: lunar
      ? `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`
      : "",
    lunarMonth: lunar?.lunarMonthName ?? "",
    lunarYear: lunar ? `${lunar.zodiacYear} ${lunar.sakYear}` : "",
    era: lunar ? toKhmerNum(lunar.buddhistEra) : "",
    eraShort: lunar
      ? toKhmerNum(String(lunar.buddhistEra).replace(/^25/, ""))
      : "",
    ...signDate,
    yearShort: sign.year ? kh(String(sign.year).replace(/^20/, "")) : "",
  };

  /* page 1: ពាក្យស្នើសុំសន្តតិកម្ម variables */
  const a2Addr = splitAddress(a2?.address || "");
  const a2Sangkat = a2?.sangkat || a2Addr.commune || sangkat;
  const a2Khan = a2?.khan || a2Addr.district || khan;
  const a2City = a2?.city || a2Addr.city || a1City;

  const a2HouseMatch = (a2?.address || "").match(
    /(?:ផ្ទះលេខ|ផ្ទះ)\s*([^\s,]+)/,
  );
  const a2HouseNo = a2?.houseNo || (a2HouseMatch ? a2HouseMatch[1] : "");

  const a2StreetMatch = (a2?.address || "").match(
    /(?:ផ្លូវលេខ|ផ្លូវ)\s*([^\s,]+)/,
  );
  const a2StreetNo = a2?.streetNo || (a2StreetMatch ? a2StreetMatch[1] : "");

  const a2Gender =
    a2?.gender ||
    (a2?.relationDeceased?.includes("ប្រពន្ធ") ||
    a2?.relationHeirs?.includes("ម្ដាយ")
      ? "ស្រី"
      : a2?.relationDeceased?.includes("ប្ដី") ||
          a2?.relationHeirs?.includes("ឪពុក")
        ? "ប្រុស"
        : "");

  const a1BirthYear = getBirthYear(a1.dob);
  const a2BirthYear = getBirthYear(a2?.dob);

  const deedDate = dateParts(
    (x as unknown as { titleDeedDate?: string }).titleDeedDate ||
      x.letterRefDate ||
      "",
  );

  const formatFullDateKh = (dp: {
    day: string;
    month: string;
    year: string;
  }) => {
    if (dp.day && dp.month && dp.year) {
      return `${dp.day} ${dp.month} ${dp.year}`;
    }
    return [dp.day, dp.month, dp.year].filter(Boolean).join(" ");
  };

  const deathDateFormatted =
    hasDeceased2 && d2.deathDate
      ? `${formatFullDateKh(death1)} / ${formatFullDateKh(death2)}`
      : formatFullDateKh(death1) || kh(d1.deathDate);

  const certDateFormatted =
    hasDeceased2 && d2.deathCertDate
      ? `${formatFullDateKh(cert1)} / ${formatFullDateKh(cert2)}`
      : formatFullDateKh(cert1) || kh(d1.deathCertDate);

  const targetInheritanceText =
    authPerson ||
    (sharedPropertyType
      ? `${applicantNames} ${wrapPropType(sharedPropertyType)}`
      : applicantNames);

  return (
    <div className="flex flex-col gap-6 print:block print:p-0 print:m-0 print:gap-0">
      {/* ═══════════════════════════ PAGE 1 ═══════════════════════════ */}
      {/* ពាក្យស្នើសុំសន្តតិកម្ម */}
      {show(1) && (
        <A4Page mode="fixed" className={PAGE}>
          {/* Kingdom Header */}
          <div className="pt-1 text-center">
            <h1 className="font-moul text-[13.5pt] font-normal tracking-wide text-neutral-900">
              ព្រះរាជាណាចក្រកម្ពុជា
            </h1>
            <h2 className="mt-1 font-moul text-[11.5pt] font-normal tracking-wide text-neutral-900">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </h2>
            <Ornament src={FORM.divider} className="h-[5mm]" />
          </div>

          <h3 className="mt-2 text-center font-moul text-[11.5pt] font-normal text-neutral-900">
            ពាក្យស្នើសុំសន្តតិកម្ម
          </h3>

          {/* Applicant 1 & Applicant 2 */}
          <div className="mt-3 space-y-0.5">
            {/* Applicant 1 */}
            <div className={ROW}>
              <L className="pl-8">ខ្ញុំបាទ/នាងខ្ញុំ ឈ្មោះ:</L>
              <D v={a1.name} grow={3.5} />
              <L>ភេទ</L>
              <D v={declarantGender} grow={0.8} />
              <L>ឆ្នាំកំណើត</L>
              <D v={a1BirthYear} grow={1} />
              <L>សញ្ជាតិ</L>
              <D v={a1.name ? "ខ្មែរ" : ""} grow={1} />
            </div>
            <div className={ROW}>
              <L>ទីលំនៅផ្ទះលេខ</L>
              <D v={kh(a1HouseNo)} grow={1} />
              <L>ផ្លូវលេខ</L>
              <D v={kh(a1StreetNo)} grow={1.2} />
              <L>សង្កាត់</L>
              <D v={a1Sangkat} grow={2} />
              <L>ខណ្ឌ</L>
              <D v={a1Khan} grow={2} />
              <L>{a1City || "រាជធានីភ្នំពេញ"}។</L>
            </div>

            {/* Applicant 2 */}
            <div className={ROW}>
              <L className="pl-8">ខ្ញុំបាទ/នាងខ្ញុំ ឈ្មោះ:</L>
              <D v={a2?.name} grow={3.5} />
              <L>ភេទ</L>
              <D v={a2Gender} grow={0.8} />
              <L>ឆ្នាំកំណើត</L>
              <D v={a2BirthYear} grow={1} />
              <L>សញ្ជាតិ</L>
              <D v={a2?.name ? "ខ្មែរ" : ""} grow={1} />
            </div>
            <div className={ROW}>
              <L>ទីលំនៅផ្ទះលេខ</L>
              <D v={a2?.name ? kh(a2HouseNo) : ""} grow={1} />
              <L>ផ្លូវលេខ</L>
              <D v={a2?.name ? kh(a2StreetNo) : ""} grow={1.2} />
              <L>សង្កាត់</L>
              <D v={a2?.name ? a2Sangkat : ""} grow={2} />
              <L>ខណ្ឌ</L>
              <D v={a2?.name ? a2Khan : ""} grow={2} />
              <L>{a2City || "រាជធានីភ្នំពេញ"}។</L>
            </div>
          </div>

          {/* Addressed To */}
          <div className="mt-4 text-center">
            <h4 className="font-moul text-[11pt] font-normal text-neutral-900 underline">
              សូមគោរពជូន
            </h4>
            <h5 className="mt-1 font-moul text-[10.5pt] font-normal text-neutral-900">
              លោកប្រធានមន្ទីររៀបចំដែនដី នគរូបនីយកម្ម សំណង់ និងសុរិយោដី{" "}
              {x.city || "រាជធានីភ្នំពេញ"}
            </h5>
          </div>

          {/* Body Lines */}
          <div className="mt-3 space-y-1">
            {/* តាមរយៈ */}
            <div className={ROW}>
              <L className="w-[20mm] font-moul text-sm">តាមរយៈ</L>
              <L>: លោកចៅសង្កាត់</L>
              <D v={deathSangkat || sangkat} grow={1} />
            </div>

            {/* កម្មវត្ថុ */}
            <div className={ROW}>
              <L className="w-[20mm] font-moul text-sm">កម្មវត្ថុ</L>
              <L>: ស្នើសុំសន្តតិកម្ម ដី-ផ្ទះមានប័ណ្ណកម្មសិទ្ធិលេខ</L>
              <D v={titleDeedNo} grow={2} />
              <L>ចុះថ្ងៃទី</L>
              <D v={deedDate.day} grow={0.8} />
              <L>ខែ</L>
              <D v={deedDate.month} grow={1.2} />
            </div>
            <div className={ROW}>
              <span className="w-[20mm] shrink-0" />
              <L>ឆ្នាំ</L>
              <D v={deedDate.year} grow={1} />
              <L>ដែលស្ថិតនៅភូមិ</L>
              <D v={village} grow={1.5} />
              <L>សង្កាត់</L>
              <D v={sangkat} grow={1.5} />
              <L>ខណ្ឌ</L>
              <D v={khan} grow={1.5} />
            </div>
            <div className={ROW}>
              <span className="w-[20mm] shrink-0" />
              <L>{a1City || "រាជធានីភ្នំពេញ"} មកជា</L>
              <D v={targetInheritanceText} grow={1} />
              <L>។</L>
            </div>

            {/* មូលហេតុ */}
            <div className={cn(ROW, "gap-x-1")}>
              <L className="w-[20mm] font-moul text-sm">មូលហេតុ</L>
              <L>: ដី-ផ្ទះនេះជាទ្រព្យរបស់មតកជនឈ្មោះ</L>
              <D v={deceasedNames} grow={2.5} />
              <L>បានទទួលមរណៈភាព</L>
            </div>
            <div className={cn(ROW, "gap-x-1")}>
              <span className="w-[6mm] shrink-0" />
              <L>កាលពីថ្ងៃទី</L>
              <D v={deathDateFormatted} grow={1.2} />
              <L>មានសំបុត្រមរណៈភាពលេខ</L>
              <D v={certNumbers} grow={0.8} />
              <L>ចុះថ្ងៃទី</L>
              <D v={certDateFormatted} grow={1.2} />
              <L>។</L>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="mt-3 space-y-0.5">
            <p className="pl-[20mm]">
              អាស្រ័យដូចបានជម្រាបជូនខាងលើ សូមលោក{" "}
              <span className="font-moul text-sm">ប្រធានមន្ទីរ</span> មេត្តាពិនិត្យ
              និងសម្រេចអនុញ្ញាតឲ្យចុះបញ្ជីតាមសំណើខាងលើដោយអនុគ្រោះ។
            </p>
          </div>

          {/* Signatures & Certification block */}
          <div className="mt-1 flex items-start justify-between gap-x-4 pt-2 text-[16px] leading-normal">
            {/* Left: Commune Chief verification (All centered, font 16px) */}
            <div className="w-[84mm] shrink-0 pt-[15mm] text-[16px]">
              {/* លេខ............................ (centered) */}
              <div className="flex justify-center">
                <div className={cn(ROW, "w-[48mm] justify-center text-[16px]")}>
                  <L className="font-semibold">លេខ</L>
                  <D v={kh(x.letterRefNo)} grow={1} />
                </div>
              </div>

              <p className="mt-1 text-center font-normal text-[16px]">
                បានឃើញ និងបញ្ជាក់ថា
              </p>
              <p className="text-center font-normal text-[16px]">
                ស្នាមមេដៃស្តាំខាងលើពិតជាស្នាមមេដៃ
              </p>

              {/* ឈ្មោះ: if 1 person -> center; if 2 persons -> left & right */}
              {activeApplicants.length >= 2 ? (
                <div className={cn(ROW, "justify-center text-[16px]")}>
                  <L>ឈ្មោះ</L>
                  <D v={activeApplicants[0].name} grow={1} />
                  <L>និង</L>
                  <D v={activeApplicants[1].name} grow={1} />
                </div>
              ) : (
                <div className={cn(ROW, "justify-center text-[16px]")}>
                  <L>ឈ្មោះ</L>
                  <D v={a1.name} grow={1} />
                </div>
              )}

              <p className="text-center text-[16px]">
                បានផ្តិតចំពោះមុខយើងប្រាកដមែន។
              </p>

              {/* ថ្ងៃ... ខែ... ឆ្នាំ... ព.ស២៥... */}
              <div className="mt-0.5 text-[16px]">
                <LunarLine d={sd} shortEra />
                <PlaceDateLine
                  d={sd}
                  label={`${a1City || "រាជធានីភ្នំពេញ"} ថ្ងៃទី`}
                />
              </div>

              {/* ចៅសង្កាត់......................... (centered) */}
              <div className="mt-1 flex justify-center">
                <div className={cn(ROW, "w-[55mm] justify-center text-[16px]")}>
                  <L className="font-moul text-[14px]">ចៅសង្កាត់</L>
                  <D v={x.communeChiefName} grow={1} />
                </div>
              </div>
            </div>

            {/* Right: Applicant dates, thumbprint header, thumbprint space & Applicant Name(s) */}
            <div className="w-[80mm] shrink-0 text-center text-[16px] leading-normal">
              <LunarLine d={sd} shortEra />
              <PlaceDateLine
                d={sd}
                label={`${a1City || "រាជធានីភ្នំពេញ"} ថ្ងៃទី`}
              />
              <p className="mt-1 font-moul text-[14px]">ស្នាមមេដៃស្តាំ</p>

              {/* Thumbprint space directly under ស្នាមមេដៃស្តាំ */}
              <div className="h-[22mm]" />

              {/* Applicant Name(s): if 1 person -> center; if 2 persons -> left & right */}
              {activeApplicants.length >= 2 ? (
                <div className="grid grid-cols-2 gap-2 text-center font-semibold text-[16px]">
                  <p>{activeApplicants[0].name}</p>
                  <p>{activeApplicants[1].name}</p>
                </div>
              ) : (
                <p className="text-center font-semibold text-[16px]">
                  {a1.name || "\u00A0"}
                </p>
              )}
            </div>
          </div>
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 2 ═══════════════════════════ */}
      {show(2) && (
        <A4Page mode="fixed" className={PAGE}>
          {/* header: storage line centred on the page, logo box on the right */}
          <div className="relative h-[28mm]">
            <div className="absolute inset-x-0 top-[1mm] flex justify-center">
              <div className={cn(ROW, "w-[68mm]")}>
                <L className="font-moul text-[12pt]">តំកល់ទុក</L>
                <L className="font-moul text-[12pt] underline underline-offset-8">
                  លេខ
                </L>
                <D v={kh(data.refNo)} grow={1} />
              </div>
            </div>

            <div className="absolute left-0 top-[10mm] w-[48mm]">
              <div className={ROW}>
                <L>អ្នកតែងលិខិត</L>
                <D grow={1} />
              </div>
            </div>

            <div className="absolute right-0 top-0 w-[54mm] border-b border-l border-neutral-800 pb-1 pl-2 text-[18px] leading-tight">
              <p>ក្រដាសលេខ {FORM.paperNo}</p>
              <p>លេខទីទុកឯកសារ</p>
              <Img
                src={FORM.logo}
                alt={FORM.logoAlt}
                className="mt-1 h-9 w-auto max-w-full"
              />
            </div>
          </div>

          {/* title + deceased */}
          <div className="mt-2">
            <div className={ROW}>
              <L className="pl-[18mm] font-battambang text-[18px] font-bold">
                សំបុត្រដំណរវង្សត្រកូលនៃមតកជន (១)
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={cn(ROW, "gap-x-1")}>
              <L>កើតនៅឆ្នាំ</L>
              <D v={kh(d1.birthYear)} grow={1} />
              {hasDeceased2 && (
                <>
                  <L>និងឆ្នាំ</L>
                  <D v={kh(d2.birthYear)} grow={1} />
                </>
              )}
              <L>ស្លាប់នៅថ្ងៃ</L>
              <D v={kh(d1.deathDate)} grow={1.5} />
              {hasDeceased2 && (
                <>
                  <L>និងថ្ងៃ</L>
                  <D v={kh(d2.deathDate)} grow={1.5} />
                </>
              )}
              <L>តាមសំបុត្រ</L>
            </div>
            <div className={cn(ROW, "gap-x-1")}>
              <L>មរណៈភាពលេខ</L>
              <D v={kh(d1.deathCertNo)} grow={1} />
              {hasDeceased2 && (
                <>
                  <L>និងលេខ</L>
                  <D v={kh(d2.deathCertNo)} grow={1} />
                </>
              )}
              <L>ចុះថ្ងៃ</L>
              <D v={kh(d1.deathCertDate)} grow={1.5} />
              {hasDeceased2 && (
                <>
                  <L>និងថ្ងៃ</L>
                  <D v={kh(d2.deathCertDate)} grow={1.5} />
                </>
              )}
              <L>នៅសង្កាត់</L>
              <D v={deathSangkat} grow={1.5} />
            </div>

            <p className="my-1.5 text-center font-battambang text-[18px] font-bold">
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
                <D v={spouseName} grow={3} />
                <L>អាយុ</L>
                <D v={spouseAge} grow={1} />
                <L>ឆ្នាំ ជាប្ដី ឬប្រពន្ធដើមនៃមតកជនឈ្មោះ</L>
              </div>
              <div className={ROW}>
                <D v={deceasedNames} grow={2} />
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

          <div className="mt-0.5">
            {p1Children.map((c, i) => (
              <ChildBlock key={i} child={c} first={i === 0} />
            ))}
          </div>

          <Footnotes notes={FOOTNOTES_PAGE_1} withArticle />
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 3 ═══════════════════════════ */}
      {show(3) && (
        <A4Page mode="fixed" className={PAGE}>
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
              <L>បានពិនិត្យបញ្ជាក់ថា សំបុត្រដំណរវង្សត្រកូលនៃមតកជនឈ្មោះ (១)</L>
              <D v={deceasedNames} grow={2} />
            </div>
            <div className={ROW}>
              <L>ដែលអនិច្ចកម្មដោយឥតមានសំបុត្របណ្ដាំ។</L>
            </div>
          </div>

          {/* commune chief */}
          <div className="mt-4">
            <div className={ROW}>
              <L className="pl-[18mm]">យើង (២)</L>
              <D grow={2.5} />
              <L>ចៅសង្កាត់</L>
              <D v={deathSangkat} grow={2} />
              <L>បានពិនិត្យ</L>
            </div>
            <div className={ROW}>
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
              <L>ឆ្នាំ ប្រពន្ធ</L>
            </div>
            <div className={ROW}>
              <L>ឈ្មោះ</L>
              <D v={a2.name} grow={2.5} />
              <L>នៅសង្កាត់</L>
              <D v={a1Sangkat} grow={2} />
              <L>យកមកប្តឹងយើង។</L>
            </div>
          </div>

          {/* date */}
          <div className="ml-auto mt-4 w-[125mm]">
            <LunarLine d={sd} indentClass="pl-[22mm]" />
            <div className={ROW}>
              <L>ធ្វើនៅសង្កាត់ (៣)</L>
              <D v={deathSangkat} grow={2} />
              <L>នៅថ្ងៃទី</L>
              <D v={sd.day} grow={0.8} />
              <L>ខែ</L>
              <D v={sd.month} grow={1.2} />
              <L>ឆ្នាំ</L>
              <D v={sd.year} grow={1} />
            </div>
          </div>

          {/* signatures */}
          <div className="mt-4 grid grid-cols-[1.3fr_1fr] gap-4 break-inside-avoid">
            <div className="pl-[4mm]">
              <p className="text-center">ហត្ថលេខា ឬ ស្នាមមេដៃស្តាំ</p>
              <div
                className={cn(
                  "mt-1 text-center",
                  activeWitnesses.length >= 2 && activeApplicants.length < 2
                    ? "grid grid-cols-[1fr_1.6fr] gap-3"
                    : activeApplicants.length >= 2 && activeWitnesses.length < 2
                      ? "grid grid-cols-[1.6fr_1fr] gap-3"
                      : "grid grid-cols-2 gap-3",
                )}
              >
                <div>
                  <p>អ្នកប្តឹង</p>
                  <div className="mt-30">
                    {activeApplicants.length >= 2 ? (
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <p className="font-semibold">
                          {activeApplicants[0].name}
                        </p>
                        <p className="font-semibold">
                          {activeApplicants[1].name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-center font-semibold">
                        {activeApplicants[0]?.name || "\u00A0"}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p>កសិណ</p>
                  <div className="mt-30">
                    {activeWitnesses.length >= 2 ? (
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <p className="font-semibold">
                          {activeWitnesses[0].name}
                        </p>
                        <p className="font-semibold">
                          {activeWitnesses[1].name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-center font-semibold">
                        {activeWitnesses[0]?.name || "\u00A0"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className={cn(ROW, "justify-center")}>
                <L>បញ្ជាក់ចុះលេខ</L>
                <D grow={1} />
              </div>
              <p className="pl-[25mm]">ហត្ថលេខា និងត្រាចៅសង្កាត់ដែលបញ្ជាក់</p>
            </div>
          </div>

          <Footnotes notes={FOOTNOTES_PAGE_2} />
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 4 ═══════════════════════════ */}
      {/* សេចក្តីព្រមព្រៀង និងអនុញ្ញាត */}
      {show(4) && (
        <A4Page mode="fixed" className={PAGE}>
          <TitleBar title="សេចក្តីព្រមព្រៀង និងអនុញ្ញាត" withOrnament />

          <div className="mt-1">
            <div className={ROW}>
              <L className="pl-[8mm]">
                ឱ្យផ្ទេរសិទ្ធិកាន់កាប់នូវអចលនវត្ថុរបស់មរតកជន (នាង)(១)
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>យើងខ្ញុំទាំងអស់គ្នាជាកូនបង្កើតរបស់មរតកជន (នាង) (២)</L>
              <D v={deceasedNames} grow={1} />
            </div>
            <p className="text-[16px] leading-snug text-neutral-800">
              (សរសេរតែឈ្មោះកូនដែលមានអាយុពី១៨ឆ្នាំឡើងទៅ
              ឬកូនដែលបានទទួលអត្ថាធិនភាពហើយ)
            </p>
          </div>

          {/* heirs */}
          <div className="mt-1.5">
            {adultHeirs.map((c, i) => (
              <div key={i} className={ROW}>
                <L className="w-[18mm]">{kh(i + 1)}- ឈ្មោះ:</L>
                <D v={c.name} grow={3.5} />
                <L>ភេទ</L>
                <D v={c.gender} grow={1} />
                <L>អាយុ</L>
                <D v={ageNumber(c.dob)} grow={1} />
                <L>ឆ្នាំ,</L>
                {c.note && (
                  <span className="shrink-0 font-semibold text-neutral-900">
                    ({c.note.replace(/[()]/g, "").trim()})
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* authorisation */}
          <div className="mt-2.5">
            <div className={ROW}>
              <L className="pl-[8mm]">
                សូមប្រកាសព្រមព្រៀង និងអនុញ្ញាតឱ្យឈ្មោះ (នាង)(៣)
              </L>
              <D v={authPerson} grow={1} />
            </div>
            <div className={ROW}>
              <L>ដែលត្រូវជា(៤)</L>
              <D v={relDeceased} grow={1.2} />
              <L>នៃមរតកជន និងជា(៥)</L>
              <D v={relHeirs} grow={1.2} />
              <L>នៃយើងខ្ញុំទាំងអស់គ្នា បានចាត់ចែង</L>
              <D v={FORM.defaults.action} grow={1.5} />
            </div>
            <div className={ROW}>
              <L>អចលនវត្ថុដែលមានក្នុងប័ណ្ណសម្គាល់សិទ្ធិកាន់កាប់អចលនវត្ថុលេខ</L>
              <D v={titleDeedNo} grow={1} />
            </div>
            <div className={ROW}>
              <L>ទំហំផ្ទៃ</L>
              <D v={area} grow={1.2} />
              <L>ស្ថិតនៅក្នុងភូមិ</L>
              <D v={village} grow={1.5} />
              <L>សង្កាត់</L>
              <D v={sangkat} grow={1.5} />
              <L>ខណ្ឌ</L>
              <D v={khan} grow={1.5} />
            </div>
            <div className={ROW}>
              <L>រាជធានីភ្នំពេញ ជាមរតករបស់មរតកជន</L>
              <D v={deceasedNames} grow={1} />
              <L>យើងខ្ញុំ។</L>
            </div>
          </div>

          <p className="mt-2 text-center">
            យើងខ្ញុំទាំងអស់គ្នាសូមផ្តិតមេដៃស្តាំទុកជាភស្តុតាងស្រាប់។
          </p>

          {/* notes (left) + right thumbprints & consenting heirs (right) */}
          <div className="mt-2.5 grid grid-cols-[1fr_1.4fr] gap-4">
            {/* Left: Notes & ឈ្មោះ label */}
            <div className="flex flex-col justify-between">
              <div className="space-y-0.5 text-[9pt] leading-tight text-neutral-800">
                {NOTES_CONSENT.map((n) => (
                  <p key={n}>{n}</p>
                ))}
              </div>
              <div className={ROW}>
                <L>ឈ្មោះ:</L>
                <D grow={1} />
              </div>
            </div>

            {/* Right: Thumbprint header, thumbprint gap, and adult heir names */}
            <div className="flex flex-col text-center">
              <p className="font-medium">ស្នាមមេដៃស្តាំ</p>
              <div className="h-[20mm]" />
              <div className={ROW}>
                {consentHeirs.length > 0 ? (
                  consentHeirs.map((h, idx) => (
                    <D key={idx} v={h.name} grow={1} />
                  ))
                ) : (
                  <D grow={1} />
                )}
              </div>
            </div>
          </div>

          {/* commune chief */}
          <div className="mt-2 text-center text-[10pt] leading-[1.6]">
            <p>ស្នាមមេដៃទាំងនេះបានផ្តិតនៅចំពោះមុខយើង</p>
            <p>ដែលយើងបានសូត្រសេចក្តីខាងលើនេះយ៉ាងក្បោះក្បាយ</p>
            <p>ហើយអានខ្លាំងៗអោយទាយាទទាំងអស់ស្តាប់មុនពេលផ្តិតមេដៃយល់ព្រម។</p>
          </div>
          <div className="mx-auto mt-1.5 w-[125mm]">
            <LunarLine d={sd} indentClass="pl-[16mm]" />
            <PlaceDateLine d={sd} indentClass="pl-[22mm]" />
          </div>
          <ChiefSign name={x.communeChiefName} className="mt-1" />
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 5 ═══════════════════════════ */}
      {/* សំបុត្រអនុញ្ញាតពីក្រុមប្រឹក្សាញាតិ */}
      {show(5) && (
        <A4Page mode="fixed" className={PAGE}>
          <TitleBar title="សំបុត្រអនុញ្ញាតពីក្រុមប្រឹក្សាញាតិ" />

          <div className="mt-1">
            <div className={ROW}>
              <L className="pl-[16mm]">នៃមតកជន (នាង)</L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={cn(ROW, "text-[9.5pt]")}>
              <L>(លិខិតដំណាលរបស់លិខិតសញ្ញាលក់ផ្ដាច់លេខ</L>
              <D v={kh(x.letterRefNo)} grow={1.5} />
              <L>ចុះថ្ងៃទី</L>
              <D v={kh(x.letterRefDate)} grow={1.2} />
              <L>)</L>
            </div>
          </div>

          <p className="mt-1.5 text-center font-moul text-[13pt]">
            យើងខ្ញុំទាំងអស់គ្នា
          </p>

          {/* council members = relatives (1-8) */}
          <div className="mt-1">
            {councilRelatives.map((rel, i) => (
              <div key={i} className={cn(ROW, "h-[6.8mm]")}>
                <L className="w-[18mm]">{kh(i + 1)}- ឈ្មោះ:</L>
                <D v={rel.name} grow={3} />
                <L>ភេទ</L>
                <D v={rel.gender} grow={0.8} />
                <L>ឆ្នាំកំណើត</L>
                <D v={kh(rel.birthYear)} grow={1} />
                <L>ទីលំនៅ</L>
                <D v={rel.address} grow={3.5} />
              </div>
            ))}
          </div>

          {/* statement */}
          <div className="mt-2.5">
            <div className={ROW}>
              <L className="pl-[8mm]">
                ជាសាច់សារលោហិត និងជាក្រុមប្រឹក្សាញាតិរបស់មតកជន
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>
                ដែលបានស្លាប់ទៅ ដោយឥតមានបណ្ដាំ ហើយបន្សល់ទុកនូវកេរ្តិ៍មរតកជាដី
              </L>
              <D v={data.propertyType || FORM.defaults.landKind} grow={1.2} />
              <L>ទំហំ</L>
              <D v={area} grow={1} />
            </div>
            <div className={ROW}>
              <L>តាមប័ណ្ណសម្គាល់សិទ្ធិកាន់កាប់អចលនវត្ថុលេខ(២)</L>
              <D v={titleDeedNo} grow={1.5} />
              <L>ស្ថិតនៅក្បាលដីលេខ</L>
              <D v={plotNo} grow={1} />
              <L>ផ្លូវ</L>
              <D v={kh(x.streetNo)} grow={1} />
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
              <L>ដោយសម្គាល់ឃើញថាឈ្មោះ (នាង)(៣)</L>
              <D grow={1.2} />
              <L>បានព្រមព្រៀងអោយឈ្មោះ</L>
              <D v={applicantNames} grow={2} />
            </div>
            <div className={ROW}>
              <L className="pl-[8mm]">
                ដែលនៅរស់មានសិទ្ធិចាត់ចែងនូវមរតកមតកជន (នាង)(១)
              </L>
              <D v={deceasedNames} grow={1} />
            </div>
            <div className={ROW}>
              <L>តាមសេចក្តីត្រូវការក្នុងការដោះស្រាយជីវភាពក្នុងគ្រួសារតទៅ។</L>
            </div>
          </div>

          {/* date + thumbprint */}
          <div className="ml-auto mt-2.5 w-[110mm] text-center">
            <LunarLine d={sd} shortEra />
            <PlaceDateLine d={sd} label="ធ្វើនៅថ្ងៃទី" />
            <p className="mt-2 font-medium">ស្នាមមេដៃស្តាំ</p>
          </div>

          {/* notes (left) + verification (right) */}
          <div className="mt-auto grid grid-cols-2 gap-4 pb-2">
            <div className="text-[8.4pt] leading-relaxed text-neutral-800">
              <p className="font-semibold">បញ្ជាក់៖</p>
              {NOTES_COUNCIL.map((n) => (
                <p key={n}>{n}</p>
              ))}
            </div>

            <div className="text-center text-[9.5pt]">
              <p className="font-medium">បានឃើញ និងបញ្ជាក់ថាត្រឹមត្រូវ</p>
              <LunarLine d={sd} shortEra />
              <PlaceDateLine d={sd} label="ថ្ងៃទី" />
              <ChiefSign name={x.communeChiefName} className="mt-1" />
            </div>
          </div>
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 6 ═══════════════════════════ */}
      {/* សំបុត្របញ្ជាក់ទាយាទ */}
      {show(6) && (
        <A4Page mode="fixed" className={PAGE}>
          {/* kingdom header, logo on the right */}
          <div className="relative">
            <Img
              src={FORM.logo}
              alt={FORM.logoAlt}
              className="absolute right-0 top-[22mm] h-[8mm] w-auto"
            />
            <div className="pt-1 text-center">
              <h1 className="font-moul text-[13.5pt] font-normal tracking-wide text-neutral-900">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h1>
              <h2 className="mt-1 font-moul text-[11.5pt] font-normal tracking-wide text-neutral-900">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </h2>
              <Ornament src={FORM.divider} className="h-[5mm]" />
            </div>

            <div className="mt-1 w-[65mm] text-[10pt]">
              <p className="font-semibold">រាជធានីភ្នំពេញ</p>
              <div className={ROW}>
                <L>ខណ្ឌ :</L>
                <D v={khan} grow={1} />
              </div>
              <div className={ROW}>
                <L>សង្កាត់ :</L>
                <D v={deathSangkat} grow={1} />
              </div>
            </div>
          </div>

          <h3 className="mt-2 text-center font-moul text-[13.5pt] font-normal text-neutral-900">
            សំបុត្របញ្ជាក់ទាយាទ
          </h3>

          {/* statement */}
          <div className="mt-2">
            <div className={ROW}>
              <L className="pl-[14mm]">យើង</L>
              <D v={x.communeChiefName} grow={2.4} />
              <L>ចៅសង្កាត់</L>
              <D v={deathSangkat} grow={2} />
              <L>សូមបញ្ជាក់ និងប្រកាស</L>
            </div>
            <div className={ROW}>
              <L>ដល់ អាជ្ញាធរមានសមត្ថកិច្ចថា៖ មតកជនឈ្មោះ</L>
              <D v={d1.name} grow={2.5} />
              <L>និងមតកជននាង</L>
              <D v={d2.name} grow={2.5} />
            </div>
            <div className={ROW}>
              <L>កើតឆ្នាំ</L>
              <D v={kh(d1.birthYear)} grow={1} />
              <L>និងឆ្នាំ</L>
              <D v={kh(d2.birthYear)} grow={1} />
              <L>ស្លាប់ថ្ងៃទី</L>
              <Pair a={death1.day} b={death2.day} grow={0.8} />
            </div>
            <div className={ROW}>
              <L>ខែ</L>
              <Pair a={death1.month} b={death2.month} grow={1} />
              <L>ឆ្នាំ</L>
              <Pair a={death1.year} b={death2.year} grow={1} />
              <L>នៅសង្កាត់</L>
              <D v={deathSangkat} grow={hasDeceased2 ? 1.8 : 2.5} />
              {hasDeceased2 && <L>និង</L>}
            </div>
            <div className={ROW}>
              {hasDeceased2 && (
                <>
                  <L>សង្កាត់</L>
                  <D v={deathSangkat2} grow={1.8} />
                </>
              )}
              <L className={hasDeceased2 ? "" : "pl-[10mm]"}>
                ដូចមានសំបុត្រមរណភាពលេខ៖
              </L>
              <D v={certNumbers} grow={hasDeceased2 ? 1.5 : 2} />
              <L>ចុះថ្ងៃទី</L>
              <Pair a={cert1.day} b={cert2.day} grow={0.7} />
            </div>
            <div className={ROW}>
              <L>ខែ</L>
              <Pair a={cert1.month} b={cert2.month} grow={1} />
              <L>ឆ្នាំ</L>
              <Pair a={cert1.year} b={cert2.year} grow={1} />
              <L>។</L>
            </div>
          </div>

          <p className="mt-2 pl-[8mm]">
            ដែលអនិច្ចកម្មឥតមានបណ្ដាំ
            ហើយបានបន្សល់ទុកទាយាទដូចមានរាយនាមខាងក្រោមនេះ៖
          </p>

          {/* heirs */}
          <div className="mt-1">
            {heirs.map((c, i) => (
              <div key={i} className={ROW}>
                <L className="w-[18mm]">{kh(i + 1)}- ឈ្មោះ:</L>
                <D v={c.name} grow={3.5} />
                <L>ភេទ</L>
                <D v={c.gender} grow={1} />
                <L>អាយុ</L>
                <D v={ageNumber(c.dob)} grow={1} />
                <L>ឆ្នាំ ត្រូវជាកូនទី{kh(i + 1)}នៃមតកជន</L>
                {c.note && (
                  <span className="shrink-0 font-semibold text-neutral-900">
                    ({c.note.replace(/[()]/g, "").trim()})
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-1.5">
            <div className={ROW}>
              <L className="pl-[8mm]">
                ដែលជាទាយាទមានសិទ្ធិក្នុងចំណែកមរតកនៃមតកជនឈ្មោះ៖
              </L>
              <D v={d1.name} grow={2} />
              <L>និងមតកជននាង</L>
            </div>
            <div className={ROW}>
              <D v={d2.name} grow={1} />
              <L>។</L>
            </div>
            <p className="pl-[8mm]">
              សេចក្តីបញ្ជាក់នេះចេញឱ្យទាយាទប្រើប្រាស់តាមការដែលអាចប្រើបាន។
            </p>
          </div>

          {/* number, date, chief */}
          <div className="ml-auto mt-2 w-[110mm] text-center">
            <div className={cn(ROW, "justify-center")}>
              <L className="font-moul">លេខ:</L>
              <D v={kh(x.heirCertNo)} grow={1} />
            </div>
            <LunarLine d={sd} />
            <PlaceDateLine d={sd} />
            <ChiefSign name={x.communeChiefName} className="mt-1" />
          </div>
        </A4Page>
      )}

      {/* ═══════════════════════════ PAGE 7 ═══════════════════════════ */}
      {/* កិច្ចសន្យាធានាអះអាង */}
      {show(7) && (
        <A4Page mode="fixed" className={PAGE}>
          {/* Kingdom Header */}
          <div className="pt-1 text-center">
            <h1 className="font-moul text-[13.5pt] font-normal tracking-wide text-neutral-900">
              ព្រះរាជាណាចក្រកម្ពុជា
            </h1>
            <h2 className="mt-1 font-moul text-[11.5pt] font-normal tracking-wide text-neutral-900">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </h2>
            <Ornament src={FORM.divider} className="h-[5mm]" />
          </div>

          <h3 className="mt-2 text-center font-moul text-[13.5pt] font-normal text-neutral-900">
            កិច្ចសន្យាធានាអះអាង
          </h3>

          {/* Declarant section */}
          <div className="mt-3 space-y-0.5">
            <div className={ROW}>
              <L>ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ:</L>
              <D v={a1.name} grow={3} />
              <L>ភេទ</L>
              <D v={declarantGender} grow={1} />
              <L>អាយុ</L>
              <D v={declarantAge} grow={1} />
              <L>ឆ្នាំ សញ្ជាតិ</L>
              <D v="ខ្មែរ" grow={1} />
            </div>
            <div className={ROW}>
              <L>មានទីលំនៅបច្ចុប្បន្នផ្ទះលេខ</L>
              <D v={kh(a1HouseNo)} grow={1} />
              <L>ផ្លូវលេខ</L>
              <D v={kh(a1StreetNo)} grow={1.2} />
              <L>ភូមិ</L>
              <D v={a1Village} grow={1.8} />
              <L>ឃុំ-សង្កាត់</L>
              <D v={a1Sangkat} grow={2} />
            </div>
            <div className={cn(ROW, "gap-x-1")}>
              <L>ក្រុង-ស្រុក-ខណ្ឌ</L>
              <D v={a1Khan} grow={1.5} />
              <L>រាជធានី-ខេត្ត</L>
              <D v={a1CityClean} grow={1.5} />
              <L>ដែលត្រូវជា</L>
              <D v={declarantRelation} grow={1.2} />
              <L>នៃមរតកជនឈ្មោះ:</L>
            </div>
            <div className={ROW}>
              <D v={d1.name} grow={1} />
              <L>។</L>
            </div>
          </div>

          {/* Guarantee statement heading */}
          <h4 className="mt-3 text-center font-moul text-[11pt] font-normal text-neutral-900">
            សូមធ្វើការធានាអះអាងថា
          </h4>

          {/* Statement lines */}
          <div className="mt-1 space-y-0.5">
            <div className={ROW}>
              <L>មរតកជនឈ្មោះ:</L>
              <D v={d1.name} grow={2.5} />
              <L>ពិតជាមានកូនបង្កើតចំនួន</L>
              <D v={childCountKh} grow={1} />
              <L>នាក់ប៉ុណ្ណោះ និង ពុំមានកូនណាមួយ</L>
            </div>
            <div className={ROW}>
              <L>ដែលនៅសល់ដោយមិនរាយការណ៍ឡើយ ដូចមានរាយនាមដូចខាងក្រោមនេះ៖</L>
            </div>
          </div>

          {/* List of children (7 rows) */}
          <div className="mt-1 space-y-0.5">
            {affidavitChildren
              .slice(0, Math.max(7, named.length))
              .map((c, i) => (
                <div key={i} className={cn(ROW, "pl-[8mm]")}>
                  <L className="w-[18mm]">{kh(i + 1)}- ឈ្មោះ:</L>
                  <D v={c.name} grow={3.5} />
                  <L>ភេទ</L>
                  <D v={c.gender} grow={1} />
                  <L>អាយុ</L>
                  <D v={ageNumber(c.dob)} grow={1} />
                  <L>ឆ្នាំ ត្រូវជាកូនទី{kh(i + 1)}</L>
                </div>
              ))}
          </div>

          {/* Liability / confirmation */}
          <div className="mt-2 space-y-0.5">
            <div className={ROW}>
              <L>
                បើការអះអាងខាងលើនេះខុសពីការពិត និង/ឬ មានជនណាមួយមកអះអាងបន្ថែមថា
                កូនបង្កើត ឬកូនចិញ្ចឹមនៃមរតកជន
              </L>
            </div>
            <div className={ROW}>
              <D v={d1.name} grow={2} />
              {hasDeceased2 && (
                <>
                  <L>និងមរតកជន</L>
                  <D v={d2.name} grow={2} />
                </>
              )}
              <L>នោះ ខ្ញុំបាទ-នាងខ្ញុំ សូមចេញមុខទទួលខុសត្រូវ</L>
            </div>
            <div className={ROW}>
              <L>និងទទួលទោសតាមច្បាប់បញ្ញត្តិជាធរមាន។</L>
            </div>
            <div className={cn(ROW, "pl-[8mm]")}>
              <L>
                ក្រែងពុំប្រាកដ ខ្ញុំបាទ/នាងខ្ញុំ
                សូមផ្តិតមេដៃស្តាំទុកជាភស្តុតាងស្រាប់។
              </L>
            </div>
          </div>

          {/* Signatures & Certification block */}
          <div className="mt-auto flex items-start justify-between gap-x-4 pt-2">
            {/* Left column: Commune chief certification */}
            <div className="w-[80mm] shrink-0 text-[9.5pt] leading-normal">
              <div className={cn(ROW, "w-[50mm]")}>
                <L className="font-semibold">លេខ:</L>
                <D v={kh(x.letterRefNo)} grow={1} />
              </div>
              <p className="mt-1 text-center font-semibold text-[10pt]">
                បានឃើញ និងបញ្ជាក់ថា
              </p>
              <p className="text-center font-semibold text-[10pt]">
                ស្នាមមេដៃនេះពិតជាស្នាមមេដៃ
              </p>
              <div className={cn(ROW, "justify-center")}>
                <L>របស់ឈ្មោះ</L>
                <D v={a1.name} grow={1} />
                <L>ពិតប្រាកដមែន។</L>
              </div>
              <div className="mt-0.5">
                <LunarLine d={sd} shortEra />
                <PlaceDateLine
                  d={sd}
                  label={`${a1City || "រាជធានីភ្នំពេញ"} ថ្ងៃទី`}
                />
              </div>
              <div className={cn(ROW, "mt-1")}>
                <L className="font-moul text-[9.5pt]">មេឃុំ-ចៅសង្កាត់</L>
                <D v={x.communeChiefName} grow={1} />
              </div>
            </div>

            {/* Right column: Declarant date, thumbprint, and signature */}
            <div className="w-[80mm] shrink-0 text-center text-[9.5pt] leading-normal">
              <LunarLine d={sd} shortEra />
              <PlaceDateLine
                d={sd}
                label={`${a1City || "រាជធានីភ្នំពេញ"} ថ្ងៃទី`}
              />
              <p className="mt-1 font-moul text-[10.5pt]">ស្នាមមេដៃស្តាំ</p>
              <div className="h-[18mm]" />
              <div className="flex justify-center">
                <div className={cn(ROW, "w-[60mm] justify-center")}>
                  <D v={a1.name} grow={1} />
                </div>
              </div>
            </div>
          </div>
        </A4Page>
      )}
    </div>
  );
}
