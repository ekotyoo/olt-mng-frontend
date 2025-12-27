"use server";

import { runOltCommand } from "@/lib/telnet-service";

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
