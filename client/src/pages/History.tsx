import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import JobCard from "@/components/JobCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ProcessingJob } from "@shared/schema";

export default function History() {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch jobs from database
  const { data: jobsData, isLoading } = useQuery<{ jobs: ProcessingJob[] }>({
    queryKey: ["/api/jobs"],
  });

  const jobs = jobsData?.jobs || [];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = !filter || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: jobs.length,
    processing: jobs.filter((j) => j.status === "processing").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    queued: jobs.filter((j) => j.status === "queued").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

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
    <div className="space-y-6" data-testid="page-history">
      <div>
        <h1 className="text-3xl font-bold mb-2">Processing History</h1>
        <p className="text-muted-foreground">
          View and manage all your image processing jobs
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by job ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-jobs"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filter === null ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => setFilter(null)}
          data-testid="filter-all-jobs"
        >
          All ({statusCounts.all})
        </Badge>
        <Badge
          variant={filter === "processing" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => setFilter("processing")}
          data-testid="filter-processing"
        >
          Processing ({statusCounts.processing})
        </Badge>
        <Badge
          variant={filter === "completed" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => setFilter("completed")}
          data-testid="filter-completed"
        >
          Completed ({statusCounts.completed})
        </Badge>
        <Badge
          variant={filter === "queued" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => setFilter("queued")}
          data-testid="filter-queued"
        >
          Queued ({statusCounts.queued})
        </Badge>
        <Badge
          variant={filter === "failed" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => setFilter("failed")}
          data-testid="filter-failed"
        >
          Failed ({statusCounts.failed})
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
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
          ))}
        </div>
      )}

      {!isLoading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {jobs.length === 0 ? "No processing jobs yet. Start by uploading images!" : "No jobs found"}
          </p>
        </div>
      )}
    </div>
  );
}
