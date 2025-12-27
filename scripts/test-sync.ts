
import { syncFromOlt } from "@/lib/sync-service";
import { prisma } from "@/lib/db";

async function main() {
    try {
        console.log("Running sync...");
        const result = await syncFromOlt();
        console.log("Sync success:", result);
    } catch (error) {
        console.error("Sync failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
