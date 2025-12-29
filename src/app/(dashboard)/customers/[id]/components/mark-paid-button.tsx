"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { markInvoicePaid } from "@/app/actions/billing";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkPaidButton({ invoiceId, amount }: { invoiceId: string, amount: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handlePay() {
        if(!confirm("Mark this invoice as PAID with Cash?")) return;
        
        setLoading(true);
        try {
            await markInvoicePaid(invoiceId, amount, "Cash");
            toast.success("Payment recorded");
            router.refresh();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to record payment");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handlePay} disabled={loading}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {loading ? "..." : "Mark Paid"}
        </Button>
    );
}
