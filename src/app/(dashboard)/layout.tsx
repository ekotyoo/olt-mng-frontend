import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Separator } from "@/components/ui/separator";
import UserNav from "@/components/user-nav";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="h-16 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    </div>
                    <UserNav />
                </div>
                <Separator />
                <main className="p-4 w-full">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
