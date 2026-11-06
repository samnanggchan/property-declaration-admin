import type { Metadata } from "next";
import { TransferApplicationForm } from "@/components/transfer-application-form";

export const metadata: Metadata = {
  title: "ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ | Transfer Application",
  description: "ទម្រង់ពាក្យសុំចុះបញ្ជីអំពីការផ្ទេរកម្មសិទ្ធិ (១-១០ នាក់)",
};

export default function TransferApplicationPage() {
  return (
    <div className="p-4 print:p-0 print:m-0">
      <TransferApplicationForm />
    </div>
  );
}

