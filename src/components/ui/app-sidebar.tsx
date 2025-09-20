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
import { Cat, CatIcon, Computer, LogOut, Network, Plug, User } from "lucide-react";

const menus = [
  {
    groupName: "Optical Line Terminal (OLT)",
    items: [
      {
        title: "OLT List",
        url: "olt",
        icon: Computer,
      },
    ],
  },

  {
    groupName: "Optical Network Unit (ONU)",
    items: [
      {
        title: "ONU List",
        url: "onu",
        icon: Network,
      },
      {
        title: "ONU Configuration",
        url: "onu-configuration",
        icon: Plug,
      },
    ],
  },
];

const footerItems = [
  {
    title: "Profile",
    url: "#",
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
              <a href="/">
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
              {footerItems.map((item) => (
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
      </SidebarFooter>
    </Sidebar>
  );
}
