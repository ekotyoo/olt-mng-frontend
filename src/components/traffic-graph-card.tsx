"use client";

import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import OltInfoCard from "./olt-info-card";
import { useEffect, useState } from "react";
import { getOltCardStats } from "@/app/actions/olt";
import { OltCardDetail } from "@/lib/type";
import { Skeleton } from "./ui/skeleton";
import { toTitleCase } from "@/lib/utils";

export default function TrafficGraphCard({ oltId }: { oltId: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">System Info</h2>
      <div className="grid grid-cols-5 gap-4 mt-4">
        <div className="col-span-2">
          <OltInfoCard oltId={oltId} />
        </div>
        <div className="col-span-3">
          <OltCardInfo oltId={oltId} />
        </div>
      </div>
    </div>
  );
}

function OltCardInfo({ oltId }: { oltId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [oltCardStats, setOltCardStats] = useState<OltCardDetail[]>();

  useEffect(() => {
    initOltCardInfo();
  }, [oltId]);

  async function initOltCardInfo() {
    setIsLoading(true);

    try {
      const data = await getOltCardStats(oltId);
      setOltCardStats(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading)
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );

  return (
    <div className="grid grid-cols-3 gap-4">
      {oltCardStats?.map((oltCard) => (
        <CardStats oltCardDetail={oltCard} />
      ))}
    </div>
  );
}

function CardStats({ oltCardDetail }: { oltCardDetail: OltCardDetail }) {
  return (
    <Card className="min-w-[200px]">
      <CardContent>
        <div className="flex flex-col justify-between">
          <div className="flex justify-between">
            <h2 className="font-semibold">{oltCardDetail.configType}</h2>
            <Badge
              variant={oltCardDetail.status === "OFFLINE" ? "outline" : "default"}
              className={oltCardDetail.status === "OFFLINE" ? "h-6" : "h-6 bg-green-500"}
            >
              {toTitleCase(oltCardDetail.status)}
            </Badge>
          </div>
          <Separator className="mt-3" />
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-evenly">
              <div className="flex flex-col items-center text-sm">
                <span className="mb-1">Rack</span>
                <span className="font-bold">{oltCardDetail.rack}</span>
              </div>
              <Separator orientation="vertical" />
              <div className="flex flex-col items-center text-sm">
                <span className="mb-1">Shelf</span>
                <span className="font-bold">{oltCardDetail.shelf}</span>
              </div>
              <Separator orientation="vertical" />
              <div className="flex flex-col items-center text-sm">
                <span className="mb-1">Slot</span>
                <span className="font-bold">{oltCardDetail.slot}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>CPU</span>
              <span className="font-semibold">{oltCardDetail.cpuUsage}%</span>
            </div>
            <Progress value={oltCardDetail.cpuUsage} />
            <div className="flex justify-between text-sm">
              <span>Memory</span>
              <span className="font-semibold">{oltCardDetail.memoryUsage}%</span>
            </div>
            <Progress value={oltCardDetail.memoryUsage} />
            <Separator className="mt-4" />
            <div className="flex justify-between text-sm">
              <span>Serial</span>
              <Badge variant={"outline"}>{oltCardDetail.serialNumber}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Up Time</span>
              <span className="font-semibold">{oltCardDetail.upTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Restart</span>
              <span className="font-semibold">{oltCardDetail.lastRestartReason}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
