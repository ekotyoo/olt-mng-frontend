import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { runOltCommand } from "../src/lib/telnet-service";

// Load env
const res = dotenv.config({ path: '.env' });
console.log("Env loaded:", res.parsed ? "OK" : "FAIL");

// Mock if needed for standalone script
if (!process.env.OLT_HOST) process.env.OLT_HOST = "192.168.1.1";
if (!process.env.OLT_USER) process.env.OLT_USER = "admin";
if (!process.env.OLT_PASS) process.env.OLT_PASS = "pass";
if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = "12345678901234567890123456789012";

const prisma = new PrismaClient();

const INTERFACE_NAME = "gei_1/3/1"; // Default uplink

async function getStats(oltId: string, host: string, pass: string, user: string, port: number) {
    console.log(`Polling OLT ${host}...`);
    try {
        // Need to set env vars for telnet-service dynamically if we support multi-OLT properly in script
        // But runOltCommand uses getOltConnectionParams which uses DB or ENV.
        // Since this script runs outside of Next.js context, we need to be careful with imports.
        // Actually, runOltCommand imports 'getOltConnectionParams' from 'olt.ts' which uses 'auth.ts' etc.
        // This might be complex to run as a standalone script due to Next.js dependencies.

        // Simplified approach: Re-implement basic telnet for the script or mock the context.
        // Better: Use the shared libraries if they don't depend on "next/headers" or similar.
        // 'telnet-service' seems pure TS/Node.

        // Let's manually inject connection params into env for runOltCommand if it relies on them,
        // OR better, pass them if runOltCommand supported it.
        // Currently runOltCommand takes (command).
        // Let's modify runOltCommand to accept optional connection params? 
        // Or for now, just set the env vars before calling it, as runOltCommand might read env defaults.

        // HOWEVER, we have 'runOltSession' which takes params!
        // Let's import runOltSession.

        const { runOltSession } = await import("../src/lib/telnet-service");

        // Fix: OltConnectionParams might not have 'type' or it differs. Casting or omitting it.
        // Also cast runOltSession return to string.
        const output = await runOltSession(async (session) => {
            return await session.sendCommand(`show interface ${INTERFACE_NAME}`);
        }, { host, port, username: user, password: pass }) as string;

        // Parse Rate (Mbps) to match getInterfaceTraffic logic
        // "Input rate : 15.6 Mbps"
        const rxMatch = output.match(/Input rate\s*:\s*([\d\.]+)\s*Mbps/i);
        const txMatch = output.match(/Output rate\s*:\s*([\d\.]+)\s*Mbps/i);

        if (rxMatch && txMatch) {
            const rx = parseFloat(rxMatch[1]);
            const tx = parseFloat(txMatch[1]);

            await (prisma as any).trafficStat.create({
                data: {
                    oltId,
                    interfaceName: INTERFACE_NAME,
                    rxMbps: rx,
                    txMbps: tx,
                }
            });
            console.log(`Saved stats for ${host}: RX=${rx} TX=${tx} Mbps`);
        } else {
            console.log(`Failed to parse traffic for ${host}. Output start: ${output.substring(0, 50)}`);
        }

    } catch (e) {
        console.error(`Error polling ${host}:`, e);
    }
}

async function main() {
    console.log("Starting Traffic Poller...");
    try {
        const olts = await prisma.olt.findMany({ where: { status: "ONLINE" } });
        console.log(`Found ${olts.length} online OLTs.`);

        for (const olt of olts) {
            await getStats(olt.id, olt.host, olt.password, olt.username, olt.port);
        }
    } catch (e) {
        console.error("Main loop error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
