import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Receipt, Network, Plus, Trash2, Printer } from "lucide-react";
import SubscriptionDialog from "./components/subscription-dialog";
import { notFound } from "next/navigation";
import InvoiceGenerator from "./components/invoice-generator";
import MarkPaidButton from "./components/mark-paid-button";
import DeleteSubscriptionButton from "./components/delete-subscription-button";
import PortalAccessCard from "./components/portal-access-card";

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const customer = await prisma.customer.findUnique({
        where: { id: params.id },
        include: {
            subscriptions: {
                include: { plan: true }
            },
            invoices: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });

    if (!customer) return notFound();

    const plansRaw = await prisma.servicePlan.findMany();
    const plans = plansRaw.map(p => ({
        ...p,
        price: p.price.toNumber()
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <User className="w-6 h-6" />
                        {customer.name}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {customer.email} • {customer.phone}
                    </p>
                </div>
                <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                    {customer.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Address: </span>
                            {customer.address || "-"}
                        </div>
                        <div>
                            <span className="text-muted-foreground">Phone: </span>
                            {customer.phone || "-"}
                        </div>
                        <div>
                            <span className="text-muted-foreground">Email: </span>
                            {customer.email || "-"}
                        </div>
                        <div>
                            <span className="text-muted-foreground">Joined: </span>
                            {customer.createdAt.toLocaleDateString()}
                        </div>
                    </CardContent>
                </Card>

                {/* Portal Access */}
                <PortalAccessCard customerId={customer.id} hasPassword={!!customer.portalPassword} />

                {/* Subscriptions */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Subscriptions</CardTitle>
                        <SubscriptionDialog customerId={customer.id} plans={plans} />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Speed</TableHead>
                                    <TableHead>PPPoE User</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customer.subscriptions.map(sub => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.plan.name}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {Math.round(sub.plan.downloadSpeed/1024)}M / {Math.round(sub.plan.uploadSpeed/1024)}M
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{sub.username}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(sub.plan.price))}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{sub.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DeleteSubscriptionButton subscriptionId={sub.id} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customer.subscriptions.length === 0 && (
                                    <TableRow>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No active subscriptions.
                                        </TableCell>
                                    </TableRow>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

                {/* Invoices */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Invoice History
                    </CardTitle>
                    <InvoiceGenerator customerId={customer.id} />
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Month</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customer.invoices.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {inv.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {inv.month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {inv.dueDate ? inv.dueDate.toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(inv.amount))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={inv.status === "paid" ? "outline" : "destructive"}>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.status !== "paid" && (
                                            <MarkPaidButton invoiceId={inv.id} amount={Number(inv.amount)} />
                                        )}
                                        <a 
                                            href={`/invoices/${inv.id}/print`} 
                                            target="_blank" 
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 ml-2"
                                            title="Print Invoice"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </a>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customer.invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        No invoices found.
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
