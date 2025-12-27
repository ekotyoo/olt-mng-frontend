import { AttenuationInfo, OltCard, OltCardDetail, OltInfo, Onu, OnuDetails, PonPortOverview } from "./type";

/**
 * Remove header/footer lines from raw CLI output
 */
function cleanOutput(output: string): string[] {
    return output
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(
            (l) =>
                l &&
                !l.startsWith("-") &&
                !/^onu\s*index/i.test(l) &&
                !l.startsWith("ONU Number") &&
                !l.includes("ZXAN#")
        );
}

/**
 * Parse a single ONU state line into structured fields
 */
function parseOnuLine(line: string) {
    const match = line.match(
        /^(\d+\/\d+\/\d+:\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/
    );

    if (!match) return null;

    const [_, onuIndex, adminState, omccState, phaseState, channel] = match;

    return {
        onuIndex,
        portId: onuIndex.split(":")[0],
        adminState,
        omccState,
        phaseState,
        channel,
    };
}

/**
 * Aggregate ONU stats per port
 */
function aggregateByPort(parsedOnus: ReturnType<typeof parseOnuLine>[]) {
    const portMap: Record<
        string,
        { registered: number; online: number; offline: number }
    > = {};

    for (const onu of parsedOnus) {
        if (!onu) continue;

        const { portId, phaseState } = onu;

        if (!portMap[portId]) {
            portMap[portId] = { registered: 0, online: 0, offline: 0 };
        }

        portMap[portId].registered++;

        if (phaseState.toLowerCase() === "working") {
            portMap[portId].online++;
        } else {
            portMap[portId].offline++;
        }
    }

    return Object.entries(portMap).map(([port_id, stats]) => {
        let status = "healthy";
        if (stats.offline > 0 && stats.online > 0) {
            status = "partial";
        } else if (stats.online === 0) {
            status = "down";
        }

        return {
            port_id,
            onu_registered: stats.registered,
            onu_online: stats.online,
            onu_offline: stats.offline,
            status,
        };
    });
}

export function parseOnuIndices(output: string): string[] {
    return output
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => /^\d+\/\d+\/\d+:\d+/.test(l)) // match "1/1/2:19"
        .map((l) => l.split(/\s+/)[0]);
}


export function parseOnuDetail(output: string, slotPort: string, onuId: string): OnuDetails {
    const lines = output.split(/\r?\n/).map(l => l.trim());

    const detail: OnuDetails = {
        slotPort,
        onuId,
        serial: "",
        interface: "",
        name: "",
        type: "",
        state: "",
        serialNumber: "",
        description: "",
        distance: "",
        onlineDuration: "",
    };

    for (const line of lines) {
        if (line.startsWith("ONU interface:")) {
            detail.interface = line.split(":")[1].trim();
        }
        if (line.startsWith("Name:")) {
            detail.name = line.split(":")[1].trim();
        }
        if (line.startsWith("Type:")) {
            detail.type = line.split(":")[1].trim();
        }
        if (line.startsWith("State:")) {
            detail.state = line.split(":")[1].trim();
        }
        if (line.startsWith("Serial number:")) {
            detail.serialNumber = line.split(":")[1].trim();
            detail.serial = detail.serialNumber;
        }
        if (line.startsWith("Description:")) {
            detail.description = line.split(":")[1].trim();
        }
        if (line.startsWith("ONU Distance:")) {
            detail.distance = line.split(":")[1].trim();
        }
        if (line.startsWith("Online Duration:")) {
            detail.onlineDuration = line.split(":")[1].trim();
        }
    }

    return detail;
}



/**
 * Main entry point: parse raw OLT output into summaries
 */
export function parseOnuState(output: string): PonPortOverview[] {
    const lines = cleanOutput(output);
    const parsedOnus = lines.map(parseOnuLine).filter(Boolean);
    return aggregateByPort(parsedOnus);
}

