import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/StatsCard";
import JobCard from "@/components/JobCard";
import ImageComparisonSlider from "@/components/ImageComparisonSlider";
import { Image, CheckCircle, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
// Placeholder images - replace with actual demo images later
const earringsWhiteBg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzI4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9yaWdpbmFsIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
const earringsDarkBg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2Y5ZmFmYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVuaGFuY2VkIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
import type { ProcessingJob } from "@shared/schema";

interface User {
  id: string;
  email: string;
  name: string;
  coinBalance: number;
  role: string;
}

export default function Dashboard() {
  // Fetch current user for coin balance
  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch recent jobs
  const { data: jobsData } = useQuery<{ jobs: ProcessingJob[] }>({
    queryKey: ["/api/jobs"],
  });

  const jobs = jobsData?.jobs || [];
  const recentJobs = jobs.slice(0, 3);

  // Calculate stats from real data
  const totalProcessed = jobs.reduce((sum, job) => sum + (job.processedImages || 0), 0);
  const completedToday = jobs.filter(job => {
    const createdAt = new Date(job.createdAt);
    const today = new Date();
    return createdAt.toDateString() === today.toDateString() && job.status === 'completed';
  }).reduce((sum, job) => sum + (job.processedImages || 0), 0);
  const inQueue = jobs.filter(j => j.status === 'queued' || j.status === 'processing')
    .reduce((sum, job) => sum + (job.totalImages - (job.processedImages || 0)), 0);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-12" data-testid="page-dashboard">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your image processing overview.
        </p>
      </div>

      <div className="max-w-3xl">
        <ImageComparisonSlider
          beforeImage={earringsWhiteBg}
          afterImage={earringsDarkBg}
          beforeLabel="Original"
          afterLabel="Enhanced with Drisya"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Image}
          label="Total Processed"
          value={totalProcessed.toString()}
          iconColor="text-primary"
        />
        <StatsCard
          icon={CheckCircle}
          label="Completed Today"
          value={completedToday.toString()}
          iconColor="text-chart-2"
        />
        <StatsCard
          icon={Clock}
          label="In Queue"
          value={inQueue.toString()}
          iconColor="text-chart-4"
        />
        <StatsCard
          icon={Coins}
          label="Coin Balance"
          value={userData?.user?.coinBalance?.toString() || "0"}
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
          {recentJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No processing jobs yet. Start by uploading images!
            </div>
          ) : (
            recentJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                templateName={`Job ${job.id.slice(0, 8)}`}
                imageCount={job.totalImages}
                status={job.status}
                progress={job.totalImages > 0 ? Math.round((job.processedImages / job.totalImages) * 100) : 0}
                timestamp={formatTimestamp(job.createdAt)}
                onView={() => console.log("View job", job.id)}
                onDownload={() => {
                  if (job.zipUrl) {
                    window.open(job.zipUrl, '_blank');
                  }
                }}
                onReprocess={() => console.log("Reprocess job", job.id)}
              />
            ))
          )}
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
