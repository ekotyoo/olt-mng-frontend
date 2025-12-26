import { getGlobalDashboardStats } from "../actions/dashboard";
import DashboardKpi from "@/components/dashboard-kpi";
import OltStatusCard from "@/components/olt-status-card";
import TrafficGraphCard from "@/components/traffic-graph-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Home() {
  const stats = await getGlobalDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Network overview and status.</p>
      </div>

      <DashboardKpi stats={{
        totalOlt: stats.totalOlt,
        totalOnu: stats.totalOnu,
        onuOnline: stats.onuOnline,
        onuOffline: stats.onuOffline
      }} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Infrastructure Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.olts.map((olt) => (
            <div key={olt.id} className="col-span-full border rounded-xl p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{olt.name} ({olt.host})</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="col-span-1">
                  <OltStatusCard olt={olt} />
                </div>
                <div className="col-span-1 lg:col-span-3">
                  <TrafficGraphCard oltId={olt.id} />
                </div>
              </div>
            </div>
          ))}
          {stats.olts.length === 0 && (
            <p className="text-muted-foreground col-span-full">No OLTs configured.</p>
          )}
        </div>
      </div>
    </div>
  );
}

