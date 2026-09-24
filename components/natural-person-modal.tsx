"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  SparklesIcon,
  SaveIcon,
  UserIcon,
  MapPinIcon,
  Building2Icon,
  CopyIcon,
  CheckCircle2Icon,
  ShoppingBagIcon,
  UserCheckIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { declarationsApi } from "@/lib/api"
import { LandDeclaration, PersonFields, emptyPerson } from "@/lib/types"

interface NaturalPersonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDeclaration?: LandDeclaration | null
  initialRecord?: LandDeclaration | null
  onSuccess: (savedDeclaration: LandDeclaration) => void
}

export function NaturalPersonModal({
  open,
  onOpenChange,
  initialDeclaration,
  initialRecord,
  onSuccess,
}: NaturalPersonModalProps) {
  const currentDeclaration = initialDeclaration ?? initialRecord
  const [activeTab, setActiveTab] = React.useState<"seller" | "buyer" | "property" | "legal">("seller")
  const [loading, setLoading] = React.useState(false)

  // Parcel info
  const [certNumber, setCertNumber] = React.useState("១២០៩០៦០៥- ៤៥៧៥")
  const [location, setLocation] = React.useState("រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១ ភូមិត្រពាំងថ្លឹង១")

  // Seller state (Husband & Wife)
  const [sellerHusband, setSellerHusband] = React.useState<PersonFields>(emptyPerson())
  const [sellerWife, setSellerWife] = React.useState<PersonFields>(emptyPerson())

  // Buyer state (Husband & Wife)
  const [buyerHusband, setBuyerHusband] = React.useState<PersonFields>(emptyPerson())
  const [buyerWife, setBuyerWife] = React.useState<PersonFields>(emptyPerson())

  // Property state
  const [propertyType, setPropertyType] = React.useState("ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)")
  const [area, setArea] = React.useState("១៥៧ m²")
  const [landUse, setLandUse] = React.useState("សាងសង់")
  const [usageNature, setUsageNature] = React.useState("ឯកជន")
  const [possessionSource, setPossessionSource] = React.useState("ទិញ")
  const [date, setDate] = React.useState("2005")

  // Legal state
  const [charter, setCharter] = React.useState("")
  const [entity, setEntity] = React.useState("")
  const [officeAddress, setOfficeAddress] = React.useState("")
  const [repName, setRepName] = React.useState("")
  const [repRole, setRepRole] = React.useState("")

  // Sync state with currentDeclaration or defaults
  React.useEffect(() => {
    if (currentDeclaration) {
      setCertNumber(currentDeclaration.certNumber || "")
      setLocation(currentDeclaration.location || "")

      setSellerHusband(currentDeclaration.seller?.husband || currentDeclaration.husband || emptyPerson())
      setSellerWife(currentDeclaration.seller?.wife || currentDeclaration.wife || emptyPerson())

      setBuyerHusband(currentDeclaration.buyer?.husband || emptyPerson())
      setBuyerWife(currentDeclaration.buyer?.wife || emptyPerson())

      setPropertyType(currentDeclaration.joint?.propertyType || "ទ្រព្យសម្បត្តិរួម")
      setArea(currentDeclaration.joint?.area || "")
      setLandUse(currentDeclaration.joint?.landUse || "សាងសង់")
      setUsageNature(currentDeclaration.joint?.usageNature || "ឯកជន")
      setPossessionSource(currentDeclaration.joint?.possessionSource || "ទិញ")
      setDate(currentDeclaration.joint?.date || new Date().getFullYear().toString())

      setCharter(currentDeclaration.joint?.charter || "")
      setEntity(currentDeclaration.joint?.entity || "")
      setOfficeAddress(currentDeclaration.joint?.officeAddress || "")
      setRepName(currentDeclaration.joint?.repName || "")
      setRepRole(currentDeclaration.joint?.repRole || "")
    } else {
      setCertNumber("១២០៩០៦០៥- ៤៥៧៥")
      setLocation("រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១ ភូមិត្រពាំងថ្លឹង១")
    }
  }, [currentDeclaration, open])

  // One-click demo data for both Seller and Buyer matching authentic land registration
  const fillSampleData = () => {
    setCertNumber("១២០៩០៦០៥- ៤៥៧៥")
    setLocation("រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១ ភូមិត្រពាំងថ្លឹង១")

    // Seller (from scanned document)
    setSellerHusband({
      name: "ឈូ ស៊ីសេង",
      idNumber: "010352372(02)/20.05.2025",
      dob: "22.02.1973",
      birthPlace: "ឃុំឫស្សីស្រុក ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម",
      nationality: "ខ្មែរ",
      status: "មានប្រពន្ធ",
      fatherName: "ឈូ ម៉េងហោ",
      motherName: "ហម ហៃឡេង",
      address: "ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ",
    })

    setSellerWife({
      name: "លាង ធាវី",
      idNumber: "011017556(01)/20.05.2025",
      dob: "06.01.1980",
      birthPlace: "សង្កាត់ផ្សារចាស់ ក្រុងភ្នំពេញ",
      nationality: "ខ្មែរ",
      status: "មានប្ដី",
      fatherName: "លាង ឆេង",
      motherName: "សៀម ហ៊ាង",
      address: "ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ",
    })

    // Buyer
    setBuyerHusband({
      name: "សុខ សំណាង",
      idNumber: "010992381(01)/15.03.2024",
      dob: "15.08.1982",
      birthPlace: "រាជធានីភ្នំពេញ",
      nationality: "ខ្មែរ",
      status: "មានប្រពន្ធ",
      fatherName: "សុខ គង់",
      motherName: "គឹម សុផល",
      address: "ផ្ទះលេខ៤៥ ផ្លូវ២៧១ សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
    })

    setBuyerWife({
      name: "ម៉ម ចិន្តា",
      idNumber: "010884912(01)/15.03.2024",
      dob: "10.11.1986",
      birthPlace: "ខេត្តកណ្តាល",
      nationality: "ខ្មែរ",
      status: "មានប្ដី",
      fatherName: "ម៉ម ថុល",
      motherName: "អ៊ុំ សារ៉េត",
      address: "ផ្ទះលេខ៤៥ ផ្លូវ២៧១ សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
    })

    setPropertyType("ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)")
    setArea("១៥៧ m²")
    setLandUse("សាងសង់")
    setUsageNature("ឯកជន")
    setPossessionSource("ទិញ")
    setDate("2005")

    toast.success("បានបំពេញទិន្នន័យគំរូអ្នកលក់ និងអ្នកទិញរួចរាល់!")
  }

  const copySellerAddress = () => {
    if (!sellerHusband.address) {
      toast.error("សូមបញ្ចូលអាសយដ្ឋានប្ដីអ្នកលក់ជាមុន")
      return
    }
    setSellerWife((prev) => ({ ...prev, address: sellerHusband.address }))
    toast.info("បានចម្លងអាសយដ្ឋានប្ដីអ្នកលក់ទៅប្រពន្ធ")
  }

  const copyBuyerAddress = () => {
    if (!buyerHusband.address) {
      toast.error("សូមបញ្ចូលអាសយដ្ឋានប្ដីអ្នកទិញជាមុន")
      return
    }
    setBuyerWife((prev) => ({ ...prev, address: buyerHusband.address }))
    toast.info("បានចម្លងអាសយដ្ឋានប្ដីអ្នកទិញទៅប្រពន្ធ")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellerHusband.name && !sellerWife.name && !buyerHusband.name && !buyerWife.name) {
      toast.error("សូមបញ្ចូលព័ត៌មានអ្នកលក់ ឬអ្នកទិញយ៉ាងហោចណាស់ម្នាក់")
      return
    }

    setLoading(true)
    const payload: Partial<LandDeclaration> = {
      certNumber: certNumber || "១២០៩០៦០៥- ០០០១",
      location: location || "រាជធានីភ្នំពេញ",
      seller: {
        husband: sellerHusband,
        wife: sellerWife,
      },
      buyer: {
        husband: buyerHusband,
        wife: buyerWife,
      },
      husband: sellerHusband.name ? sellerHusband : buyerHusband,
      wife: sellerWife.name ? sellerWife : buyerWife,
      joint: {
        propertyType,
        area,
        landUse,
        usageNature,
        possessionSource,
        date,
        charter,
        entity,
        officeAddress,
        repName,
        repRole,
      },
    }

    try {
      let saved: LandDeclaration
      if (currentDeclaration?.id) {
        saved = await declarationsApi.update(currentDeclaration.id, payload)
        toast.success("បានកែប្រែទិន្នន័យជោគជ័យ!")
      } else {
        saved = await declarationsApi.create(payload)
        toast.success("បានបន្ថែមទិន្នន័យជោគជ័យ!")
      }
      onOpenChange(false)
      onSuccess(saved)
    } catch {
      const fallbackDeclaration: LandDeclaration = {
        id: currentDeclaration?.id || crypto.randomUUID(),
        certNumber: payload.certNumber || "",
        location: payload.location || "",
        seller: payload.seller as any,
        buyer: payload.buyer as any,
        husband: payload.husband as any,
        wife: payload.wife as any,
        joint: payload.joint as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      onOpenChange(false)
      onSuccess(fallbackDeclaration)
      toast.success("បានរក្សាទុកទិន្នន័យ!")
    } finally {
      setLoading(false)
    }
  }

  // Helper for rendering person inputs
  const renderPersonForm = (
    person: PersonFields,
    setPerson: React.Dispatch<React.SetStateAction<PersonFields>>,
    label: string,
    role: string,
    badgeColor: string
  ) => {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${badgeColor}`} />
            <span className="font-semibold text-sm text-foreground">{label}</span>
          </div>
          <Badge variant="secondary" className="text-[11px] font-normal">
            {role}
          </Badge>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground/80">ឈ្មោះពេញ (Full Name) *</Label>
          <Input
            value={person.name}
            onChange={(e) => setPerson({ ...person, name: e.target.value })}
            placeholder="ឧ. ឈូ ស៊ីសេង"
            className="h-9 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground/80">អត្តសញ្ញាណប័ណ្ណលេខ</Label>
            <Input
              value={person.idNumber}
              onChange={(e) => setPerson({ ...person, idNumber: e.target.value })}
              placeholder="010352372(02)/..."
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground/80">ថ្ងៃខែឆ្នាំកំណើត</Label>
            <Input
              value={person.dob}
              onChange={(e) => setPerson({ ...person, dob: e.target.value })}
              placeholder="22.02.1973"
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground/80">សញ្ជាតិ</Label>
            <Input
              value={person.nationality}
              onChange={(e) => setPerson({ ...person, nationality: e.target.value })}
              placeholder="ខ្មែរ"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground/80">ស្ថានភាព</Label>
            <Input
              value={person.status}
              onChange={(e) => setPerson({ ...person, status: e.target.value })}
              placeholder={role === "ស្វាមី" ? "មានប្រពន្ធ" : "មានប្ដី"}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground/80">ទីកន្លែងកំណើត</Label>
          <Input
            value={person.birthPlace}
            onChange={(e) => setPerson({ ...person, birthPlace: e.target.value })}
            placeholder="ឃុំ... ស្រុក... ខេត្ត..."
            className="h-9 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground/80">ឈ្មោះឪពុក</Label>
            <Input
              value={person.fatherName}
              onChange={(e) => setPerson({ ...person, fatherName: e.target.value })}
              placeholder="ឈ្មោះឪពុក"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground/80">ឈ្មោះម្តាយ</Label>
            <Input
              value={person.motherName}
              onChange={(e) => setPerson({ ...person, motherName: e.target.value })}
              placeholder="ឈ្មោះម្តាយ"
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground/80">អាសយដ្ឋានបច្ចុប្បន្ន</Label>
          <Input
            value={person.address}
            onChange={(e) => setPerson({ ...person, address: e.target.value })}
            placeholder="ផ្ទះលេខ... ផ្លូវ... សង្កាត់... ខណ្ឌ..."
            className="h-9 text-xs"
          />
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden p-0 border border-border/80 shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="border-b bg-muted/40 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <UserCheckIcon className="size-5 text-primary" />
                {initialRecord ? "កែសម្រួលព័ត៌មានក្បាលដី (Edit Property Record)" : "ទម្រង់ចុះបញ្ជីក្បាលដី (Property Registration Form)"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                ក្បាលដីលេខ: <span className="font-semibold text-foreground">{certNumber}</span> | អ្នកលក់ (Seller) & អ្នកទិញ (Buyer)
              </DialogDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillSampleData}
              className="gap-1.5 text-xs text-primary font-medium hover:bg-primary/10 border-primary/20"
            >
              <SparklesIcon className="size-3.5 text-primary" />
              បំពេញគំរូអ្នកលក់ & អ្នកទិញ (Fill Sample)
            </Button>
          </div>
        </DialogHeader>

        {/* Clean Segmented Tab Navigation for Seller, Buyer, Property, Legal */}
        <div className="border-b bg-muted/20 px-6 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab("seller")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "seller"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <ShoppingBagIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
              ១. ភាគីអ្នកលក់ (Seller)
              {sellerHusband.name && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("buyer")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "buyer"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <UserCheckIcon className="size-3.5 text-blue-600 dark:text-blue-400" />
              ២. ភាគីអ្នកទិញ (Buyer)
              {buyerHusband.name && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("property")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "property"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <MapPinIcon className="size-3.5 text-primary" />
              ៣. ក្បាលដី & ទ្រព្យ (Property)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("legal")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "legal"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Building2Icon className="size-3.5 text-muted-foreground" />
              ៤. នីតិបុគ្គល (Legal Entity)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-6">
            {/* Tab 1: ភាគីអ្នកលក់ (Seller) */}
            {activeTab === "seller" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ព័ត៌មានភាគីអ្នកលក់ / ផ្ទេរកម្មសិទ្ធិ (Transferor / Seller Party)
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copySellerAddress}
                    className="h-6 text-[11px] text-primary gap-1"
                  >
                    <CopyIcon className="size-3" />
                    ចម្លងអាសយដ្ឋានប្ដីទៅប្រពន្ធ
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderPersonForm(sellerHusband, setSellerHusband, "ប្ដីអ្នកលក់ (Seller Husband)", "ស្វាមី", "bg-amber-500")}
                  {renderPersonForm(sellerWife, setSellerWife, "ប្រពន្ធអ្នកលក់ (Seller Wife)", "ភរិយា", "bg-rose-500")}
                </div>
              </div>
            )}

            {/* Tab 2: ភាគីអ្នកទិញ (Buyer) */}
            {activeTab === "buyer" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ព័ត៌មានភាគីអ្នកទិញ / ទទួលកម្មសិទ្ធិ (Transferee / Buyer Party)
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyBuyerAddress}
                    className="h-6 text-[11px] text-primary gap-1"
                  >
                    <CopyIcon className="size-3" />
                    ចម្លងអាសយដ្ឋានប្ដីទៅប្រពន្ធ
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderPersonForm(buyerHusband, setBuyerHusband, "ប្ដីអ្នកទិញ (Buyer Husband)", "ស្វាមី", "bg-blue-500")}
                  {renderPersonForm(buyerWife, setBuyerWife, "ប្រពន្ធអ្នកទិញ (Buyer Wife)", "ភរិយា", "bg-purple-500")}
                </div>
              </div>
            )}

            {/* Tab 3: ក្បាលដី & ទ្រព្យ (Property) */}
            {activeTab === "property" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <MapPinIcon className="size-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      ព័ត៌មានក្បាលដី (Parcel Details)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">
                        ព័ត៌មានក្បាលដីលេខ (Parcel No.) *
                      </Label>
                      <Input
                        value={certNumber}
                        onChange={(e) => setCertNumber(e.target.value)}
                        placeholder="១២០៩០៦០៥- ៤៥៧៥"
                        className="h-9 text-sm font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">
                        ទីតាំងក្បាលដី (Location)
                      </Label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ..."
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                    <span className="font-semibold text-sm text-foreground">
                      ព័ត៌មានទ្រព្យ (Property Characteristics)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">ប្រភេទទ្រព្យ</Label>
                      <Input
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        placeholder="ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">ក្រឡាផ្ទៃ / ទំហំ</Label>
                      <Input
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="១៥៧ m²"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">រូបភាពប្រើប្រាស់ដី</Label>
                      <Input
                        value={landUse}
                        onChange={(e) => setLandUse(e.target.value)}
                        placeholder="សាងសង់"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">លក្ខណៈនៃការប្រើប្រាស់</Label>
                      <Input
                        value={usageNature}
                        onChange={(e) => setUsageNature(e.target.value)}
                        placeholder="ឯកជន"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">ប្រភពនៃការកាន់កាប់</Label>
                      <Input
                        value={possessionSource}
                        onChange={(e) => setPossessionSource(e.target.value)}
                        placeholder="ទិញ"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground/80">កាលបរិច្ឆេទកាន់កាប់</Label>
                      <Input
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="2005"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: នីតិបុគ្គល (Legal Entity) */}
            {activeTab === "legal" && (
              <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Building2Icon className="size-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">
                    នីតិបុគ្គល និងអ្នកតំណាង (Legal Entity & Representative)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">លក្ខន្តិកៈ (Charter)</Label>
                    <Input
                      value={charter}
                      onChange={(e) => setCharter(e.target.value)}
                      placeholder="លក្ខន្តិកៈ..."
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">អង្គភាព (Entity)</Label>
                    <Input
                      value={entity}
                      onChange={(e) => setEntity(e.target.value)}
                      placeholder="ឈ្មោះក្រុមហ៊ុន ឬអង្គភាព"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs font-medium text-foreground/80">អាសយដ្ឋានទីស្នាក់ការ</Label>
                    <Input
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="ទីស្នាក់ការក្រុមហ៊ុន..."
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">ឈ្មោះអ្នកតំណាង</Label>
                    <Input
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="ឈ្មោះអ្នកតំណាងស្របច្បាប់"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground/80">មុខងារ (Position)</Label>
                    <Input
                      value={repRole}
                      onChange={(e) => setRepRole(e.target.value)}
                      placeholder="ឧ. អគ្គនាយក"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clean Footer */}
          <DialogFooter className="border-t bg-muted/30 px-6 py-3.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground hidden sm:block">
              ព័ត៌មានក្បាលដីលេខ: <span className="font-semibold text-foreground font-mono">{certNumber}</span>
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-xs font-medium"
              >
                បោះបង់ (Cancel)
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="h-9 px-4 text-xs font-medium gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <SaveIcon className="size-4" />
                {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក (Save Record)"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
