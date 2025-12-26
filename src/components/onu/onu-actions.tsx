"use client";

import { useState } from "react";
import React from "react";
import { OnuDetails } from "@/lib/type";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, SearchCode, Trash, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOnuAction, rebootOnuAction } from "@/app/actions/onu";
import AttenuationInfoTable from "./attenuation-info-table";

interface OnuActionsProps {
    onu: OnuDetails;
}

export function OnuActions({ onu }: OnuActionsProps) {
    const [openDelete, setOpenDelete] = useState(false);
    const [openReboot, setOpenReboot] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        try {
            setLoading(true);
            await deleteOnuAction(onu.onuId, onu.slotPort, onu.serial);
            toast.success("ONU deleted successfully");
            setOpenDelete(false);
            // Optional: refresh page or trigger re-fetch
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete ONU");
        } finally {
            setLoading(false);
        }
    }

    async function handleReboot() {
        try {
            setLoading(true);
            await rebootOnuAction(onu.onuId, onu.slotPort, onu.serial);
            toast.success("ONU reboot command sent");
            setOpenReboot(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to reboot ONU");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
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
                                    <SearchCode size={16} />
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

                    <DropdownMenuItem onClick={() => setOpenReboot(true)}>
                        <div className="flex gap-4 items-center">
                            <RefreshCw size={16} />
                            <span>Reboot</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setOpenDelete(true)}
                    >
                        <div className="flex gap-4 items-center">
                            <Trash size={16} />
                            <span>Delete</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the ONU configuration
                            (SN: {onu.serial}) from the OLT and remove it from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={openReboot} onOpenChange={setOpenReboot}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reboot ONU?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restart the ONU device (SN: {onu.serial}). Service interruption may occur.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleReboot();
                            }}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reboot
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
