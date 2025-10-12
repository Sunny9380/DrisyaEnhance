import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Image,
  Coins,
  Clock,
  Star,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const stats = [
    {
      label: "Total Processed",
      value: "12,453",
      change: "+18%",
      trend: "up",
      icon: Image,
    },
    {
      label: "Coins Spent",
      value: "24,906",
      change: "+12%",
      trend: "up",
      icon: Coins,
    },
    {
      label: "Avg. Processing Time",
      value: "2.3 min",
      change: "-15%",
      trend: "down",
      icon: Clock,
    },
    {
      label: "Favorite Templates",
      value: "8",
      change: "+2",
      trend: "up",
      icon: Star,
    },
  ];

  const topTemplates = [
    { name: "Premium Dark Fabric", uses: 3421, percentage: 27 },
    { name: "White Studio", uses: 2891, percentage: 23 },
    { name: "Blue Gradient", uses: 1567, percentage: 13 },
    { name: "Rose Gold", uses: 1234, percentage: 10 },
    { name: "Wooden Table", uses: 892, percentage: 7 },
  ];

  const monthlyUsage = [
    { month: "Jan", images: 850 },
    { month: "Feb", images: 1200 },
    { month: "Mar", images: 980 },
    { month: "Apr", images: 1450 },
    { month: "May", images: 1890 },
    { month: "Jun", images: 2156 },
  ];

  const maxUsage = Math.max(...monthlyUsage.map((m) => m.images));

  return (
    <div className="space-y-6" data-testid="component-analytics-dashboard">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-chart-2" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-chart-2" />
                  )}
                  <span className="text-xs text-chart-2 font-semibold">
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Processing Volume</h3>
          <div className="space-y-3">
            {monthlyUsage.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.month}</span>
                  <span className="font-mono font-semibold">{item.images.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(item.images / maxUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Templates */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Most Used Templates</h3>
          <div className="space-y-4">
            {topTemplates.map((template, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{template.name}</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {template.uses.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                    style={{ width: `${template.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cost Optimization Insight */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Cost Optimization Tip</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Based on your usage of <span className="font-mono font-semibold">2,156 images/month</span>, 
              upgrading to the Professional plan would save you{" "}
              <span className="font-semibold text-primary">₹800/month</span> (20% savings).
            </p>
            <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
