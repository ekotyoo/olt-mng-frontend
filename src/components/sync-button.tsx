"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { triggerSync } from "@/app/actions/sync";
import { formatDistanceToNow } from "date-fns";

export default function SyncButton({ lastSync, oltId }: { lastSync?: Date, oltId: string }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!lastSync) return;
        const diff = new Date().getTime() - new Date(lastSync).getTime();
        const tenMinutes = 10 * 60 * 1000;

        if (diff > tenMinutes) {
            console.log("Data stale, triggering background sync...");
            // Trigger without loading state to avoid UI disruption, but maybe show toast
            triggerSync(oltId);
        }
    }, [lastSync, oltId]);

    async function handleSync() {
        setLoading(true);
        toast.info("Starting synchronization...");

        const res = await triggerSync(oltId);

        setLoading(false);
        if (res.success) {
            toast.success("Sync completed successfully!");
        } else {
            toast.error("Sync failed: " + res.error);
        }
    }

    return (
        <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
                {lastSync
                    ? `Last synced ${formatDistanceToNow(lastSync)} ago`
                    : "Never synced"}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={loading}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Syncing..." : "Sync Now"}
            </Button>
        </div>
    );
}
