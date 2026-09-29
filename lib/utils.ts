import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toKhmerNum(num: number | string): string {
  const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return String(num).replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
}

export function toArabicNum(str: string): string {
  const khmerDigits: Record<string, string> = {
    "០": "0",
    "១": "1",
    "២": "2",
    "៣": "3",
    "៤": "4",
    "៥": "5",
    "៦": "6",
    "៧": "7",
    "៨": "8",
    "៩": "9",
  };
  return String(str).replace(/[០-៩]/g, (d) => khmerDigits[d] || d);
}

export function calculateAgeFromDob(dobStr?: string): string {
  if (!dobStr) return "";
  const clean = dobStr.trim();
  if (!clean) return "";

  // Convert Khmer digits to Arabic digits for accurate date math
  const normalized = toArabicNum(clean);

  // Parse DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const dmyMatch = normalized.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  // Parse YYYY-MM-DD, YYYY.MM.DD
  const ymdMatch = normalized.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  // Parse Year only (4 digits)
  const yearOnlyMatch = normalized.match(/^(\d{4})$/);

  let birthDate: Date | null = null;

  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    birthDate = new Date(year, month, day);
  } else if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    birthDate = new Date(year, month, day);
  } else if (yearOnlyMatch) {
    const year = parseInt(yearOnlyMatch[1], 10);
    if (year >= 1900 && year <= new Date().getFullYear()) {
      birthDate = new Date(year, 0, 1);
    }
  }

  if (birthDate && !isNaN(birthDate.getTime())) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age >= 0 && age < 130) {
      return `${toKhmerNum(age)} ឆ្នាំ`;
    }
  }

  // Already includes ឆ្នាំ (e.g., "២៣ ឆ្នាំ" or "23 ឆ្នាំ")
  if (clean.includes("ឆ្នាំ")) {
    return clean.replace(/[0-9]+/g, (match) => toKhmerNum(match));
  }

  // Pure number between 1 and 120 (e.g., "27" or "២៧")
  if (/^\d{1,3}$/.test(normalized)) {
    const n = parseInt(normalized, 10);
    if (n < 130) {
      return `${toKhmerNum(n)} ឆ្នាំ`;
    }
  }

  return clean;
}

export function getAgeDetails(dobStr?: string): {
  ageText: string;
  isCalculated: boolean;
} {
  const ageText = calculateAgeFromDob(dobStr);
  const normalized = toArabicNum(dobStr || "").trim();
  const isDate =
    /^(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{4})$/.test(
      normalized,
    );
  return {
    ageText,
    isCalculated: isDate && !!ageText,
  };
}
