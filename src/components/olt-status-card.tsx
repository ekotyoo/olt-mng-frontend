"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Cpu, Zap, Thermometer } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OltStatusProps = {
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

export default function OltStatusCard({ olt }: OltStatusProps) {
    return (
        <Link href={`/olt/${olt.id}`}>
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-l-4" style={{ borderLeftColor: olt.status === "ONLINE" ? "#22c55e" : "#ef4444" }}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Server className="w-4 h-4 text-muted-foreground" />
                                {olt.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{olt.host}</p>
                        </div>
                        <Badge variant={olt.status === "ONLINE" ? "default" : "destructive"} className={cn("text-[10px] px-2 py-0.5", olt.status === "ONLINE" && "bg-green-500 hover:bg-green-600")}>
                            {olt.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex justify-end -mt-10 mb-4 mr-2">
                        <SyncButton oltId={olt.id} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity className="w-3 h-3" /> ONUs
                            </span>
                            <span className="text-xl font-bold">{olt.onuCount}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Thermometer className="w-3 h-3" /> Temp
                            </span>
                            <span className={cn("text-xl font-bold", olt.temperature > 60 ? "text-red-500" : "text-foreground")}>
                                {olt.temperature}°C
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                                <span>{olt.cpuUsage}%</span>
                            </div>
                            <Progress value={olt.cpuUsage} className={cn("h-1.5", olt.cpuUsage > 80 && "bg-red-200 [&>div]:bg-red-500")} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> RAM</span>
                                <span>{olt.memoryUsage}%</span>
                            </div>
                            <Progress value={olt.memoryUsage} className={cn("h-1.5", olt.memoryUsage > 80 && "bg-yellow-200 [&>div]:bg-yellow-500")} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

import { triggerSync } from "@/app/actions/sync";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

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
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSync}
            disabled={loading}
        >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
    )
}
