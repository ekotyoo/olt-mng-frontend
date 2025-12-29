import { NextResponse } from "next/server";
import { triggerGlobalSync } from "@/app/actions/sync";
import { runDailyBillingJob } from "@/app/actions/billing";

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET(req: Request) {
    // In production, you should verify a secret token header
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        console.log("[Cron] Starting scheduled jobs...");

        // 1. Sync Logic
        const syncResult = await triggerGlobalSync();

        // 2. Billing Logic
        const billingResult = await runDailyBillingJob();
        console.log("[Cron] Billing Job:", billingResult.logs);

        return NextResponse.json({
            sync: syncResult,
            billing: billingResult
        });
    } catch (error: any) {
        console.error("[Cron] Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
