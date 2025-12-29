"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingTrigger() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRun() {
        if (!confirm("Run Billing Cycle? This will generate invoices for the current month and suspend overdue accounts.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/billing/worker", { method: "POST" });
            const data = await res.json();
            
            if (data.success) {
                toast.success(`Cycle Complete: Generated ${data.generated}, Suspended ${data.suspended}`);
                router.refresh();
            } else {
                toast.error("Billing cycle failed: " + data.error);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button onClick={handleRun} disabled={loading} variant="default">
            <Play className="w-4 h-4 mr-2" />
            {loading ? "Processing..." : "Run Billing Cycle"}
        </Button>
    );
}
