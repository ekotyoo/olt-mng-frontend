"use client";

import { Button } from "@/components/ui/button";
import { PowerOff } from "lucide-react";
import { disconnectSession } from "@/app/actions/radius";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DisconnectButton({ sessionId, username }: { sessionId: string, username: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDisconnect() {
        if(!confirm(`Disconnect user session for ${username}?`)) return;
        
        setLoading(true);
        try {
            await disconnectSession(sessionId);
            toast.success("Session disconnected");
            router.refresh();
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to disconnect");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDisconnect} disabled={loading} title="Disconnect Session">
            <PowerOff className="w-4 h-4" />
        </Button>
    );
}
