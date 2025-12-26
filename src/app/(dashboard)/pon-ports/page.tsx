import PonPortOverviewTable from "@/components/onu/pon-port-overview-table";

export default function PonPortsPage() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">PON Ports Status</h1>
            <PonPortOverviewTable />
        </div>
    );
}
