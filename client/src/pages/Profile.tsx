import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Upload, 
  Camera,
  Coins,
  ImageIcon,
  Briefcase,
  TrendingUp,
  Shield,
  Bell
} from "lucide-react";
import { useState, useRef } from "react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  coinBalance: number;
  role: string;
  emailNotifications: boolean;
  notifyJobCompletion: boolean;
  notifyPaymentConfirmed: boolean;
  notifyCoinsAdded: boolean;
  createdAt: string;
}

interface UserStats {
  totalJobs: number;
  totalImagesProcessed: number;
  totalCoinsSpent: number;
  totalCoinsPurchased: number;
  accountAge: number;
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional(),
  emailNotifications: z.boolean(),
  notifyJobCompletion: z.boolean(),
  notifyPaymentConfirmed: z.boolean(),
  notifyCoinsAdded: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData, isLoading: profileLoading } = useQuery<{ user: UserProfile }>({
    queryKey: ["/api/profile"],
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<{ stats: UserStats }>({
    queryKey: ["/api/profile/stats"],
  });

  const user = profileData?.user;
  const stats = statsData?.stats;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      emailNotifications: user?.emailNotifications ?? true,
      notifyJobCompletion: user?.notifyJobCompletion ?? true,
      notifyPaymentConfirmed: user?.notifyPaymentConfirmed ?? true,
      notifyCoinsAdded: user?.notifyCoinsAdded ?? true,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setAvatarPreview(null);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG and PNG images are allowed.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    uploadAvatarMutation.mutate(file);
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="space-y-8" data-testid="page-profile-loading">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-24 bg-muted animate-pulse rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-profile">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Jobs</p>
          </div>
          <p className="text-3xl font-bold font-mono" data-testid="text-total-jobs">
            {stats?.totalJobs || 0}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Images Processed</p>
          </div>
          <p className="text-3xl font-bold font-mono" data-testid="text-total-images">
            {stats?.totalImagesProcessed || 0}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-destructive" />
            <p className="text-sm text-muted-foreground">Coins Spent</p>
          </div>
          <p className="text-3xl font-bold font-mono" data-testid="text-coins-spent">
            {stats?.totalCoinsSpent || 0}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-muted-foreground">Current Balance</p>
          </div>
          <p className="text-3xl font-bold font-mono" data-testid="text-coin-balance">
            {user.coinBalance}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24" data-testid="avatar-profile">
                <AvatarImage src={avatarPreview || user.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleAvatarChange}
                className="hidden"
                data-testid="input-avatar"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
                data-testid="button-upload-avatar"
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploadAvatarMutation.isPending ? "Uploading..." : "Change Photo"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JPG or PNG, max 2MB
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="WhatsApp number for support"
                  data-testid="input-phone"
                />
              </div>

              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Details
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded" data-testid="text-user-id">
                {user.id}
              </code>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} data-testid="badge-role">
                {user.role.toUpperCase()}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </p>
              <p className="text-sm font-medium" data-testid="text-member-since">
                {format(new Date(user.createdAt), "MMMM dd, yyyy")}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Age</p>
              <p className="text-sm font-medium" data-testid="text-account-age">
                {stats?.accountAge || 0} {stats?.accountAge === 1 ? "day" : "days"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Coins Purchased</p>
              <p className="text-sm font-medium font-mono" data-testid="text-coins-purchased">
                {stats?.totalCoinsPurchased || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive all email notifications
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={form.watch("emailNotifications")}
              onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
              data-testid="switch-email-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyJobCompletion">Job Completion</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when processing jobs are completed
              </p>
            </div>
            <Switch
              id="notifyJobCompletion"
              checked={form.watch("notifyJobCompletion")}
              onCheckedChange={(checked) => form.setValue("notifyJobCompletion", checked)}
              disabled={!form.watch("emailNotifications")}
              data-testid="switch-job-completion"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyPaymentConfirmed">Payment Confirmations</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when payments are confirmed
              </p>
            </div>
            <Switch
              id="notifyPaymentConfirmed"
              checked={form.watch("notifyPaymentConfirmed")}
              onCheckedChange={(checked) => form.setValue("notifyPaymentConfirmed", checked)}
              disabled={!form.watch("emailNotifications")}
              data-testid="switch-payment-confirmed"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyCoinsAdded">Coins Added</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when coins are added to your account
              </p>
            </div>
            <Switch
              id="notifyCoinsAdded"
              checked={form.watch("notifyCoinsAdded")}
              onCheckedChange={(checked) => form.setValue("notifyCoinsAdded", checked)}
              disabled={!form.watch("emailNotifications")}
              data-testid="switch-coins-added"
            />
          </div>

          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateProfileMutation.isPending}
            className="mt-4"
            data-testid="button-save-notifications"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
