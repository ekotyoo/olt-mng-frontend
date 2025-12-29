"use client";

import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState, useMemo } from "react";
import { getOltCardStats, getOltInfo, getTrafficHistory } from "@/app/actions/olt";
import { OltCardDetail, OltInfo } from "@/lib/type";
import { Skeleton } from "./ui/skeleton";
import { toTitleCase, cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Clock, MapPin, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from "date-fns";

export default function TrafficGraphCard({ oltId, hideHeader = false }: { oltId: string; hideHeader?: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [oltCardStats, setOltCardStats] = useState<OltCardDetail[]>();
  const [oltInfo, setOltInfo] = useState<OltInfo>();
  
  // Traffic State
  const [trafficData, setTrafficData] = useState<{ interfaces: string[], data: any[] }>({ interfaces: [], data: [] });
  const [selectedInterface, setSelectedInterface] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [cards, info, traffic] = await Promise.all([
          getOltCardStats(oltId),
          getOltInfo(oltId),
          getTrafficHistory(oltId)
        ]);
        setOltCardStats(cards);
        setOltInfo(info);
        setTrafficData(traffic);
        
        if (traffic.interfaces.length > 0) {
            setSelectedInterface(traffic.interfaces[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [oltId]);

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!trafficData.data || !selectedInterface) return [];
    return trafficData.data
        .filter(d => d.interfaceName === selectedInterface)
        .map(d => ({
            time: new Date(d.timestamp).getTime(), // milliseconds
            rx: d.rxMbps,
            tx: d.txMbps,
            label: format(new Date(d.timestamp), "HH:mm")
        }));
  }, [trafficData, selectedInterface]);

  // Get latest stats from the computed chart data
  const latestStats = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Traffic Header & Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            {!hideHeader && <h2 className="text-lg font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Traffic Analysis</h2>}
            
            {trafficData.interfaces.length > 0 && (
                <Select value={selectedInterface} onValueChange={setSelectedInterface}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Select Interface" />
                    </SelectTrigger>
                    <SelectContent>
                        {trafficData.interfaces.map(iface => (
                            <SelectItem key={iface} value={iface}>{iface}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>

        {/* Latest Stats Badge */}
        {latestStats && (
            <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">RX:</span>
                    <span className="font-mono font-medium text-foreground">{latestStats.rx} Mbps</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">TX:</span>
                    <span className="font-mono font-medium text-foreground">{latestStats.tx} Mbps</span>
                </div>
            </div>
        )}
      </div>

      {/* 2. Chart Area */}
      {chartData.length > 0 ? (
          <div className="h-[250px] w-full border rounded-lg p-2 bg-card/50">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis 
                        dataKey="label" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        width={30}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                    <Legend iconType="circle" />
                    <Area 
                        type="monotone" 
                        dataKey="rx" 
                        name="RX (Mbps)" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorRx)" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="tx" 
                        name="TX (Mbps)" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorTx)" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                    />
                </AreaChart>
             </ResponsiveContainer>
          </div>
      ) : (
          <div className="h-[150px] w-full border rounded-lg flex items-center justify-center bg-muted/20">
              <span className="text-muted-foreground text-sm">No traffic data captured yet. Run Sync to populate.</span>
          </div>
      )}

      <Separator />

      {/* 3. System Info / Card List (Legacy but useful) */}
      <h3 className="text-sm font-medium text-muted-foreground">System Overview</h3>
      
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
        </div>
      )}

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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
