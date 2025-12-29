import { getCommandLogs } from "@/app/actions/logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export default async function LogsPage() {
    const logs = await getCommandLogs();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Terminal className="w-6 h-6" />
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        History of commands executed on OLT devices.
                    </p>
                </div>
            </div>

            <Card className="bg-black border-slate-800 text-green-400 font-mono text-sm overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-2">
                    <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500" />
                         <div className="w-3 h-3 rounded-full bg-yellow-500" />
                         <div className="w-3 h-3 rounded-full bg-green-500" />
                         <span className="ml-2 text-slate-400 text-xs">root@olt-manager:~# history</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                    {logs.map((log) => (
                        <div key={log.id} className="border-b border-slate-800/50 pb-2 mb-2 last:border-0">
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
                                <span>[{log.executedAt.toLocaleString()}]</span>
                                <span className={log.status === 'SUCCESS' ? 'text-blue-400' : 'text-red-400'}>
                                    {log.status}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-blue-500">$</span>
                                <span className="text-white font-bold">{log.command}</span>
                            </div>
                            {log.output && (
                                <pre className="mt-1 pl-4 text-slate-400 whitespace-pre-wrap leading-tight">
                                    {log.output}
                                </pre>
                            )}
                        </div>
                    ))}
                    {logs.length === 0 && (
                         <div className="text-slate-600 italic">No command history found.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
