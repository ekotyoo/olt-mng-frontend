import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Cat, CatIcon, Computer, LogOut, Network, Plug, Settings, User, ScrollText, Activity, Users, CreditCard, Receipt, Map } from "lucide-react";
import { logout } from "@/app/actions/auth";

const menus = [
  {
    groupName: "Network",
    items: [
      {
        title: "Port Overview",
        url: "/pon-ports",
        icon: Network,
      },
      {
        title: "Network Map",
        url: "/map",
        icon: Map,
      },
      {
        title: "OLT Devices",
        url: "/settings/olts",
        icon: Settings,
      }
    ],
  },
  {
    groupName: "Device Management",
    items: [
      {
        title: "Search Devices",
        url: "/onus",
        icon: Network,
      },
      {
        title: "Provision New",
        url: "/onu-configuration",
        icon: Plug,
      },
      {
        title: "Signal Audit",
        url: "/health",
        icon: Activity,
      },
    ],
  },
  {
    groupName: "Billing & Service",
    items: [
      {
        title: "Subscribers",
        url: "/customers",
        icon: Users,
      },
      {
        title: "Internet Plans",
        url: "/plans",
        icon: ScrollText,
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: Receipt,
      },
      {
        title: "Active Sessions",
        url: "/radius/sessions",
        icon: Activity,
      },
    ],
  },
  {
    groupName: "Administration",
    items: [
      {
        title: "User Management",
        url: "/settings/users",
        icon: User,
      },
      {
        title: "Global Billing",
        url: "/settings/billing",
        icon: CreditCard,
      },
      {
        title: "Audit Logs",
        url: "/logs",
        icon: ScrollText,
      },
      {
        title: "NAS / Routers",
        url: "/settings/nas",
        icon: Network,
      },
    ]
  }
];

const footerItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Logout",
    url: "#",
    icon: LogOut,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-foreground text-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Cat className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Buroq.net</span>
                  <span className="truncate text-xs">OLT Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menus.map((menu) => (
          <SidebarGroup key={menu.groupName}>
            <SidebarGroupLabel>{menu.groupName}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menu.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => {
                if (item.title === "Logout") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <form action={logout}>
                          <button className="flex w-full items-center gap-2">
                            <item.icon />
                            <span>{item.title}</span>
                          </button>
                        </form>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
