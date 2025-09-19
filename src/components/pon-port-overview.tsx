import PonPortStatsCard from "./pon-port-stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function PonPortOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PON Port</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-auto">
          <PonPortStatsCard />
          <PonPortStatsCard />
          <PonPortStatsCard />
          <PonPortStatsCard />
        </div>
      </CardContent>
    </Card>
  );
}
