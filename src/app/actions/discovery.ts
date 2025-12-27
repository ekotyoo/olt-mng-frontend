"use server";

import { prisma } from "@/lib/db";
import { getUnconfiguredOnus } from "./onu";
import { Onu } from "@/lib/type";

export interface DiscoveredDevice extends Onu {
    oltId: string;
    oltName: string;
}

export async function scanAllUnconfiguredDevices(): Promise<DiscoveredDevice[]> {
    const olts = await prisma.olt.findMany();
    const results: DiscoveredDevice[] = [];
    const BATCH_SIZE = 2;

    // Process in batches to prevent overwhelming the OLTs / Server
    for (let i = 0; i < olts.length; i += BATCH_SIZE) {
        const batch = olts.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (olt) => {
            try {
                const onus = await getUnconfiguredOnus(olt.id);
                return onus.map(o => ({
                    ...o,
                    oltId: olt.id,
                    oltName: olt.name
                }));
            } catch (error) {
                console.error(`Failed to scan OLT ${olt.name}:`, error);
                return [];
            }
        });

        const settled = await Promise.allSettled(promises);

        settled.forEach(res => {
            if (res.status === "fulfilled") {
                results.push(...res.value);
            }
        });
    }

    return results;
}
