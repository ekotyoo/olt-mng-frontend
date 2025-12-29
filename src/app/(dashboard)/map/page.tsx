import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import NetworkMap from "@/components/map/network-map";

export default async function MapPage() {
    // Fetch subscriptions with coordinates
    const subs = await prisma.subscription.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null }
        },
        include: {
            customer: true,
            plan: true
        }
    });

    // Transform to Location format
    const locations = subs.map(sub => ({
        id: sub.id,
        lat: sub.latitude!,
        lng: sub.longitude!,
        title: sub.customer.name,
        description: `${sub.plan.name} (${sub.username})`,
        status: sub.status
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6" />
                        Network Map
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Geographic view of subscriber locations.
                    </p>
                </div>
            </div>

            <div className="w-full h-full">
                <NetworkMap locations={locations} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Mapped Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{locations.length}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
