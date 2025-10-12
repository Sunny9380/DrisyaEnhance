import { useState } from "react";
import JobCard from "@/components/JobCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function History() {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    {
      id: "4",
      templateName: "Pink Pastel Dream",
      imageCount: 345,
      status: "completed" as const,
      timestamp: "2 days ago",
    },
    {
      id: "5",
      templateName: "Black Premium Dark",
      imageCount: 678,
      status: "failed" as const,
      timestamp: "3 days ago",
    },
  ];

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = job.templateName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = !filter || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: mockJobs.length,
    processing: mockJobs.filter((j) => j.status === "processing").length,
    completed: mockJobs.filter((j) => j.status === "completed").length,
    queued: mockJobs.filter((j) => j.status === "queued").length,
    failed: mockJobs.filter((j) => j.status === "failed").length,
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
            placeholder="Search by template name..."
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

      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            {...job}
            onView={() => console.log("View job", job.id)}
            onDownload={() => console.log("Download job", job.id)}
            onReprocess={() => console.log("Reprocess job", job.id)}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      )}
    </div>
  );
}
