import AlertEventCard from "@/components/alert-event-card";
import CounterInfoCard from "@/components/counter-info-card";
import OnuStatsCard from "@/components/onu-stats-card";
import OnuStatusCard from "@/components/onu-status-card";
import PonPortOverview from "@/components/pon-port-overview";
import TrafficGraphCard from "@/components/traffic-graph-card";

export default function Home() {
  return (
    <div className="grid grid-cols-8 grid-rows-6 gap-4">
      <div className="col-span-8">
        <OnuStatsCard />
      </div>
      <div className="row-span-2 col-span-4">
        <PonPortOverview />
      </div>
      <div className="row-span-3 col-span-4">
        <TrafficGraphCard />
      </div>
      <div className="col-span-4">
        <AlertEventCard />
      </div>
      <div className="col-span-8">
        <OnuStatusCard />
      </div>
    </div>
  );
}
