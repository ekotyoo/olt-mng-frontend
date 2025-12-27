"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowRight, Server, Wifi } from "lucide-react";
import { DiscoveredDevice, scanAllUnconfiguredDevices } from "@/app/actions/discovery";
import Link from "next/link";

export default function UnconfiguredDevicesCard() {
    const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function scan() {
            try {
                const res = await scanAllUnconfiguredDevices();
                setDevices(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        // Delay scan to allow dashboard status cards to load first
        const timer = setTimeout(() => {
            scan();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) return null; // Don't show anything while loading to avoid layout shift, or show skeleton? 
    // Better to show nothing initially, or a subtle loader. Let's return null to keep dashboard clean until we find something.

    if (devices.length === 0) return null;

    return (
        <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <AlertCircle className="h-5 w-5" />
                        New Devices Detected
                        <Badge className="bg-indigo-500 hover:bg-indigo-600 ml-2">{devices.length}</Badge>
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100" asChild>
                        <Link href="/onu-configuration">
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {devices.slice(0, 3).map((device, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Wifi className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{device.serial}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Server className="h-3 w-3" /> {device.oltName} ({device.slot_port})
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                                {/* Deep link to config page, assuming it accepts params. We might need to handle this in the page. */}
                                <Link href={`/onu-configuration?olt=${device.oltId}&serial=${device.serial}`}>
                                    Configure
                                </Link>
                            </Button>
                        </div>
                    ))}
                    {devices.length > 3 && (
                        <div className="text-center text-xs text-muted-foreground pt-1">
                            + {devices.length - 3} more devices waiting...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
