"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OnuDetails } from "@/lib/type";
import { Badge } from "@/components/ui/badge";
import { OnuActions } from "./onu-actions";

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
            return <OnuActions onu={row.original} />;
        },
    },
];
