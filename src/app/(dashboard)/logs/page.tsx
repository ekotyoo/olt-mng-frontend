"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCcw, AlertTriangle, AlertOctagon, Info, AlertCircle } from "lucide-react";
import { getOltOptions } from "@/app/actions/olt";
import { getSystemLogs } from "@/app/actions/logs";
import { SystemLog } from "@/lib/type";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function SystemLogsPage() {
    const [olts, setOlts] = useState<{ label: string; value: string }[]>([]);
    const [selectedOlt, setSelectedOlt] = useState<string>("");

    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [levelFilter, setLevelFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        getOltOptions().then((opts) => {
            setOlts(opts);
            if (opts.length > 0) setSelectedOlt(opts[0].value);
        });
    }, []);

    useEffect(() => {
        if (selectedOlt) {
            fetchLogs();
        }
    }, [selectedOlt]);

    async function fetchLogs() {
        if (!selectedOlt) return;
        setLoading(true);
        try {
            const data = await getSystemLogs(selectedOlt);
            setLogs(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    }

    const filteredLogs = logs.filter(log => {
        if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
        if (search) {
            const lower = search.toLowerCase();
            return log.message.toLowerCase().includes(lower) ||
                log.code?.includes(lower) ||
                log.level.toLowerCase().includes(lower);
        }
        return true;
    });

    const getLevelBadge = (level: string) => {
        switch (level.toUpperCase()) {
            case "CRITICAL": return <Badge variant="destructive">CRITICAL</Badge>;
            case "MAJOR": return <Badge className="bg-orange-500 hover:bg-orange-600">MAJOR</Badge>;
            case "MINOR": return <Badge className="bg-yellow-500 hover:bg-yellow-600">MINOR</Badge>;
            case "WARNING": return <Badge className="bg-blue-500 hover:bg-blue-600">WARNING</Badge>;
            default: return <Badge variant="outline">{level}</Badge>;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground">Monitor OLT alarms and events.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedOlt} onValueChange={setSelectedOlt}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select OLT" />
                        </SelectTrigger>
                        <SelectContent>
                            {olts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="py-3 flex flex-row items-center justify-between gap-4">
                    <CardTitle className="text-base">Log Entries</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={levelFilter} onValueChange={setLevelFilter}>
                            <SelectTrigger className="w-[130px] h-8 text-sm">
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Levels</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                                <SelectItem value="MAJOR">Major</SelectItem>
                                <SelectItem value="MINOR">Minor</SelectItem>
                                <SelectItem value="WARNING">Warning</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Search logs..."
                            className="h-8 w-[200px] text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border h-[600px] overflow-auto relative">
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 transition-all">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm font-medium">Fetching logs from OLT...</p>
                                </div>
                            </div>
                        )}
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 bg-white dark:bg-black z-10 shadow-sm border-b">
                                <TableRow>
                                    <TableHead className="w-[180px]">Date</TableHead>
                                    <TableHead className="w-[100px]">Level</TableHead>
                                    <TableHead className="w-[100px]">Code</TableHead>
                                    <TableHead>Message</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-xs">{log.date}</TableCell>
                                            <TableCell>{getLevelBadge(log.level)}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{log.code || "-"}</TableCell>
                                            <TableCell className="text-sm">{log.message}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    !loading && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No logs found.
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
