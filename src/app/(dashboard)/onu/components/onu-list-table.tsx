"use client";

import { useEffect, useState } from "react";
import { getAllOnuDetails } from "@/app/actions/telnet";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, SearchCode, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AttenuationInfoTable from "./attenuation-info-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OnuDetails } from "@/lib/type";

export const columns: ColumnDef<OnuDetails>[] = [
  {
    accessorKey: "slotPort",
    header: "Slot Port",
    meta: { width: "80px" },
    cell: ({ row }) => {
      return <span className="font-bold">{row.original.slotPort}</span>;
    },
  },
  {
    accessorKey: "onuId",
    header: "ONU ID",
    meta: { width: "60px" },
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    meta: { width: "80px" },
  },
  {
    accessorKey: "serial",
    header: "Serial Number",
    cell: ({ row }) => {
      return <Badge variant={"secondary"}>{row.original.serial}</Badge>;
    },
  },
  {
    accessorKey: "vlan",
    header: "VLAN",
    meta: { width: "60px" },
  },
  {
    accessorKey: "pppoeUser",
    header: "PPPoE User",
  },
  {
    accessorKey: "pppoePass",
    header: "PPPoE Password",
  },
  {
    accessorKey: "tcontProfile",
    header: "Profile",
    meta: { width: "80px" },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const onu = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex gap-4 items-center">
                    <SearchCode />
                    <span>Attenuation</span>
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>
                    Optical Power: gpon-olt_{onu.slotPort}:{onu.onuId}
                  </DialogTitle>
                </DialogHeader>
                <AttenuationInfoTable onuId={onu.onuId} slotPort={onu.slotPort} />
              </DialogContent>
            </Dialog>
            <DropdownMenuItem variant="destructive" onClick={() => { }}>
              <div className="flex gap-4 items-center">
                <Trash />
                <span>Delete</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function OnuListTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [onuDetails, setOnuDetails] = useState<OnuDetails[]>([]);

  useEffect(() => {
    initOnuDetails();
  }, []);

  async function initOnuDetails() {
    setIsLoading(true);
    try {
      const result = await getAllOnuDetails();
      setOnuDetails(result);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <Skeleton className="h-[500px] w-full rounded-lg" />;

  return (
    <Card>
      <CardContent>
        <DataTable columns={columns} data={onuDetails} title="Configured ONUs" />
      </CardContent>
    </Card>
  );
}