export function parseOnuDetails(config: string): OnuDetails[] {
    const onuList: OnuDetails[] = [];

    // --- Parse ONU definitions (serials) ---
    const oltBlockRegex = /interface gpon-olt_(\d+\/\d+\/\d+)[\s\S]*?(?=interface|exit|$)/g;
    let oltMatch;
    while ((oltMatch = oltBlockRegex.exec(config)) !== null) {
        const slotPort = oltMatch[1];
        const block = oltMatch[0];

        const onuRegex = /onu\s+(\d+)\s+type\s+(\S+)\s+sn\s+(\S+)/g;
        let onuMatch;
        while ((onuMatch = onuRegex.exec(block)) !== null) {
            onuList.push({
                slotPort,
                onuId: onuMatch[1],
                vendor: onuMatch[2],
                serial: onuMatch[3],
                vlan: null,
                pppoeUser: null,
                pppoePass: null,
                tcontProfile: null,
            });
        }
    }

    // --- Parse pon-onu-mng (vlan + PPPoE) ---
    const ponMngRegex = /pon-onu-mng gpon-onu_(\d+\/\d+\/\d+):(\d+)[\s\S]*?(?=pon-onu-mng|interface|exit|$)/g;
    let ponMatch;
    while ((ponMatch = ponMngRegex.exec(config)) !== null) {
        const slotPort = ponMatch[1];
        const onuId = ponMatch[2];
        const block = ponMatch[0];

        const vlanMatch = /vlan\s+(\d+)/.exec(block);
        const pppoeMatch = /username\s+(\S+)\s+password\s+(\S+)/.exec(block);

        const onu = onuList.find(o => o.slotPort === slotPort && o.onuId === onuId);
        if (onu) {
            if (vlanMatch) onu.vlan = vlanMatch[1];
            if (pppoeMatch) {
                onu.pppoeUser = pppoeMatch[1];
                onu.pppoePass = pppoeMatch[2];
            }
        }
    }

    // --- Parse gpon-onu interface (TCONT profile) ---
    const onuIfRegex = /interface gpon-onu_(\d+\/\d+\/\d+):(\d+)[\s\S]*?(?=interface|pon-onu-mng|exit|$)/g;
    let onuIfMatch;
    while ((onuIfMatch = onuIfRegex.exec(config)) !== null) {
        const slotPort = onuIfMatch[1];
        const onuId = onuIfMatch[2];
        const block = onuIfMatch[0];

        const tcontMatch = /tcont\s+\d+\s+profile\s+(\S+)/.exec(block);

        const onu = onuList.find(o => o.slotPort === slotPort && o.onuId === onuId);
        if (onu && tcontMatch) {
            onu.tcontProfile = tcontMatch[1];
        }
    }

    return onuList;
}

export function parseAttenuationInfo(cliOutput: string): AttenuationInfo {
    const lines = cliOutput.split("\n").map(l => l.trim()).filter(Boolean);

    const results: AttenuationInfo = [];

    for (const line of lines) {
        if (line.startsWith("up") || line.startsWith("down")) {
            const [direction, ...rest] = line.split(/\s+/);

            // Match Rx, Tx, Attenuation values
            const rxMatch = line.match(/Rx\s*:?(-?\d+(\.\d+)?)/);
            const txMatch = line.match(/Tx\s*:?(-?\d+(\.\d+)?)/);
            const attMatch = line.match(/(\-?\d+\.\d+)\(dB\)/);

            results.push({
                direction: direction as "up" | "down",
                rx: rxMatch ? parseFloat(rxMatch[1]) : NaN,
                tx: txMatch ? parseFloat(txMatch[1]) : NaN,
                attenuation: attMatch ? parseFloat(attMatch[1]) : NaN,
            });
        }
    }

    return results;
}

