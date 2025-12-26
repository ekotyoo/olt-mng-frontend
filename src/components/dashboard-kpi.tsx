"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Network, Wifi, WifiOff, Server } from "lucide-react";

type DashboardKpiProps = {
    stats: {
        totalOlt: number;
        totalOnu: number;
        onuOnline: number;
        onuOffline: number;
    };
};

export default function DashboardKpi({ stats }: DashboardKpiProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Network className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total ONUs</p>
                        <h3 className="text-2xl font-bold">{stats.totalOnu}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Wifi className="w-6 h-6 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Online</p>
                        <h3 className="text-2xl font-bold">{stats.onuOnline}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                        <WifiOff className="w-6 h-6 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Offline</p>
                        <h3 className="text-2xl font-bold">{stats.onuOffline}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                        <Server className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Active OLTs</p>
                        <h3 className="text-2xl font-bold">{stats.totalOlt}</h3>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
