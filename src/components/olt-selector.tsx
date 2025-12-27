"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface OltSelectorProps {
    olts: { id: string; name: string }[];
}

export default function OltSelector({ olts }: OltSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentOlt = searchParams.get("oltId") || "all";

    function handleValueChange(value: string) {
        if (value === "all") {
            router.push("/pon-ports");
        } else {
            router.push(`/pon-ports?oltId=${value}`);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap hidden md:inline-block">Filter OLT:</span>
            <Select value={currentOlt} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select OLT" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All OLTs</SelectItem>
                    {olts.map((olt) => (
                        <SelectItem key={olt.id} value={olt.id}>
                            {olt.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
