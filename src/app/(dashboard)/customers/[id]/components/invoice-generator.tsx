"use client";

import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { generateInvoice } from "@/app/actions/billing";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceGenerator({ customerId }: { customerId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleGenerate() {
        setLoading(true);
        try {
            const today = new Date();
            await generateInvoice(customerId, today);
            toast.success("Invoice generated successfully");
            router.refresh();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to generate invoice");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading}>
            <Receipt className="w-4 h-4 mr-2" />
            {loading ? "Generating..." : "Generate Invoice (Now)"}
        </Button>
    );
}
