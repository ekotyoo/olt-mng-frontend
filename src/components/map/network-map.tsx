"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

interface Location {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    status: string;
}

const ActiveMap = dynamic(() => import("./active-network-map"), {
    ssr: false,
    loading: () => <Skeleton className="h-[600px] w-full bg-slate-100 rounded-lg" />
});

export default function NetworkMap({ locations }: { locations: Location[] }) {
    return <ActiveMap locations={locations} />;
}
