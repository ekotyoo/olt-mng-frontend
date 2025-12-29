import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        include: {
            customer: true
        }
    });

    if (!invoice) return notFound();

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @page { margin: 0; size: auto; }
                @media print {
                    html, body {
                        height: initial !important;
                        overflow: initial !important;
                        -webkit-print-color-adjust: exact;
                        background: white;
                    }
                }
            `}} />
            <div className="bg-white text-black p-[10mm] md:p-[20mm] font-sans w-full max-w-[210mm] mx-auto relative box-border">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
                    <p className="text-slate-500 mt-1">#{invoice.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-800">ISP Provider Name</h2>
                    <p className="text-sm text-slate-600">123 Network Lane</p>
                    <p className="text-sm text-slate-600">Jakarta, Indonesia</p>
                    <p className="text-sm text-slate-600">support@isp.com</p>
                </div>
            </div>

            {/* Bill To & Details */}
            <div className="flex justify-between mb-12">
                <div>
                    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Bill To</h3>
                    <p className="font-bold text-lg text-slate-800">{invoice.customer.name}</p>
                    <p className="text-slate-600">{invoice.customer.address}</p>
                    <p className="text-slate-600">{invoice.customer.phone}</p>
                    <p className="text-slate-600">{invoice.customer.email}</p>
                </div>
                <div className="text-right space-y-2">
                    <div>
                        <span className="text-slate-500 text-sm font-semibold uppercase mr-4">Invoice Date</span>
                        <span className="font-medium">{invoice.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm font-semibold uppercase mr-4">Due Date</span>
                        <span className="font-medium text-red-600">
                             {invoice.dueDate ? invoice.dueDate.toLocaleDateString() : "-"}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm font-semibold uppercase mr-4">Status</span>
                        <Badge variant={invoice.status === "paid" ? "outline" : "destructive"} className="uppercase">
                            {invoice.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-12 border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 text-slate-500 text-sm font-semibold uppercase">Description</th>
                        <th className="text-right py-3 text-slate-500 text-sm font-semibold uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100">
                        <td className="py-4 text-slate-800">
                            Internet Service subscription
                            <div className="text-xs text-slate-500 mt-1">
                                Billing Cycle: {invoice.month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                        </td>
                        <td className="py-4 text-right font-medium text-slate-800">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(invoice.amount))}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end">
                <div className="w-1/2">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(invoice.amount))}
                        </span>
                    </div>
                    <div className="flex justify-between py-4">
                        <span className="text-xl font-bold text-slate-900">Total</span>
                        <span className="text-xl font-bold text-slate-900">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(invoice.amount))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
                <p>Thank you for your business!</p>
                <p className="mt-1">Please make checks payable to "ISP Provider Name"</p>
            </div>
            
            {/* Print Script */}
            <PrintTrigger />
            </div>
        </>
    );
}

function PrintTrigger() {
    return (
        <script dangerouslySetInnerHTML={{ __html: `window.print()` }} />
    );
}
