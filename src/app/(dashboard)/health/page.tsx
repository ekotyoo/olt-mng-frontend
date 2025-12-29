import { prisma } from "@/lib/db";
import SignalAuditDashboard from "./components/signal-audit-dashboard";
import { getOltList } from "@/app/actions/olt-list";

export default async function HealthPage() {
    // Fetch ALL working ONUs across all OLTs
    // Limit to 2000 for safety? Browsers can handle it.
    const workingOnus = await prisma.onu.findMany({
        where: {
            status: "working" // Only scan online ONUs
        },
        select: {
            id: true,
            serial: true,
            name: true,
            slotPort: true,
            onuId: true,
            ponPort: {
                select: {
                    oltId: true,
                    olt: { select: { name: true } }
                }
            }
        },
        take: 1000 // Safety cap
    });

    const olts = await getOltList();

    return (
        <div className="w-full space-y-4">
             <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Signal Audit 🏥</h1>
                <p className="text-muted-foreground text-sm">
                    Scan online devices for signal degradation.
                </p>
            </div>
            
            <SignalAuditDashboard 
                initialOnus={workingOnus.map(o => ({
                    id: o.id,
                    serial: o.serial,
                    name: o.name || "",
                    slotPort: o.slotPort,
                    onuId: String(o.onuId),
                    oltId: o.ponPort.oltId,
                    oltName: o.ponPort.olt.name
                }))}
                olts={olts}
            />
        </div>
    );
}