export function parseSystemGroup(raw: string): OltInfo {
    const clean = (val: string) =>
        val.replace(/\r/g, "").replace(/\x00/g, "").trim();

    const result: any = {};
    const lines = raw.split("\n");

    for (const line of lines) {
        if (line.includes(":")) {
            const [key, ...rest] = line.split(":");
            const value = clean(rest.join(":"));

            switch (key.trim()) {
                case "Started before":
                    result.upTime = value;
                    break;
                case "Contact with":
                    result.contact = value;
                    break;
                case "System name":
                    result.systemName = value;
                    break;
                case "Location":
                    result.location = value;
                    break;
                default:
                    break;
            }
        }

        if (line.startsWith("This system primarily offers")) {
            const num = line.match(/\d+/);
            result.ServicesOffered = num ? parseInt(num[0]) : null;
        }
    }

    console.log(result);

    return {
        upTime: result.upTime || "-",
        contact: result.contact || "-",
        systemName: result.systemName || "-",
        location: result.location || "-",
    };
}

export function parseOltCard(raw: string): OltCard[] {
    const cards: OltCard[] = [];

    // Skip header lines
    const lines = raw.split("\n").filter(l => /^\s*\d/.test(l));

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        // Typical Output:
        // Rack Shelf Slot CfgType RealType Port HardVer SoftVer Status
        // 1    1     1    GTGH    GTGH      16   V1.0    V1.2.3  InService
        if (parts.length >= 8) {
            cards.push({
                rack: parts[0],
                shelf: parts[1],
                slot: parts[2],
                cfgType: parts[3],
                realType: parts[4],
                ports: parts[5],
                hardwareVersion: parts[6], // Simplified logic
                softwareVersion: parts[7],
                status: parts[parts.length - 1],
            });
        }
    });

    return cards;
}

function extractPairs(line: string): [string, string][] {
    const regex = /([A-Za-z\-\s]+):\s*([^:]+?)(?=\s{2,}[A-Za-z\-\s]+:|$)/g;
    const pairs: [string, string][] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
        pairs.push([match[1].trim(), match[2].trim()]);
    }
    return pairs;
}

function shortenUptime(raw: string): string {
    const regex = /(\d+)\s*Days?,?\s*(\d+)\s*Hours?,?\s*(\d+)\s*Minutes?,?\s*(\d+)\s*Seconds?/i;
    const match = raw.match(regex);

    if (!match) return raw; // fallback if parsing fails

    const days = parseInt(match[1], 10);
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);

    // choose your format:
    if (days > 0) return `${days}d ${hours}h`; // e.g. "103d 3h"
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function parseOltCardDetail(
    raw: string,
    rack: string,
    shelf: string,
    slot: string
): OltCardDetail {
    const version = (v: string) => v.match(/V\d+\.\d+\.\d+/)?.[0] ?? "";
    const parseMemory = (v: string) => {
        const m = v.match(/(\d+)(MB|GB)/i);
        if (!m) return 0;
        const num = parseInt(m[1], 10);
        return m[2].toUpperCase() === "GB" ? num * 1024 : num;
    };
    const parsePercent = (v: string) => parseInt(v.replace("%", "").trim(), 10) || 0;

    const result: OltCardDetail = {
        rack, shelf, slot,
        configType: "-",
        status: "-",
        ports: 0,
        serialNumber: "-",
        phyMemorySize: 0,
        hardwareVersion: "-",
        softwareVersion: "-",
        cpuUsage: 0,
        memoryUsage: 0,
        upTime: "-",
        lastRestartReason: "-"
    };

    raw.split("\n").forEach(line => {
        extractPairs(line).forEach(([key, value]) => {
            switch (key) {
                case "Config-Type": result.configType = value; break;
                case "Status": result.status = value; break;
                case "Port-Number": result.ports = parseInt(value, 10) || 0; break;
                case "Serial-Number": result.serialNumber = value; break;
                case "Phy-Mem-Size": result.phyMemorySize = parseMemory(value); break;
                case "Hardware-VER": result.hardwareVersion = version(value); break;
                case "Software-VER": result.softwareVersion = version(value); break;
                case "Cpu-Usage": result.cpuUsage = parsePercent(value); break;
                case "Mem-Usage": result.memoryUsage = parsePercent(value); break;
                case "Uptime": result.upTime = shortenUptime(value); break;
                case "Last restart reason": result.lastRestartReason = value; break;
            }
        });
    });

    return result;
}




