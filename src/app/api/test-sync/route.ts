import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triggerGlobalSync } from "@/app/actions/sync";

export async function POST(req: Request) {
    try {
        // 1. Check for OLT
        let olt = await prisma.olt.findFirst();
        if (!olt) {
            olt = await prisma.olt.create({
                data: {
                    name: "Test OLT",
                    host: "127.0.0.1",
                    community: "public",
                    snmpPort: 161,
                    telnetPort: 23,
                    user: "admin",
                    pass: "admin"
                }
            });
            console.log("Created Test OLT");
        }

        // 2. Trigger Sync
        const result = await triggerGlobalSync();
        return NextResponse.json({
            message: "Sync triggered",
            oltId: olt.id,
            result
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const jobs = await prisma.syncJob.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ jobs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
