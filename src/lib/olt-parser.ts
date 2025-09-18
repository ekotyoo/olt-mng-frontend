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


export function parseOnuDetail(output: string): OnuDetails {
    const lines = output.split(/\r?\n/).map(l => l.trim());

    const detail: OnuDetails = {
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

