"use client";

import * as React from "react";
import { PrinterIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { A4Page } from "@/components/a4-page";
import { cn, calculateAgeFromDob } from "@/lib/utils";
import {
  Applicant,
  Child,
  CHILD_SLOTS,
  InheritanceRequest,
  Witness,
  countNamed,
  emptyRequest,
  normalizeRequest,
  parseDateParts,
  sampleRequest,
  toKhmerDigits as kh,
} from "@/lib/inheritance-request-types";

const STORAGE_KEY = "inheritance_request_draft_v1";

/** "22.02.1980" → "43 ឆ្នាំ" (or "" when unknown) */
const ageOf = (dob: string) => {
  if (!dob.trim()) return "";
  const a = calculateAgeFromDob(dob);
  return a && a !== "—" ? String(a) : "";
};

/* ═════════════════════════ small editor pieces ═════════════════════════ */

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2 border-b pb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-xs"
      />
    </div>
  );
}

/* ═════════════════════════ printed-sheet pieces ═════════════════════════ */

const cellBase = "border border-neutral-800 px-2 py-0.5 align-middle";

/** "label ........value........" on one line */
function Line({
  label,
  value,
  className,
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span className="shrink-0">{label}</span>
      <span className="min-h-[1.5em] flex-1 border-b border-dotted border-neutral-600 px-1 font-semibold text-neutral-950">
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1 mt-3 text-[11pt] font-bold text-neutral-950">
      {children}
    </h4>
  );
}

/* ═════════════════════════════ main component ═════════════════════════════ */

