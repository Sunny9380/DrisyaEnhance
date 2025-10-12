import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface JobCardProps {
  id: string;
  templateName: string;
  imageCount: number;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  timestamp: string;
  onView?: () => void;
  onDownload?: () => void;
  onReprocess?: () => void;
}

export default function JobCard({
  id,
  templateName,
  imageCount,
  status,
  progress = 0,
  timestamp,
  onView,
  onDownload,
  onReprocess,
}: JobCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "queued":
        return "border-l-chart-4";
      case "processing":
        return "border-l-primary";
      case "completed":
        return "border-l-chart-2";
      case "failed":
        return "border-l-destructive";
      default:
        return "border-l-border";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "queued":
        return <Badge variant="secondary">Queued</Badge>;
      case "processing":
        return <Badge className="bg-primary text-primary-foreground">Processing</Badge>;
      case "completed":
        return <Badge className="bg-chart-2 text-white">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card
      className={`border-l-4 ${getStatusColor()}`}
      data-testid={`card-job-${id}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate" data-testid={`text-job-template-${id}`}>
                {templateName}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono font-semibold">{imageCount}</span> images
              {" • "}
              {timestamp}
            </p>
          </div>
        </div>

        {status === "processing" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Processing...
              </span>
              <span className="text-sm font-mono font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex gap-2">
          {status === "completed" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onView}
                data-testid={`button-view-job-${id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onDownload}
                data-testid={`button-download-job-${id}`}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
          {status === "failed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReprocess}
              data-testid={`button-reprocess-job-${id}`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
