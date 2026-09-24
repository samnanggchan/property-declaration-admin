"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  PlusIcon,
  Columns3Icon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  PrinterIcon,
  PencilIcon,
  Trash2Icon,
  CopyIcon,
  GripVerticalIcon,
  SearchIcon,
  EyeIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { NaturalPersonModal } from "@/components/natural-person-modal"
import { OfficialDeclarationDocument } from "@/components/official-declaration-document"
import { declarationsApi } from "@/lib/api"
import { LandDeclaration } from "@/lib/types"

export function DeclarationsView() {
  const [declarations, setDeclarations] = React.useState<LandDeclaration[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Modal & Detail states (HIDDEN BY DEFAULT until user clicks detail one by one)
  const [selectedDeclaration, setSelectedDeclaration] = React.useState<LandDeclaration | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingDeclaration, setEditingDeclaration] = React.useState<LandDeclaration | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Load declarations from API
  const loadDeclarations = React.useCallback(async () => {
    try {
      const data = await declarationsApi.list()
      setDeclarations(data)
    } catch {
      toast.error("មិនអាចទាញយកទិន្នន័យបានទេ")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDeclarations()
  }, [loadDeclarations])

  // Filter declarations by search query
  const filteredDeclarations = React.useMemo(() => {
    return declarations.filter((r) => {
      const query = searchQuery.toLowerCase().trim()
      if (!query) return true

      const sellerH = r.seller?.husband?.name?.toLowerCase() || r.husband?.name?.toLowerCase() || ""
      const sellerW = r.seller?.wife?.name?.toLowerCase() || r.wife?.name?.toLowerCase() || ""
      const buyerH = r.buyer?.husband?.name?.toLowerCase() || ""
      const buyerW = r.buyer?.wife?.name?.toLowerCase() || ""
      const cert = r.certNumber?.toLowerCase() || ""
      const loc = r.location?.toLowerCase() || ""

      return (
        sellerH.includes(query) ||
        sellerW.includes(query) ||
        buyerH.includes(query) ||
        buyerW.includes(query) ||
        cert.includes(query) ||
        loc.includes(query)
      )
    })
  }, [declarations, searchQuery])

  // Handlers
  const handleAddNew = () => {
    setEditingDeclaration(null)
    setModalOpen(true)
  }

  const handleEdit = (declaration: LandDeclaration) => {
    setEditingDeclaration(declaration)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) return
    try {
      await declarationsApi.remove(id)
      setDeclarations((prev) => prev.filter((r) => r.id !== id))
      if (selectedDeclaration?.id === id) {
        setSelectedDeclaration(null)
      }
      toast.success("បានលុបទិន្នន័យជោគជ័យ")
    } catch {
      toast.error("មានបញ្ហាក្នុងការលុបទិន្នន័យ")
    }
  }

  const handleDuplicate = async (declaration: LandDeclaration) => {
    try {
      const copy = await declarationsApi.create()
      const updated = await declarationsApi.update(copy.id, {
        ...declaration,
        certNumber: `${declaration.certNumber} (Copy)`,
      })
      setDeclarations((prev) => [updated, ...prev])
      toast.success("បានចម្លងទិន្នន័យជោគជ័យ")
    } catch {
      toast.error("មានបញ្ហាក្នុងការចម្លងទិន្នន័យ")
    }
  }

  const handleSuccess = (saved: LandDeclaration) => {
    setDeclarations((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setSelectedDeclaration(saved)
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredDeclarations.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              ចុះបញ្ជីក្បាលដី
            </h2>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
              {filteredDeclarations.length} ឯកសារ
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Land Declarations — ព័ត៌មានក្បាលដី និងរូបវន្តបុគ្គល: ភាគីអ្នកលក់ (Seller) & ភាគីអ្នកទិញ (Buyer)
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="ស្វែងរកក្បាលដី ឬឈ្មោះ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" />}
            >
              <Columns3Icon className="size-3.5" />
              Columns
              <ChevronDownIcon className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuItem>ក្បាលដីលេខ</DropdownMenuItem>
              <DropdownMenuItem>ភាគីអ្នកលក់ (Seller)</DropdownMenuItem>
              <DropdownMenuItem>ភាគីអ្នកទិញ (Buyer)</DropdownMenuItem>
              <DropdownMenuItem>ស្ថានភាព</DropdownMenuItem>
              <DropdownMenuItem>ក្រឡាផ្ទៃ</DropdownMenuItem>
              <DropdownMenuItem>កាលបរិច្ឆេទ</DropdownMenuItem>
              <DropdownMenuItem>ទីតាំងក្បាលដី</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="default"
            size="sm"
            onClick={handleAddNew}
            className="h-9 gap-1.5 bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:bg-primary/90"
          >
            <PlusIcon className="size-4" />
            <span>ចុះបញ្ជីក្បាលដីថ្មី (New Declaration)</span>
          </Button>
        </div>
      </div>

      {/* Main Declarations Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      filteredDeclarations.length > 0 &&
                      selectedIds.length === filteredDeclarations.length
                    }
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[180px]">
                ព័ត៌មានក្បាលដីលេខ (Parcel No.)
              </TableHead>
              <TableHead className="min-w-[180px]">
                ភាគីអ្នកលក់ (Seller Party)
              </TableHead>
              <TableHead className="min-w-[180px]">
                ភាគីអ្នកទិញ (Buyer Party)
              </TableHead>
              <TableHead>ស្ថានភាព (Status)</TableHead>
              <TableHead className="text-right">ក្រឡាផ្ទៃ (Area)</TableHead>
              <TableHead className="text-right">កាលបរិច្ឆេទ (Date)</TableHead>
              <TableHead>ទីតាំង (Location)</TableHead>
              <TableHead className="w-16 text-right">សកម្មភាព</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-28 text-center text-sm text-muted-foreground">
                  កំពុងផ្ទុកទិន្នន័យ...
                </TableCell>
              </TableRow>
            ) : filteredDeclarations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  <p>មិនទាន់មានទិន្នន័យក្បាលដីនៅឡើយទេ។</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddNew}
                    className="mt-3 gap-1.5 text-xs text-primary"
                  >
                    <PlusIcon className="size-3.5" />
                    ចុចទីនេះដើម្បីបន្ថែមទិន្នន័យថ្មី
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredDeclarations.map((r) => {
                const isChecked = selectedIds.includes(r.id)

                // Seller names
                const sellerH = r.seller?.husband?.name || r.husband?.name || ""
                const sellerW = r.seller?.wife?.name || r.wife?.name || ""
                const sellerTitle =
                  sellerH && sellerW
                    ? `${sellerH} & ${sellerW}`
                    : sellerH || sellerW || "មិនទាន់មាន"

                // Buyer names
                const buyerH = r.buyer?.husband?.name || ""
                const buyerW = r.buyer?.wife?.name || ""
                const buyerTitle =
                  buyerH && buyerW
                    ? `${buyerH} & ${buyerW}`
                    : buyerH || buyerW || "មិនទាន់មាន"

                return (
                  <TableRow
                    key={r.id}
                    data-state={isChecked ? "selected" : undefined}
                    className="cursor-pointer transition-colors hover:bg-muted/50 group"
                    onClick={() => setSelectedDeclaration(r)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <GripVerticalIcon className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleSelectOne(r.id)}
                          aria-label={`Select parcel ${r.certNumber}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm text-foreground font-mono group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {r.certNumber || "—"}
                          <EyeIcon className="size-3.5 opacity-0 group-hover:opacity-70 transition-opacity text-primary" />
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {r.joint?.propertyType || "ទ្រព្យសម្បត្តិរួម"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Seller Party Cell */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        >
                          អ្នកលក់
                        </Badge>
                        <span className="text-xs font-medium text-foreground">
                          {sellerTitle}
                        </span>
                      </div>
                    </TableCell>

                    {/* Buyer Party Cell */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                        >
                          អ្នកទិញ
                        </Badge>
                        <span className="text-xs font-medium text-foreground">
                          {buyerTitle}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1.5 px-2 py-0.5 text-xs font-normal text-muted-foreground bg-emerald-500/5 border-emerald-500/20"
                      >
                        <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                        រួចរាល់ (Done)
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm">
                      {r.joint?.area || "—"}
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {r.joint?.date || new Date(r.updatedAt).getFullYear()}
                    </TableCell>

                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {r.location || "—"}
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <EllipsisVerticalIcon className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 text-xs shadow-lg">
                          <DropdownMenuItem
                            onClick={() => setSelectedDeclaration(r)}
                            className="gap-2 font-medium"
                          >
                            <FileTextIcon className="size-4 text-primary" />
                            មើលឯកសារលម្អិត (View Detail)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDeclaration(r)
                              setTimeout(() => window.print(), 350)
                            }}
                            className="gap-2"
                          >
                            <PrinterIcon className="size-4" />
                            បោះពុម្ពឯកសារ (Print)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(r)}
                            className="gap-2"
                          >
                            <PencilIcon className="size-4" />
                            កែសម្រួល (Edit)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(r)}
                            className="gap-2"
                          >
                            <CopyIcon className="size-4" />
                            ចម្លង (Duplicate)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(r.id)}
                            className="gap-2 text-destructive"
                          >
                            <Trash2Icon className="size-4" />
                            លុប (Delete)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-4">
        <div>
          ជ្រើសរើសបាន {selectedIds.length} នៃ {filteredDeclarations.length} ជួរដេក
        </div>
        <div>
          ចុចលើជួរដេកណាមួយដើម្បីមើលឯកសារផ្លូវការ និងបោះពុម្ព
        </div>
      </div>

      {/* One-by-One Detail View Dialog */}
      <Dialog
        open={!!selectedDeclaration}
        onOpenChange={(open) => {
          if (!open) setSelectedDeclaration(null)
        }}
      >
        <DialogContent className="max-h-[94vh] max-w-5xl overflow-y-auto p-4 sm:p-6 border border-border/80 shadow-2xl rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>
              ឯកសារក្បាលដីលេខ: {selectedDeclaration?.certNumber}
            </DialogTitle>
            <DialogDescription>
              ព័ត៌មានលម្អិតអ្នកលក់ និងអ្នកទិញ
            </DialogDescription>
          </DialogHeader>

          {selectedDeclaration && (
            <OfficialDeclarationDocument
              declaration={selectedDeclaration}
              onClose={() => setSelectedDeclaration(null)}
              onEdit={handleEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Clean Modal Popup for Adding/Editing Parcel Declarations with Seller & Buyer */}
      <NaturalPersonModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialDeclaration={editingDeclaration}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
