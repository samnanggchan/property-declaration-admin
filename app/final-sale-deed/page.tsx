import type { Metadata } from "next";
import { FinalSaleDeedForm } from "@/components/final-sale-deed-form";

export const metadata: Metadata = {
  title: "Final Sale Deed | ក្រដាសពុម្ពលេខ ៦",
  description: "ទម្រង់កិច្ចសន្យាទិញ-លក់ផ្តាច់អចលនវត្ថុផ្លូវការ (VENTE DEFINITIVE)",
};

export default function FinalSaleDeedPage() {
  return (
    <div className="p-4 print:p-0 print:m-0">
      <FinalSaleDeedForm />
    </div>
  );
}
