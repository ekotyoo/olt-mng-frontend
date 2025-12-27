import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PonPortOverview } from "@/lib/type";
import { Activity, Network, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PonPortKpiProps {
    data: PonPortOverview[];
}

export default function PonPortKpi({ data }: PonPortKpiProps) {
    const totalPorts = data.length;
    const totalRegistered = data.reduce((acc, curr) => acc + curr.onu_registered, 0);
    const totalOnline = data.reduce((acc, curr) => acc + curr.onu_online, 0);
    const totalOffline = totalRegistered - totalOnline;

    // Average utilization (online / registered) across all ports that have ONUs
    const activePorts = data.filter(p => p.onu_registered > 0);
    const avgUtilization = activePorts.length > 0
        ? Math.round((activePorts.reduce((acc, curr) => acc + (curr.onu_online / curr.onu_registered), 0) / activePorts.length) * 100)
        : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Ports
                    </CardTitle>
                    <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalPorts}</div>
                    <p className="text-xs text-muted-foreground">
                        Active PON Interfaces
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total ONUs
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRegistered}</div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span className="text-green-500 font-medium">{totalOnline} Online</span>
                        <span>•</span>
                        <span className={cn(totalOffline > 0 && "text-red-500 font-medium")}>{totalOffline} Offline</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg Utilization
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgUtilization}%</div>
                    <p className="text-xs text-muted-foreground">
                        Online Rate per Port
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Capacity
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round((totalRegistered / (totalPorts * 128)) * 100)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Based on 128 ONU/Port
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
