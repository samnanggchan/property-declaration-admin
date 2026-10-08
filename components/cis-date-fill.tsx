"use client";

import * as React from "react";
import { cn, toKhmerNum } from "@/lib/utils";
import type { KhmerLunarDate } from "@/lib/khmer-lunar-calendar";

export const DATE_BLOCK = {
  width: 140,
  height: 16,
  bottom: 51.4,
  right: 0,
};

const SHORT_YEAR = true;

export const DATE_FIELDS = {
  weekday: { x: 50.2, y: 0, maxW: 26, tweak: "" },
  lunarMonth: { x: 76.6, y: 0, maxW: 14.5, tweak: "" },
  zodiac: { x: 101.1, y: 0, maxW: 20, tweak: "" },
  be: { x: 130, y: 0, tweak: "" },

  gDay: { x: 80.5, y: 8.5, maxW: 8, tweak: "" },
  gMonth: { x: 94.3, y: 8.5, maxW: 10.5, tweak: "" },
  gYear: { x: 112.8, y: 8.5, tweak: "" },
} satisfies Record<string, FieldConfig>;

const PRINTED_WORDS = [
  { text: "ថ្ងៃ", x: 31.5, y: 0 },
  { text: "ខែ", x: 65.5, y: 0 },
  { text: "ឆ្នាំ", x: 85, y: 0 },
  { text: "ព.ស. ២៥...", x: 112.7, y: 0 },
  { text: "ធ្វើនៅភ្នំពេញ ថ្ងៃទី", x: 48.9, y: 8.5 },
  { text: "ខែ", x: 85, y: 8.5 },
  { text: "ឆ្នាំ២០...", x: 100.8, y: 8.5 },
];

interface FieldConfig {
  x: number;
  y: number;
  maxW?: number;
  tweak?: string;
}

type FieldKey = keyof typeof DATE_FIELDS;

export const KHMER_GREGORIAN_MONTHS = [
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

const MM_TO_PX = 96 / 25.4;

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const pad2 = (s: string) => (s.length < 2 ? `០${s}` : s); // "៨" → "០៨"
const year = (s: string) => (SHORT_YEAR ? s.slice(-2) : s);

/** One value, centered on its own point. Moves/scales only itself. */
function Field({
  cfg,
  text,
  guide,
}: {
  cfg: FieldConfig;
  text: string;
  guide: boolean;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [scale, setScale] = React.useState(1);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const natural = el.offsetWidth; // not affected by the scale transform
      const limit = cfg.maxW ? cfg.maxW * MM_TO_PX : Infinity;
      setScale(natural > limit && natural > 0 ? limit / natural : 1);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      active = false;
    };
  }, [text, cfg.maxW]);

  return (
    // zero-width anchor at (x, y); `tweak` margins move only this field
    <div
      className={cn("absolute flex w-0 justify-center", cfg.tweak)}
      style={{ left: `${cfg.x}mm`, top: `${cfg.y}mm` }}
    >
      <span
        ref={ref}
        className={cn(
          "shrink-0 whitespace-nowrap",
          guide &&
            "outline outline-1 outline-dashed outline-sky-400/70 print:outline-none",
        )}
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        {text}
      </span>
    </div>
  );
}

export function CadastralDateFill({
  lunar,
  showGuide = true,
}: {
  lunar: KhmerLunarDate;
  showGuide?: boolean;
}) {
  const texts: Record<FieldKey, string> = {
    weekday: `${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerNum(lunar.lunarDay)}${lunar.lunarPhase}`,
    lunarMonth: lunar.lunarMonthName,
    zodiac: `${lunar.zodiacYear} ${lunar.sakYear}`,
    be: year(toKhmerNum(lunar.buddhistEra)),
    gDay: pad2(toKhmerNum(lunar.gregorianDay)),
    gMonth: KHMER_GREGORIAN_MONTHS[lunar.gregorianMonth],
    gYear: year(toKhmerNum(lunar.gregorianYear)),
  };

  return (
    <div
      className="relative font-medium text-blue-950 text-[12pt] leading-relaxed tracking-wide whitespace-nowrap"
      style={{
        width: `${DATE_BLOCK.width}mm`,
        height: `${DATE_BLOCK.height}mm`,
      }}
    >
      {showGuide &&
        PRINTED_WORDS.map((w, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap text-neutral-400 select-none pointer-events-none print:hidden"
            style={{ left: `${w.x}mm`, top: `${w.y}mm` }}
          >
            {w.text}
          </span>
        ))}

      {(Object.keys(DATE_FIELDS) as FieldKey[]).map((key) => (
        <Field
          key={key}
          cfg={DATE_FIELDS[key]}
          text={texts[key]}
          guide={showGuide}
        />
      ))}
    </div>
  );
}
