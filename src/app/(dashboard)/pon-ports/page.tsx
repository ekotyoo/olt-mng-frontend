import PonPortOverviewTable from "@/components/onu/pon-port-overview-table";
import { getPonPortOverview } from "@/app/actions/onu";
import PonPortKpi from "@/components/pon-port-kpi";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getOltList } from "@/app/actions/olt-list";
import OltSelector from "@/components/olt-selector";

export const dynamic = 'force-dynamic';

export default async function PonPortsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { oltId } = await searchParams;
    const [data, olts] = await Promise.all([
        getPonPortOverview(oltId === "all" ? undefined : oltId),
        getOltList()
    ]);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">Port Overview</h1>
                <OltSelector olts={olts} />
            </div>

            <PonPortKpi data={data} />

            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <PonPortOverviewTable data={data} />
            </Suspense>
        </div>
    );
}
