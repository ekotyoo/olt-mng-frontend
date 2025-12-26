import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { OnuDetails } from "@/lib/type";
import { columns } from "./onu-columns";

export default function OnuListTable({ onuDetails }: { onuDetails: OnuDetails[] }) {
  return (
    <Card>
      <CardContent>
        <DataTable columns={columns} data={onuDetails} title="Configured ONUs" />
      </CardContent>
    </Card>
  );
}
