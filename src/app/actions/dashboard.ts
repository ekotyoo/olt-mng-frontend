"use server";

import { prisma } from "@/lib/db";

export type DashboardStats = {
    totalOlt: number;
    totalOnu: number;
    onuOnline: number;
    onuOffline: number;
    olts: {
        id: string;
        name: string;
        host: string;
        status: "ONLINE" | "OFFLINE"; // Derived from successful sync or recent update
        cpuUsage: number;
        memoryUsage: number;
        temperature: number;
        onuCount: number;
    }[];
};

export async function getGlobalDashboardStats(): Promise<DashboardStats> {
    const olts = await prisma.olt.findMany({
        include: {
            ponPorts: true,
        }
    });

    let totalOnu = 0;
    let onuOnline = 0;
    let onuOffline = 0;

    const oltStats = olts.map(olt => {
        const oltOnuCount = olt.ponPorts.reduce((acc, port) => acc + port.registeredCount, 0);
        const oltOnuOnline = olt.ponPorts.reduce((acc, port) => acc + port.onlineCount, 0);

        totalOnu += oltOnuCount;
        onuOnline += oltOnuOnline;

        // Simulating OLT status based on recent update (e.g. within last 5 minutes)
        // In a real scenario, we might have a dedicated status field or health check
        const isOnline = (new Date().getTime() - new Date(olt.updatedAt).getTime()) < 60 * 60 * 1000;

        return {
            id: olt.id,
            name: olt.name,
            host: olt.host,
            status: isOnline ? "ONLINE" : "OFFLINE" as "ONLINE" | "OFFLINE",
            cpuUsage: olt.cpuUsage,
            memoryUsage: olt.memoryUsage,
            temperature: olt.temperature,
            onuCount: oltOnuCount,
        };
    });

    onuOffline = totalOnu - onuOnline;

    return {
        totalOlt: olts.length,
        totalOnu,
        onuOnline,
        onuOffline,
        olts: oltStats,
    };
}
