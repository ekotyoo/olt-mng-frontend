import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { runDailyBillingJob } = await import("@/app/actions/billing");

        // Run the robust billing job (includes Radius CoA and System Settings)
        const result = await runDailyBillingJob();

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ success: false, error: "Job returned failure" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Billing Worker Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