export function InheritanceRequestForm() {
  const [data, setData] = React.useState<InheritanceRequest>(emptyRequest);
  const [hydrated, setHydrated] = React.useState(false);

  // load saved draft once (after mount, so server/client HTML match)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(normalizeRequest(JSON.parse(saved)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // autosave draft
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated]);

  const setField = <K extends keyof InheritanceRequest>(
    key: K,
    value: InheritanceRequest[K],
  ) => setData((p) => ({ ...p, [key]: value }));

  const patchApplicant = (i: number, patch: Partial<Applicant>) =>
    setData((p) => ({
      ...p,
      applicants: p.applicants.map((a, idx) =>
        idx === i ? { ...a, ...patch } : a,
      ),
    }));

  const patchWitness = (i: number, patch: Partial<Witness>) =>
    setData((p) => ({
      ...p,
      witnesses: p.witnesses.map((w, idx) =>
        idx === i ? { ...w, ...patch } : w,
      ),
    }));

  const patchChild = (i: number, patch: Partial<Child>) =>
    setData((p) => ({
      ...p,
      children: p.children.map((c, idx) =>
        idx === i ? { ...c, ...patch } : c,
      ),
    }));

  const handleReset = () => {
    if (!window.confirm("សម្អាតទិន្នន័យទាំងអស់?")) return;
    setData(emptyRequest());
    toast.success("បានសម្អាតទិន្នន័យ");
  };

  const handleSample = () => {
    setData(sampleRequest());
    toast.success("បានដាក់ទិន្នន័យគំរូ");
  };

  const date = parseDateParts(data.date);
  const applicantsNamed = countNamed(data.applicants);
  const witnessesNamed = countNamed(data.witnesses);
  const childrenNamed = countNamed(data.children);

  const applicantRows: {
    label: string;
    bold?: boolean;
    value: (a: Applicant) => string;
  }[] = [
    { label: "ឈ្មោះ", bold: true, value: (a) => a.name },
    {
      label: "ថ្ងៃ ខែ ឆ្នាំកំណើត",
      value: (a) => {
        if (!a.dob) return "";
        const age = ageOf(a.dob);
        return `${kh(a.dob)}${age ? ` (${kh(age)})` : ""}`;
      },
    },
    { label: "អាសយដ្ឋាន", value: (a) => a.address },
    { label: "ឈ្មោះឪពុក", value: (a) => a.fatherName },
    { label: "ឈ្មោះម្តាយ", value: (a) => a.motherName },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── toolbar (never printed) ── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            អ្នកស្នើសុំ {applicantsNamed}/{data.applicants.length}
          </Badge>
          <Badge variant="outline" className="text-xs">
            សាក្សី {witnessesNamed}/{data.witnesses.length}
          </Badge>
          <Badge variant="outline" className="text-xs">
            កូន {childrenNamed}/{CHILD_SLOTS}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSample}
            className="h-8 gap-1.5 text-xs"
          >
            <SparklesIcon className="size-3.5" />
            ទិន្នន័យគំរូ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcwIcon className="size-3.5" />
            សម្អាត
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 gap-1.5 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900"
          >
            <PrinterIcon className="size-3.5" />
            បោះពុម្ព (Print)
          </Button>
        </div>
      </div>

      {/* editor on the left, A4 preview on the right; plain block when printing */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)] print:block">
        {/* ═══════════════ EDITOR (never printed) ═══════════════ */}
        <div className="no-print space-y-4">
          <Card title="ព័ត៌មានទូទៅ">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="ចំណងជើង"
                value={data.title}
                onChange={(v) => setField("title", v)}
                className="col-span-2"
              />
              <Field
                label="លេខយោង"
                value={data.refNo}
                onChange={(v) => setField("refNo", v)}
              />
              <Field
                label="ទំហំ"
                value={data.area}
                onChange={(v) => setField("area", v)}
                placeholder="93 ម²"
              />
              <Field
                label="ទីតាំង"
                value={data.location}
                onChange={(v) => setField("location", v)}
                className="col-span-2"
              />
              <Field
                label="កាលបរិច្ឆេទ (ថ្ងៃ.ខែ.ឆ្នាំ)"
                value={data.date}
                onChange={(v) => setField("date", v)}
                placeholder="08.10.2026"
                className="col-span-2"
              />
            </div>
          </Card>

          {data.applicants.map((a, i) => (
            <Card key={i} title={`អ្នកស្នើសុំទី ${i + 1}`}>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="ឈ្មោះ"
                  value={a.name}
                  onChange={(v) => patchApplicant(i, { name: v })}
                />
                <Field
                  label="ថ្ងៃ ខែ ឆ្នាំកំណើត"
                  value={a.dob}
                  onChange={(v) => patchApplicant(i, { dob: v })}
                  placeholder="22.02.1980"
                />
                <Field
                  label="អាសយដ្ឋាន"
                  value={a.address}
                  onChange={(v) => patchApplicant(i, { address: v })}
                  className="col-span-2"
                />
                <Field
                  label="ឈ្មោះឪពុក"
                  value={a.fatherName}
                  onChange={(v) => patchApplicant(i, { fatherName: v })}
                />
                <Field
                  label="ឈ្មោះម្តាយ"
                  value={a.motherName}
                  onChange={(v) => patchApplicant(i, { motherName: v })}
                />
              </div>
            </Card>
          ))}

          {data.witnesses.map((w, i) => (
            <Card key={i} title={`សាក្សីទី ${i + 1}`}>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="ឈ្មោះ"
                  value={w.name}
                  onChange={(v) => patchWitness(i, { name: v })}
                />
                <Field
                  label="ថ្ងៃ ខែ ឆ្នាំកំណើត"
                  value={w.dob}
                  onChange={(v) => patchWitness(i, { dob: v })}
                  placeholder="22.02.1980"
                />
                <Field
                  label="អត្តសញ្ញាណប័ណ្ណ"
                  value={w.idNumber}
                  onChange={(v) => patchWitness(i, { idNumber: v })}
                />
                <Field
                  label="អាសយដ្ឋាន"
                  value={w.address}
                  onChange={(v) => patchWitness(i, { address: v })}
                />
              </div>
            </Card>
          ))}

          <Card title={`ឈ្មោះកូន (${CHILD_SLOTS} នាក់)`} hint="ទុកទទេបើគ្មាន">
            <div className="mb-1 grid grid-cols-[1.25rem_minmax(0,1.4fr)_5rem_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 text-[10px] text-muted-foreground">
              <span />
              <span>ឈ្មោះ</span>
              <span>ភេទ</span>
              <span>ថ្ងៃកំណើត</span>
              <span>សម្គាល់</span>
            </div>
            <div className="space-y-1.5">
              {data.children.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1.25rem_minmax(0,1.4fr)_5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1.5"
                >
                  <span className="text-[11px] text-muted-foreground">
                    {i + 1}
                  </span>
                  <Input
                    value={c.name}
                    onChange={(e) => patchChild(i, { name: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <select
                    value={c.gender}
                    onChange={(e) =>
                      patchChild(i, {
                        gender: e.target.value as Child["gender"],
                      })
                    }
                    className="h-8 rounded-md border border-input bg-background px-1.5 text-xs"
                  >
                    <option value="">—</option>
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                  <Input
                    value={c.dob}
                    onChange={(e) => patchChild(i, { dob: e.target.value })}
                    placeholder="dd.mm.yyyy"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={c.note}
                    onChange={(e) => patchChild(i, { note: e.target.value })}
                    placeholder="ស្លាប់…"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ═══════════════ PRINTABLE A4 SHEET ═══════════════ */}
        <div id="printable-document" className="printable-area">
          <A4Page className="font-battambang text-[10pt] leading-snug text-neutral-900">
            {/* Kingdom header */}
            <div className="text-center">
              <h2 className="font-moul text-[12pt] font-normal text-neutral-950">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h2>
              <h3 className="mt-0.5 font-moul text-[11pt] font-normal text-neutral-950">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </h3>
              <div className="mx-auto my-1 flex w-28 items-center justify-center">
                <span className="h-[1.5px] w-full bg-neutral-800" />
                <span className="mx-1 text-[9pt]">❖</span>
                <span className="h-[1.5px] w-full bg-neutral-800" />
              </div>
              <h1 className="mt-1 font-moul text-[14pt] font-normal text-neutral-950">
                {data.title}
              </h1>
            </div>

            {/* reference / area / location */}
            <div className="mt-3 space-y-1.5">
              <div className="flex gap-4">
                <Line
                  label="លេខយោង៖"
                  value={kh(data.refNo)}
                  className="flex-1"
                />
                <Line
                  label="ទំហំ៖"
                  value={kh(data.area)}
                  className="w-[55mm]"
                />
              </div>
              <Line label="ទីតាំង៖" value={data.location} />
            </div>

            {/* ១. applicants */}
            <SectionTitle>១. អ្នកស្នើសុំ (២នាក់)</SectionTitle>
            <table className="w-full border-collapse border-2 border-neutral-800 text-[10pt]">
              <thead>
                <tr className="bg-neutral-100 font-bold">
                  <th className={cn(cellBase, "w-[24%] text-left")}>
                    ប្រភេទទិន្នន័យ
                  </th>
                  {data.applicants.map((_, i) => (
                    <th key={i} className={cn(cellBase, "text-center")}>
                      អ្នកស្នើសុំទី {kh(i + 1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicantRows.map((row) => (
                  <tr key={row.label} className="h-[6.5mm]">
                    <td className={cn(cellBase, "font-semibold")}>
                      {row.label}
                    </td>
                    {data.applicants.map((a, i) => (
                      <td
                        key={i}
                        className={cn(
                          cellBase,
                          "text-center",
                          row.bold && "font-bold",
                        )}
                      >
                        {row.value(a)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ២. witnesses */}
            <SectionTitle>២. សាក្សី (២នាក់)</SectionTitle>
            <table className="w-full table-fixed border-collapse border-2 border-neutral-800 text-[10pt]">
              <thead>
                <tr className="bg-neutral-100 font-bold">
                  <th className={cn(cellBase, "w-[8%] text-center")}>ល.រ</th>
                  <th className={cn(cellBase, "w-[26%] text-center")}>ឈ្មោះ</th>
                  <th className={cn(cellBase, "w-[18%] text-center")}>
                    ថ្ងៃ ខែ ឆ្នាំកំណើត
                  </th>
                  <th className={cn(cellBase, "w-[18%] text-center")}>
                    អត្តសញ្ញាណប័ណ្ណ
                  </th>
                  <th className={cn(cellBase, "text-center")}>អាសយដ្ឋាន</th>
                </tr>
              </thead>
              <tbody>
                {data.witnesses.map((w, i) => (
                  <tr key={i} className="h-[6.5mm]">
                    <td className={cn(cellBase, "text-center")}>{kh(i + 1)}</td>
                    <td className={cn(cellBase, "text-center font-semibold")}>
                      {w.name}
                    </td>
                    <td className={cn(cellBase, "text-center")}>{kh(w.dob)}</td>
                    <td
                      className={cn(
                        cellBase,
                        "text-center font-mono text-[9pt]",
                      )}
                    >
                      {w.idNumber}
                    </td>
                    <td className={cellBase}>{w.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ៣. children */}
            <SectionTitle>៣. ឈ្មោះកូន ({kh(CHILD_SLOTS)}នាក់)</SectionTitle>
            <table className="w-full table-fixed border-collapse border-2 border-neutral-800 text-[10pt]">
              <thead>
                <tr className="bg-neutral-100 font-bold">
                  <th className={cn(cellBase, "w-[8%] text-center")}>ល.រ</th>
                  <th className={cn(cellBase, "w-[32%] text-center")}>ឈ្មោះ</th>
                  <th className={cn(cellBase, "w-[10%] text-center")}>ភេទ</th>
                  <th className={cn(cellBase, "w-[20%] text-center")}>
                    ថ្ងៃ ខែ ឆ្នាំកំណើត
                  </th>
                  <th className={cn(cellBase, "w-[12%] text-center")}>អាយុ</th>
                  <th className={cn(cellBase, "text-center")}>សម្គាល់</th>
                </tr>
              </thead>
              <tbody>
                {data.children.map((c, i) => {
                  const age = ageOf(c.dob);
                  return (
                    <tr key={i} className="h-[6.5mm]">
                      <td className={cn(cellBase, "text-center")}>
                        {kh(i + 1)}
                      </td>
                      <td className={cn(cellBase, "font-semibold")}>
                        {c.name}
                      </td>
                      <td className={cn(cellBase, "text-center")}>
                        {c.gender}
                      </td>
                      <td className={cn(cellBase, "text-center")}>
                        {kh(c.dob)}
                      </td>
                      <td className={cn(cellBase, "text-center")}>
                        {age ? kh(age) : ""}
                      </td>
                      <td className={cellBase}>{c.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* date + signatures */}
            <div className="mt-3 break-inside-avoid">
              <p className="text-right">
                រាជធានីភ្នំពេញ ថ្ងៃទី {date.day ? kh(date.day) : "........"} ខែ{" "}
                {date.month ? kh(date.month) : "........"} ឆ្នាំ{" "}
                {date.year ? kh(date.year) : "........"}
              </p>

              <div className="mt-1 grid grid-cols-2 gap-6 text-center">
                {data.applicants.map((a, i) => (
                  <div key={i}>
                    <p className="font-semibold">អ្នកស្នើសុំទី {kh(i + 1)}</p>
                    <p className="text-[9pt] italic text-neutral-600">
                      (ស្នាមមេដៃស្តាំ)
                    </p>
                    <div className="mx-auto my-1 size-14 rounded border border-dashed border-neutral-400" />
                    <p className="font-semibold">{a.name}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-6 text-center">
                {data.witnesses.map((w, i) => (
                  <div key={i}>
                    <p className="font-semibold">
                      សាក្សីទី {kh(i + 1)} (ហត្ថលេខា)
                    </p>
                    <p className="mt-8 font-semibold">
                      {w.name || "......................"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </A4Page>
        </div>
      </div>
    </div>
  );
}
