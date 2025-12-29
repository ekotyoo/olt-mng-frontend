import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center animate-fade-in-up", className)}>
            <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                {description}
            </p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
}
