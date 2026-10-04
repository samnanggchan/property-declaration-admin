/**
 * Khmer Lunar Calendar (ប្រតិទិនចន្ទគតិខ្មែរ)
 *
 * Converts Gregorian dates to official Khmer Lunar Calendar dates.
 * Uses traditional Khmer calendar calculations conforming to:
 * https://khmer-lunar-calendar.com/
 */

import { fromGregorian } from "@thyrith/momentkh";

// ─── Khmer numerals ────────────────────────────────────────────────────────────
const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

export function toKhmerDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => KHMER_DIGITS[parseInt(d, 10)]);
}

// ─── Khmer Gregorian month names ─────────────────────────────────────────────
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

export interface KhmerLunarDate {
  weekday: string;
  lunarDay: number;
  lunarPhase: string;
  lunarMonthIndex: number;
  lunarMonthName: string;
  zodiacYear: string;
  sakYear: string;
  buddhistEra: number;
  ben: number;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  formatted: string;
  officialLunarLine: string;
  fullLunarLine: string;
  formattedBen: string;
}

/**
 * Converts a Gregorian date (year, month 1-12, day 1-31) to Khmer Lunar calendar details.
 */
export function gregorianToKhmerLunar(
  year: number,
  month: number,
  day: number
): KhmerLunarDate {
  const result = fromGregorian(year, month, day);
  const k = result.khmer;

  // Ben calculation:
  // In Bhadrapada (ភទ្របទ) waning phase (រោច), Ben is Kan Ben 1..15
  // Otherwise, day in the lunar cycle: waxing = day (1..15), waning = 15 + day (16..30)
  const isPchumBenMonth = k.monthIndex === 9 && k.moonPhase === 1;
  const ben = isPchumBenMonth
    ? k.day
    : k.moonPhase === 0
      ? k.day
      : 15 + k.day;

  const khmerGregMonth = KHMER_GREGORIAN_MONTHS[month] || "";

  // 1. Official document line: ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០
  const officialLunarLine = `ថ្ងៃ${k.dayOfWeekName} ${toKhmerDigits(k.day)}${k.moonPhaseName} ខែ${k.monthName} ឆ្នាំ${k.animalYearName} ${k.sakName} ព.ស. ${toKhmerDigits(k.beYear)}`;

  // 2. Full lunar line with weekday: ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០
  const fullLunarLine = `ថ្ងៃ${k.dayOfWeekName} ${toKhmerDigits(k.day)}${k.moonPhaseName} ខែ${k.monthName} ឆ្នាំ${k.animalYearName} ${k.sakName} ពុទ្ធសករាជ ${toKhmerDigits(k.beYear)}`;

  // 3. Full format with gregorian reference: ថ្ងៃអាទិត្យ ៨រោច... ត្រូវនឹងថ្ងៃទី៤ ខែ តុលា ឆ្នាំ២០២៦
  const formatted = `${fullLunarLine} ត្រូវនឹងថ្ងៃទី${toKhmerDigits(day)} ខែ ${khmerGregMonth} ឆ្នាំ${toKhmerDigits(year)}`;

  const formattedBen = `បិណ្ឌ ${toKhmerDigits(ben)} (Ben ${ben})`;

  return {
    weekday: `ថ្ងៃ${k.dayOfWeekName}`,
    lunarDay: k.day,
    lunarPhase: k.moonPhaseName,
    lunarMonthIndex: k.monthIndex,
    lunarMonthName: k.monthName,
    zodiacYear: k.animalYearName,
    sakYear: k.sakName,
    buddhistEra: k.beYear,
    ben,
    gregorianDay: day,
    gregorianMonth: month,
    gregorianYear: year,
    formatted,
    officialLunarLine,
    fullLunarLine,
    formattedBen,
  };
}

/**
 * Parse common date strings: DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD
 */
export function parseDateString(
  input: string
): { year: number; month: number; day: number } | null {
  if (!input) return null;
  const clean = input.trim().replace(/[០-៩]/g, (c) => {
    const idx = "០១២៣៤៥៦៧៨៩".indexOf(c);
    return idx >= 0 ? String(idx) : c;
  });

  // DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1800 && year <= 2200) {
      return { year, month, day };
    }
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1800 && year <= 2200) {
      return { year, month, day };
    }
  }

  return null;
}

/**
 * Convert a date string directly to KhmerLunarDate. Returns null if invalid.
 */
export function dateStringToKhmerLunar(
  dateStr: string
): KhmerLunarDate | null {
  const parsed = parseDateString(dateStr);
  if (!parsed) return null;
  try {
    return gregorianToKhmerLunar(parsed.year, parsed.month, parsed.day);
  } catch {
    return null;
  }
}
