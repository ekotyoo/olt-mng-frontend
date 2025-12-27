"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Activity, Radio, Wifi, Loader2 } from "lucide-react";
import { getAttenuationInfo } from "@/app/actions/onu";
import { AttenuationInfo } from "@/lib/type";

interface SignalCheckPopoverProps {
    onuId: string;
    slotPort: string;
}

function getSignalStatus(dbm: number) {
    if (dbm > -8) return { label: "Excellent", color: "text-green-500", dot: "bg-green-500" };
    if (dbm > -25) return { label: "Good", color: "text-green-500", dot: "bg-green-500" };
    if (dbm > -28) return { label: "Warning", color: "text-yellow-500", dot: "bg-yellow-500" };
    return { label: "Extremely Low", color: "text-red-500", dot: "bg-red-500" }; // < -28
}

export default function SignalCheckPopover({ onuId, slotPort }: SignalCheckPopoverProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AttenuationInfo | null>(null);

    async function loadData() {
        if (loading) return;
        setLoading(true);
        try {
            const res = await getAttenuationInfo({ onuId, slotPort });
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function onOpenChange(isOpen: boolean) {
        setOpen(isOpen);
        if (isOpen && !data) {
            loadData();
        }
    }

    // Extract key metrics
    const downstream = data?.find(d => d.direction === "down"); // OLT -> ONU (Rx at ONU)
    const upstream = data?.find(d => d.direction === "up"); // ONU -> OLT (Rx at OLT)

    // OLT Tx / ONU Rx pair (Downstream path)
    // ONU Tx / OLT Rx pair (Upstream path)

    // Usually "Signal Strength" refers to what is RECEIVED.
    // Downstream Rx (At ONU): most critical for user experience.
    const dsRx = downstream?.rx ?? -99;
    const usRx = upstream?.rx ?? -99;

    const dsStatus = getSignalStatus(dsRx);
    const usStatus = getSignalStatus(usRx);

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-primary">
                    <Activity className="h-4 w-4" />
                    <span className="sr-only">Check Signal</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-medium leading-none">Optical Signal Health</h4>
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        {!loading && data && <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setData(null); loadData(); }}>Refresh</Button>}
                    </div>

                    {loading && !data && (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Measuring functionality...</span>
                        </div>
                    )}

                    {!loading && data && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 border">
                                <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                    <Wifi className="h-3 w-3" /> Downstream
                                </span>
                                <div className={`text-2xl font-bold ${dsStatus.color}`}>{dsRx} <span className="text-xs text-muted-foreground font-normal">dBm</span></div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={`h-2 w-2 rounded-full ${dsStatus.dot}`} />
                                    <span className="text-xs font-medium">{dsStatus.label}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 border">
                                <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                    <Radio className="h-3 w-3" /> Upstream
                                </span>
                                <div className={`text-2xl font-bold ${usStatus.color}`}>{usRx} <span className="text-xs text-muted-foreground font-normal">dBm</span></div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={`h-2 w-2 rounded-full ${usStatus.dot}`} />
                                    <span className="text-xs font-medium">{usStatus.label}</span>
                                </div>
                            </div>

                            <div className="col-span-2 text-[10px] text-center text-muted-foreground mt-2">
                                Signal at ONU: {dsRx} dBm (Rx) | Signal at OLT: {usRx} dBm (Rx)
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
