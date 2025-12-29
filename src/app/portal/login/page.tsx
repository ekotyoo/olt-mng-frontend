"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginCustomer } from "@/app/actions/portal";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const res = await loginCustomer(formData);
            if (res?.error) {
                toast.error(res.error);
                setLoading(false);
            }
            // If success, server action redirects
        } catch (e) {
            console.error(e);
            toast.error("Login failed");
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account.
                    </CardDescription>
                </CardHeader>
                <form action={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
