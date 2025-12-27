"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Olt } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteOlt } from "@/app/actions/olt-management";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function OltListTable({ olts }: { olts: Olt[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this OLT?")) return;

        const res = await deleteOlt(id);
        if (res.success) {
            toast.success("OLT deleted");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Port</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {olts.map((olt) => (
                        <TableRow key={olt.id}>
                            <TableCell className="font-medium">{olt.name}</TableCell>
                            <TableCell>{olt.host}</TableCell>
                            <TableCell>{olt.port}</TableCell>
                            <TableCell>
                                <Badge variant={olt.status === 'ONLINE' ? 'default' : 'destructive'} className={olt.status === 'ONLINE' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {olt.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                                CPU: {olt.cpuUsage}% | Mem: {olt.memoryUsage}%
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                                <Link href={`/settings/olts/${olt.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => handleDelete(olt.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {olts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No OLTs configured.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
