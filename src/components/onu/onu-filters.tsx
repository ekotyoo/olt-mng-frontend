"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks";
import OltSelector from "@/components/olt-selector";

interface OnuFiltersProps {
    olts: { id: string; name: string }[];
}

// Simple debounce hook if not exists
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function OnuFilters({ olts }: OnuFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for immediate input feedback
    const [query, setQuery] = useState(searchParams.get("query") || "");
    const debouncedQuery = useDebounceValue(query, 500);

    const status = searchParams.get("status") || "all";

    useEffect(() => {
        // Update URL when debounced query changes
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedQuery) {
            params.set("query", debouncedQuery);
        } else {
            params.delete("query");
        }
        params.set("page", "1"); // Reset to page 1 on search
        router.push(`?${params.toString()}`);
    }, [debouncedQuery, router]);
    // warning: adding searchParams to dependency array might cause loops if router.push updates it immediately. 
    // But router.push triggers a re-render. Ideally we check if value changed.

    function handleStatusChange(val: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") params.delete("status");
        else params.set("status", val);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 w-full md:items-center bg-card p-4 rounded-lg border">
            <Input
                placeholder="Search Serial, Name, PPPoE..."
                className="max-w-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex gap-2">
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="working">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="los">LOS</SelectItem>
                        <SelectItem value="dying_gasp">Dying Gasp</SelectItem>
                    </SelectContent>
                </Select>

                <OltSelector olts={olts} />
            </div>
        </div>
    )
}
