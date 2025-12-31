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
    console.log("OLT Connection Params:", { params });

    return await runOltSession(async (session) => {
        // 1. Register ONU
        // conf t
        // interface gpon-olt_1/1/3
        // onu 50 type ZTE sn ZICG276DBE73
        // exit
        await session.sendCommand("conf t");
        await session.sendCommand(`interface gpon-olt_${config.slotPort}`);

        // User requested type to be 'ZTE' or 'ALL'
        const type = config.deviceType || "ZTE";
        await session.sendCommand(`onu ${config.onuId} type ${type} sn ${config.serialNumber}`);
        await session.sendCommand("exit");

        // 2. Configure Interface
        // interface gpon-onu_1/1/3:50
        // tcont 1 profile 20M
        // gemport 1 tcont 1
        // service-port 1 vport 1 user-vlan 143 vlan 143
        // exit
        await session.sendCommand(`interface gpon-onu_${config.slotPort}:${config.onuId}`);

        const tcontProfile = config.profile || "default"; // Fallback if missing
        await session.sendCommand(`tcont 1 profile ${tcontProfile}`);
        await session.sendCommand(`gemport 1 tcont 1`);

        const vlan = config.vlanId || "100"; // Fallback
        // service-port 1 vport 1 user-vlan 143 vlan 143
        await session.sendCommand(`service-port 1 vport 1 user-vlan ${vlan} vlan ${vlan}`);

        if (config.customerOnuName) {
            await session.sendCommand(`name ${config.customerOnuName}`);
        }
        await session.sendCommand("exit");

        // 3. Configure Service (WAN / PPPoE)
        // pon-onu-mng gpon-onu_1/1/3:16
        // service 1 gemport 1 vlan 143
        // wan-ip 1 mode pppoe username 13*Boncel password 212 vlan-profile netmedia 143 host 1
        // exit
        await session.sendCommand(`pon-onu-mng gpon-onu_${config.slotPort}:${config.onuId}`);
        await session.sendCommand(`service 1 gemport 1 vlan ${vlan}`);

        if (config.pppoeUsername && config.pppoePassword) {
            const vlanProfile = config.vlanProfile || "netmedia";
            // wan-ip 1 mode pppoe username ... password ... vlan-profile netmedia 143 host 1
            const cmd = `wan-ip 1 mode pppoe username ${config.pppoeUsername} password ${config.pppoePassword} vlan-profile ${vlanProfile} host 1`;
            const response = await session.sendCommand(cmd);

            if (response.includes("%") || response.toLowerCase().includes("error")) {
                throw new Error(`OLT Invalid Command (WAN IP): ${response}`);
            }
        }

        await session.sendCommand("exit");

        // 4. Save
        await session.sendCommand("exit"); // Exit config mode
        await session.sendCommand("write"); // Save config

        return "success";
    }, params);

    // 5. Optimistic Database Update
    // Update DB immediately for instant UI feedback
    // Background sync (every 60s) will validate and correct any drift
    try {
        const oltInfo = await prisma.olt.findFirst({
            where: config.olt ? { id: config.olt } : { host: params?.host }
        });

        if (oltInfo) {
            const ponPort = await prisma.ponPort.findUnique({
                where: {
                    oltId_portIndex: {
                        oltId: oltInfo.id,
                        portIndex: config.slotPort!
                    }
                }
            });

            if (ponPort) {
                const onuIdInt = parseInt(config.onuId!, 10);

                await prisma.onu.upsert({
                    where: { serial: config.serialNumber! },
                    create: {
                        serial: config.serialNumber!,
                        slotPort: config.slotPort!,
                        onuId: onuIdInt,
                        ponPortId: ponPort.id,
                        name: config.customerOnuName || undefined,
                        deviceType: config.deviceType || "ZTE",
                        vlan: config.vlanId || undefined,
                        pppoeUser: config.pppoeUsername || undefined,
                        pppoePass: config.pppoePassword || undefined,
                        tcontProfile: config.profile || undefined,
                        status: "Working", // Optimistic status
                        lastSync: new Date()
                    },
                    update: {
                        slotPort: config.slotPort!,
                        onuId: onuIdInt,
                        ponPortId: ponPort.id,
                        name: config.customerOnuName || undefined,
                        deviceType: config.deviceType || "ZTE",
                        vlan: config.vlanId || undefined,
                        pppoeUser: config.pppoeUsername || undefined,
                        pppoePass: config.pppoePassword || undefined,
                        tcontProfile: config.profile || undefined,
                        status: "Working", // Update status optimistically
                        lastSync: new Date()
                    }
                });

                console.log(`[Optimistic Update] ONU ${config.serialNumber} updated in DB`);
                revalidatePath("/onus");
                revalidatePath("/onu-configuration");
            }
        }
    } catch (dbError) {
        // Don't fail the operation if DB update fails
        // Background sync will catch it
        console.error("[Optimistic Update] Failed to update DB, background sync will correct:", dbError);
    }

    return "success";
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
            const vlansRaw = await session.sendCommand("show vlan summary");
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
        await session.sendCommand("write"); // Persist deletion to OLT config

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

export async function getAvailableOnus() {
    const onus = await prisma.onu.findMany({
        where: {
            subscription: null
        },
        orderBy: {
            serial: 'asc'
        }
    });

    return onus.map(o => ({
        id: o.id,
        serial: o.serial,
        name: o.name || "Unnamed",
        slotPort: o.slotPort,
        onuId: o.onuId
    }));
}
