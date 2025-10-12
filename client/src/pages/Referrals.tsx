import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gift, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Referrals() {
  const { toast } = useToast();
  const referralCode = "DRISYA-JD2025";
  const referralLink = `https://drisya.app/register?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const stats = [
    { label: "Total Referrals", value: "12", icon: Users },
    { label: "Coins Earned", value: "600", icon: Gift },
    { label: "This Month", value: "+3", icon: TrendingUp },
  ];

  const referralHistory = [
    { name: "Sarah Johnson", date: "2 days ago", coins: 50, status: "completed" },
    { name: "Mike Chen", date: "1 week ago", coins: 50, status: "completed" },
    { name: "Emma Davis", date: "2 weeks ago", coins: 50, status: "pending" },
  ];

  return (
    <div className="space-y-8" data-testid="page-referrals">
      <div>
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground">
          Earn 50 coins for every friend who signs up and makes their first purchase
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
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
        <div className="flex gap-2 mt-4">
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
              Your friend creates an account and purchases their first coin package
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="font-semibold">You Both Earn</h3>
            <p className="text-sm text-muted-foreground">
              You get 50 coins, they get 25 bonus coins on their first purchase
            </p>
          </div>
        </div>
      </Card>

      {/* Referral History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Referral History</h2>
        <div className="space-y-3">
          {referralHistory.map((referral, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
              data-testid={`referral-${index}`}
            >
              <div>
                <p className="font-medium">{referral.name}</p>
                <p className="text-sm text-muted-foreground">{referral.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono font-semibold">+{referral.coins} coins</p>
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
      </Card>
    </div>
  );
}
