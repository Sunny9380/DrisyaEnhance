import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Users, Gift, TrendingUp, Mail, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { SiWhatsapp, SiX } from "react-icons/si";

export default function Referrals() {
  const { toast } = useToast();

  // Fetch referral code
  const { data: codeData, isLoading: codeLoading } = useQuery({
    queryKey: ["/api/referrals/my-code"],
  });

  // Fetch referral stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  // Fetch referral list
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["/api/referrals/list"],
  });

  const referralCode = codeData?.referralCode || "";
  const referralLink = `https://drisya.app/register?ref=${referralCode}`;

  const stats = statsData?.stats || {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalCoinsEarned: 0,
  };

  const referrals = listData?.referrals || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Hey! I'm using Drisya to transform my product images with AI. Sign up using my link and we both get bonus coins! ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Transform Your Images with Drisya");
    const body = encodeURIComponent(
      `Hi!\n\nI've been using Drisya to enhance my product images with AI-powered templates. It's amazing!\n\nSign up using my referral link and we both get bonus coins:\n${referralLink}\n\nCheck it out!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `Transform your product images with AI! Join me on @Drisya and get bonus coins: ${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const statCards = [
    { 
      label: "Total Referrals", 
      value: stats.totalReferrals.toString(), 
      icon: Users 
    },
    { 
      label: "Coins Earned", 
      value: stats.totalCoinsEarned.toString(), 
      icon: Gift 
    },
    { 
      label: "Pending", 
      value: stats.pendingReferrals.toString(), 
      icon: TrendingUp 
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-referrals">
      <div>
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground">
          Earn 50 coins for every friend who signs up using your referral link
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            {statsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
        {codeLoading ? (
          <Skeleton className="h-10 w-full mb-4" />
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
                data-testid="input-referral-link"
              />
              <Button
                onClick={() => copyToClipboard(referralLink)}
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Badge variant="secondary">Your Code: {referralCode}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(referralCode)}
                data-testid="button-copy-code"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Code
              </Button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={shareWhatsApp}
                className="gap-2"
                data-testid="button-share-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareEmail}
                className="gap-2"
                data-testid="button-share-email"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareTwitter}
                className="gap-2"
                data-testid="button-share-twitter"
              >
                <SiX className="w-4 h-4" />
                Twitter
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="font-semibold">Share Your Link</h3>
            <p className="text-sm text-muted-foreground">
              Send your unique referral link to friends and colleagues
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="font-semibold">They Sign Up</h3>
            <p className="text-sm text-muted-foreground">
              Your friend creates an account using your referral code
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="font-semibold">You Both Earn</h3>
            <p className="text-sm text-muted-foreground">
              You get 50 coins instantly when they sign up
            </p>
          </div>
        </div>
      </Card>

      {/* Referral History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Referral History</h2>
        {listLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No referrals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Share your referral link to start earning coins!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral: any, index: number) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
                data-testid={`referral-${index}`}
              >
                <div>
                  <p className="font-medium">{referral.referredUserName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(referral.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono font-semibold">
                      +{referral.coinsEarned} coins
                    </p>
                  </div>
                  <Badge
                    variant={referral.status === "completed" ? "default" : "secondary"}
                  >
                    {referral.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
