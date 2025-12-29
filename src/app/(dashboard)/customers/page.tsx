import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users } from "lucide-react";
import CustomerDialog from "./components/customer-dialog";
import { Badge } from "@/components/ui/badge";

export default async function CustomersPage() {
    const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { subscriptions: true } }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Subscribers
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your subscriber base.
                    </p>
                </div>
                <CustomerDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Customers ({customers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Services</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{c.phone || "-"}</span>
                                            <span className="text-muted-foreground text-xs">{c.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={c.status === "active" ? "default" : "secondary"}>
                                            {c.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {c._count.subscriptions > 0 ? (
                                            <Badge variant="outline">{c._count.subscriptions} Subs</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">No active plan</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={`/customers/${c.id}`}>Manage</a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No customers yet. Add one to get started.
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
