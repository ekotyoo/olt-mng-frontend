"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- VALIDATION SCHEMAS ---
const CustomerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
});

const PlanSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0),
    uploadSpeed: z.number().int().min(1), // Kbps
    downloadSpeed: z.number().int().min(1), // Kbps
});

const SubscriptionSchema = z.object({
    customerId: z.string(),
    planId: z.string(),
    onuId: z.string().optional(), // Optional link to ONU
    username: z.string().min(3), // PPPoE User
    password: z.string().min(3), // PPPoE Pass
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
});

// --- ACTIONS ---

export async function createCustomer(data: z.infer<typeof CustomerSchema>) {
    const validated = CustomerSchema.parse(data);

    await prisma.customer.create({
        data: {
            name: validated.name,
            email: validated.email || null,
            phone: validated.phone || null,
            address: validated.address || null,
        }
    });

    revalidatePath("/customers");
    return { success: true };
}

export async function createServicePlan(data: z.infer<typeof PlanSchema>) {
    const validated = PlanSchema.parse(data);

    // Create Plan in DB
    const plan = await prisma.servicePlan.create({
        data: {
            name: validated.name,
            price: validated.price,
            uploadSpeed: validated.uploadSpeed,
            downloadSpeed: validated.downloadSpeed,
            radiusGroup: validated.name.toLowerCase().replace(/\s+/g, "_") // e.g. "Gold 50M" -> "gold_50m"
        }
    });

    // Create Radius Group (Mikrotik Rate Limit)
    // Mikrotik-Rate-Limit = "20M/50M" (Up/Down)
    const rateLimit = `${Math.round(validated.uploadSpeed / 1024)}M/${Math.round(validated.downloadSpeed / 1024)}M`;

    // We insert into radgroupreply
    if (plan.radiusGroup) {
        await prisma.radGroupReply.create({
            data: {
                groupname: plan.radiusGroup,
                attribute: "Mikrotik-Rate-Limit",
                op: ":=",
                value: `${validated.uploadSpeed}M/${validated.downloadSpeed}M` // Assuming input is Mbps
            }
        });
    }

    revalidatePath("/plans");
    return { success: true };
}

export async function updateServicePlan(id: string, data: z.infer<typeof PlanSchema>) {
    const validated = PlanSchema.parse(data);

    // 1. Update Plan
    const plan = await prisma.servicePlan.update({
        where: { id },
        data: {
            name: validated.name,
            price: validated.price,
            uploadSpeed: validated.uploadSpeed,
            downloadSpeed: validated.downloadSpeed,
        }
    });

    // 2. Update Radius Group (Mikrotik Rate Limit)
    // If original plan had a radius group, we update its rate limit.
    if (plan.radiusGroup) {
        // Create or Update logic (Upsert isn't perfect here due to lack of unique constraint on groupname in schema sometimes, 
        // but RadGroupReply usually doesn't enforce unique groupname+attribute). 
        // We will try to update existing or create new.

        // Check if exists
        const existing = await prisma.radGroupReply.findFirst({
            where: {
                groupname: plan.radiusGroup,
                attribute: "Mikrotik-Rate-Limit"
            }
        });

        const rateLimitValue = `${validated.uploadSpeed}M/${validated.downloadSpeed}M`; // Assuming inputs are Mbps

        if (existing) {
            await prisma.radGroupReply.update({
                where: { id: existing.id },
                data: {
                    value: rateLimitValue
                }
            });
        } else {
            await prisma.radGroupReply.create({
                data: {
                    groupname: plan.radiusGroup,
                    attribute: "Mikrotik-Rate-Limit",
                    op: ":=",
                    value: rateLimitValue
                }
            });
        }
    }

    revalidatePath("/plans");
    return { success: true };
}

export async function createSubscription(data: z.infer<typeof SubscriptionSchema>) {
    const validated = SubscriptionSchema.parse(data);

    const plan = await prisma.servicePlan.findUnique({ where: { id: validated.planId } });
    if (!plan) throw new Error("Plan not found");

    // 1. Create Subscription
    const sub = await prisma.subscription.create({
        data: {
            customerId: validated.customerId,
            planId: validated.planId,
            onuId: validated.onuId || null,
            username: validated.username,
            password: validated.password,
            latitude: validated.latitude || null,
            longitude: validated.longitude || null,
            status: "active"
        }
    });

    // 2. Sync to RadCheck (Cleartext-Password)
    await prisma.radCheck.create({
        data: {
            username: validated.username,
            attribute: "Cleartext-Password",
            op: ":=",
            value: validated.password
        }
    });

    // 3. Sync to RadUserGroup (Link to Plan)
    if (plan.radiusGroup) {
        await prisma.radUserGroup.create({
            data: {
                username: validated.username,
                groupname: plan.radiusGroup,
                priority: 1
            }
        });
    }

    revalidatePath("/customers");
    return { success: true };
}

// --- INVOICING (MANUAL) ---

export async function generateInvoice(customerId: string, month: Date) {
    // 1. Find active subscription
    const sub = await prisma.subscription.findFirst({
        where: { customerId, status: "active" },
        include: { plan: true }
    });

    if (!sub) throw new Error("No active subscription");

    // 2. Create Invoice
    await prisma.invoice.create({
        data: {
            customerId,
            month: month,
            amount: sub.plan.price,
            status: "unpaid"
        }
    });

    revalidatePath("/invoices");
    return { success: true };
}

