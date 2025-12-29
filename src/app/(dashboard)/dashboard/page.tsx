import { getGlobalDashboardStats, getBillingStats } from "@/app/actions/dashboard";
import DashboardKpi from "@/components/dashboard-kpi";
import OltStatusCard from "@/components/olt-status-card";
import TrafficGraphCard from "@/components/traffic-graph-card";
import GlobalSyncButton from "@/components/global-sync-button";
import OltUnifiedCard from "@/components/olt-unified-card";
import UnconfiguredDevicesCard from "@/components/dashboard/unconfigured-devices-card";
import BillingKpi from "@/components/dashboard/billing-kpi";

export default async function Home() {
  const stats = await getGlobalDashboardStats();
  const billingStats = await getBillingStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Network overview and status.</p>
        </div>
        <GlobalSyncButton />
      </div>

      <div className="animate-fade-in-up">
        <UnconfiguredDevicesCard />
      </div>

      <div className="animate-fade-in-up">
          <h2 className="text-md font-semibold mb-4 text-muted-foreground">Financial Overview</h2>
          <BillingKpi stats={billingStats} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h2 className="text-md font-semibold mb-4 text-muted-foreground">Network Health</h2>
        <DashboardKpi stats={{
          totalOlt: stats.totalOlt,
          totalOnu: stats.totalOnu,
          onuOnline: stats.onuOnline,
          onuOffline: stats.onuOffline
        }} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h2 className="text-xl font-semibold mb-4">Infrastructure Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.olts.map((olt) => (
            <div key={olt.id}>
              <OltUnifiedCard olt={olt} />
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
