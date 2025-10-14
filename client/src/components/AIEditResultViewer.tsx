import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import ImageComparisonSlider from "@/components/ImageComparisonSlider";
import type { AIEdit } from "@shared/schema";

interface AIEditResultViewerProps {
  editId: string;
  onReEdit?: (prompt: string, model: string) => void;
}

export default function AIEditResultViewer({
  editId,
  onReEdit,
}: AIEditResultViewerProps) {
  const { data: edit, isLoading } = useQuery<AIEdit>({
    queryKey: ["/api/ai-edits", editId],
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "queued" || data?.status === "processing" ? 2000 : false;
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/ai-edits/${editId}/retry`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-edits", editId] });
    },
  });

  const handleDownload = async () => {
    if (!edit?.outputImageUrl) return;

    try {
      const response = await fetch(edit.outputImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-edit-${editId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleRetry = () => {
    retryMutation.mutate();
  };

  if (isLoading || !edit) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (edit.status === "queued" || edit.status === "processing") {
    return (
      <div className="space-y-4 text-center p-8" data-testid="processing-state">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <p className="text-lg font-semibold">AI is processing your image...</p>
        <p className="text-sm text-muted-foreground" data-testid="text-processing-status">
          Model: {edit.aiModel} | Status: {edit.status}
        </p>
      </div>
    );
  }

  if (edit.status === "failed") {
    return (
      <Alert variant="destructive" data-testid="error-state">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Processing Failed</AlertTitle>
        <AlertDescription>
          {edit.errorMessage || "An unknown error occurred during processing"}
        </AlertDescription>
        <Button
          onClick={handleRetry}
          className="mt-2"
          disabled={retryMutation.isPending}
          data-testid="button-retry"
        >
          {retryMutation.isPending ? "Retrying..." : "Retry Processing"}
        </Button>
      </Alert>
    );
  }

  if (edit.status === "completed" && edit.outputImageUrl) {
    return (
      <div className="space-y-4" data-testid="success-state">
        <div className="relative w-full h-96">
          <ImageComparisonSlider
            beforeImage={edit.inputImageUrl}
            afterImage={edit.outputImageUrl}
            beforeLabel="Original"
            afterLabel="AI Enhanced"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} data-testid="button-download-ai-result">
            <Download className="w-4 h-4 mr-2" />
            Download Result
          </Button>
          {onReEdit && (
            <Button
              variant="outline"
              onClick={() => onReEdit(edit.prompt, edit.aiModel)}
              data-testid="button-re-edit"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-edit with New Prompt
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-1" data-testid="edit-details">
          <p data-testid="text-prompt">Prompt: "{edit.prompt}"</p>
          <p data-testid="text-model">Model: {edit.aiModel}</p>
          {edit.completedAt && (
            <p data-testid="text-completed-at">
              Processed: {format(new Date(edit.completedAt), "PPpp")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert data-testid="unknown-state">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Unknown Status</AlertTitle>
      <AlertDescription>
        The edit status is not recognized. Please refresh the page.
      </AlertDescription>
    </Alert>
  );
}
