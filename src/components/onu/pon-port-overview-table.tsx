"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { toTitleCase } from "@/lib/utils";
import Link from "next/link";
import { PonPortOverview } from "@/lib/type";
import { Progress } from "@/components/ui/progress";

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
    header: "Registered",
    cell: ({ getValue }) => <div className="font-mono">{getValue() as number}</div>,
  },
  {
    accessorKey: "onu_online",
    header: "Online Utilization",
    cell: ({ row }) => {
      const online = row.original.onu_online;
      const total = row.original.onu_registered;
      const percentage = total > 0 ? (online / total) * 100 : 0;

      return (
        <div className="flex flex-col gap-1.5 w-[140px]">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{online} / {total} Online</span>
            <span className="text-muted-foreground">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      )
    },
    meta: { width: "150px" },
  },
  {
    accessorKey: "onu_offline",
    header: "Offline",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <div className={val > 0 ? "text-red-500 font-bold" : "text-muted-foreground"}>
          {val}
        </div>
      )
    }
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

interface PonPortOverviewTableProps {
  data: PonPortOverview[];
}

export default function PonPortOverviewTable({ data }: PonPortOverviewTableProps) {
  return (
    <Card>
      <CardContent>
        <DataTable columns={columns} data={data} title="PON PORT Overview" />
      </CardContent>
    </Card>
  );
}
