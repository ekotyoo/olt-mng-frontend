export const dynamic = 'force-dynamic';

import { getOnus } from "@/app/actions/onu";
import { getOltList } from "@/app/actions/olt-list";
import OnuListTable from "@/components/onu/onu-list-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import OnuFilters from "@/components/onu/onu-filters";
import PaginationControls from "@/components/ui/pagination-controls";

export default async function OnusPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const query = params.query || "";
    const oltId = params.oltId;
    const status = params.status;

    const [onuData, olts] = await Promise.all([
        getOnus({ page, query, oltId, status }),
        getOltList()
    ]);

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Search Devices</h1>
                <p className="text-muted-foreground text-sm">
                    Total {onuData.total} ONUs found
                </p>
            </div>

            <OnuFilters olts={olts} />

            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <OnuListTable onuDetails={onuData.data} />
            </Suspense>

            <div className="flex justify-end">
                <PaginationControls page={onuData.page} totalPages={onuData.totalPages} />
            </div>
        </div>
    );
}
