"use client";

import { useEffect, useState, useRef } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficStats, getInterfaceTraffic, getTrafficHistory } from "@/app/actions/monitor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Clock, CalendarDays } from "lucide-react";

interface TrafficChartProps {
    oltId: string;
    interfaceName?: string;
}

type TimeRange = 'realtime' | '24h' | '7d';

export default function TrafficChart({ oltId, interfaceName = "gei_1/3/1" }: TrafficChartProps) {
    const [data, setData] = useState<TrafficStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<TimeRange>('realtime');

    // Instant values for display in header
    const [currentRx, setCurrentRx] = useState(0);
    const [currentTx, setCurrentTx] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load History or Start Polling
    useEffect(() => {
        // Clear previous interval
        if (intervalRef.current) clearInterval(intervalRef.current);
        setData([]);
        setLoading(true);

        if (range === 'realtime') {
            startPolling();
        } else {
            fetchHistory(range);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [range, oltId, interfaceName]);

    const startPolling = async () => {
        setLoading(true);
        // Initial fetch
        await fetchLive();
        setLoading(false);

        // Poll every 5s
        intervalRef.current = setInterval(fetchLive, 5000);
    };

    const fetchLive = async () => {
        try {
            const stats = await getInterfaceTraffic(oltId, interfaceName);
            setCurrentRx(stats.rx);
            setCurrentTx(stats.tx);

            setData(prev => {
                const newData = [...prev, { ...stats, time: new Date(stats.timestamp).toLocaleTimeString() }];
                if (newData.length > 20) newData.shift(); // Keep last 20 points
                return newData;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async (r: '24h' | '7d') => {
        try {
            const history = await getTrafficHistory(oltId, r);
            const formatted = history.map(h => ({
                ...h,
                // Format time differently for history
                time: r === '24h'
                    ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })
            }));
            setData(formatted);

            // Set current stats to the latest point
            if (formatted.length > 0) {
                const last = formatted[formatted.length - 1];
                setCurrentRx(last.rx);
                setCurrentTx(last.tx);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Uplink Traffic ({interfaceName})
                    </CardTitle>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-muted p-1 rounded-md">
                        <Button
                            variant={range === 'realtime' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setRange('realtime')}
                        >
                            Realtime
                        </Button>
                        <Button
                            variant={range === '24h' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setRange('24h')}
                        >
                            24 Hours
                        </Button>
                        <Button
                            variant={range === '7d' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setRange('7d')}
                        >
                            7 Days
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            ↓ {currentRx.toFixed(1)} Mbps
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ↑ {currentTx.toFixed(1)} Mbps
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {loading && data.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 10, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={range === 'realtime' ? 'preserveStartEnd' : undefined}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'Mbps', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#6B7280' } }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ color: '#6B7280', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rx"
                                    name="Download (Rx)"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorRx)"
                                    strokeWidth={2}
                                    animationDuration={1000}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tx"
                                    name="Upload (Tx)"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorTx)"
                                    strokeWidth={2}
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
