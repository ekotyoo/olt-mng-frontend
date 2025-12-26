import { getAllOnuDetails } from "@/app/actions/onu";
import OnuListTable from "@/components/onu/onu-list-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

type Params = Promise<{ id: string }>;

export default async function PortOnuListPage({ params }: { params: Params }) {
    const { id } = await params;
    // Decode port ID if it contains special chars (usually not for 1-1-1 but just in case)
    // Our model says slotPort is typically "1/1/1".
    // URL safe might be encoded or we pass it as-is? 
    // If user visits /dashboard/pon-ports/1%2F1%2F1
    const decodedId = decodeURIComponent(id);

    const allOnus = await getAllOnuDetails();
    const filteredOnus = allOnus.filter(onu => onu.slotPort === decodedId);

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">ONUs on Port {decodedId}</h1>
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <OnuListTable onuDetails={filteredOnus} />
            </Suspense>
        </div>
    );
}
