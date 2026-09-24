import { DataTable } from "@/components/data-table";
import data from "./data.json";

export default function RecordsPage() {
  return <DataTable data={data} />;
}
