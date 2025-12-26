import { getAllOnuDetails } from "@/app/actions/onu";
import OnuListTable from "@/components/onu/onu-list-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default async function OnusPage() {
    const onuDetails = await getAllOnuDetails();

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">All Optical Network Units (ONU)</h1>
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <OnuListTable onuDetails={onuDetails} />
            </Suspense>
        </div>
    );
}
