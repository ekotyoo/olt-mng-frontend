"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { getBillingSettings, updateBillingSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function BillingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dueDay, setDueDay] = useState(20);
    const [maxUnpaid, setMaxUnpaid] = useState(2);

    useEffect(() => {
        getBillingSettings().then(settings => {
            setDueDay(settings.dueDay);
            setMaxUnpaid(settings.maxUnpaid);
            setLoading(false);
        });
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            await updateBillingSettings(dueDay, maxUnpaid);
            toast.success("Billing settings updated");
        } catch (e) {
            console.error(e);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Billing Settings</h1>
                <p className="text-muted-foreground text-sm">Configure global billing cycle and policy.</p>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Invoicing & Suspension</CardTitle>
                    <CardDescription>
                        Set when invoices fall due and when to automatically suspend delinquent accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="dueDay">Global Due Day (of Month)</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="dueDay" 
                                type="number" 
                                min={1} 
                                max={28} 
                                value={dueDay} 
                                onChange={(e) => setDueDay(parseInt(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">Every month (1-28)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Invoices generated on the 1st will be due on this day.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="maxUnpaid">Max Unpaid Invoices</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="maxUnpaid" 
                                type="number" 
                                min={1} 
                                max={12} 
                                value={maxUnpaid} 
                                onChange={(e) => setMaxUnpaid(parseInt(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">Invoices</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Services will be suspended if a customer has this many (or more) unpaid invoices.
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
