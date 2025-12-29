import { getCustomerSession, logoutCustomer } from "@/app/actions/portal";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Receipt, Signal } from "lucide-react";

export default async function PortalDashboard() {
    const customer = await getCustomerSession();

    if (!customer) {
        redirect("/portal/login");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Dashboard</h1>
                    <p className="text-muted-foreground">{customer.name}</p>
                </div>
                <form action={logoutCustomer}>
                    <Button variant="ghost" size="icon">
                        <LogOut className="w-5 h-5 text-red-500" />
                    </Button>
                </form>
            </div>

            {/* Subscriptions */}
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Signal className="w-5 h-5" />
                Active Services
            </h2>
            <div className="grid gap-4">
                {customer.subscriptions.map(sub => (
                    <Card key={sub.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">{sub.plan.name}</CardTitle>
                                <Badge variant={sub.status === "active" ? "default" : "destructive"}>
                                    {sub.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                <div>Username: {sub.username}</div>
                                <div>Speed: {Math.round(sub.plan.downloadSpeed / 1024)} Mbps</div>
                                <div className="mt-2 text-foreground font-medium">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(sub.plan.price))}/mo
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {customer.subscriptions.length === 0 && (
                    <div className="p-4 border rounded-lg text-center text-muted-foreground text-sm">
                        No active subscriptions.
                    </div>
                )}
            </div>

            {/* Invoices */}
            <h2 className="text-lg font-semibold flex items-center gap-2 mt-8">
                <Receipt className="w-5 h-5" />
                Recent Invoices
            </h2>
            <div className="space-y-3">
                {customer.invoices.map(inv => (
                    <Card key={inv.id} className="overflow-hidden">
                        <div className="flex items-center justify-between p-4">
                            <div>
                                <div className="font-medium">
                                    {inv.month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Due: {inv.dueDate ? inv.dueDate.toLocaleDateString() : "-"}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(inv.amount))}
                                </div>
                                <Badge variant={inv.status === "paid" ? "outline" : "destructive"} className="mt-1">
                                    {inv.status}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
