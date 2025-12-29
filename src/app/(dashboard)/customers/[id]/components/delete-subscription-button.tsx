"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSubscription } from "@/app/actions/subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteSubscriptionButtonProps {
    subscriptionId: string;
}

export default function DeleteSubscriptionButton({ subscriptionId }: DeleteSubscriptionButtonProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteSubscription(subscriptionId);
            if (result.success) {
                toast.success("Subscription deleted successfully");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete subscription</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove the subscription from this customer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={loading}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
