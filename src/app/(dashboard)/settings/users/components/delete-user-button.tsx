"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/app/actions/user";
import { toast } from "sonner";
import { useState } from "react";

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

        setLoading(true);
        try {
            await deleteUser(userId);
            toast.success("User deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete user");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
            <Trash2 className="w-4 h-4" />
        </Button>
    );
}
