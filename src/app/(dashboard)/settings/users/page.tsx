"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/user";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        const res = await deleteUser(id);
        if (res.success) {
            toast.success("User deleted");
            fetchUsers();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system access and roles.</p>
                </div>
                <Button onClick={() => { setEditingUser(null); setIsOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">System Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name || "-"}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={user.status === 'ACTIVE' ? "border-green-500 text-green-500" : "border-gray-500 text-gray-500"}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="icon" variant="ghost" onClick={() => { setEditingUser(user); setIsOpen(true); }}>
                                                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <UserDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                user={editingUser}
                onSuccess={fetchUsers}
            />
        </div>
    );
}

function UserDialog({ open, onOpenChange, user, onSuccess }: { open: boolean, onOpenChange: (Open: boolean) => void, user: User | null, onSuccess: () => void }) {
    const { register, handleSubmit, reset, setValue } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setValue("name", user.name);
            setValue("email", user.email);
            setValue("role", user.role);
            setValue("status", user.status);
            setValue("password", ""); // Clear password on edit
        } else {
            reset({
                name: "",
                email: "",
                role: "VIEWER",
                status: "ACTIVE",
                password: ""
            });
        }
    }, [user, open, reset, setValue]);

    async function onSubmit(data: any) {
        setLoading(true);
        try {
            let res;
            if (user) {
                res = await updateUser(user.id, data);
            } else {
                res = await createUser(data);
            }

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(user ? "User updated" : "User created");
                onOpenChange(false);
                onSuccess();
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name")} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} placeholder="john@example.com" disabled={!!user} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                onValueChange={(v) => setValue("role", v)}
                                defaultValue={user?.role || "VIEWER"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                onValueChange={(v) => setValue("status", v)}
                                defaultValue={user?.status || "ACTIVE"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="DISABLED">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{user ? "New Password (Optional)" : "Password"}</Label>
                        <Input id="password" type="password" {...register("password")} placeholder={user ? "Leave blank to keep current" : "Min 8 characters"} minLength={user ? undefined : 8} required={!user} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {user ? "Save Changes" : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
