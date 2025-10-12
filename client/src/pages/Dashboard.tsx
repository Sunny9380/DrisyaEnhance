import StatsCard from "@/components/StatsCard";
import JobCard from "@/components/JobCard";
import ProductShowcase from "@/components/ProductShowcase";
import { Image, CheckCircle, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const mockJobs = [
    {
      id: "1",
      templateName: "Blue Gradient Background",
      imageCount: 1247,
      status: "processing" as const,
      progress: 67,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      templateName: "White Minimal Studio",
      imageCount: 523,
      status: "completed" as const,
      timestamp: "Yesterday",
    },
    {
      id: "3",
      templateName: "Wooden Table Surface",
      imageCount: 892,
      status: "queued" as const,
      timestamp: "3 hours ago",
    },
  ];

  return (
    <div className="space-y-12" data-testid="page-dashboard">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your image processing overview.
        </p>
      </div>

      <ProductShowcase />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Image}
          label="Total Processed"
          value="12,453"
          trend="+18% from last month"
          iconColor="text-primary"
        />
        <StatsCard
          icon={CheckCircle}
          label="Completed Today"
          value="247"
          iconColor="text-chart-2"
        />
        <StatsCard
          icon={Clock}
          label="In Queue"
          value="1,892"
          iconColor="text-chart-4"
        />
        <StatsCard
          icon={Coins}
          label="Coin Balance"
          value="2,500"
          iconColor="text-chart-4"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Jobs</h2>
          <Link href="/history">
            <Button variant="ghost" size="sm" data-testid="button-view-all-jobs">
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {mockJobs.map((job) => (
            <JobCard
              key={job.id}
              {...job}
              onView={() => console.log("View job", job.id)}
              onDownload={() => console.log("Download job", job.id)}
              onReprocess={() => console.log("Reprocess job", job.id)}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex gap-4">
        <Link href="/templates">
          <Button size="lg" data-testid="button-browse-templates">
            Browse Templates
          </Button>
        </Link>
        <Link href="/upload">
          <Button variant="outline" size="lg" data-testid="button-new-upload">
            New Upload
          </Button>
        </Link>
      </div>
    </div>
  );
}
