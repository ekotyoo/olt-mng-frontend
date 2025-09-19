import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

export default function TrafficGraphCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Card Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto flex gap-4">
          <CardStats />
          <CardStats />
          <CardStats />
        </div>
      </CardContent>
    </Card>
  );
}

function CardStats() {
  return (
    <Card className="min-w-[250px]">
      <CardContent>
        <div className="flex flex-col justify-between">
          <h2 className="text-center font-semibold mb-2">Slot 4 — SMXA</h2>
          <Separator />
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between text-sm">
              <span>Status</span>
              <span className="font-semibold">Inservice</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>CPU</span>
              <span className="font-semibold">8%</span>
            </div>
            <Progress value={8} />
            <div className="flex justify-between text-sm">
              <span>Memory</span>
              <span className="font-semibold">25%</span>
            </div>
            <Progress value={25} />
            <Separator className="mt-4" />
            <div className="flex justify-between text-sm">
              <span>Serial</span>
              <span className="font-semibold">706049800147</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Hardware Ver.</span>
              <span className="font-semibold">V1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Software Ver.</span>
              <span className="font-semibold">V2.1.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Up Time</span>
              <span className="font-semibold">102d 1h 47m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Restart</span>
              <span className="font-semibold">Power-off</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
