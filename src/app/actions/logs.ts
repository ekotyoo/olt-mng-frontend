"use server";

import { runOltCommand, runOltSession } from "@/lib/telnet-service";
import { parseSystemLogs } from "@/lib/olt-parser";
import { SystemLog } from "@/lib/type";
import { getOltConnectionParams } from "./olt";

export async function getSystemLogs(oltId: string): Promise<SystemLog[]> {
    const params = await getOltConnectionParams(oltId);

    // logs needs more time to fetch potentially if buffer is large
    // override timeout if possible, but our runOltSession uses default.
    // Let's use runOltSession with custom logic if we need paging, but for "show logging alarm" it might be one scroll.

    return await runOltSession(async (session) => {
        // Some OLTs might need "show logging alarm" or just "show logging"
        // Paging might be an issue. "terminal length 0" is sent by session init, so it should dump all.
        const output = await session.sendCommand("show logging alarm");
        return parseSystemLogs(output);
    }, params);
}
