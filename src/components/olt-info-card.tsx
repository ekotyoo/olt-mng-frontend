"use client";

import { Computer } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
import { getOltInfo } from "@/app/actions/telnet";
import { OltInfo } from "@/lib/type";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

export default function OltInfoCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [oltInfo, setOltInfo] = useState<OltInfo>();

  useEffect(() => {
    initOltInfo();
  }, []);

  async function initOltInfo() {
    setIsLoading(true);
    try {
      const oltInfo = await getOltInfo();
      setOltInfo(oltInfo);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <Skeleton className="h-[250px] w-full rounded-lg" />;

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between">
          <div className="flex flex-col justify-between">
            <h5 className="font-semibold">OLT Info</h5>
          </div>
          <div className="bg-primary text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
            <Computer className="size-6" />
          </div>
        </div>
        <Separator className="mt-4" />
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex w-full justify-between text-sm">
            <div>Host</div>
            <div className="font-semibold">{oltInfo?.systemName}</div>
          </div>
          <div className="flex w-full justify-between text-sm">
            <div>IP</div>
            <Badge variant={"outline"}>192.168.220.22:23</Badge>
          </div>
          <div className="flex w-full justify-between text-sm">
            <div>Contact</div>
            <div className="font-semibold">{oltInfo?.contact}</div>
          </div>
          <div className="flex w-full justify-between text-sm">
            <div>Location</div>
            <div className="font-semibold">{oltInfo?.location}</div>
          </div>
          <div className="flex w-full justify-between text-sm">
            <div>Up Time</div>
            <div className="font-semibold">{oltInfo?.upTime}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
