import { getUsers } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, User as UserIcon } from "lucide-react";
import UserDialog from "./components/user-dialog";
import DeleteUserButton from "./components/delete-user-button";

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage administrators and access roles.
                    </p>
                </div>
                <UserDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Administrators</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-slate-100">
                                                <UserIcon className="w-4 h-4 text-slate-600" />
                                            </div>
                                            {user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {user.role === 'ADMIN' ? (
                                                <ShieldAlert className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <Shield className="w-4 h-4 text-blue-500" />
                                            )}
                                            {user.role}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DeleteUserButton userId={user.id} userName={user.name || "User"} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
