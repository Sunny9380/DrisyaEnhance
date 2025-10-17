import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();

  // Fetch current user to check role
  const { data: userData, isLoading, error } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = userData?.user;
  const isAdmin = user?.role === 'admin';

  // Redirect non-admin users to dashboard
  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      setLocation("/dashboard");
    }
  }, [isLoading, user, isAdmin, setLocation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to verify your permissions. Please try logging in again.
          </p>
          <Button onClick={() => setLocation("/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            Please log in to access this page.
          </p>
          <Button onClick={() => setLocation("/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin panel. Only administrators can view this page.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current role: <span className="font-mono bg-muted px-2 py-1 rounded">{user.role || 'user'}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Required role: <span className="font-mono bg-muted px-2 py-1 rounded">admin</span>
            </p>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={() => setLocation("/profile")}>
              View Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User is admin, render the protected content
  return <>{children}</>;
}
