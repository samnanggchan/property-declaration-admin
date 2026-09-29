"use client"

import { PrinterIcon, XIcon, PencilIcon, CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  LandDeclaration,
  PersonFields,
  emptyWitnessPerson,
  emptyPerson,
  emptyJoint,
} from "@/lib/types"
import { calculateAgeFromDob } from "@/lib/utils"

interface OfficialDeclarationDocumentProps {
  declaration?: LandDeclaration
  record?: LandDeclaration
  onClose?: () => void
  onEdit?: (declaration: LandDeclaration) => void
  onSwitchToCertificate?: () => void
}

export function OfficialDeclarationDocument({
  declaration,
  record,
  onClose,
  onEdit,
  onSwitchToCertificate,
}: OfficialDeclarationDocumentProps) {
  const currentDoc = declaration || record

  const handlePrint = () => {
    window.print()
  }

  if (!currentDoc) {
    return null
  }

  const joint = currentDoc.joint || emptyJoint()

  // Parties data with clean fallbacks
  const sellerHusband = currentDoc.seller?.husband || currentDoc.husband || emptyPerson()
  const sellerWife = currentDoc.seller?.wife || currentDoc.wife || emptyPerson()
  const buyerHusband = currentDoc.buyer?.husband || emptyPerson()
  const buyerWife = currentDoc.buyer?.wife || emptyPerson()
  const hasBuyer = Boolean(buyerHusband.name || buyerWife.name)

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
          {onSwitchToCertificate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToCertificate}
              className="gap-1.5 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 text-xs"
            >
              តារាងសម្រង់វិញ្ញាបនប័ត្រ (Extract Table)
            </Button>
          )}
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
            buyerHusband,
            buyerWife,
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
              <span className="font-medium">{joint.propertyType || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">ក្រឡាផ្ទៃ:</span>
              <span className="font-medium">{joint.area || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">រូបភាពប្រើប្រាស់ដី:</span>
              <span className="font-medium">{joint.landUse || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">លក្ខណៈនៃការប្រើប្រាស់:</span>
              <span className="font-medium">{joint.usageNature || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">ប្រភពនៃការកាន់កាប់:</span>
              <span className="font-medium">{joint.possessionSource || "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-neutral-400 pb-1">
              <span className="font-semibold text-neutral-800">កាលបរិច្ឆេទ:</span>
              <span className="font-medium">{joint.date || "—"}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Legal Entity (នីតិបុគ្គល) */}
        <div className="mb-6 border-t border-neutral-300 pt-3">
          <h5 className="mb-2 text-center text-sm font-bold">នីតិបុគ្គល</h5>
          <div className="grid grid-cols-3 gap-2 text-xs text-neutral-700">
            <div>
              <span className="font-semibold">លក្ខន្តិកៈ:</span>{" "}
              {joint.charter || "..................."}
            </div>
            <div>
              <span className="font-semibold">អង្គភាព:</span>{" "}
              {joint.entity || "..................."}
            </div>
            <div>
              <span className="font-semibold">អាសយដ្ឋាន (ទីស្នាក់ការ):</span>{" "}
              {joint.officeAddress || "..................."}
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-neutral-800">
            <span className="font-bold">អ្នកតំណាង ឬអ្នកគ្រប់គ្រង:</span>{" "}
            {joint.repName
              ? `${joint.repName}${joint.repRole ? ` (${joint.repRole})` : ""}`
              : "ឈ្មោះអ្នកតំណាង .................................... មុខងារ ...................................."}
          </div>

          {/* 1-Person Table for Company Representative (អ្នកតំណាង ឬអ្នកគ្រប់គ្រង) matching Image 2 */}
          {(() => {
            const rep = joint.repPerson || joint.representativePerson || emptyPerson()
            const hasRep = Boolean(
              rep.name || joint.repName || rep.idNumber || rep.dob || rep.address || joint.entity || joint.charter
            )

            if (!hasRep) return null

            return (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse border-2 border-neutral-800 text-sm">
                  <thead>
                    <tr className="bg-neutral-100 text-center font-bold">
                      <th className="w-[30%] border border-neutral-800 px-3 py-1.5 text-left">
                        ប្រភេទទិន្នន័យ
                      </th>
                      <th className="w-[70%] border border-neutral-800 px-3 py-1.5 text-center">
                        អ្នកតំណាង ឬអ្នកគ្រប់គ្រង{joint.repRole ? ` (${joint.repRole})` : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        អត្តសញ្ញាណប័ណ្ណ
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center font-mono text-xs">
                        {rep.idNumber || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        ឈ្មោះ
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center font-bold">
                        {rep.name || joint.repName || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        ថ្ងៃ ខែ ឆ្នាំ កំណើត
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.dob || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        ទីកន្លែងកំណើត
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.birthPlace || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        សញ្ជាតិ
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.nationality || "ខ្មែរ"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        ស្ថានភាព
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.status || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        ឈ្មោះឪពុក
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.fatherName || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold">
                        ឈ្មោះម្តាយ
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.motherName || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-800 px-3 py-1 font-semibold align-top">
                        អាសយដ្ឋាន
                      </td>
                      <td className="border border-neutral-800 px-3 py-1 text-center">
                        {rep.address || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>

        {/* Witnesses Block (សាក្សី - ២ នាក់) matching authentic document scan & Image 2 */}
        {(() => {
          const w1 = joint.witness1 || joint.witnesses?.[0] || joint.rep1 || joint.representatives?.[0] || emptyWitnessPerson()
          const w2 = joint.witness2 || joint.witnesses?.[1] || joint.rep2 || joint.representatives?.[1] || emptyWitnessPerson()
          
          const age1 = calculateAgeFromDob(w1.dob) || "............."
          const age2 = calculateAgeFromDob(w2.dob) || "............."

          return (
            <div className="mt-4 border-t border-neutral-300 pt-3 text-xs text-neutral-800">
              <p className="mb-2 text-center font-bold">
                បានអានសេចក្តីនៃលិខិតនេះឱ្យគូភាគីស្តាប់ចំពោះមុខ
              </p>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold">សាក្សី  ឈ្មោះ:</span>
                  <span className="font-bold text-neutral-900 border-b border-dotted border-neutral-400 min-w-28 inline-block">
                    {w1.name || "...................................."}
                  </span>
                  <span className="font-medium">អាយុ/ថ្ងៃកំណើត:</span>
                  <span className="border-b border-dotted border-neutral-400 min-w-16 inline-block text-center font-semibold text-neutral-900">
                    {age1}
                  </span>
                  <span className="font-medium">ទីលំនៅ:</span>
                  <span className="border-b border-dotted border-neutral-400 flex-1 min-w-48 inline-block">
                    {w1.address || "......................................................."}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-2 pl-6 sm:pl-10">
                  <span className="font-bold">ឈ្មោះ:</span>
                  <span className="font-bold text-neutral-900 border-b border-dotted border-neutral-400 min-w-28 inline-block">
                    {w2.name || "...................................."}
                  </span>
                  <span className="font-medium">អាយុ/ថ្ងៃកំណើត:</span>
                  <span className="border-b border-dotted border-neutral-400 min-w-16 inline-block text-center font-semibold text-neutral-900">
                    {age2}
                  </span>
                  <span className="font-medium">ទីលំនៅ:</span>
                  <span className="border-b border-dotted border-neutral-400 flex-1 min-w-48 inline-block">
                    {w2.address || "......................................................."}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-700">
                  <div className="space-y-0.5">
                    {w1.idNumber && (
                      <div>
                        <span className="font-semibold">អត្ត:</span>{" "}
                        <span className="font-mono text-neutral-900">{w1.idNumber}</span>
                      </div>
                    )}
                    {w2.idNumber && (
                      <div>
                        <span className="font-semibold">អត្ត:</span>{" "}
                        <span className="font-mono text-neutral-900">{w2.idNumber}</span>
                      </div>
                    )}
                    {!w1.idNumber && !w2.idNumber && (
                      <div>
                        <span className="font-semibold">អត្ត:</span> ....................................................
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">បញ្ជាក់ចុះលេខ...</span>{" "}
                    <span className="border-b border-dotted border-neutral-400 px-3 font-semibold text-neutral-900">
                      {currentDoc.certNumber ? currentDoc.certNumber.split("-")[1]?.trim() || "៤៥៧៥" : "៤៥៧៥"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

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
