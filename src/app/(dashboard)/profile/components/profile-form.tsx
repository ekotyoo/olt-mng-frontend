"use client";

import { useActionState } from "react";
import { updateProfile, changePassword } from "@/app/actions/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

type User = {
    id: string;
    name: string | null;
    email: string;
};

export default function ProfileForm({ user }: { user: User }) {
    return (
        <div className="space-y-6">
            <GeneralInfoForm user={user} />
            <SecurityForm />
        </div>
    );
}

function GeneralInfoForm({ user }: { user: User }) {
    const [state, action, isPending] = useActionState(updateProfile, {});

    useEffect(() => {
        if (state.success) toast.success(state.success);
        if (state.error) toast.error(state.error);
    }, [state]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" defaultValue={user.email} disabled className="bg-muted" />
                        <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" defaultValue={user.name || ""} />
                        {state.fieldErrors?.name && <p className="text-red-500 text-xs">{state.fieldErrors.name[0]}</p>}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function SecurityForm() {
    const [state, action, isPending] = useActionState(changePassword, {});

    useEffect(() => {
        if (state.success) toast.success(state.success);
        if (state.error) toast.error(state.error);
    }, [state]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Change your account password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" />
                        {state.error && state.error.includes("password") && <p className="text-red-500 text-xs">{state.error}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" name="newPassword" type="password" />
                        {state.fieldErrors?.newPassword && <p className="text-red-500 text-xs">{state.fieldErrors.newPassword[0]}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" />
                        {state.fieldErrors?.confirmPassword && <p className="text-red-500 text-xs">{state.fieldErrors.confirmPassword[0]}</p>}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" variant="destructive" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Lock className="mr-2 h-4 w-4" />
                            Change Password
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
