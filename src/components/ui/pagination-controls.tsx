"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
    page: number;
    totalPages: number;
}

export default function PaginationControls({ page, totalPages }: PaginationControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function setPage(newPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
