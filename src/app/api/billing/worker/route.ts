import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

        let generatedCount = 0;
        let suspendedCount = 0;
        const logs: string[] = [];

        // 1. GENERATE INVOICES
        const activeSubs = await prisma.subscription.findMany({
            where: { status: "active" },
            include: { plan: true }
        });

        for (const sub of activeSubs) {
            // Check if invoice exists for this month
            const existing = await prisma.invoice.findFirst({
                where: {
                    customerId: sub.customerId,
                    month: {
                        gte: startOfMonth,
                        lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
                    }
                }
            });

            if (!existing) {
                await prisma.invoice.create({
                    data: {
                        customerId: sub.customerId,
                        month: startOfMonth,
                        dueDate: dueDate,
                        amount: sub.plan.price,
                        status: "unpaid"
                    }
                });
                generatedCount++;
                logs.push(`Generated invoice for Customer ${sub.customerId}`);
            }
        }

        // 2. ENFORCE CUTOFF (SUSPEND OVERDUE)
        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                status: "unpaid",
                dueDate: { lt: today }, // Due date passed
                customer: {
                    subscriptions: {
                        some: { status: "active" } // Only suspend if still active
                    }
                }
            },
            include: { customer: { include: { subscriptions: true } } }
        });

        for (const inv of overdueInvoices) {
            // Suspend all active subscriptions for this customer
            for (const sub of inv.customer.subscriptions.filter(s => s.status === 'active')) {
                // A. Update Status
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: "suspended" }
                });

                // B. Add Radius Reject Rule
                // Check if rule exists
                const existingRule = await prisma.radCheck.findFirst({
                    where: { username: sub.username, attribute: "Auth-Type" }
                });

                if (!existingRule) {
                    await prisma.radCheck.create({
                        data: {
                            username: sub.username,
                            attribute: "Auth-Type",
                            op: ":=",
                            value: "Reject"
                        }
                    });
                } else if (existingRule.value !== "Reject") {
                    await prisma.radCheck.update({
                        where: { id: existingRule.id },
                        data: { value: "Reject" }
                    });
                }

                suspendedCount++;
                logs.push(`Suspended Subscription ${sub.id} (Overdue Invoice ${inv.id})`);
            }
        }

        revalidatePath("/invoices");
        revalidatePath("/customers");

        return NextResponse.json({
            success: true,
            generated: generatedCount,
            suspended: suspendedCount,
            logs
        });

    } catch (error: any) {
        console.error("Billing Worker Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
