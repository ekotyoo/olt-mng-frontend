import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getOlts } from "@/app/actions/olt-management";
import OltListTable from "./components/olt-list-table";


export default async function OltsPage() {
    const olts = await getOlts();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">OLT Management</h1>
                <Link href="/settings/olts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add OLT
                    </Button>
                </Link>
            </div>

            <OltListTable olts={olts} />
        </div>
    );
}
