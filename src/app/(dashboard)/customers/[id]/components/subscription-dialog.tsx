"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createSubscription } from "@/app/actions/billing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Plan = {
    id: string;
    name: string;
    price: any;
};

import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/map/location-picker"), { 
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-slate-100 animate-pulse rounded-md" />
});

export default function SubscriptionDialog({ customerId, plans }: { customerId: string, plans: Plan[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<{ lat: number, lng: number }>({ lat: 0, lng: 0 });
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const data = {
            customerId,
            planId: formData.get("planId") as string,
            username: formData.get("username") as string,
            password: formData.get("password") as string,
            latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
            longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
        };

        try {
            await createSubscription(data);
            toast.success("Subscription created & synced to Radius");
            setOpen(false);
            router.refresh();
        } catch (e) {
            console.error(e);
            toast.error("Failed to create subscription");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subscription
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Subscription</DialogTitle>
                        <DialogDescription>
                            Assign a plan and create PPPoE credentials.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="plan" className="text-right">
                                Plan
                            </Label>
                            <div className="col-span-3">
                                <Select name="planId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(p.price))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                PPPoE User
                            </Label>
                            <Input id="username" name="username" placeholder="user@net" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input id="password" name="password" type="password" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">
                                Location
                            </Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex gap-2">
                                    <Input 
                                        name="latitude" 
                                        placeholder="Lat" 
                                        type="number" 
                                        step="any" 
                                        value={coords.lat} 
                                        onChange={e => setCoords({...coords, lat: Number(e.target.value)})}
                                    />
                                    <Input 
                                        name="longitude" 
                                        placeholder="Long" 
                                        type="number" 
                                        step="any" 
                                        value={coords.lng}
                                        onChange={e => setCoords({...coords, lng: Number(e.target.value)})}
                                    />
                                </div>
                                <LocationPicker 
                                    value={coords.lat ? { lat: coords.lat, lng: coords.lng } : undefined}
                                    onChange={(lat, lng) => setCoords({ lat, lng })}
                                />
                                <p className="text-xs text-muted-foreground">Click on the map to set location.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Subscription"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
