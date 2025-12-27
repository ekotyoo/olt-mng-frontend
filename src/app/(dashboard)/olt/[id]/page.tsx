import OnuStatsCard from "@/components/onu-stats-card";
import TrafficGraphCard from "@/components/traffic-graph-card";
import SyncButton from "@/components/sync-button";
import TrafficChart from "@/components/charts/traffic-chart";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function DynamicOltPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const olt = await prisma.olt.findUnique({
        where: { id }
    });

    if (!olt) notFound();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">OLT Overview: {olt.name}</h1>
                <SyncButton lastSync={olt.updatedAt} oltId={olt.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OnuStatsCard oltId={id} />
                <TrafficChart oltId={id} />
            </div>

            <TrafficGraphCard oltId={id} />
        </div>
    );
}
