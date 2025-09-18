"use client";

import { getPonPortOverview } from "@/app/actions/telnet";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { toTitleCase } from "@/lib/utils";

export const columns: ColumnDef<PonPortOverview>[] = [
  {
    accessorKey: "port_id",
    header: "Slot Port",
    meta: { width: "80px" },
  },
  {
    accessorKey: "onu_registered",
    header: "Registered ONU",
  },
  {
    accessorKey: "onu_online",
    header: "ONU Online",
    meta: { width: "80px" },
  },
  {
    accessorKey: "onu_offline",
    header: "ONU Offline",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const val = getValue() as string;
      return <span>{toTitleCase(val)}</span>;
    },
    meta: { width: "60px" },
  },
];

export default function PonPortOverviewTable() {
  const [ponPortOverviews, setPonPortOverviews] = useState<PonPortOverview[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    initPonPortOverview();
  }, []);

  async function initPonPortOverview() {
    try {
      setTableLoading(true);
      const data = await getPonPortOverview();

      setPonPortOverviews(data);
    } catch (e) {
      console.log(e);
    } finally {
      setTableLoading(false);
    }
  }

  if (tableLoading) return <div>Loading...</div>;

  return (
    <Card className="w-[600px]">
      <CardContent>
        <DataTable columns={columns} data={ponPortOverviews} title="PON PORT Overview" />
      </CardContent>
    </Card>
  );
}
