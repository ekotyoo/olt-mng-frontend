"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficStats, getInterfaceTraffic } from "@/app/actions/monitor";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity } from "lucide-react";

interface TrafficChartProps {
    oltId: string;
    interfaceName?: string;
}

export default function TrafficChart({ oltId, interfaceName = "gei_1/3/1" }: TrafficChartProps) {
    const [data, setData] = useState<TrafficStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentRx, setCurrentRx] = useState(0);
    const [currentTx, setCurrentTx] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [oltId, interfaceName]);

    if (loading && data.length === 0) {
        return (
            <Card className="h-[350px] flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" />
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Uplink Traffic ({interfaceName})
                    </CardTitle>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        ↓ {currentRx} Mbps
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ↑ {currentTx} Mbps
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
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
                </div>
            </CardContent>
        </Card>
    );
}
