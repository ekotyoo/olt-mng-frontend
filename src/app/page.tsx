import OnuStatsCard from "@/components/onu-stats-card";
import TrafficGraphCard from "@/components/traffic-graph-card";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <OnuStatsCard />
      <TrafficGraphCard />
    </div>
  );
}
