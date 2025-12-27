import { prisma } from "@/lib/db";
import { parseOnuDetails, parseOnuState, parseOltCard, parseOltCardDetail, parseSystemGroup } from "@/lib/olt-parser";
import { runOltSession } from "@/lib/telnet-service";
import { env } from "@/env";
import { Olt } from "@prisma/client";

export async function syncFromOlt(oltId?: string) {
    console.log(`Starting OLT Sync for ID: ${oltId || "Default"}...`);

    let targetOlt: Partial<Olt> | null = null;

    if (oltId) {
        targetOlt = await prisma.olt.findUnique({ where: { id: oltId } });
    } else {
        targetOlt = await prisma.olt.findFirst();
    }

    // Fallback to ENV if DB is empty or defaults needed
    if (!targetOlt) {
        console.log("No OLT found in DB, using ENV defaults.");
        targetOlt = {
            host: env.OLT_HOST,
        };
    }

    const connectionParams = {
        host: targetOlt.host!,
        port: targetOlt.port || parseInt(env.OLT_PORT.toString()) || 23,
        username: targetOlt.username || env.OLT_USER,
        password: targetOlt.password || env.OLT_PASS,
    };

    try {
        return await runOltSession(async (session) => {
            // 1. Fetch Config & State
            const runningConfig = await session.sendCommand("show running");
            const onusState = await session.sendCommand("show gpon onu state");
            const systemGroup = await session.sendCommand("show system-group");
            const cardListRaw = await session.sendCommand("show card");

            if (!runningConfig || !onusState) {
                throw new Error("Failed to fetch data from OLT");
            }

            // 2. Parse Data
            const detailedOnus = parseOnuDetails(runningConfig);
            const ponStates = parseOnuState(onusState);
            const sysInfo = parseSystemGroup(systemGroup);
            const cards = parseOltCard(cardListRaw);

            // Fetch detailed card stats
            let maxCpu = 0;
            let maxMem = 0;
            let temp = 0;

            const cardDetails: any[] = [];
            for (const card of cards) {
                try {
                    if (card.status !== "Offline" && card.status !== "Type_Error") {
                        const detailRaw = await session.sendCommand(`show card rack ${card.rack} shelf ${card.shelf} slot ${card.slot}`);
                        const detail = parseOltCardDetail(detailRaw, card.rack, card.shelf, card.slot);
                        if (detail.cpuUsage > maxCpu) maxCpu = detail.cpuUsage;
                        if (detail.memoryUsage > maxMem) maxMem = detail.memoryUsage;
                        // Assuming temp is available in 'detail' or we need to parse it differently. 
                        // The original code only mocked 'temp = 0'.
                        cardDetails.push({ ...detail, status: card.status, configType: card.realType });
                    } else {
                        cardDetails.push({
                            rack: card.rack,
                            shelf: card.shelf,
                            slot: card.slot,
                            configType: card.cfgType, // Use configured type for offline cards
                            status: card.status,
                            cpuUsage: 0,
                            memoryUsage: 0,
                            temperature: 0,
                            serialNumber: "",
                            upTime: "",
                            lastRestartReason: ""
                        });
                    }
                } catch (e) {
                    console.log(`Failed to fetch card detail for ${card.rack}/${card.shelf}/${card.slot}`, e);
                }
            }

            // 3. Sync to DB
            return await prisma.$transaction(async (tx) => {
                // A. Upsert OLT
                const olt = await tx.olt.upsert({
                    where: { host: connectionParams.host },
                    create: {
                        host: connectionParams.host,
                        port: connectionParams.port,
                        username: connectionParams.username,
                        password: connectionParams.password, // Sync credentials too if created
                        name: sysInfo.systemName || "Main OLT",
                        upTime: sysInfo.upTime,
                        contact: sysInfo.contact,
                        location: sysInfo.location,
                        cpuUsage: maxCpu,
                        memoryUsage: maxMem,
                        temperature: temp,
                        status: "ONLINE"
                    },
                    update: {
                        name: sysInfo.systemName || "Main OLT",
                        upTime: sysInfo.upTime,
                        contact: sysInfo.contact,
                        location: sysInfo.location,
                        cpuUsage: maxCpu,
                        memoryUsage: maxMem,
                        temperature: temp,
                        status: "ONLINE"
                    },
                });

                // B. Upsert PON Ports
                for (const port of ponStates) {
                    await tx.ponPort.upsert({
                        where: {
                            oltId_portIndex: {
                                oltId: olt.id,
                                portIndex: port.port_id,
                            },
                        },
                        create: {
                            oltId: olt.id,
                            portIndex: port.port_id,
                            registeredCount: port.onu_registered,
                            onlineCount: port.onu_online,
                        },
                        update: {
                            registeredCount: port.onu_registered,
                            onlineCount: port.onu_online,
                        },
                    });
                }

                // B2. Upsert OLT Slots (Cards)
                for (const card of cardDetails) {
                    await tx.oltSlot.upsert({
                        where: {
                            oltId_rack_shelf_slot: {
                                oltId: olt.id,
                                rack: parseInt(card.rack),
                                shelf: parseInt(card.shelf),
                                slot: parseInt(card.slot)
                            }
                        },
                        create: {
                            oltId: olt.id,
                            rack: parseInt(card.rack),
                            shelf: parseInt(card.shelf),
                            slot: parseInt(card.slot),
                            configType: card.configType,
                            status: card.status,
                            cpuUsage: card.cpuUsage,
                            memoryUsage: card.memoryUsage,
                            temperature: card.temperature || 0,
                            serialNumber: card.serialNumber,
                            upTime: card.upTime,
                            lastRestartReason: card.lastRestartReason
                        },
                        update: {
                            configType: card.configType,
                            status: card.status,
                            cpuUsage: card.cpuUsage,
                            memoryUsage: card.memoryUsage,
                            temperature: card.temperature || 0,
                            serialNumber: card.serialNumber,
                            upTime: card.upTime,
                            lastRestartReason: card.lastRestartReason
                        }
                    });
                }

                // C. Upsert ONUs
                // First, map ONUs to their port DB IDs
                const allPorts = await tx.ponPort.findMany({
                    where: { oltId: olt.id }
                });

                const portMap = new Map<string, string>();
                allPorts.forEach(p => portMap.set(p.portIndex, p.id));

                for (const onu of detailedOnus) {
                    const portId = portMap.get(onu.slotPort);
                    if (!portId) continue;

                    await tx.onu.upsert({
                        where: { serial: onu.serial },
                        create: {
                            serial: onu.serial,
                            slotPort: onu.slotPort,
                            onuId: parseInt(onu.onuId, 10),
                            ponPortId: portId,
                            name: onu.name || onu.description || undefined,
                            deviceType: onu.vendor,
                            vlan: onu.vlan || undefined,
                            pppoeUser: onu.pppoeUser || undefined,
                            pppoePass: onu.pppoePass || undefined,
                            tcontProfile: onu.tcontProfile || undefined,
                            lastSync: new Date(),
                        },
                        update: {
                            slotPort: onu.slotPort,
                            onuId: parseInt(onu.onuId, 10),
                            ponPortId: portId,
                            name: onu.name || onu.description || undefined,
                            vlan: onu.vlan || undefined,
                            pppoeUser: onu.pppoeUser || undefined,
                            pppoePass: onu.pppoePass || undefined,
                            tcontProfile: onu.tcontProfile || undefined,
                            lastSync: new Date(),
                        }
                    });
                }

                return { success: true, allPorts: allPorts.length, totalOnus: detailedOnus.length, oltId: olt.id };
            });
        }, connectionParams);
    } catch (error) {
        console.error("Sync Error, marking OLT offline:", error);
        // Mark OLT as OFFLINE in DB if possible (if we have ID or host)
        if (targetOlt && targetOlt.host) {
            await prisma.olt.update({
                where: { host: targetOlt.host },
                data: { status: "OFFLINE" }
            });
        }
        throw error;
    }
}