export async function markInvoicePaid(invoiceId: string, amount: number, method: string = "Cash") {
    // 1. Create Payment
    await prisma.payment.create({
        data: {
            invoiceId,
            amount,
            method,
            paidAt: new Date()
        }
    });

    // 2. Update Invoice to 'paid'
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "paid" }
    });

    revalidatePath("/invoices");
    return { success: true };
}

export async function updateCustomerPassword(customerId: string, password: string) {
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters");

    await prisma.customer.update({
        where: { id: customerId },
        data: { portalPassword: password }
    });

    revalidatePath(`/customers/${customerId}`);
    return { success: true };
}

// --- AUTOMATION JOB ---

export async function runDailyBillingJob() {
    const now = new Date();
    const today = now.getDate();
    const settings = await prisma.systemSetting.findMany({ where: { key: { in: ["billing_due_day", "billing_max_unpaid"] } } });

    const dueDay = parseInt(settings.find(s => s.key === "billing_due_day")?.value || "20");
    const maxUnpaid = parseInt(settings.find(s => s.key === "billing_max_unpaid")?.value || "2");

    const logs: string[] = [];

    // 1. GENERATE INVOICES (On the 1st of the month)
    if (today === 1) {
        logs.push("It's the 1st of the month. Starting invoice generation...");
        // Find all ACTIVE subscriptions
        const subs = await prisma.subscription.findMany({
            where: { status: "active" },
            include: { plan: true }
        });

        const monthDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

        let generatedCount = 0;
        for (const sub of subs) {
            // Check if already exists
            const exists = await prisma.invoice.findFirst({
                where: {
                    customerId: sub.customerId,
                    month: monthDate
                }
            });

            if (!exists) {
                await prisma.invoice.create({
                    data: {
                        customerId: sub.customerId,
                        month: monthDate,
                        dueDate: dueDate,
                        amount: sub.plan.price,
                        status: "unpaid"
                    }
                });
                generatedCount++;
            }
        }
        logs.push(`Generated ${generatedCount} invoices.`);
    }

    // 2. SUSPENSION POLICY (Daily Check)
    logs.push("Checking for delinquent accounts...");

    // Find customers with active subscriptions
    const activeCustomers = await prisma.customer.findMany({
        where: { status: "active" },
        include: {
            invoices: {
                where: { status: "unpaid" }
            },
            subscriptions: true
        }
    });

    let suspendedCount = 0;
    for (const customer of activeCustomers) {
        const unpaidCount = customer.invoices.length;

        if (unpaidCount >= maxUnpaid) {
            // Suspend Account
            await prisma.customer.update({
                where: { id: customer.id },
                data: { status: "disabled" }
            });

            // Suspend Subscriptions
            // We also need to disconnect Radius sessions!
            // We can't easily import from 'radius.ts' if it creates circular dependency but let's try or handle DB directly.

            // 1. Update Subscriptions to 'suspended'
            await prisma.subscription.updateMany({
                where: { customerId: customer.id },
                data: { status: "suspended" }
            });

            // 2. Disable Radius Access (RadCheck)
            // Convention: Add 'Auth-Type := Reject' or just remove password? 
            // Better: update radcheck to have "Auth-Type := Reject" or change password to invalid.
            // Let's use the standard "Simultaneous-Use := 0" or group change.
            // Simplest: Change status in our DB, and Radius should check that?
            // Existing logic might rely on `RadCheck` presence.
            // Let's just DELETE their RadCheck password entry for now, effectively blocking login.
            // Or better, set Attribute "Auth-Type" := "Reject".

            for (const sub of customer.subscriptions) {
                // Clear existing check items to be safe or upsert Reject
                // Getting complicated. Let's just set the User Status.
                // Assuming Authentication checks Subscription Status? 
                // Standard Radius usually only checks RadCheck table.
                // So we MUST update RadCheck.

                // Remove Cleartext-Password
                await prisma.radCheck.deleteMany({
                    where: { username: sub.username, attribute: "Cleartext-Password" }
                });

                // Add Auth-Type = Reject
                await prisma.radCheck.create({
                    data: {
                        username: sub.username,
                        attribute: "Auth-Type",
                        op: ":=",
                        value: "Reject"
                    }
                });

                // KICK Session (Disconnect)
                const activeSessions = await prisma.radAcct.findMany({
                    where: { username: sub.username, acctStopTime: null }
                });

                const { sendDisconnectPacket } = await import("@/lib/radius/coa");

                for (const session of activeSessions) {
                    // Try to disconnect via Radius CoA
                    const nas = await prisma.nas.findUnique({
                        where: { nasname: session.nasIpAddress }
                    });

                    let terminateCause = "Admin-Suspend";

                    if (nas) {
                        const result = await sendDisconnectPacket(nas.nasname, nas.secret, session.acctSessionId, session.username);
                        if (!result.success) {
                            logs.push(`CoA Failed for ${session.username}: ${result.message}`);
                        } else {
                            logs.push(`Sent Disconnect to NAS for ${session.username}`);
                        }
                    }

                    await prisma.radAcct.update({
                        where: { radAcctId: session.radAcctId },
                        data: { acctStopTime: new Date(), acctTerminateCause: terminateCause }
                    });
                }
            }

            suspendedCount++;
            logs.push(`Suspended Customer: ${customer.name} (${unpaidCount} unpaid invoices)`);
        }
    }

    return { success: true, logs };
}
