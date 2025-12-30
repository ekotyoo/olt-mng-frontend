"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Signal, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OnuStatusProps {
    slotPort: string;
    onuId: string;
    serial: string;
}

export default function OnuStatusBadge({ slotPort, onuId, serial }: OnuStatusProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ rx?: string, status?: string } | null>(null);

    async function fetchStatus() {
        setLoading(true);
        try {
            // Import dynamically to avoid server action issues if any
            const { getAttenuationInfo, getOnuDetailAction } = await import("@/app/actions/onu");

            // Parallel fetch
            const [attn, detail] = await Promise.all([
                getAttenuationInfo({ slotPort, onuId }),
                getOnuDetailAction(slotPort, onuId, serial)
            ]);

            setData({
                rx: attn.rx,
                status: detail.status
            });
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch live status");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Fetch on mount
        fetchStatus();
    }, []);

    if (!data && loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

    return (
        <div className="flex items-center gap-2">
            {data?.status === 'Online' || data?.status?.includes('working') ? (
                <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <Wifi className="h-3 w-3" /> Online
                </Badge>
            ) : (
                <Badge variant="secondary" className="gap-1">
                    <WifiOff className="h-3 w-3" /> {data?.status || "Unknown"}
                </Badge>
            )}

            {data?.rx && (
                <Badge variant="outline" className={
                    parseFloat(data.rx) < -25 ? "text-red-500 border-red-200 bg-red-50" :
                        parseFloat(data.rx) < -20 ? "text-yellow-600 border-yellow-200 bg-yellow-50" :
                            "text-green-600 border-green-200 bg-green-50"
                }>
                    <Signal className="h-3 w-3 mr-1" />
                    {data.rx} dBm
                </Badge>
            )}

            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchStatus} disabled={loading}>
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
}
