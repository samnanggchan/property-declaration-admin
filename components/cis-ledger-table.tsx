"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const LEDGER = {
  origin: { x: 8.4, y: 46 },

  width: 272,
  height: 159,

  cols: [0, 60.7, 88.7, 116.7, 201.3, 236.9, 272],

  rows: {
    master: 10,
    titles: 28.5,
    numbers: 34,
    row1: 42.2,
  },
  line: 0.3,
};

const B = LEDGER.cols;

const cell = (from: number, to: number, pad = 1.5) => ({
  x: B[from - 1] + pad,
  w: B[to] - B[from - 1] - pad * 2,
});

export const LEDGER_FIELDS = {
  col1: { ...cell(1, 1), y: 36, align: "left", tweak: "" },
  col2: { ...cell(2, 3), y: 36, align: "center", tweak: "" },
  col2Alone: {
    ...cell(2, 2, 1),
    y: 36,
    align: "center",
    size: "text-[9pt]",
    tweak: "",
  },
  col3: {
    ...cell(3, 3, 1),
    y: 36,
    align: "left",
    size: "text-[9pt]",
    tweak: "",
  },
  col4: { ...cell(4, 4), y: 36, align: "center", tweak: "" },
  col5: { ...cell(5, 5), y: 36, align: "center", tweak: "" },
  col6: {
    ...cell(6, 6, 1.5),
    y: 36,
    align: "center",
    size: "text-[10pt]",
    lh: 2,
    tweak: "",
  },
} satisfies Record<string, FieldCfg>;

interface FieldCfg {
  x: number;
  w: number;
  y: number;
  align: "left" | "center";
  size?: string;
  lh?: number;
  tweak?: string;
}

export interface LedgerValues {
  col1?: string;
  col1Sub?: string;
  col2?: string;
  col3?: string;
  col4?: string;
  col4Sub?: string;
  col5?: string;
  remarksRed?: string;
  remarksBlack?: string;
  remarks?: string;
}

const KHMER_DIGITS = ["១", "២", "៣", "៤", "៥", "៦"];

/** A text box positioned in mm, content centered (or left) inside it. */
function Box({
  x,
  y,
  w,
  h,
  className,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center text-center leading-tight",
        className,
      )}
      style={{
        left: `${x}mm`,
        top: `${y}mm`,
        width: `${w}mm`,
        height: `${h}mm`,
      }}
    >
      {children}
    </div>
  );
}

/** The printed table: lines + headings. `ghost` = grey, screen-only guide. */
function LedgerFrame({ ghost }: { ghost: boolean }) {
  const { width: W, height: H, rows: R, line } = LEDGER;
  const title = R.titles - R.master;
  const numH = R.numbers - R.titles;

  return (
    <div
      className={cn(
        "absolute inset-0 text-[10pt]",
        ghost
          ? "text-neutral-400 print:hidden pointer-events-none select-none"
          : "text-neutral-900",
      )}
    >
      <svg
        width={`${W}mm`}
        height={`${H}mm`}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth={line}
      >
        {/* horizontals */}
        <path
          d={`M0 0H${W} M0 ${R.master}H${W} M0 ${R.titles}H${W} M0 ${R.numbers}H${W}`}
        />
        {/* outer left / right */}
        <path d={`M0 0V${H} M${W} 0V${H}`} />
        {/* master row dividers */}
        <path d={`M${B[3]} 0V${R.master} M${B[5]} 0V${R.master}`} />
        {/* titles + numbers rows dividers */}
        <path
          d={[1, 2, 3, 4, 5]
            .map((i) => `M${B[i]} ${R.master}V${R.numbers}`)
            .join(" ")}
        />
        {/* body dividers (col 2|3 starts under the merged first row) */}
        <path
          d={
            [1, 3, 4, 5].map((i) => `M${B[i]} ${R.numbers}V${H}`).join(" ") +
            ` M${B[2]} ${R.row1}V${H}`
          }
        />
        {/* diagonal in the first title cell */}
        <path d={`M0 ${R.titles}L${B[1]} ${R.master}`} />
      </svg>

      {/* master headings */}
      <Box x={0} y={0} w={B[3]} h={R.master} className="text-[11pt] font-bold">
        អត្រានុកូលដ្ឋានម្ចាស់អចលនវត្ថុ
      </Box>
      <Box
        x={B[3]}
        y={0}
        w={B[5] - B[3]}
        h={R.master}
        className="text-[11pt] font-bold"
      >
        ការផ្លាស់ប្តូរ
      </Box>

      {/* column 1 title (two corners of the diagonal) */}
      <Box
        x={1.2}
        y={R.master + 0.8}
        w={B[1] - 2.4}
        h={5}
        className="justify-start text-left"
      >
        តាមត្រកូល និង នាមខ្លួន
      </Box>
      <Box
        x={1.2}
        y={R.titles - 5.8}
        w={B[1] - 2.4}
        h={5}
        className="justify-end text-right"
      >
        ប្រភេទទ្រព្យ
      </Box>

      {/* other column titles */}
      <Box
        x={B[1]}
        y={R.master}
        w={B[2] - B[1]}
        h={title}
        className="text-[9.5pt]"
      >
        <span>
          ថ្ងៃ ខែ ឆ្នាំ
          <br />
          និង
          <br />
          ទីកន្លែងកំណើត
        </span>
      </Box>
      <Box x={B[2]} y={R.master} w={B[3] - B[2]} h={title}>
        សាវតារ
      </Box>
      <Box x={B[3]} y={R.master + 2.5} w={B[4] - B[3]} h={5}>
        លេខចារឹកដោយសង្ខេបនៃ
      </Box>
      <Box x={B[3]} y={R.master + 12.5} w={B[4] - B[3]} h={5}>
        លិខិតសញ្ញា ឬ សាលក្រមតុលាការ
      </Box>
      <Box x={B[4]} y={R.master} w={B[5] - B[4]} h={title}>
        បន្ទុកលើអចលនវត្ថុ
      </Box>
      <Box x={B[5]} y={R.master} w={B[6] - B[5]} h={title}>
        សេចក្តីផ្សេងៗ
      </Box>

      {/* column numbers ១ ២ ៣ ៤ ៥ ៦ */}
      {KHMER_DIGITS.map((d, i) => (
        <Box
          key={d}
          x={B[i]}
          y={R.titles}
          w={B[i + 1] - B[i]}
          h={numH}
          className="font-medium"
        >
          {d}
        </Box>
      ))}
    </div>
  );
}

