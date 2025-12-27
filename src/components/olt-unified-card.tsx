"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Cpu, Zap, Thermometer, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { triggerSync } from "@/app/actions/sync";
import TrafficGraphCard from "./traffic-graph-card";
import Link from "next/link";

type OltUnifiedCardProps = {
    olt: {
        id: string;
        name: string;
        host: string;
        status: "ONLINE" | "OFFLINE";
        cpuUsage: number;
        memoryUsage: number;
        temperature: number;
        onuCount: number;
    };
};

export default function OltUnifiedCard({ olt }: OltUnifiedCardProps) {
    return (
        <Link href={`/olt/${olt.id}`} className="block h-full">
            <Card className="hover:shadow-lg transition-all border-t-4 h-full" style={{ borderTopColor: olt.status === "ONLINE" ? "#22c55e" : "#ef4444" }}>
                <CardHeader className="pb-2 border-b bg-muted/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Identity */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className={cn("w-3 h-3 rounded-full animate-pulse", olt.status === "ONLINE" ? "bg-green-500" : "bg-red-500")} />
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    {olt.name}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-mono">{olt.host}</p>
                            </div>
                            <Badge
                                variant={olt.status === "ONLINE" ? "default" : "destructive"}
                                className={cn("ml-2 text-[10px] h-5", olt.status === "ONLINE" && "bg-green-500 hover:bg-green-600")}
                            >
                                {olt.status}
                            </Badge>
                        </div>

                        {/* Compact Metrics Row */}
                        <div className="flex items-center gap-4 md:gap-6 text-sm w-full md:w-auto justify-between md:justify-end">
                            <div className="flex items-center gap-2" title="Connected ONUs">
                                <Activity className="w-4 h-4 text-muted-foreground" />
                                <span className="font-bold">{olt.onuCount}</span>
                            </div>
                            <div className="w-px h-4 bg-border hidden md:block" />
                            <div className="flex items-center gap-2" title="CPU Usage">
                                <Cpu className="w-4 h-4 text-muted-foreground" />
                                <span className={cn("font-bold", olt.cpuUsage > 80 && "text-red-500")}>{olt.cpuUsage}%</span>
                            </div>
                            <div className="flex items-center gap-2" title="Memory Usage">
                                <Zap className="w-4 h-4 text-muted-foreground" />
                                <span className={cn("font-bold", olt.memoryUsage > 80 && "text-yellow-500")}>{olt.memoryUsage}%</span>
                            </div>
                            <div className="flex items-center gap-2" title="Temperature">
                                <Thermometer className="w-4 h-4 text-muted-foreground" />
                                <span className={cn("font-bold", olt.temperature > 60 ? "text-red-500" : "text-foreground")}>
                                    {olt.temperature}°C
                                </span>
                            </div>

                            <div className="w-px h-4 bg-border hidden md:block" />

                            <SyncButton oltId={olt.id} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Embed the content that was previously in TrafficGraphCard */}
                    {/* Since TrafficGraphCard has its own "System Info" header, we might want to hide it or pass a prop to hide it */}
                    <TrafficGraphCard oltId={olt.id} hideHeader />
                </CardContent>
            </Card>
        </Link>
    );
}

function SyncButton({ oltId }: { oltId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleSync(e: React.MouseEvent) {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        try {
            setLoading(true);
            const res = await triggerSync(oltId);
            if (res.success) {
                toast.success("OLT Synced Successfully");
            } else {
                toast.error("Sync Failed: " + res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Sync Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 ml-2"
            onClick={handleSync}
            disabled={loading}
        >
            <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="sr-only md:not-sr-only">Sync</span>
        </Button>
    )
}
