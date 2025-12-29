"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, StopCircle, CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { auditSignalBatch, AuditResult, AuditTarget, getLiveOnlineOnus } from "@/app/actions/audit";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OnuTarget = {
    id: string;
    serial: string;
    name: string;
    slotPort: string;
    onuId: string;
    oltId: string;
    oltName: string;
};

export default function SignalAuditDashboard({ initialOnus, olts }: { initialOnus: OnuTarget[], olts: any[] }) {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<AuditResult[]>([]);
    const [search, setSearch] = useState("");
    const [selectedOlt, setSelectedOlt] = useState<string>("all");
    
    // Derived Stats
    const total = initialOnus.length;
    const scanned = results.length;
    const critical = results.filter(r => r.level === "critical").length;
    const warning = results.filter(r => r.level === "warning").length;
    const good = results.filter(r => r.level === "good").length;

    async function startScan() {
        if (isScanning) return;
        setIsScanning(true);
        setResults([]); // Clear previous
        setProgress(0);
        
        const byOlt: Record<string, OnuTarget[]> = {};
        const filteredOnus = selectedOlt === "all" ? initialOnus : initialOnus.filter(o => o.oltId === selectedOlt);

        for(const onu of filteredOnus) {
            if(!byOlt[onu.oltId]) byOlt[onu.oltId] = [];
            byOlt[onu.oltId].push(onu);
        }

        const BATCH_SIZE = 5;

        try {
            // Sequential OLT processing
            let processedCount = 0;
            // Total targets relevant to this scan
            const scanTotal = filteredOnus.length;

            for (const [oltId, targets] of Object.entries(byOlt)) {
                // 1. Discover Live ONUs
                toast.info("Discovering live devices...");
                let liveKeys: string[] = [];
                try {
                    liveKeys = await getLiveOnlineOnus(oltId);
                } catch (e) {
                    console.error("Discovery failed", e);
                    toast.error("Discovery failed, checking all devices");
                    liveKeys = targets.map(t => `${t.slotPort}:${t.onuId}`);
                }

                // 2. Filter Targets
                const validTargets = targets.filter(t => liveKeys.includes(`${t.slotPort}:${t.onuId}`));
                
                // Add skipped offline devices to progress
                processedCount += (targets.length - validTargets.length);
                setProgress(Math.round((processedCount / scanTotal) * 100));

                if (validTargets.length > 0) {
                     toast.success(`Scanning ${validTargets.length} online devices on ${targets[0].oltName}`);
                }

                // 3. Process Valid Targets
                for (let i = 0; i < validTargets.length; i += BATCH_SIZE) {
                    const chunk = validTargets.slice(i, i + BATCH_SIZE);
                    
                    // Map to AuditTarget
                    const batchTargets: AuditTarget[] = chunk.map(t => ({
                        id: t.id,
                        slotPort: t.slotPort,
                        onuId: t.onuId,
                        serial: t.serial
                    }));

                    const batchResults = await auditSignalBatch(oltId, batchTargets);
                    
                    setResults(prev => [...prev, ...batchResults]);
                    
                    processedCount += chunk.length;
                    setProgress(Math.round((processedCount / scanTotal) * 100));
                }
            }
            toast.success("Audit Completed");
        } catch (e) {
            console.error(e);
            toast.error("Audit stopped due to error");
        } finally {
            setIsScanning(false);
        }
    }

    const filteredIssues = useMemo(() => {
        // Show all results, but sort by severity?
        let base = results;
        if (search) {
             base = base.filter(r => 
                initialOnus.find(o => o.id === r.onuId)?.name.toLowerCase().includes(search.toLowerCase()) ||
                initialOnus.find(o => o.id === r.onuId)?.serial.toLowerCase().includes(search.toLowerCase())
             );
        }
        //Sort: Critical first
        return base.sort((a, b) => {
            const rank = { critical: 3, warning: 2, good: 1 };
            return rank[b.level] - rank[a.level];
        });
    }, [results, search, initialOnus]);

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Total Targets</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-bold">{total}</CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Critical</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-bold text-red-600">{critical}</CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Warning</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-bold text-yellow-600">{warning}</CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Healthy</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-bold text-green-600">{good}</CardContent>
                </Card>
            </div>

            {/* Control & Progress */}
            <Card>
                <CardContent className="py-6 flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-semibold">Scanner Control</h3>
                            <p className="text-sm text-muted-foreground">
                                {isScanning ? `Scanning... ${scanned}/${total}` : "Ready to scan"}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                             <Select value={selectedOlt} onValueChange={setSelectedOlt} disabled={isScanning}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select OLT" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All OLTs</SelectItem>
                                    {olts.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>

                            <Button size="lg" onClick={startScan} disabled={isScanning || total === 0}>
                                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                {isScanning ? "Scanning" : "Start Audit"}
                            </Button>
                        </div>
                     </div>
                     <Progress value={progress} className="h-3" />
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardHeader>
                   <div className="flex justify-between items-center">
                       <CardTitle>Audit Results</CardTitle>
                       <div className="relative w-64">
                         <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="Filter results..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                       </div>
                   </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>ONU</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Rx (Down)</TableHead>
                                <TableHead>Tx (Up)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIssues.slice(0, 100).map(res => {
                                const meta = initialOnus.find(o => o.id === res.onuId);
                                return (
                                    <TableRow key={res.onuId}>
                                        <TableCell>
                                            <LevelBadge level={res.level} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{meta?.name || "Unknown"}</span>
                                                <span className="text-xs text-muted-foreground">{meta?.serial}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{meta?.oltName}</span>
                                                <span className="text-xs font-mono text-muted-foreground">{meta?.slotPort}:{meta?.onuId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`font-mono font-bold ${res.rx < -27 ? "text-red-500" : ""}`}>
                                            {res.rx} dBm
                                        </TableCell>
                                        <TableCell className="font-mono text-muted-foreground">
                                            {res.tx} dBm
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {filteredIssues.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No results yet. Start scan to populate.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
}

function LevelBadge({ level }: { level: string }) {
  if (level === "critical") return <Badge variant="destructive">Critical</Badge>;
  if (level === "warning") return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
  return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Good</Badge>;
}
