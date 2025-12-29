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
import { Plus, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { createServicePlan, updateServicePlan } from "@/app/actions/billing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Plan {
    id: string;
    name: string;
    price: number;
    uploadSpeed: number;
    downloadSpeed: number;
}

interface PlanDialogProps {
    plan?: Plan; // If provided, we are in Edit Mode
}

export default function PlanDialog({ plan }: PlanDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const downMbps = parseFloat(formData.get("download") as string);
        const upMbps = parseFloat(formData.get("upload") as string);
        
        const data = {
            name,
            price,
            downloadSpeed: downMbps * 1024, // Convert to Kbps
            uploadSpeed: upMbps * 1024,     // Convert to Kbps
        };

        try {
            if (plan) {
                await updateServicePlan(plan.id, data);
                toast.success("Plan updated successfully");
            } else {
                await createServicePlan(data);
                toast.success("Service Plan created");
            }
            setOpen(false);
            router.refresh();
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to save plan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {plan ? (
                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit Plan</span>
                    </Button>
                ) : (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Plan
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{plan ? "Edit Service Plan" : "Create Service Plan"}</DialogTitle>
                        <DialogDescription>
                            {plan ? "Update plan details and bandwidth limits." : "Define a new internet package. Speeds are in Mbps."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input 
                                id="name" 
                                name="name" 
                                defaultValue={plan?.name}
                                placeholder="e.g. Home 20M" 
                                className="col-span-3" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price (IDR)
                            </Label>
                            <Input 
                                id="price" 
                                name="price" 
                                type="number" 
                                defaultValue={plan?.price}
                                placeholder="150000" 
                                className="col-span-3" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="download" className="text-right">
                                Download
                            </Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input 
                                    id="download" 
                                    name="download" 
                                    type="number" 
                                    defaultValue={plan ? Math.round(plan.downloadSpeed / 1024) : 20}
                                    placeholder="20" 
                                    required 
                                />
                                <span className="text-sm text-muted-foreground">Mbps</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="upload" className="text-right">
                                Upload
                            </Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input 
                                    id="upload" 
                                    name="upload" 
                                    type="number" 
                                    defaultValue={plan ? Math.round(plan.uploadSpeed / 1024) : 10}
                                    placeholder="10" 
                                    required 
                                />
                                <span className="text-sm text-muted-foreground">Mbps</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Plan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
