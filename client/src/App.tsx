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
import Dashboard from "@/pages/Dashboard";
import Templates from "@/pages/Templates";
import Upload from "@/pages/Upload";
import History from "@/pages/History";
import Wallet from "@/pages/Wallet";
import Admin from "@/pages/Admin";
import Analytics from "@/pages/Analytics";
import Referrals from "@/pages/Referrals";
import Team from "@/pages/Team";
import Integrations from "@/pages/Integrations";
import APIAccess from "@/pages/APIAccess";
import NotFound from "@/pages/NotFound";
import NotificationCenter from "@/components/NotificationCenter";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/templates" component={Templates} />
      <Route path="/upload" component={Upload} />
      <Route path="/history" component={History} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/team" component={Team} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/api" component={APIAccess} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location, setLocation] = useLocation();
  
  // Public routes (landing, login, register)
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(location);

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !isPublicRoute,
    retry: false,
  });

  const user = userData?.user;

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isPublicRoute) {
    return (
      <>
        <PublicRouter />
        <Toaster />
      </>
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
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="menu-profile">
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
