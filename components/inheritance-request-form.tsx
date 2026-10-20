"use client";

import * as React from "react";
import { PrinterIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InheritanceRequestPrint } from "@/components/inheritance-request-print";
import { cn } from "@/lib/utils";
import {
  Applicant,
  Child,
  CHILD_SLOTS,
  Deceased,
  DECEASED_SLOTS,
  InheritanceRequest,
  Witness,
  countNamed,
  emptyRequest,
  normalizeRequest,
  sampleRequest,
  toKhmerDigits as kh,
} from "@/lib/inheritance-request-types";

const STORAGE_KEY = "inheritance_request_draft_v1";

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

  const patchDeceased = (i: number, patch: Partial<Deceased>) =>
    setData((p) => ({
      ...p,
      deceased: p.deceased.map((d, idx) =>
        idx === i ? { ...d, ...patch } : d,
      ),
    }));

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

  const deceasedNamed = countNamed(data.deceased);
  const applicantsNamed = countNamed(data.applicants);
  const witnessesNamed = countNamed(data.witnesses);
  const childrenNamed = countNamed(data.children);

  return (
    <div className="flex flex-col gap-4">
      {/* ── toolbar (never printed) ── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            ខ្មោច {deceasedNamed}/{DECEASED_SLOTS}
          </Badge>
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

          <Card
            title={`សំបុត្រដំណរវង្សត្រកូលនៃខ្មោច (${DECEASED_SLOTS} នាក់)`}
            hint="ព័ត៌មានឪពុក-ម្តាយ ឬអ្នកចែកឋាន"
          >
            <div className="space-y-3">
              <Field
                label="នៅសង្កាត់ (នៃសំបុត្រមរណៈភាព)"
                value={data.deceasedSangkat}
                onChange={(v) => setField("deceasedSangkat", v)}
                placeholder="សង្កាត់..."
              />

              {data.deceased.map((d, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="border-b pb-1 text-xs font-semibold text-foreground">
                    ខ្មោចទី {kh(i + 1)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="ឈ្មោះខ្មោច"
                      value={d.name}
                      onChange={(v) => patchDeceased(i, { name: v })}
                      placeholder="ឈ្មោះ..."
                      className="col-span-2"
                    />
                    <Field
                      label="កើតនៅឆ្នាំ"
                      value={d.birthYear}
                      onChange={(v) => patchDeceased(i, { birthYear: v })}
                      placeholder="1955"
                    />
                    <Field
                      label="ស្លាប់នៅថ្ងៃ (dd.mm.yyyy)"
                      value={d.deathDate}
                      onChange={(v) => patchDeceased(i, { deathDate: v })}
                      placeholder="10.05.2020"
                    />
                    <Field
                      label="សំបុត្រមរណៈភាពលេខ"
                      value={d.deathCertNo}
                      onChange={(v) => patchDeceased(i, { deathCertNo: v })}
                      placeholder="លេខ..."
                    />
                    <Field
                      label="ចុះថ្ងៃ (dd.mm.yyyy)"
                      value={d.deathCertDate}
                      onChange={(v) => patchDeceased(i, { deathCertDate: v })}
                      placeholder="12.05.2020"
                    />
                  </div>
                </div>
              ))}
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
                  placeholder="សង្កាត់… ខណ្ឌ… រាជធានី…"
                />
              </div>
            </Card>
          ))}

          <Card title={`ឈ្មោះកូន (${CHILD_SLOTS} នាក់)`} hint="ទុកទទេបើគ្មាន">
            <div className="space-y-3">
              {data.children.map((c, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-muted/20 p-2.5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {i + 1}
                      </span>
                      <span>
                        កូនទី {kh(i + 1)}
                        {c.name ? `: ${c.name}` : ""}
                      </span>
                    </span>
                    {c.gender && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {c.gender}
                      </Badge>
                    )}
                  </div>

                  {/* Row 1: ឈ្មោះ, ភេទ, ថ្ងៃកំណើត, សម្គាល់ */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ឈ្មោះ
                      </Label>
                      <Input
                        value={c.name}
                        onChange={(e) =>
                          patchChild(i, { name: e.target.value })
                        }
                        placeholder="ឈ្មោះកូន"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ភេទ
                      </Label>
                      <select
                        value={c.gender}
                        onChange={(e) =>
                          patchChild(i, {
                            gender: e.target.value as Child["gender"],
                          })
                        }
                        className="h-8 w-full rounded-md border border-input bg-background px-1.5 text-xs"
                      >
                        <option value="">—</option>
                        <option value="ប្រុស">ប្រុស</option>
                        <option value="ស្រី">ស្រី</option>
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ថ្ងៃ ខែ ឆ្នាំកំណើត
                      </Label>
                      <Input
                        value={c.dob}
                        onChange={(e) => patchChild(i, { dob: e.target.value })}
                        placeholder="dd.mm.yyyy"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        សម្គាល់
                      </Label>
                      <Input
                        value={c.note}
                        onChange={(e) =>
                          patchChild(i, { note: e.target.value })
                        }
                        placeholder="ស្លាប់…"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 2: birth certificate */}
                  <div className="grid grid-cols-12 gap-2 border-t border-dashed pt-2">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ថ្ងៃចុះសំបុត្រកំណើត
                      </Label>
                      <Input
                        value={c.birthCertDate}
                        onChange={(e) =>
                          patchChild(i, { birthCertDate: e.target.value })
                        }
                        placeholder="dd.mm.yyyy"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        លេខសំបុត្រកំណើត
                      </Label>
                      <Input
                        value={c.birthCertNo}
                        onChange={(e) =>
                          patchChild(i, { birthCertNo: e.target.value })
                        }
                        placeholder="លេខសំបុត្រ"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ឃុំ/សង្កាត់
                      </Label>
                      <Input
                        value={c.commune}
                        onChange={(e) =>
                          patchChild(i, { commune: e.target.value })
                        }
                        placeholder="ឃុំ/សង្កាត់"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        ក្រុង/ស្រុក/ខណ្ឌ
                      </Label>
                      <Input
                        value={c.district}
                        onChange={(e) =>
                          patchChild(i, { district: e.target.value })
                        }
                        placeholder="ក្រុង/ស្រុក/ខណ្ឌ"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ═══════════════ PRINTABLE FORM (2 × A4) ═══════════════ */}
        <div id="printable-document" className="printable-area">
          <InheritanceRequestPrint data={data} />
        </div>
      </div>
    </div>
  );
}
