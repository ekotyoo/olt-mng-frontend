"use client";

import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState } from "react";
import { getOltCardStats, getOltInfo } from "@/app/actions/olt";
import { OltCardDetail, OltInfo } from "@/lib/type";
import { Skeleton } from "./ui/skeleton";
import { toTitleCase } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Clock, MapPin } from "lucide-react";

export default function TrafficGraphCard({ oltId, hideHeader = false }: { oltId: string; hideHeader?: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [oltCardStats, setOltCardStats] = useState<OltCardDetail[]>();
  const [oltInfo, setOltInfo] = useState<OltInfo>();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [cards, info] = await Promise.all([
          getOltCardStats(oltId),
          getOltInfo(oltId)
        ]);
        setOltCardStats(cards);
        setOltInfo(info);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [oltId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!hideHeader && <h2 className="text-lg font-semibold">System Info</h2>}

      {/* Meta Info Row */}
      {oltInfo && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Uptime: <span className="font-medium text-foreground">{oltInfo.upTime || "N/A"}</span></span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Location: <span className="font-medium text-foreground">{oltInfo.location || "N/A"}</span></span>
          </div>
          {/*  Contact can be added if needed, but often clutter */}
        </div>
      )}

      {/* Cards Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="h-8 py-0">Slot</TableHead>
              <TableHead className="h-8 py-0">Type</TableHead>
              <TableHead className="h-8 py-0">Status</TableHead>
              <TableHead className="h-8 py-0 text-right">CPU</TableHead>
              <TableHead className="h-8 py-0 text-right">RAM</TableHead>
              <TableHead className="h-8 py-0 text-right">Temp</TableHead>
              <TableHead className="h-8 py-0">Serial</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oltCardStats?.map((card) => (
              <TableRow key={`${card.rack}-${card.shelf}-${card.slot}`} className="h-9">
                <TableCell className="py-1 font-mono text-xs">{card.rack}/{card.shelf}/{card.slot}</TableCell>
                <TableCell className="py-1 text-xs">{card.configType}</TableCell>
                <TableCell className="py-1">
                  <Badge variant={card.status === "OFFLINE" ? "outline" : "secondary"} className="text-[10px] h-4 px-1">
                    {toTitleCase(card.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 text-xs text-right font-mono">{card.cpuUsage}%</TableCell>
                <TableCell className="py-1 text-xs text-right font-mono">{card.memoryUsage}%</TableCell>
                <TableCell className="py-1 text-xs text-right font-mono">{card.temperature || 0}°C</TableCell>
                <TableCell className="py-1 text-xs font-mono text-muted-foreground">{card.serialNumber || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
