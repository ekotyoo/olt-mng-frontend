import { getLiveSessions } from "@/app/actions/radius";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock, ArrowDown, ArrowUp, Activity } from "lucide-react";
import DisconnectButton from "./components/disconnect-button";

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (parts.length === 0) return "< 1m";
    return parts.join(" ");
}

export default async function LiveSessionsPage() {
    const sessions = await getLiveSessions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-green-500" />
                        Active Sessions
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Real-time monitoring of active connections.
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1">
                    {sessions.length} Online
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Connections</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>MAC Info</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Data Usage</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            {session.username}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{session.ipAddress}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{session.macAddress}</TableCell>
                                    <TableCell className="text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            {formatDuration(session.duration)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs gap-1">
                                            <span className="flex items-center text-green-600 gap-1">
                                                <ArrowDown className="w-3 h-3" /> {formatBytes(session.download)}
                                            </span>
                                            <span className="flex items-center text-blue-600 gap-1">
                                                <ArrowUp className="w-3 h-3" /> {formatBytes(session.upload)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DisconnectButton sessionId={session.id} username={session.username} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sessions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                        No active sessions found.
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
