import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const total = await prisma.onu.count();
    const unassigned = await prisma.onu.count({
        where: { subscription: null }
    });

    console.log(`Total ONUs: ${total}`);
    console.log(`Unassigned ONUs: ${unassigned}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
