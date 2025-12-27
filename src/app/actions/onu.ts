"use server";

import { parseAttenuationInfo, parseOnuDetail, parseUnconfiguredOnus } from "@/lib/olt-parser";
import { runOltCommand, runOltSession } from "@/lib/telnet-service";
import { Onu, OnuConfig, OnuDetails, PonPortOverview } from "@/lib/type";

async function runTelnetCommand(command: string): Promise<string> {
    return await runOltCommand(command);
}

import { prisma } from "@/lib/db";

export async function getAllOnuDetails(): Promise<OnuDetails[]> {
    const onus = await prisma.onu.findMany({
        orderBy: [
            { slotPort: 'asc' },
            { onuId: 'asc' }
        ]
    });

    return onus.map((o) => ({
        slotPort: o.slotPort,
        onuId: o.onuId.toString(),
        serial: o.serial,
        vendor: o.deviceType || "",
        vlan: o.vlan,
        pppoeUser: o.pppoeUser,
        pppoePass: o.pppoePass,
        tcontProfile: o.tcontProfile,
        name: o.name || undefined,
        status: o.status || undefined
    }));
}

export async function getOnus({
    page = 1,
    limit = 10,
    query = "",
    oltId,
    status
}: {
    page?: number;
    limit?: number;
    query?: string;
    oltId?: string;
    status?: string;
}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { serial: { contains: query, mode: 'insensitive' } },
            { pppoeUser: { contains: query, mode: 'insensitive' } },
            { slotPort: { contains: query, mode: 'insensitive' } }
        ];
    }

    // OLT filter
    if (oltId && oltId !== "all") {
        where.ponPort = {
            oltId: oltId
        };
    }

    // Status filter
    if (status && status !== "all") {
        where.status = status;
    }

    const [data, total] = await Promise.all([
        prisma.onu.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
                { ponPort: { oltId: 'asc' } },
                { slotPort: 'asc' },
                { onuId: 'asc' }
            ]
        }),
        prisma.onu.count({ where })
    ]);

    const mappedData: OnuDetails[] = data.map((o) => ({
        slotPort: o.slotPort,
        onuId: o.onuId.toString(),
        serial: o.serial,
        vendor: o.deviceType || "",
        vlan: o.vlan,
        pppoeUser: o.pppoeUser,
        pppoePass: o.pppoePass,
        tcontProfile: o.tcontProfile,
        name: o.name || undefined,
        status: o.status || undefined
    }));

    return {
        data: mappedData,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

export async function getPonPortOverview(oltId?: string): Promise<PonPortOverview[]> {
    const where = oltId ? { oltId: oltId } : {};

    const ports = await prisma.ponPort.findMany({
        where,
        orderBy: {
            portIndex: 'asc'
        }
    });

    return ports.map(p => ({

        port_id: p.portIndex,
        onu_registered: p.registeredCount,
        onu_online: p.onlineCount,
        onu_offline: p.registeredCount - p.onlineCount,
        status: (p.onlineCount > 0 && (p.registeredCount - p.onlineCount) > 0)
            ? "partial"
            : (p.onlineCount === 0 && p.registeredCount > 0) ? "down" : "healthy"
    }));
}

export async function getAttenuationInfo({ slotPort, onuId }: { slotPort: string, onuId: string }) {
    const result = await runTelnetCommand(`show pon power attenuation gpon-onu_${slotPort}:${onuId}`);
    const data = parseAttenuationInfo(result);

    return data;
}

import { getOltConnectionParams } from "./olt";

// ... existing imports

export async function getUnconfiguredOnus(oltId?: string): Promise<Onu[]> {
    const params = await getOltConnectionParams(oltId);

    return await runOltSession(async (session) => {
        const result = await session.sendCommand("show gpon onu uncfg");
        return parseUnconfiguredOnus(result);
    }, params);
}

export async function getOnuDetailAction(slotPort: string, onuId: string, serial: string): Promise<OnuDetails> {
    const result = await runTelnetCommand(`show gpon onu detail-info gpon-onu_${slotPort}:${onuId}`);
    return parseOnuDetail(result, slotPort, onuId);
}

export async function configureOnuAction(config: OnuConfig) {
    if (!config.slotPort || !config.onuId || !config.serialNumber) throw new Error("Missing config fields");

    const params = await getOltConnectionParams(config.olt);

    return await runOltSession(async (session) => {
        // 1. Register ONU
        await session.sendCommand("conf t");
        await session.sendCommand(`interface gpon-olt_${config.slotPort}`);
        // Assuming default type 'ZTE-F609' if not provided, or generic
        const type = "ZTE-F609";
        await session.sendCommand(`onu ${config.onuId} type ${type} sn ${config.serialNumber}`);
        await session.sendCommand("exit");

        // 2. Configure Interface
        await session.sendCommand(`interface gpon-onu_${config.slotPort}:${config.onuId}`);
        if (config.customerOnuName) await session.sendCommand(`name ${config.customerOnuName}`);
        if (config.profile) await session.sendCommand(`tcont 1 profile ${config.profile}`);
        await session.sendCommand(`gemport 1 name ${config.customerOnuName || 'internet'} tcont 1`);
        await session.sendCommand(`gemport 1 traffic-limit upstream default downstream default`);
        await session.sendCommand("switchport mode hybrid vport 1"); // Example
        await session.sendCommand("exit");

        // 3. Configure Service (pon-onu-mng)
        await session.sendCommand(`pon-onu-mng gpon-onu_${config.slotPort}:${config.onuId}`);
        // Logic forWAN IP / PPPoE would go here
        if (config.vlanId) {
            await session.sendCommand(`service 1 gemport 1 vlan ${config.vlanId}`);
        }
        await session.sendCommand("exit");

        return "success";
    });
}

export async function getNextOnuId(oltId: string, slotPort: string): Promise<string> {
    const port = await prisma.ponPort.findUnique({
        where: {
            oltId_portIndex: {
                oltId: oltId,
                portIndex: slotPort
            }
        },
        include: {
            onus: {
                select: { onuId: true }
            }
        }
    });

    if (!port || port.onus.length === 0) {
        return "1";
    }

    const usedIds = port.onus.map(o => o.onuId).sort((a, b) => a - b);

    // Find first gap
    let nextId = 1;
    for (const id of usedIds) {
        if (id === nextId) {
            nextId++;
        } else if (id > nextId) {
            return nextId.toString();
        }
    }

    return nextId.toString();
}

import { parseTrafficProfiles, parseVlanProfiles, parseVlans } from "@/lib/olt-parser";

export async function getAvailableProfiles(oltId?: string) {
    const params = await getOltConnectionParams(oltId);

    // Default empty
    const result = {
        tcont: [] as string[],
        vlan: [] as string[],
        activeVlans: [] as { id: string, name: string }[]
    };

    try {
        await runOltSession(async (session) => {
            // Fetch Traffic Profiles
            const tcontRaw = await session.sendCommand("show gpon profile tcont");
            result.tcont = parseTrafficProfiles(tcontRaw);

            // Fetch VLAN Profiles
            // Determine command based on device type if possible, but standard is:
            const vlanRaw = await session.sendCommand("show gpon profile vlan");
            result.vlan = parseVlanProfiles(vlanRaw);

            // Fetch Active VLANs
            const vlansRaw = await session.sendCommand("show vlan");
            result.activeVlans = parseVlans(vlansRaw);

        }, params);
    } catch (e) {
        console.error("Failed to fetch profiles", e);
    }

    return result;
}

import { revalidatePath } from "next/cache";

export async function deleteOnuAction(onuId: string, slotPort: string, serial: string) {
    const onu = await prisma.onu.findFirst({
        where: {
            serial: serial
        },
        include: {
            ponPort: true
        }
    });

    const oltId = onu?.ponPort.oltId;
    const params = await getOltConnectionParams(oltId);

    const result = await runOltSession(async (session) => {
        // Command to delete:
        // interface gpon-olt_1/1/3
        // no onu 18

        await session.sendCommand("conf t");
        await session.sendCommand(`interface gpon-olt_${slotPort}`);
        await session.sendCommand(`no onu ${onuId}`);
        await session.sendCommand("exit");

        // Also delete from database
        await prisma.onu.delete({
            where: {
                serial: serial
            }
        });

        return "success";
    }, params);

    revalidatePath("/onus");
    return result;
}

export async function rebootOnuAction(onuId: string, slotPort: string, serial: string) {
    // Only connection params needed, not full DB deletion
    const onu = await prisma.onu.findFirst({
        where: {
            serial: serial
        },
        include: {
            ponPort: true
        }
    });

    const oltId = onu?.ponPort.oltId;
    const params = await getOltConnectionParams(oltId);

    return await runOltSession(async (session) => {
        // Command to reboot:
        // interface gpon-olt_1/1/3
        // onu 18 reboot

        await session.sendCommand("conf t");
        await session.sendCommand(`interface gpon-olt_${slotPort}`);
        await session.sendCommand(`onu ${onuId} reboot`);
        await session.sendCommand("exit");

        return "success";
    }, params);
}
