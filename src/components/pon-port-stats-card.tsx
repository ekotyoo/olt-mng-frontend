import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

export default function PonPortStatsCard() {
  return (
    <Card className="w-[200px] inline-block">
      <CardContent>
        <div className="flex flex-col items-center justify-between">
          <h2 className="font-semibold mb-2">PON Port 1/1/1</h2>
          <Separator />
          <div className="flex flex-col gap-2 mt-2 w-full">
            <div className="flex justify-between text-sm">
              <span>Registered ONU</span>
              <span className="font-semibold">20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Online</span>
              <span className="font-semibold">15</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Offline</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status</span>
              <span className="font-semibold">Warning</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
