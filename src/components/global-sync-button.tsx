"use client";

import { triggerGlobalSync } from "@/app/actions/sync";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GlobalSyncButton() {
    const [loading, setLoading] = useState(false);

    async function handleSync() {
        try {
            setLoading(true);
            const res = await triggerGlobalSync();
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error("Global Sync Failed: " + res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Global Sync Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={loading}
            className="gap-2"
        >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            Sync All
        </Button>
    )
}
