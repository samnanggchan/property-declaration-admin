"use client";

import * as React from "react";
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  DownloadIcon,
  RefreshCwIcon,
  DatabaseIcon,
  EyeIcon,
  ShieldAlertIcon,
  InfoIcon,
  LayersIcon,
  ArrowRightIcon,
  CopyIcon,
  CheckIcon,
  ClockIcon,
  Settings2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { parcelsApi, BulkUpdateReport, BulkUpdateOptions } from "@/lib/api";

export default function ParcelsPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState("");
  const [report, setReport] = React.useState<BulkUpdateReport | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [copiedSample, setCopiedSample] = React.useState(false);

  // Advanced options
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [tableName, setTableName] = React.useState("parcels");
  const [columnName, setColumnName] = React.useState("parcel_number");
  const [batchSize, setBatchSize] = React.useState(5000);
  const [dryRun, setDryRun] = React.useState(true);
  const [operation, setOperation] = React.useState<"update" | "upsert" | "seed_old" | "insert_new">("update");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (f?: File) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("ប្រភេទឯកសារមិនត្រឹមត្រូវ! សូមជ្រើសរើសឯកសារ .xlsx, .xls ឬ .csv");
      return;
    }
    setFile(f);
    setReport(null);
    toast.success(`បានជ្រើសរើសឯកសារ: ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  // Run execution (dryRun: true or false)
  const executeUpdate = async (isDryRun: boolean) => {
    if (!file) {
      toast.error("សូមជ្រើសរើសឯកសារ Excel ជាមុនសិន!");
      return;
    }

    setIsLoading(true);
    setLoadingStep(
      isDryRun
        ? "កំពុងផ្ទុកឡើង និងសាកល្បងពិនិត្យទិន្នន័យ (Dry Run Analysis)..."
        : "កំពុងអនុវត្តការកែប្រែជាក់ស្តែងក្នុង PostgreSQL (Live Update)..."
    );

    try {
      const options: BulkUpdateOptions = {
        dryRun: isDryRun,
        tableName: tableName.trim() || "parcels",
        columnName: columnName.trim() || "parcel_number",
        batchSize: Number(batchSize) || 5000,
        operation,
      };

      const result = await parcelsApi.bulkUpdate(file, options);
      setReport(result);

      if (isDryRun) {
        toast.info(result.message || "ការសាកល្បងពិនិត្យបានបញ្ចប់ជោគជ័យ!");
      } else {
        toast.success(result.message || "ការកែប្រែទិន្នន័យជាក់ស្តែងបានជោគជ័យ!");
      }
    } catch (err: any) {
      toast.error(err?.message || "មានបញ្ហាក្នុងការដំណើរការ! សូមពិនិត្យមើលតារាង ឬឯកសារឡើងវិញ");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
      setShowConfirmDialog(false);
    }
  };

  // Download Sample Template (.csv)
  const downloadSampleTemplate = () => {
    const headers = "old_parcel_number,new_parcel_number\n";
    const rows = [
      "12010105-0181,12010107-0315",
      "12010105-0182,12010107-0316",
      "12010105-0183,12010107-0317",
      "12010105-0184,12010107-0318",
      "12010105-0185,12010107-0319",
    ].join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_parcel_mapping.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("បានទាញយកឯកសារគំរូ sample_parcel_mapping.csv");
  };

  const copyMissingSamples = (samples: string[]) => {
    navigator.clipboard.writeText(samples.join("\n"));
    setCopiedSample(true);
    toast.success("បានចម្លងបញ្ជីលេខក្បាលដីដែលខ្វះទៅក្ដារតម្បៀតខ្ទាស់!");
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 max-w-6xl mx-auto w-full font-khmer">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DatabaseIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                កែប្រែលេខក្បាលដីជាបាច់ (Bulk Parcel Number Update)
              </h1>
              <p className="text-xs text-muted-foreground">
                ផ្ទុកឡើងឯកសារ Excel (.xlsx) ដើម្បីធ្វើបច្ចុប្បន្នភាពលេខក្បាលដីចាស់ទៅថ្មី (128,000+ កំណត់ត្រា) ក្នុង PostgreSQL
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSampleTemplate}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <DownloadIcon className="size-3.5" />
            <span>ទាញយកទម្រង់គំរូ (Sample)</span>
          </Button>

          {file && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null);
                setReport(null);
              }}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RefreshCwIcon className="size-3.5" />
              <span>ជម្រះឯកសារ</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Layout: Dropzone & Settings ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dropzone & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* File Dropzone Card */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheetIcon className="size-4 text-primary" />
                  <CardTitle className="text-sm font-bold">
                    ជ្រើសរើស ឬទម្លាក់ឯកសារ Excel (.xlsx / .csv)
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                  ទំហំអតិបរមា 50 MB
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : file
                    ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20"
                    : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30"
                )}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <FileSpreadsheetIcon className="size-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name.split(".").pop()?.toUpperCase()}
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-2 text-emerald-600 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-[10px]">
                      ឯកសារបានត្រៀមរួចរាល់
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                      <UploadCloudIcon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        ចុចទីនេះដើម្បីជ្រើសរើស ឬអូសទម្លាក់ឯកសារ Excel
                      </p>
                      <p className="text-xs text-muted-foreground">
                        គាំទ្រឯកសារ .xlsx, .xls ឬ .csv (ទិន្នន័យ 128,000+ ជួរដេក)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Operation Selector */}
              <div className="mt-4 p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2">
                <Label className="text-xs font-bold text-foreground">
                  ជ្រើសរើសប្រភេទប្រតិបត្តិការ (Operation Mode)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOperation("update")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer",
                      operation === "update"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                        : "border-border/70 hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <div className="font-bold">កែប្រែលេខចាស់ → ថ្មី (Update)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      ធ្វើបច្ចុប្បន្នភាពលេខចាស់ដែលមានស្រាប់
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperation("upsert")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer",
                      operation === "upsert"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                        : "border-border/70 hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <div className="font-bold">កែប្រែ ឬបញ្ចូលថ្មី (Upsert)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      កែប្រែបើមាន ឬបញ្ចូលថ្មីបើមិនទាន់មាន
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperation("seed_old")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer",
                      operation === "seed_old"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                        : "border-border/70 hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <div className="font-bold">បញ្ចូលលេខចាស់ 128k (Seed Old)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      បញ្ចូលទិន្នន័យចាស់ដំបូងទៅក្នុងតារាង
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperation("insert_new")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer",
                      operation === "insert_new"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                        : "border-border/70 hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <div className="font-bold">បញ្ចូលលេខថ្មីផ្ទាល់ (Insert New)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      បញ្ចូលលេខក្បាលដីថ្មីទាំងអស់ភ្លាមៗ
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => executeUpdate(true)}
                  disabled={!file || isLoading}
                  variant="outline"
                  className="flex-1 h-10 gap-2 border-primary/40 text-primary hover:bg-primary/10 font-semibold text-xs shadow-2xs"
                >
                  <EyeIcon className="size-4" />
                  <span>សាកល្បងពិនិត្យ (Dry Run Preview)</span>
                </Button>

                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!file || isLoading}
                  className="flex-1 h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  <DatabaseIcon className="size-4" />
                  <span>អនុវត្តកែប្រែជាក់ស្តែង (Live Update)</span>
                </Button>
              </div>

              {isLoading && (
                <div className="mt-4 p-3.5 rounded-lg border border-primary/20 bg-primary/5 flex items-center gap-3 animate-pulse">
                  <RefreshCwIcon className="size-4 text-primary animate-spin" />
                  <span className="text-xs font-medium text-primary">
                    {loadingStep}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Configuration Settings */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader
              className="py-3 px-5 border-b cursor-pointer select-none bg-muted/10 hover:bg-muted/20 transition-colors"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2Icon className="size-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">
                    ការកំណត់កម្រិតខ្ពស់ (Database Settings)
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {showAdvanced ? "បិទ" : "បើកមើល"}
                </Badge>
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ឈ្មោះតារាង (Table Name)</Label>
                    <Input
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      placeholder="parcels"
                      className="font-mono text-xs h-8"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      តារាងគោលដៅក្នុង PostgreSQL (លំនាំដើម: parcels)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ឈ្មោះជួរឈរ (Column Name)</Label>
                    <Input
                      value={columnName}
                      onChange={(e) => setColumnName(e.target.value)}
                      placeholder="parcel_number"
                      className="font-mono text-xs h-8"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      ជួរឈរដែលត្រូវកែប្រែ (លំនាំដើម: parcel_number)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ទំហំកញ្ចប់ UNNEST (Batch Size)</Label>
                    <Input
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      placeholder="5000"
                      min={500}
                      max={10000}
                      className="font-mono text-xs h-8"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      ចំនួនជួរដេកបញ្ចូលម្តងៗ (លំនាំដើម: 5000 ជួរដេក/query)
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column: Instructions & Structure Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-border/80 shadow-xs bg-neutral-50/60 dark:bg-neutral-900/40">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <InfoIcon className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold text-foreground">
                  រចនាសម្ព័ន្ធឯកសារ Excel (.xlsx)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                ឯកសារ Excel ត្រូវមាន <strong>២ ជួរឈរ</strong> ដែលកំណត់ទម្រង់ជា <strong>អត្ថបទ (Text)</strong>៖
              </p>

              {/* Table preview */}
              <div className="rounded-lg border border-border bg-white dark:bg-neutral-950 overflow-hidden shadow-2xs">
                <table className="w-full text-[11px] font-mono">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-foreground font-semibold">
                      <th className="py-1.5 px-3 text-left">old_parcel_number</th>
                      <th className="py-1.5 px-3 text-left">new_parcel_number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-1.5 px-3 text-red-600 dark:text-red-400">12010105-0181</td>
                      <td className="py-1.5 px-3 text-emerald-600 dark:text-emerald-400">12010107-0315</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-red-600 dark:text-red-400">12010105-0182</td>
                      <td className="py-1.5 px-3 text-emerald-600 dark:text-emerald-400">12010107-0316</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-muted-foreground italic">... (128,061 ជួរដេក)</td>
                      <td className="py-1.5 px-3 text-muted-foreground italic">... (128,061 ជួរដេក)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-1 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>PostgreSQL TEMP TABLE:</strong> បង្កើតតារាងបណ្តោះអាសន្ន និងលុបវិញស្វ័យប្រវត្ត។
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>UPDATE តាមរយៈ JOIN:</strong> ធ្វើបច្ចុប្បន្នភាពទិន្នន័យ 128,061 កំណត់ត្រាក្នុងប្រតិបត្តិការតែមួយ មិនយឺត។
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Transaction Safe:</strong> មានបញ្ហាត្រង់ណា ប្រព័ន្ធនឹង Rollback ត្រឡប់មកដើមវិញភ្លាម។
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Section 3: Execution Report / Results Dashboard ──────────────────── */}
      {report && (
        <Card className={cn(
          "border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
          report.dryRun
            ? "border-blue-200 dark:border-blue-900/50 bg-blue-50/10"
            : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10"
        )}>
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {report.dryRun ? (
                  <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <EyeIcon className="size-4" />
                  </div>
                ) : (
                  <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2Icon className="size-4" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {report.dryRun ? "លទ្ធផលសាកល្បងពិនិត្យ (Dry Run Report)" : "លទ្ធផលកែប្រែទិន្នន័យជាក់ស្តែង (Live Update Report)"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {report.message}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={report.dryRun ? "outline" : "default"} className={cn(
                  "text-xs font-semibold",
                  report.dryRun
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300"
                    : "bg-emerald-600 text-white"
                )}>
                  {report.dryRun ? "របៀបសាកល្បង" : "កែប្រែជោគជ័យ"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <ClockIcon className="size-3" />
                  {(report.executionTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* 4 Stat Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Metric 1: Total in Excel */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs">
                <span className="text-[11px] text-muted-foreground">ជួរដេកក្នុង Excel</span>
                <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                  {report.totalRowsInExcel.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  ត្រឹមត្រូវ: {report.validMappingRows.toLocaleString()}
                </span>
              </div>

              {/* Metric 2: Matches in DB */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs">
                <span className="text-[11px] text-muted-foreground">ផ្ទៀងផ្ទាត់ឃើញក្នុង DB</span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {report.existingMatchesInDb.toLocaleString()}
                </p>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {report.targetTable}.{report.targetColumn}
                </span>
              </div>

              {/* Metric 3: Missing in DB */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs">
                <span className="text-[11px] text-muted-foreground">រកមិនឃើញក្នុង DB</span>
                <p className={cn(
                  "text-lg font-bold font-mono mt-0.5",
                  report.missingOldNumbersInDb > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                )}>
                  {report.missingOldNumbersInDb.toLocaleString()}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {report.missingOldNumbersInDb > 0 ? "មិនមានក្នុងទិន្នន័យចាស់" : "គ្រប់ចំនួនទាំងអស់"}
                </span>
              </div>

              {/* Metric 4: Updated Rows */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs">
                <span className="text-[11px] text-muted-foreground">ចំនួនដែលបានកែប្រែ</span>
                <p className="text-lg font-bold font-mono text-primary mt-0.5">
                  {report.dryRun
                    ? `${report.existingMatchesInDb.toLocaleString()} (ត្រៀម)`
                    : report.updatedCount.toLocaleString()}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {report.dryRun ? "មិនទាន់កែ (សាកល្បង)" : "បានកែប្រែរួចរាល់"}
                </span>
              </div>
            </div>

            {/* Warnings / Discrepancies Chips */}
            {(report.sampleMissingOldNumbers.length > 0 ||
              report.sampleDuplicateOldNumbers.length > 0) && (
              <div className="space-y-3 pt-2">
                {/* Missing Parcels */}
                {report.sampleMissingOldNumbers.length > 0 && (
                  <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                        <AlertTriangleIcon className="size-4" />
                        <span>
                          គំរូលេខក្បាលដីដែលរកមិនឃើញក្នុង DB (Missing Old Numbers - {report.missingOldNumbersInDb} សរុប):
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMissingSamples(report.sampleMissingOldNumbers)}
                        className="h-6 px-2 text-[11px] gap-1 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                      >
                        {copiedSample ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                        <span>{copiedSample ? "បានចម្លង" : "ចម្លងគំរូ"}</span>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {report.sampleMissingOldNumbers.map((num, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-[10px] bg-white dark:bg-neutral-900 border-amber-300">
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duplicate in Excel */}
                {report.sampleDuplicateOldNumbers.length > 0 && (
                  <div className="p-3.5 rounded-lg border border-purple-300 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 dark:text-purple-300">
                      <LayersIcon className="size-4" />
                      <span>
                        លេខក្បាលដីចាស់ដែលមានជាន់គ្នាក្នុង Excel ({report.duplicateOldNumbersInExcel} ជួរដេក - ប្រព័ន្ធរក្សាទុកតែជួរដេកទី១):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {report.sampleDuplicateOldNumbers.map((num, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-[10px] bg-white dark:bg-neutral-900 border-purple-300">
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Confirmation Dialog for Live Update ──────────────────────────────── */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md font-khmer">
          <DialogHeader className="space-y-2">
            <div className="size-11 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <ShieldAlertIcon className="size-6" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              បញ្ជាក់ការកែប្រែទិន្នន័យជាក់ស្តែង (Apply Live Update)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              លោកអ្នករៀបនឹងធ្វើបច្ចុប្បន្នភាពលេខក្បាលដីផ្ទាល់លើ PostgreSQL តារាង{" "}
              <strong className="font-mono text-foreground">{tableName}.{columnName}</strong> ចំនួន{" "}
              <strong className="text-foreground">{file?.name}</strong>។
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-3 space-y-1 text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold">⚠️ ការណែនាំសុវត្ថិភាព៖</p>
            <p className="text-[11px] leading-relaxed">
              សូមប្រាកដថាបានចុច <strong>&quot;សាកល្បងពិនិត្យ (Dry Run Preview)&quot;</strong> រួចរាល់មុននឹងអនុវត្ត ដើម្បីផ្ទៀងផ្ទាត់ចំនួនទិន្នន័យដែលត្រូវកែប្រែ។
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmDialog(false)}
              className="text-xs"
            >
              បោះបង់
            </Button>
            <Button
              size="sm"
              onClick={() => executeUpdate(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
            >
              <CheckIcon className="size-4" />
              <span>យល់ព្រមអនុវត្តកែប្រែឥឡូវនេះ</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
