"use client";

import { getPonPortOverview } from "@/app/actions/onu";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { toTitleCase } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { PonPortOverview } from "@/lib/type";

const cellValueToUrl = (val: string) => val; // Placeholder if simpler needed

function getStatusColor(value: string | null) {
  if (value === null || value === "down") return "bg-red-500";
  if (value === "partial") return "bg-yellow-500";
  if (value === "healthy") return "bg-green-500";

  return "bg-gray-400";
}

export const columns: ColumnDef<PonPortOverview>[] = [
  {
    accessorKey: "port_id",
    header: "Slot Port",
    meta: { width: "80px" },
    cell: ({ row }) => {
      const portId = row.original.port_id;
      return (
        <Link href={`/pon-ports/${encodeURIComponent(cellValueToUrl(portId))}`} className="font-bold hover:underline">
          {portId}
        </Link>
      );
    },
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
      return (
        <div className="flex items-center gap-2">
          <div className={`inline-block h-3 w-3 rounded-full ${getStatusColor(val)}`} />
          {toTitleCase(val)}
        </div>
      );
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

  if (tableLoading) return <Skeleton className="h-[300px] w-full rounded-lg" />;

  return (
    <Card>
      <CardContent>
        <DataTable columns={columns} data={ponPortOverviews} title="PON PORT Overview" />
      </CardContent>
    </Card>
  );
}
