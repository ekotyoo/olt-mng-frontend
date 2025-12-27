"use server";

import { prisma } from "@/lib/db";

export async function getOltList() {
    return await prisma.olt.findMany({
        select: {
            id: true,
            name: true,
            host: true
        },
        orderBy: {
            name: 'asc'
        }
    });
}
