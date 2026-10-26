import type { Metadata } from "next";
import { InheritanceRequestForm } from "@/components/inheritance-request-form";

export const metadata: Metadata = {
  title: "ពាក្យស្នើសុំផ្ទេរសិទ្ធិកាន់កាប់អចលនវត្ថុជាមរតក",
  description: "ទម្រង់ពាក្យស្នើសុំផ្ទេរសិទ្ធិកាន់កាប់អចលនវត្ថុជាមរតក",
};

export default function InheritanceRequestPage() {
  return (
    <div className="p-4 print:p-0 print:m-0">
      <InheritanceRequestForm />
    </div>
  );
}
