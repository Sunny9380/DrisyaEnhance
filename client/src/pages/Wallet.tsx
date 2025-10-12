import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function Wallet() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const pricingPlans = [
    {
      id: "starter",
      name: "Starter",
      coins: 500,
      price: 499,
      perImageCost: 0.998,
      popular: false,
    },
    {
      id: "pro",
      name: "Professional",
      coins: 2000,
      price: 1599,
      perImageCost: 0.799,
      popular: true,
      savings: "20%",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      coins: 5000,
      price: 3499,
      perImageCost: 0.699,
      popular: false,
      savings: "30%",
    },
  ];

  const mockTransactions = [
    {
      id: "1",
      type: "debit" as const,
      amount: 1247,
      description: "Processed 1247 images - Blue Gradient",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "credit" as const,
      amount: 2000,
      description: "Purchased Professional Plan",
      timestamp: "Yesterday",
    },
    {
      id: "3",
      type: "debit" as const,
      amount: 523,
      description: "Processed 523 images - White Minimal",
      timestamp: "2 days ago",
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-wallet">
      <div>
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your coins and view transaction history
        </p>
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">
              Current Balance
            </p>
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-chart-4" />
              <span className="text-5xl font-mono font-bold" data-testid="text-current-balance">
                2,500
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Enough for</p>
            <p className="text-2xl font-semibold mt-1">~1,250 images</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Purchase Coins</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-visible cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 ${
                selectedPlan === plan.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Best Value
                  </Badge>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  {plan.savings && (
                    <Badge variant="secondary" className="ml-2">
                      Save {plan.savings}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Coins</span>
                    <span className="font-mono font-semibold">
                      {plan.coins.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Per Image</span>
                    <span className="text-sm font-semibold">₹{plan.perImageCost}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Purchase plan:", plan.id);
                  }}
                  data-testid={`button-purchase-${plan.id}`}
                >
                  Purchase
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div className="space-y-2">
          {mockTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4" data-testid={`card-transaction-${transaction.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {transaction.type === "credit" ? (
                    <div className="w-10 h-10 bg-chart-2/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-chart-2" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.timestamp}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono font-semibold ${
                      transaction.type === "credit"
                        ? "text-chart-2"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
