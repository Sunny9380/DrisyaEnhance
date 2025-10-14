import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import CoinBalance from "@/components/CoinBalance";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Dashboard from "@/pages/Dashboard";
import Templates from "@/pages/Templates";
import Upload from "@/pages/Upload";
import History from "@/pages/History";
import Gallery from "@/pages/Gallery";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import Analytics from "@/pages/Analytics";
import Referrals from "@/pages/Referrals";
import Team from "@/pages/Team";
import Integrations from "@/pages/Integrations";
import APIAccess from "@/pages/APIAccess";
import MediaLibrary from "@/pages/MediaLibrary";
import Help from "@/pages/Help";
import Showcase3D from "@/pages/Showcase3D";
import CustomizeTemplate from "@/pages/CustomizeTemplate";
import ProductViewer from "@/pages/ProductViewer";
import TemplateDetail from "@/pages/TemplateDetail";
import NotFound from "@/pages/NotFound";
import NotificationCenter from "@/components/NotificationCenter";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/templates" component={Templates} />
      <Route path="/template/:id" component={TemplateDetail} />
      <Route path="/upload" component={Upload} />
      <Route path="/history" component={History} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/media-library" component={MediaLibrary} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/help" component={Help} />
      <Route path="/team" component={Team} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/api" component={APIAccess} />
      <Route path="/admin" component={Admin} />
      <Route path="/showcase-3d" component={Showcase3D} />
      <Route path="/customize" component={CustomizeTemplate} />
      <Route path="/product-viewer" component={ProductViewer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location, setLocation] = useLocation();
  
  // Public routes (landing, login, register, legal pages)
  const publicRoutes = ["/", "/login", "/register", "/terms", "/privacy"];
  const isPublicRoute = publicRoutes.includes(location);

  // Fetch current user
  const { data: userData } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
    enabled: !isPublicRoute,
    retry: false,
  });

  const user = userData?.user;

  // Fetch quota status
  const { data: quotaData } = useQuery<{ used: number; quota: number; remaining: number; hasQuota: boolean; tier: string }>({
    queryKey: ["/api/usage/quota"],
    enabled: !isPublicRoute && !!user,
    retry: false,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const quota = quotaData || { used: 0, quota: 50, remaining: 50, hasQuota: true, tier: "free" };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isPublicRoute) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <PublicRouter />
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              {/* Quota Display */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg" data-testid="component-quota-display">
                <TrendingUp className={`w-4 h-4 ${quota.remaining < 3 ? "text-destructive" : "text-chart-2"}`} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-semibold text-xs" data-testid="text-quota-status">
                    {quota.used}/{quota.quota === 999999 ? "∞" : quota.quota} images
                  </span>
                  {quota.remaining < 3 && quota.tier !== "enterprise" && (
                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                      Low quota
                    </Badge>
                  )}
                </div>
              </div>

              <CoinBalance
                balance={user?.coinBalance || 0}
                onAddCoins={() => setLocation("/wallet")}
              />
              <NotificationCenter />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none" data-testid="button-user-menu">
                    <Avatar className="w-9 h-9 cursor-pointer hover-elevate active-elevate-2">
                      <AvatarImage src={user?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setLocation("/profile")}
                    data-testid="menu-profile"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
                      await apiRequest("POST", "/api/auth/logout");
                      queryClient.clear();
                      setLocation("/");
                    }} 
                    data-testid="menu-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-12 max-w-7xl mx-auto">
              <AuthenticatedRouter />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
      <KeyboardShortcuts />
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
