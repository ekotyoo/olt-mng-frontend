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
import { FileStack, Home, List, LogOut, NotebookPen, Settings, User } from "lucide-react";

const menus = [
  {
    groupName: "Optical Line Terminal (OLT)",
    items: [
      {
        title: "OLT List",
        url: "olt",
        icon: List,
      },
    ],
  },

  {
    groupName: "Optical Network Unit (ONU)",
    items: [
      {
        title: "ONU List",
        url: "onu",
        icon: List,
      },
      {
        title: "ONU Configuration",
        url: "onu-configuration",
        icon: Settings,
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
        <h1>Management OLT</h1>
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
