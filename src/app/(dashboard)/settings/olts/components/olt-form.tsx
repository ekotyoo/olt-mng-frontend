"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createOlt, updateOlt, OltInput } from "@/app/actions/olt-management";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Olt } from "@prisma/client";

export default function OltForm({ initialData }: { initialData?: Olt }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const data: OltInput = {
            name: formData.get("name") as string,
            host: formData.get("host") as string,
            port: parseInt(formData.get("port") as string),
            username: formData.get("username") as string,
            password: formData.get("password") as string,
            type: "ZTE", // Hardcoded for now
        };

        const res = initialData
            ? await updateOlt(initialData.id, data)
            : await createOlt(data);

        if (res.success) {
            toast.success(initialData ? "OLT updated" : "OLT created");
            router.push("/settings/olts");
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Main OLT" required defaultValue={initialData?.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="host">Host / IP</Label>
                <Input id="host" name="host" placeholder="192.168.1.1" required defaultValue={initialData?.host} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input id="port" name="port" type="number" placeholder="23" required defaultValue={initialData?.port || 23} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="admin" required defaultValue={initialData?.username} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required defaultValue={initialData?.password} />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save OLT"}
            </Button>
        </form>
    );
}
