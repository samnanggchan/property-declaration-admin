"use client"

import * as React from "react"
import { PrinterIcon, XIcon, PencilIcon, CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandDeclaration, PersonFields } from "@/lib/types"

interface OfficialDeclarationDocumentProps {
  declaration?: LandDeclaration
  record?: LandDeclaration
  onClose?: () => void
  onEdit?: (declaration: LandDeclaration) => void
}

export function OfficialDeclarationDocument({
  declaration,
  record,
  onClose,
  onEdit,
}: OfficialDeclarationDocumentProps) {
  const currentDoc = (declaration || record)!

  const handlePrint = () => {
    window.print()
  }

  // Parties data
  const sellerHusband = currentDoc.seller?.husband || currentDoc.husband
  const sellerWife = currentDoc.seller?.wife || currentDoc.wife
  const buyerHusband = currentDoc.buyer?.husband
  const buyerWife = currentDoc.buyer?.wife
  const hasBuyer = Boolean(buyerHusband?.name || buyerWife?.name)

  const renderPartyTable = (
    husband: PersonFields,
    wife: PersonFields,
    title: string,
    badgeText: string
  ) => {
    const isSameAddress =
      husband.address &&
      wife.address &&
      husband.address.trim() === wife.address.trim()

    return (
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between border-b border-neutral-900 pb-1">
          <h4 className="text-base font-bold text-neutral-900">
            {title}
          </h4>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            {badgeText}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-neutral-800 text-sm">
            <thead>
              <tr className="bg-neutral-100 text-center font-bold">
                <th className="w-[28%] border border-neutral-800 px-3 py-2 text-left">
                  ប្រភេទទិន្នន័យ
                </th>
                <th className="w-[36%] border border-neutral-800 px-3 py-2 text-center">
                  ប្ដី (Husband)
                </th>
                <th className="w-[36%] border border-neutral-800 px-3 py-2 text-center">
                  ប្រពន្ធ (Wife)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  អត្តសញ្ញាណប័ណ្ណ
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center font-mono text-xs">
                  {husband.idNumber || "—"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center font-mono text-xs">
                  {wife.idNumber || "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  ឈ្មោះ
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center font-bold">
                  {husband.name || "—"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center font-bold">
                  {wife.name || "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  ថ្ងៃ ខែ ឆ្នាំ កំណើត
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {husband.dob || "—"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {wife.dob || "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  ទីកន្លែងកំណើត
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {husband.birthPlace || "—"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {wife.birthPlace || "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  សញ្ជាតិ
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {husband.nationality || "ខ្មែរ"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {wife.nationality || "ខ្មែរ"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  ស្ថានភាព
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {husband.status || "មានប្រពន្ធ"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {wife.status || "មានប្ដី"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  ឈ្មោះឪពុក
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {husband.fatherName || "—"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {wife.fatherName || "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold">
                  ឈ្មោះម្តាយ
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {husband.motherName || "—"}
                </td>
                <td className="border border-neutral-800 px-3 py-1.5 text-center">
                  {wife.motherName || "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-800 px-3 py-1.5 font-semibold align-top">
                  អាសយដ្ឋាន
                </td>
                {isSameAddress ? (
                  <td
                    colSpan={2}
                    className="border border-neutral-800 px-3 py-1.5 text-center"
                  >
                    {husband.address}
                  </td>
                ) : (
                  <>
                    <td className="border border-neutral-800 px-3 py-1.5 text-center">
                      {husband.address || "—"}
                    </td>
                    <td className="border border-neutral-800 px-3 py-1.5 text-center">
                      {wife.address || "—"}
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top action bar - hidden during print */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <CheckCircle2Icon className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              លម្អិតឯកសារក្បាលដីលេខ: {currentDoc.certNumber || "—"}
            </h3>
            <p className="text-xs text-muted-foreground">
              អ្នកលក់: {sellerHusband?.name || sellerWife?.name || "—"} | អ្នកទិញ:{" "}
              {buyerHusband?.name || buyerWife?.name || "មិនទាន់មាន"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(currentDoc)}
              className="gap-1.5"
            >
              <PencilIcon className="size-4" />
              កែសម្រួល (Edit)
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-primary text-primary-foreground shadow-sm"
          >
            <PrinterIcon className="size-4" />
            បោះពុម្ព (Print)
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Printable Official Document Layout */}
      <div
        id="printable-document"
        className="mx-auto w-full max-w-[850px] rounded-lg border bg-white p-8 text-neutral-900 shadow-sm print:m-0 print:max-w-none print:border-none print:p-0 print:shadow-none font-serif"
      >
        {/* Kingdom of Cambodia Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-wide">
            ព្រះរាជាណាចក្រកម្ពុជា
          </h2>
          <h3 className="text-lg font-bold tracking-wider">
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </h3>
          <div className="mx-auto my-2 flex w-32 items-center justify-center">
            <span className="h-[1.5px] w-full bg-neutral-800" />
            <span className="mx-1 text-xs">❖</span>
            <span className="h-[1.5px] w-full bg-neutral-800" />
          </div>
        </div>

        {/* Parcel Information */}
        <div className="mb-5 text-center">
          <p className="text-base font-bold">
            ព័ត៌មានក្បាលដីលេខ:{" "}
            <span className="font-semibold underline decoration-neutral-400 underline-offset-4">
              {currentDoc.certNumber || "......................................."}
            </span>
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-800">
            {currentDoc.location || "...................................................................................................."}
          </p>
        </div>

        {/* Section 1: ភាគីអ្នកលក់ (Seller) */}
        {renderPartyTable(
          sellerHusband,
          sellerWife,
          "១. រូបវន្តបុគ្គល - ភាគីអ្នកលក់ (Seller / Transferor)",
          "អ្នកលក់"
        )}

        {/* Section 2: ភាគីអ្នកទិញ (Buyer) if filled */}
        {hasBuyer &&
          renderPartyTable(
            buyerHusband!,
            buyerWife!,
            "២. រូបវន្តបុគ្គល - ភាគីអ្នកទិញ (Buyer / Transferee)",
            "អ្នកទិញ"
          )}

        {/* Section 3: Property Details (ទ្រព្យសម្បត្តិ) */}
        <div className="mb-4 border-t border-neutral-300 pt-3">
          <h5 className="mb-2 text-sm font-bold text-neutral-900">
            ព័ត៌មានទ្រព្យ (Property Characteristics)
          </h5>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">ប្រភេទទ្រព្យ:</span>
              <span className="font-medium">{currentDoc.joint.propertyType || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">ក្រឡាផ្ទៃ:</span>
              <span className="font-medium">{currentDoc.joint.area || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">រូបភាពប្រើប្រាស់ដី:</span>
              <span className="font-medium">{currentDoc.joint.landUse || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">លក្ខណៈនៃការប្រើប្រាស់:</span>
              <span className="font-medium">{currentDoc.joint.usageNature || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">ប្រភពនៃការកាន់កាប់:</span>
              <span className="font-medium">{currentDoc.joint.possessionSource || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">កាលបរិច្ឆេទ:</span>
              <span className="font-medium">{currentDoc.joint.date || "—"}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Legal Entity (នីតិបុគ្គល) */}
        <div className="mb-6 border-t border-neutral-300 pt-3">
          <h5 className="mb-2 text-center text-sm font-bold">នីតិបុគ្គល</h5>
          <div className="grid grid-cols-3 gap-2 text-xs text-neutral-700">
            <div>
              <span className="font-semibold">លក្ខន្តិកៈ:</span>{" "}
              {currentDoc.joint.charter || "..................."}
            </div>
            <div>
              <span className="font-semibold">អង្គភាព:</span>{" "}
              {currentDoc.joint.entity || "..................."}
            </div>
            <div>
              <span className="font-semibold">អាសយដ្ឋាន (ទីស្នាក់ការ):</span>{" "}
              {currentDoc.joint.officeAddress || "..................."}
            </div>
          </div>
          <div className="mt-2 text-center text-xs">
            <span className="font-bold">អ្នកតំណាង ឬអ្នកគ្រប់គ្រង:</span>{" "}
            {currentDoc.joint.repName
              ? `${currentDoc.joint.repName} (${currentDoc.joint.repRole || ""})`
              : "ឈ្មោះអ្នកតំណាង .................................... មុខងារ ...................................."}
          </div>
        </div>

        {/* Footer / Official Signatures & Stamps matching scanned document */}
        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-neutral-600">
              រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០......
            </p>
            <p className="mt-1 font-bold text-neutral-900">
              ប្រធានការិយាល័យរៀបចំដែនដី នគរូបនីយកម្ម
              <br />
              សំណង់ និងភូមិបាល
            </p>
            <div className="mt-16 flex items-center justify-center">
              <span className="border-b border-neutral-400 px-12 py-1 italic text-neutral-400">
                (ហត្ថលេខា និងត្រា)
              </span>
            </div>
          </div>

          <div>
            <p className="text-neutral-600">
              រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០......
            </p>
            <p className="mt-1 font-bold text-neutral-900">
              មន្ត្រីអនុវត្តវាស់វែង និងវិនិច្ឆ័យ
            </p>
            <div className="mt-16 flex items-center justify-center">
              <span className="border-b border-neutral-400 px-12 py-1 italic text-neutral-400">
                (ហត្ថលេខា)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compatibility export
export const OfficialRecordDocument = OfficialDeclarationDocument