export function parseUnconfiguredOnus(output: string): Onu[] {
    const lines = cleanOutput(output);
    const onus: Onu[] = [];
    const regex = /gpon-onu_(\d+\/\d+\/\d+):(\d+)\s+(\S+)/;

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            onus.push({
                slot_port: match[1],
                serial: match[3]
            });
        }
    }
    return onus;
}

export function parseTrafficProfiles(output: string): string[] {
    const lines = cleanOutput(output);
    const profiles: string[] = [];
    // Example Output:
    // Profile-Name: 10M
    // Profile-Name: 20M
    // or tabular
    // 1    10M     ...

    const regex = /^\d+\s+(\S+)/; // Matches "1   10M"

    for (const line of lines) {
        if (line.includes("Profile-Name:")) {
            profiles.push(line.split(":")[1].trim());
        } else {
            const match = line.match(regex);
            if (match && !line.includes("Name")) {
                profiles.push(match[1]);
            }
        }
    }
    return [...new Set(profiles)].filter(p => !p.toLowerCase().includes("name"));
}

export function parseVlanProfiles(output: string): string[] {
    const lines = cleanOutput(output);
    const profiles: string[] = [];
    const regex = /^\d+\s+(\S+)/;

    for (const line of lines) {
        const match = line.match(regex);
        if (match && !line.includes("Name") && !line.includes("Profile")) {
            profiles.push(match[1]);
        }
    }
    return profiles;
}

export function parseVlans(output: string): { id: string, name: string }[] {
    const lines = cleanOutput(output);
    const vlans: { id: string, name: string }[] = [];
    // Typical "show vlan" output:
    // VLAN  Name  ...
    // 100   Inet  ...

    const regex = /^(\d+)\s+(\S+)/;

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            vlans.push({
                id: match[1],
                name: match[2]
            });
        }
    }
    return vlans;
}

import { SystemLog } from "./type";

export function parseSystemLogs(output: string): SystemLog[] {
    const lines = cleanOutput(output);
    const logs: SystemLog[] = [];

    // Example line:
    // alarm code 1234 level minor occurred at 00:28:37 Mon Nov 10 2025 utc reason: GPON alarm link loss

    // Heuristic Regex
    // Look for "level <lvl> occurred at <time> <msg>"
    // or just generally split by certain keywords if strict regex fails.

    // Based on previous debug output: 
    // "level minor occurred at 00:28:37  Mon  Nov 10  2025  utc  reason: GPON alarm link loss"

    const regex = /level\s+(\w+)\s+occurred\s+at\s+(\d+:\d+:\d+\s+[A-Za-z]+\s+[A-Za-z]+\s+\d+\s+\d{4})\s+(?:utc)?\s*(.*)/i;
    // We might also want to capture "code X" if present before level.
    const codeRegex = /code\s+(\d+)/i;

    let idCounter = 0;

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            const level = match[1];
            const dateStr = match[2]; // e.g., "00:28:37 Mon Nov 10 2025"
            let message = match[3];

            // Clean up message
            if (message.startsWith("reason:")) message = message.substring(7).trim();

            const codeMatch = line.match(codeRegex);
            const code = codeMatch ? codeMatch[1] : null;

            // Try to parse date, or keep raw string
            // "00:28:37 Mon Nov 10 2025" might be parseable by Date.parse with some massaging
            // Start with raw string for display

            logs.push({
                id: `log-${Date.now()}-${idCounter++}`, // temporary unique id
                date: dateStr,
                level: level.toUpperCase(),
                message: message,
                code: code
            });
        }
    }

    return logs.reverse(); // Newest first usually preferred
}
