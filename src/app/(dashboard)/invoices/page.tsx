import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, CheckCircle, Clock, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BillingTrigger from "./components/billing-trigger";
import { EmptyState } from "@/components/ui/empty-state";

export default async function InvoicesPage() {
    const invoices = await prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            customer: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6" />
                        Invoices
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Track payments and billing history.
                    </p>
                </div>
                <BillingTrigger />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Month</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-xs">{inv.id.slice(-8)}</TableCell>
                                    <TableCell>{inv.customer.name}</TableCell>
                                    <TableCell>
                                        {inv.month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {inv.dueDate ? inv.dueDate.toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(inv.amount))}
                                    </TableCell>
                                    <TableCell>
                                        {inv.status === 'paid' ? (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                                                <Clock className="w-3 h-3 mr-1" /> Unpaid
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <a 
                                            href={`/invoices/${inv.id}/print`} 
                                            target="_blank" 
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </a>
                                    </TableCell>
                                </TableRow>
                            ))}
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24">
                                        <EmptyState 
                                            icon={Receipt}
                                            title="No invoices found"
                                            description="Invoices will appear here once generated manually or automatically."
                                            action={<BillingTrigger />}
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