/** One filled-in value. Moves / wraps only itself. */
function Field({
  cfg,
  children,
}: {
  cfg: FieldCfg;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute whitespace-pre-line break-words",
        cfg.align === "center" ? "text-center" : "text-left",
        cfg.size ?? "text-[11pt]",
        cfg.tweak,
      )}
      style={{
        left: `${cfg.x}mm`,
        top: `${cfg.y}mm`,
        width: `${cfg.w}mm`,
        lineHeight: cfg.lh,
      }}
    >
      {children}
    </div>
  );
}

const has = (s?: string) => !!s && s.trim().length > 0;

export function CisLedgerTable({
  values,
  fillMode,
  showGuide = true,
}: {
  values: LedgerValues;
  /** true  → print ONLY the values onto the pre-printed paper form
   *  false → also print the table lines and headings */
  fillMode: boolean;
  /** fillMode only: show the grey table on screen (never printed) */
  showGuide?: boolean;
}) {
  const v = values;
  const hasCol3 = has(v.col3);
  const hasRemarks = has(v.remarksRed) || has(v.remarksBlack) || has(v.remarks);

  return (
    // landscape A4 sheet, rotated so it sits on the portrait page
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: "297mm",
        height: "210mm",
        transform: "translate(-50%, -50%) rotate(-90deg)",
      }}
    >
      <div
        className="absolute"
        style={{
          left: `${LEDGER.origin.x}mm`,
          top: `${LEDGER.origin.y}mm`,
          width: `${LEDGER.width}mm`,
          height: `${LEDGER.height}mm`,
        }}
      >
        {/* table: real in full mode, grey guide in fill mode */}
        {!fillMode && <LedgerFrame ghost={false} />}
        {fillMode && showGuide && <LedgerFrame ghost />}

        {/* values (ink colour) */}
        <div className="text-black">
          {(has(v.col1) || has(v.col1Sub)) && (
            <Field cfg={LEDGER_FIELDS.col1}>
              {has(v.col1) && <div className="font-semibold">{v.col1}</div>}
              {has(v.col1Sub) && <div className="text-[10pt]">{v.col1Sub}</div>}
            </Field>
          )}

          {has(v.col2) && (
            <Field cfg={hasCol3 ? LEDGER_FIELDS.col2Alone : LEDGER_FIELDS.col2}>
              <span className="underline underline-offset-2">{v.col2}</span>
            </Field>
          )}

          {hasCol3 && <Field cfg={LEDGER_FIELDS.col3}>{v.col3}</Field>}

          {(has(v.col4) || has(v.col4Sub)) && (
            <Field cfg={LEDGER_FIELDS.col4}>
              {has(v.col4) && <div className="font-bold">{v.col4}</div>}
              {has(v.col4Sub) && <div className="text-[10pt]">{v.col4Sub}</div>}
            </Field>
          )}

          {has(v.col5) && <Field cfg={LEDGER_FIELDS.col5}>{v.col5}</Field>}

          {hasRemarks && (
            <Field cfg={LEDGER_FIELDS.col6}>
              {has(v.remarksRed) || has(v.remarksBlack) ? (
                <>
                  {has(v.remarksRed) && (
                    <div className="font-semibold text-red-600">
                      {v.remarksRed}
                    </div>
                  )}
                  {has(v.remarksBlack) && (
                    <div className="font-semibold text-black">
                      {v.remarksBlack}
                    </div>
                  )}
                </>
              ) : (
                v.remarks
              )}
            </Field>
          )}
        </div>
      </div>
    </div>
  );
}
