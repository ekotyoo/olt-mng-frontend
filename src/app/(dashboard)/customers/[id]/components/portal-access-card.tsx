"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCustomerPassword } from "@/app/actions/billing";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function PortalAccessCard({ customerId, hasPassword }: { customerId: string, hasPassword: boolean }) {
    const [loading, setLoading] = useState(false);
    
    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const password = formData.get("password") as string;
            await updateCustomerPassword(customerId, password);
            toast.success("Portal password updated");
            (document.getElementById("portal-form") as HTMLFormElement).reset();
        } catch (e) {
            console.error(e);
            toast.error("Failed to update password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    Portal Access
                </CardTitle>
                <CardDescription>
                    Manage customer login for the self-service portal.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded border text-sm">
                    <ShieldCheck className={`w-4 h-4 ${hasPassword ? "text-green-500" : "text-gray-400"}`} />
                    <span>State: </span>
                    <span className={`font-medium ${hasPassword ? "text-green-600" : "text-yellow-600"}`}>
                        {hasPassword ? "Active (Password Set)" : "Inactive (No Password)"}
                    </span>
                </div>

                <form action={handleSubmit} id="portal-form" className="flex gap-2">
                    <div className="flex-1">
                        <Input 
                            name="password" 
                            type="password" 
                            placeholder={hasPassword ? "Reset Password" : "Set New Password"} 
                            required 
                            minLength={6}
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
