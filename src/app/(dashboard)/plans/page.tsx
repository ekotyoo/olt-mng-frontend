import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText, ArrowUp, ArrowDown } from "lucide-react";
import PlanDialog from "./components/plan-dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PlansPage() {
    const plans = await prisma.servicePlan.findMany({
        orderBy: { price: 'asc' },
        include: {
            _count: { select: { subscriptions: true } }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ScrollText className="w-6 h-6" />
                        Internet Plans
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Define internet packages and pricing.
                    </p>
                </div>
                <PlanDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Available Plans ({plans.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Speed (Up/Down)</TableHead>
                                <TableHead>Active Subs</TableHead>
                                <TableHead>Radius Group</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="font-mono">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(p.price))}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1 text-green-600">
                                                <ArrowDown className="w-3 h-3" />
                                                {(p.downloadSpeed / 1024).toFixed(0)} M
                                            </span>
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <ArrowUp className="w-3 h-3" />
                                                {(p.uploadSpeed / 1024).toFixed(0)} M
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{p._count.subscriptions}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {p.radiusGroup || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <PlanDialog plan={{
                                            id: p.id,
                                            name: p.name,
                                            price: Number(p.price),
                                            uploadSpeed: p.uploadSpeed,
                                            downloadSpeed: p.downloadSpeed
                                        }} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {plans.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24">
                                        <EmptyState 
                                            icon={ScrollText}
                                            title="No plans found"
                                            description="Get started by creating your first internet service plan."
                                            action={<PlanDialog />}
                                        />
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
