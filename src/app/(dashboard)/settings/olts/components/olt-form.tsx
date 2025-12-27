"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createOlt, updateOlt, testConnection, OltInput } from "@/app/actions/olt-management";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Olt } from "@prisma/client";
import { Eye, EyeOff, Loader2, Network } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OltForm({ initialData }: { initialData?: Olt }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; error?: string } | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        host: initialData?.host || "",
        port: initialData?.port?.toString() || "23",
        username: initialData?.username || "",
        password: initialData?.password || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear test result on change
        if (testResult) setTestResult(null);
    };

    async function handleTestConnection() {
        setTesting(true);
        setTestResult(null);

        try {
            const data: OltInput = {
                ...formData,
                port: parseInt(formData.port),
                type: "ZTE",
            };

            const res = await testConnection(data);
            if (res.success) {
                setTestResult({ success: true, latency: res.latency });
                toast.success(`Connection successful! (${res.latency}ms)`);
            } else {
                setTestResult({ success: false, error: res.error });
                toast.error("Connection failed");
            }
        } catch (e) {
            toast.error("An unexpected error occurred");
        } finally {
            setTesting(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const data: OltInput = {
            ...formData,
            port: parseInt(formData.port),
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">

            {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "border-green-500 text-green-700 bg-green-50" : ""}>
                    <Network className="h-4 w-4" />
                    <AlertTitle>{testResult.success ? "Connected Successfully" : "Connection Failed"}</AlertTitle>
                    <AlertDescription>
                        {testResult.success
                            ? `Latency: ${testResult.latency}ms`
                            : testResult.error}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Main OLT" required value={formData.name} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="host">Host / IP</Label>
                        <Input id="host" name="host" placeholder="192.168.1.1" required value={formData.host} onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" name="port" type="number" placeholder="23" required value={formData.port} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" placeholder="admin" required value={formData.username} onChange={handleChange} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleTestConnection}
                    disabled={testing || loading}
                >
                    {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Network className="mr-2 h-4 w-4" />}
                    Test Connection
                </Button>
                <Button type="submit" disabled={loading || testing} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save OLT"}
                </Button>
            </div>
        </form>
    );
}
