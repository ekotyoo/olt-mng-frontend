"use server";

import { runOltCommand } from "@/lib/telnet-service";
import { prisma } from "@/lib/db";

export interface TrafficStats {
    timestamp: string; // ISO string
    rx: number; // Mbps
    tx: number; // Mbps
}

export async function getInterfaceTraffic(oltId: string, interfaceName: string = "gei_1/3/1"): Promise<TrafficStats> {
    const result = await runOltCommand(`show interface ${interfaceName}`);

    // Example Output parsing needed:
    // Input rate: 123.5 Mbps, ...
    // Output rate: 456.7 Mbps, ...

    // Regex to capture rates. Assume Mbps.
    // "Input rate : 15.6 Mbps"
    // "Output rate: 104.2 Mbps"

    const rxMatch = result.match(/Input rate\s*:\s*([\d\.]+)\s*Mbps/i);
    const txMatch = result.match(/Output rate\s*:\s*([\d\.]+)\s*Mbps/i);

    let rx = 0;
    let tx = 0;

    if (rxMatch && rxMatch[1]) rx = parseFloat(rxMatch[1]);
    if (txMatch && txMatch[1]) tx = parseFloat(txMatch[1]);

    return {
        timestamp: new Date().toISOString(),
        rx,
        tx
    };
}

export async function getTrafficHistory(oltId: string, range: '24h' | '7d') {
    const now = new Date();
    const startTime = new Date(now);

    if (range === '24h') {
        startTime.setHours(startTime.getHours() - 24);
    } else {
        startTime.setDate(startTime.getDate() - 7);
    }

    const stats = await prisma.trafficStat.findMany({
        where: {
            oltId,
            interfaceName: "gei_1/3/1",
            timestamp: {
                gte: startTime
            }
        },
        orderBy: {
            timestamp: 'asc'
        }
    });

    return stats.map(s => ({
        timestamp: s.timestamp.toISOString(),
        rx: s.rxMbps,
        tx: s.txMbps
    }));
}
