import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Images,
  Upload,
  History,
  Wallet,
  Settings,
  BarChart3,
  Users,
  Gift,
  Plug,
  Code,
  ImagePlus,
  FileImage,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/templates", icon: Images },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "History", url: "/history", icon: History },
  { title: "Gallery", url: "/gallery", icon: FileImage },
  { title: "Media Library", url: "/media-library", icon: ImagePlus },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Referrals", url: "/referrals", icon: Gift },
];

const businessItems = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Team", url: "/team", icon: Users },
];

const developersItems = [
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "API Access", url: "/api", icon: Code },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: Settings },
];

export default function AppSidebar() {
  const [location] = useLocation();

  // Fetch current user to check role
  const { data: userData } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = userData?.user;
  const isAdmin = user?.role === 'admin';

  return (
    <Sidebar>
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">D</span>
          </div>
          <h1 className="font-bold text-xl">Drisya</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Business</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Developers</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {developersItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
