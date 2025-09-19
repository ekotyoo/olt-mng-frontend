import { Network } from "lucide-react";
import CounterInfoCard from "./counter-info-card";

export default function OnuStatsCard() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <CounterInfoCard count={20} label="Total ONU" icon={Network} />
      <CounterInfoCard count={20} label="Total ONU" icon={Network} />
      <CounterInfoCard count={20} label="Total ONU" icon={Network} />
      <CounterInfoCard count={20} label="Total ONU" icon={Network} />
    </div>
  );
}
