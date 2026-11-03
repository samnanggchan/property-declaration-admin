"use client";

import * as React from "react";
import {
  SearchIcon,
  CheckCircle2Icon,
  CopyIcon,
  PrinterIcon,
  CheckIcon,
  FileTextIcon,
  Building2Icon,
  UsersIcon,
  UserIcon,
  HeartHandshakeIcon,
  BabyIcon,
  LandmarkIcon,
  ShieldCheckIcon,
  PaperclipIcon,
  Trash2Icon,
  UploadCloudIcon,
  SparklesIcon,
  ArrowRightIcon,
  FileCheck2Icon,
  ListFilterIcon,
  RotateCcwIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  PROPERTY_STATUS_REQUIREMENTS,
  PropertyStatusRequirement,
  RequiredDocumentItem,
  PropertyPartyCategory,
} from "@/lib/data/required-documents";

interface DocumentFilingState {
  checked: boolean;
  notes: string;
  fileName?: string;
  fileSize?: string;
}

export default function RequiredDocumentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "buyer" | "seller">("all");
  const [selectedRequirement, setSelectedRequirement] =
    React.useState<PropertyStatusRequirement | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Store user filing/checking state per requirement item: { [docId]: DocumentFilingState }
  const [filingState, setFilingState] = React.useState<
    Record<string, DocumentFilingState>
  >({});

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Filter requirements based on tab & search query
  const filteredRequirements = React.useMemo(() => {
    let list = PROPERTY_STATUS_REQUIREMENTS;

    if (activeTab === "buyer") {
      list = list.filter((r) => r.category === "buyer");
    } else if (activeTab === "seller") {
      list = list.filter((r) => r.category === "seller");
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter((r) => {
      const matchStatus = r.status.toLowerCase().includes(query);
      const matchCategory = r.categoryTitle.toLowerCase().includes(query);
      const matchDocs = r.documents.some(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          (d.note && d.note.toLowerCase().includes(query)),
      );
      return matchStatus || matchCategory || matchDocs;
    });
  }, [activeTab, searchQuery]);

  // Open modal for a specific requirement
  const handleOpenModal = (req: PropertyStatusRequirement) => {
    setSelectedRequirement(req);
    setIsModalOpen(true);
  };

  // Toggle checklist item
  const toggleDocCheck = (docId: string) => {
    setFilingState((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        checked: !prev[docId]?.checked,
        notes: prev[docId]?.notes || "",
      },
    }));
  };

  // Update notes for a document item
  const updateDocNotes = (docId: string, notes: string) => {
    setFilingState((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        checked: prev[docId]?.checked ?? false,
        notes,
      },
    }));
  };

  // Handle local file attachment simulation
  const handleFileChange = (
    docId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setFilingState((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        checked: true, // Auto check when file attached
        notes: prev[docId]?.notes || "",
        fileName: file.name,
        fileSize: sizeStr,
      },
    }));

    toast.success(`បានភ្ជាប់ឯកសារ៖ ${file.name}`);
  };

  const removeFile = (docId: string) => {
    setFilingState((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        fileName: undefined,
        fileSize: undefined,
      },
    }));
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId]!.value = "";
    }
  };

  // Select all or reset in modal
  const handleToggleAll = (req: PropertyStatusRequirement) => {
    const allChecked = req.documents.every((d) => filingState[d.id]?.checked);
    const updated: Record<string, DocumentFilingState> = { ...filingState };

    req.documents.forEach((d) => {
      updated[d.id] = {
        ...updated[d.id],
        checked: !allChecked,
        notes: updated[d.id]?.notes || "",
      };
    });

    setFilingState(updated);
  };

  // Copy checklist text to clipboard
  const handleCopyChecklist = (req: PropertyStatusRequirement) => {
    const lines = [
      `📋 បញ្ជីឯកសារដែលត្រូវផ្តល់ (${req.categoryTitle})`,
      `🔹 ស្ថានភាព៖ ${req.status}`,
      req.description ? `📝 ការបរិយាយ៖ ${req.description}` : "",
      `---------------------------------------`,
      ...req.documents.map((d, index) => {
        const isChecked = filingState[d.id]?.checked;
        const icon = isChecked ? "✅" : "⬜";
        const extraNote = filingState[d.id]?.notes
          ? ` (កំណត់សម្គាល់៖ ${filingState[d.id].notes})`
          : "";
        return `${icon} ${index + 1}. ${d.name}${extraNote}`;
      }),
      `---------------------------------------`,
      `ប្រព័ន្ធគ្រប់គ្រង និងផ្ទៀងផ្ទាត់ឯកសារសុរិយោដី`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    toast.success("បានចម្លងបញ្ជីឯកសារទៅកាន់ Clipboard រួចរាល់!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Print checklist
  const handlePrint = () => {
    window.print();
  };

  // Helper icons per status
  const getStatusIcon = (status: string, category: PropertyPartyCategory) => {
    if (status.includes("ក្រុមហ៊ុន")) {
      return <Building2Icon className="size-5 text-indigo-600 dark:text-indigo-400" />;
    }
    if (status.includes("អង្គការ") || status.includes("សមាគម")) {
      return <LandmarkIcon className="size-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (status.includes("អនិតិជន")) {
      return <BabyIcon className="size-5 text-amber-600 dark:text-amber-400" />;
    }
    if (status.includes("ប្តី ប្រពន្ធ")) {
      return <UsersIcon className="size-5 text-blue-600 dark:text-blue-400" />;
    }
    if (status.includes("អវិភាគ")) {
      return <UsersIcon className="size-5 text-purple-600 dark:text-purple-400" />;
    }
    if (status.includes("ទ្រព្យខាងប្តី") || status.includes("ទ្រព្យផ្ទាល់ខ្លួន")) {
      return <ShieldCheckIcon className="size-5 text-teal-600 dark:text-teal-400" />;
    }
    return <UserIcon className="size-5 text-blue-600 dark:text-blue-400" />;
  };

  // Progress calculator for modal
  const completedCount =
    selectedRequirement?.documents.filter((d) => filingState[d.id]?.checked).length ?? 0;
  const totalCount = selectedRequirement?.documents.length ?? 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 font-khmer">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/70 bg-gradient-to-r from-card to-muted/30 p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck2Icon className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              ឯកសារតម្រូវតាមប្រភេទទ្រព្យ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pl-11">
            ស្វែងរក និងផ្ទៀងផ្ទាត់បញ្ជីឯកសារដែលត្រូវផ្តល់សម្រាប់ ជនមានសិទ្ធិ (អ្នកទិញ) និង ជនមានកាតព្វកិច្ច (អ្នកលក់)
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <span className="size-1.5 rounded-full bg-blue-600" />
            អ្នកទិញ៖ ៩ ស្ថានភាព
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            អ្នកលក់៖ ៧ ស្ថានភាព
          </Badge>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs Filter */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "all" | "buyer" | "seller")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-[420px] h-10 p-1 bg-muted/60">
            <TabsTrigger value="all" className="text-xs font-semibold">
              ទាំងអស់ (១៦)
            </TabsTrigger>
            <TabsTrigger value="buyer" className="text-xs font-semibold">
              អ្នកទិញ / ទទួល (៩)
            </TabsTrigger>
            <TabsTrigger value="seller" className="text-xs font-semibold">
              អ្នកលក់ (៧)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកស្ថានភាព ឬ ឯកសារ..."
            className="pl-9 text-xs font-khmer h-10 rounded-xl bg-card border-border/80"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              សម្អាត
            </button>
          )}
        </div>
      </div>

      {/* ── Requirements Grid ──────────────────────────────────────────────── */}
      {filteredRequirements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-16 text-center bg-card/40">
          <FileTextIcon className="size-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            មិនមានទិន្នន័យត្រូវគ្នានឹងការស្វែងរក
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            សូមសាកល្បងស្វែងរកដោយប្រើពាក្យគន្លឹះផ្សេង ដូចជា &quot;លីវ&quot;, &quot;ប្តី ប្រពន្ធ&quot;, &quot;អត្តសញ្ញាណបណ្ណ&quot;
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveTab("all");
            }}
            className="mt-4 text-xs"
          >
            កំណត់ឡើងវិញ
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequirements.map((req) => {
            const isBuyer = req.category === "buyer";
            const reqCompleted =
              req.documents.filter((d) => filingState[d.id]?.checked).length;
            const hasProgress = reqCompleted > 0;

            return (
              <div
                key={req.id}
                onClick={() => handleOpenModal(req)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-all duration-200",
                  "hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer",
                  isBuyer
                    ? "border-blue-100 dark:border-blue-950/60"
                    : "border-emerald-100 dark:border-emerald-950/60",
                )}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-semibold tracking-wide",
                        isBuyer
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                      )}
                    >
                      {req.categoryTitle}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium text-muted-foreground bg-muted/30"
                    >
                      {req.documents.length} ឯកសារ
                    </Badge>
                  </div>

                  {/* Status Title & Icon */}
                  <div className="flex items-start gap-3 pt-1">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        isBuyer
                          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20",
                      )}
                    >
                      {getStatusIcon(req.status, req.category)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {req.status}
                      </h3>
                      {req.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Document preview list */}
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      ឯកសារដែលត្រូវផ្តល់៖
                    </span>
                    <ul className="space-y-1.5 text-xs text-foreground/90">
                      {req.documents.slice(0, 3).map((doc, idx) => {
                        const isDone = filingState[doc.id]?.checked;
                        return (
                          <li
                            key={doc.id}
                            className="flex items-start gap-2 leading-snug"
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold mt-0.5",
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {isDone ? "✓" : idx + 1}
                            </span>
                            <span
                              className={cn(
                                "line-clamp-1",
                                isDone && "line-through text-muted-foreground",
                              )}
                            >
                              {doc.name}
                            </span>
                          </li>
                        );
                      })}
                      {req.documents.length > 3 && (
                        <li className="text-[11px] font-medium text-primary pl-6">
                          + នៅសល់ {req.documents.length - 3} ឯកសារទៀត...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>
                    {hasProgress ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        បានផ្ទៀងផ្ទាត់ {reqCompleted}/{req.documents.length}
                      </span>
                    ) : (
                      "ចុចដើម្បីមើល និងបំពេញឯកសារ"
                    )}
                  </span>
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialog / Modal: Required Documents Checklist & Filing ───────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden p-0 border border-border/80 shadow-2xl rounded-2xl flex flex-col font-khmer">
          {selectedRequirement && (
            <>
              {/* Modal Header */}
              <DialogHeader className="border-b bg-muted/40 px-6 py-4.5 shrink-0 pr-12">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      selectedRequirement.category === "buyer"
                        ? "bg-blue-500/15 text-blue-600 dark:bg-blue-500/25"
                        : "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25",
                    )}
                  >
                    {getStatusIcon(
                      selectedRequirement.status,
                      selectedRequirement.category,
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-lg font-bold text-foreground">
                        ស្ថានភាព៖ {selectedRequirement.status}
                      </DialogTitle>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-semibold",
                          selectedRequirement.category === "buyer"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                        )}
                      >
                        {selectedRequirement.categoryTitle}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {selectedRequirement.description ||
                        "បញ្ជីឯកសារដែលត្រូវផ្តល់ជូនអាជ្ញាធរមានសមត្ថកិច្ច"}
                    </DialogDescription>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-foreground">
                      ការផ្ទៀងផ្ទាត់ឯកសារ ({completedCount}/{totalCount})
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        progressPercent === 100
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-primary",
                      )}
                    >
                      {progressPercent}% រួចរាល់
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300 rounded-full",
                        progressPercent === 100 ? "bg-emerald-500" : "bg-primary",
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </DialogHeader>

              {/* Modal Body / Scrollable Documents List */}
              <div className="overflow-y-auto px-6 py-4 space-y-3.5 flex-1 max-h-[60vh]">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    ឯកសារដែលត្រូវផ្តល់ ({selectedRequirement.documents.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAll(selectedRequirement)}
                    className="text-xs h-7 text-muted-foreground hover:text-foreground"
                  >
                    {completedCount === totalCount ? "ដោះធីកទាំងអស់" : "ធីកទាំងអស់"}
                  </Button>
                </div>

                {selectedRequirement.documents.map((doc, index) => {
                  const itemState = filingState[doc.id] || {
                    checked: false,
                    notes: "",
                  };

                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "rounded-xl border p-3.5 transition-all space-y-2.5",
                        itemState.checked
                          ? "bg-emerald-50/20 border-emerald-200 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                          : "bg-card border-border/80 hover:border-border",
                      )}
                    >
                      {/* Document Name + Checkbox */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`doc-${doc.id}`}
                          checked={itemState.checked}
                          onCheckedChange={() => toggleDocCheck(doc.id)}
                          className="mt-1 size-5 rounded-md"
                        />
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor={`doc-${doc.id}`}
                            className={cn(
                              "text-sm font-semibold cursor-pointer select-none leading-snug block",
                              itemState.checked
                                ? "text-emerald-900 dark:text-emerald-200 font-bold"
                                : "text-foreground",
                            )}
                          >
                            <span className="text-primary font-bold mr-1.5">
                              {index + 1}.
                            </span>
                            {doc.name}
                          </label>
                          {doc.note && (
                            <p className="text-xs text-muted-foreground pl-5">
                              {doc.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* File attachment & Notes Area */}
                      <div className="pl-8 pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[doc.id] = el;
                          }}
                          onChange={(e) => handleFileChange(doc.id, e)}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />

                        {/* File status / Attach button */}
                        {itemState.fileName ? (
                          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-800 dark:text-emerald-300">
                            <PaperclipIcon className="size-3.5 shrink-0" />
                            <span className="font-medium truncate max-w-[180px]">
                              {itemState.fileName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({itemState.fileSize})
                            </span>
                            <button
                              onClick={() => removeFile(doc.id)}
                              className="ml-1 text-muted-foreground hover:text-destructive"
                              title="ដកឯកសារចេញ"
                            >
                              <Trash2Icon className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fileInputRefs.current[doc.id]?.click()
                            }
                            className="h-7 text-[11px] gap-1.5 rounded-lg border-dashed text-muted-foreground hover:text-foreground"
                          >
                            <UploadCloudIcon className="size-3.5" />
                            ភ្ជាប់ឯកសារ (Attach file)
                          </Button>
                        )}

                        {/* Quick Notes Input */}
                        <Input
                          value={itemState.notes}
                          onChange={(e) =>
                            updateDocNotes(doc.id, e.target.value)
                          }
                          placeholder="កំណត់ចំណាំ ឬ លេខឯកសារ (ស្រេចចិត្ត)..."
                          className="h-7 text-xs rounded-lg flex-1 bg-background/50 text-foreground"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer / Action Buttons */}
              <DialogFooter className="mt-0 border-t bg-muted/20 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyChecklist(selectedRequirement)}
                    className="h-8 text-xs gap-1.5"
                  >
                    {copied ? (
                      <CheckIcon className="size-3.5 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                    {copied ? "បានចម្លងរួចរាល់" : "ចម្លងបញ្ជីឯកសារ"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="h-8 text-xs gap-1.5"
                  >
                    <PrinterIcon className="size-3.5" />
                    បោះពុម្ព
                  </Button>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 text-xs px-5"
                >
                  បិទ
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
