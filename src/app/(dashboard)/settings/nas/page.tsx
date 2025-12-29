"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Plus, Trash, Router, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { getNasList, createNas, deleteNas } from "@/app/actions/nas";
import { EmptyState } from "@/components/ui/empty-state";

export default function NasPage() {
    const [nasList, setNasList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        nasname: "",
        shortname: "",
        type: "mikrotik",
        secret: "",
        description: ""
    });

    useEffect(() => {
        loadNas();
    }, []);

    async function loadNas() {
        setLoading(true);
        try {
            const data = await getNasList();
            setNasList(data);
        } catch (error) {
            toast.error("Failed to load NAS list");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createNas(formData);
            toast.success("NAS added successfully");
            setOpen(false);
            setFormData({ nasname: "", shortname: "", type: "mikrotik", secret: "", description: "" });
            loadNas();
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure? This router will no longer be able to authenticate users.")) return;
        try {
            await deleteNas(id);
            toast.success("NAS deleted");
            loadNas();
        } catch (error) {
            toast.error("Failed to delete NAS");
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">NAS / Routers</h1>
                    <p className="text-muted-foreground">Manage Radius Clients (Mikrotik/Cisco) authorized to connect.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Router
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Radius Client</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nasname">IP Address</Label>
                                <Input 
                                    id="nasname" 
                                    placeholder="192.168.88.1"
                                    value={formData.nasname}
                                    onChange={e => setFormData({...formData, nasname: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shortname">Short Name</Label>
                                <Input 
                                    id="shortname" 
                                    placeholder="Tower A"
                                    value={formData.shortname}
                                    onChange={e => setFormData({...formData, shortname: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select 
                                    value={formData.type} 
                                    onValueChange={v => setFormData({...formData, type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mikrotik">Mikrotik</SelectItem>
                                        <SelectItem value="cisco">Cisco</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="secret">Radius Secret</Label>
                                <div className="relative">
                                    <ShieldAlert className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="secret" 
                                        type="text"
                                        placeholder="SharedSecret123"
                                        className="pl-9"
                                        value={formData.secret}
                                        onChange={e => setFormData({...formData, secret: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Create</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Short Name</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nasList.map((nas) => (
                            <TableRow key={nas.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Router className="w-4 h-4 text-muted-foreground" />
                                        {nas.shortname || "-"}
                                    </div>
                                </TableCell>
                                <TableCell>{nas.nasname}</TableCell>
                                <TableCell className="capitalize">{nas.type}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(nas.id)}>
                                        <Trash className="w-4 h-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {nasList.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24">
                                     <EmptyState 
                                            icon={Router} 
                                            title="No Routers Configured" 
                                            description="Add a NAS (Network Access Server) to allow customers to connect." 
                                            action={<Button variant="outline" onClick={() => setOpen(true)}>Add Router</Button>}
                                     />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
