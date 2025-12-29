"use server";

import { parseOltCard, parseOltCardDetail, parseSystemGroup } from "@/lib/olt-parser";
import { runOltCommand, runOltSession } from "@/lib/telnet-service";
import { OltCardDetail } from "@/lib/type";

export async function runTelnetCommand(command: string): Promise<string> {
    return await runOltCommand(command);
}

import { prisma } from "@/lib/db";
import { env } from "@/env";
import { OltInfo } from "@/lib/type";

export async function getOltConnectionParams(oltId?: string) {
    if (!oltId) {
        // Fallback for backward compatibility or default
        return undefined;
    }

    const olt = await prisma.olt.findUnique({
        where: { id: oltId }
    });

    if (!olt) throw new Error("OLT not found");

    return {
        host: olt.host,
        port: olt.port,
        username: olt.username,
        password: olt.password,
    }
}

export async function getOltInfo(oltId?: string): Promise<OltInfo> {
    // If we have an ID, we prioritize DB, otherwise we fell back to Env in the old version.
    // Ideally we should move away from Env entirely for multi-olt.

    let olt;
    if (oltId) {
        olt = await prisma.olt.findUnique({ where: { id: oltId } });
    } else {
        olt = await prisma.olt.findUnique({ where: { host: env.OLT_HOST } });
    }

    return {
        upTime: olt?.upTime || "-",
        contact: olt?.contact || "-",
        systemName: olt?.name || "-",
        location: olt?.location || "-"
    };
}

export async function getOltCardStats(oltId?: string) {
    if (!oltId) return [];

    const slots = await prisma.oltSlot.findMany({
        where: { oltId: oltId },
        orderBy: [{ rack: 'asc' }, { shelf: 'asc' }, { slot: 'asc' }]
    });

    if (slots.length === 0) {
        // Fallback: If no cache, maybe trigger sync? Or just return empty to avoid slow loading.
        // For now, let's returning empty implies "Sync to see data"
        return [];
    }

    return slots.map(s => ({
        rack: s.rack.toString(),
        shelf: s.shelf.toString(),
        slot: s.slot.toString(),
        configType: s.configType || "-",
        status: s.status || "-",
        ports: 0, // Not stored in OltSlot yet? Ah, OltSlot should store it, but schema didn't have it.
        // Wait, 'ports' is on OltCard parse but I didn't add it to OltSlot schema.
        // Checking schema: configType, status, cpuUsage, memoryUsage, temperature, serialNumber, upTime, lastRestartReason.
        // 'ports' count is missing. Ill just default to 0 or fix schema later.
        serialNumber: s.serialNumber || "-",
        phyMemorySize: 0, // Not stored
        hardwareVersion: "-", // Not stored
        softwareVersion: "-", // Not stored
        cpuUsage: s.cpuUsage,
        memoryUsage: s.memoryUsage,
        temperature: s.temperature,
        upTime: s.upTime || "-",
        lastRestartReason: s.lastRestartReason || "-"
    }));
}

export async function getOltOptions() {
    const olts = await prisma.olt.findMany({
        select: { id: true, name: true, host: true }
    });
    return olts.map(o => ({
        label: `${o.name} (${o.host})`,
        value: o.id
    }));
}

export async function getTrafficHistory(oltId: string) {
    if (!oltId) return { interfaces: [], data: [] };

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stats = await prisma.trafficStat.findMany({
        where: {
            oltId,
            timestamp: { gte: twentyFourHoursAgo }
        },
        orderBy: { timestamp: 'asc' }
    });

    const interfaces = Array.from(new Set(stats.map(s => s.interfaceName)));

    // Serialize Dates
    const safeData = stats.map(s => ({
        ...s,
        rxMbps: s.rxMbps,
        txMbps: s.txMbps,
        timestamp: s.timestamp.toISOString() // Pass as string to client
    }));

    return { interfaces, data: safeData };
}
