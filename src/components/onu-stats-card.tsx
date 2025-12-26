"use client";

import { Network, Plug, Unplug } from "lucide-react";
import CounterInfoCard from "./counter-info-card";
import { useEffect, useState } from "react";
import { getPonPortOverview } from "@/app/actions/onu";
import { Skeleton } from "./ui/skeleton";

export default function OnuStatsCard({ oltId }: { oltId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [totalOnu, setTotalOnu] = useState(0);
  const [onuOnline, setOnuOnline] = useState(0);
  const [onuOffline, setOnuOffline] = useState(0);

  useEffect(() => {
    initOnuStatsCard();
  }, [oltId]);

  async function initOnuStatsCard() {
    setIsLoading(true);
    try {
      const result = await getPonPortOverview(oltId);

      setTotalOnu(result.reduce((a, b) => a + b.onu_registered, 0));
      setOnuOnline(result.reduce((a, b) => a + b.onu_online, 0));
      setOnuOffline(result.reduce((a, b) => a + b.onu_offline, 0));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading)
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-[180px] w-full rounded-lg" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
      </div>
    );

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <CounterInfoCard count={totalOnu} label="Total ONU" icon={Network} iconColor="bg-gray-400" />
      <CounterInfoCard count={onuOnline} label="ONU Online" icon={Plug} iconColor="bg-green-500" />
      <CounterInfoCard
        count={onuOffline}
        label="ONU Offline"
        icon={Unplug}
        iconColor="bg-red-500"
      />
    </div>
  );
}
