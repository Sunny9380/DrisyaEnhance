import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Grid as GridIcon, List, Download, Eye, RefreshCw, Plus, Image as ImageIcon, Check, X, Trash, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ImageComparisonSlider from "@/components/ImageComparisonSlider";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { ProcessingJob, Image, Template } from "@shared/schema";

interface JobWithImages extends ProcessingJob {
  images?: Image[];
  templateName?: string;
}

interface FlattenedImage extends Image {
  jobId: string;
  templateName: string;
  jobStatus: string;
  jobCreatedAt: string | Date;
  originalName: string;
}

function formatDate(dateString: string | Date) {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "MMM dd, yyyy");
  } catch {
    return String(dateString);
  }
}

export default function Gallery() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [filter, setFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Preview modal state
  const [previewImage, setPreviewImage] = useState<FlattenedImage | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Bulk action states
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkReprocessDialogOpen, setBulkReprocessDialogOpen] = useState(false);
  const [reprocessTemplateId, setReprocessTemplateId] = useState<string>('');

  // Fetch all processing jobs with their images
  const { data: jobsData, isLoading } = useQuery<{ jobs: JobWithImages[] }>({
    queryKey: ["/api/jobs"],
  });

  const jobs = jobsData?.jobs || [];

  // Fetch templates for reprocess dialog
  const { data: templatesData } = useQuery<{ templates: Template[] }>({
    queryKey: ["/api/templates"],
  });

  const templates = templatesData?.templates || [];

  // Flatten jobs into individual images
  const allImages = useMemo(() => {
    return jobs.flatMap(job => 
      job.images?.map(img => ({
        ...img,
        jobId: job.id,
        templateName: job.templateName || "Unknown Template",
        jobStatus: job.status,
        jobCreatedAt: job.createdAt,
        originalName: img.originalUrl?.split('/').pop()?.split('-').slice(1).join('-') || `image-${img.id.slice(0, 8)}`,
      })) || []
    ) as FlattenedImage[];
  }, [jobs]);

  // Get unique template names for filter
  const uniqueTemplates = useMemo(() => {
    const templates = new Set(allImages.map(img => img.templateName));
    return Array.from(templates);
  }, [allImages]);

  // Apply filters
  const filteredImages = useMemo(() => {
    return allImages.filter(img => {
      // Filter by status
      if (filter !== 'all') {
        const imageStatus = img.status || img.jobStatus;
        if (imageStatus !== filter) return false;
      }
      
      // Filter by template
      if (templateFilter !== 'all' && img.templateName !== templateFilter) return false;
      
      // Search by name
      if (searchQuery && !img.originalName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });
  }, [allImages, filter, templateFilter, searchQuery]);

  const handleViewToggle = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const handleDownload = async (image: FlattenedImage) => {
    try {
      if (!image.processedUrl) {
        toast({
          title: "Image not ready",
          description: "This image hasn't been processed yet",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(image.processedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.originalName;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Download started",
        description: `Downloading ${image.originalName}`,
      });
    } catch (error) {
      toast({
        title: "❌ Download failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (image: FlattenedImage) => {
    setPreviewImage(image);
    setPreviewDialogOpen(true);
  };

  const handleReEdit = (image: FlattenedImage) => {
    localStorage.setItem('reEditImage', JSON.stringify(image));
    setLocation('/upload');
    toast({
      title: "Image loaded",
      description: "Redirecting to upload page...",
    });
  };

  // Bulk action helper functions
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAll = () => {
    setSelectedImages(filteredImages.map(img => img.id));
  };

  const clearSelection = () => {
    setSelectedImages([]);
    setSelectionMode(false);
  };

  // Bulk download mutation
  const bulkDownloadMutation = useMutation({
    mutationFn: async (imageIds: string[]) => {
      const response = await fetch("/api/gallery/bulk-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gallery-export-${Date.now()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: `Downloading ${selectedImages.length} images as ZIP`,
      });
      clearSelection();
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Failed to create ZIP file",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (imageIds: string[]) => {
      // Delete images from their jobs
      await Promise.all(
        imageIds.map(id => apiRequest("DELETE", `/api/images/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Images Deleted",
        description: `${selectedImages.length} images removed`,
      });
      clearSelection();
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete images",
        variant: "destructive",
      });
    },
  });

  // Bulk reprocess mutation
  const bulkReprocessMutation = useMutation({
    mutationFn: async ({ imageIds, templateId, quality }: { imageIds: string[]; templateId: string; quality?: string }) => {
      return await apiRequest("POST", "/api/gallery/bulk-reprocess", {
        imageIds,
        templateId,
        quality: quality || "standard",
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Reprocessing Started",
        description: data.message || `Processing ${selectedImages.length} images with new template`,
      });
      clearSelection();
      setBulkReprocessDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Reprocessing Failed",
        description: error.message || "Failed to reprocess images",
        variant: "destructive",
      });
    },
  });

  const handleBulkDownload = () => {
    bulkDownloadMutation.mutate(selectedImages);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) {
      bulkDeleteMutation.mutate(selectedImages);
    }
  };

  const handleBulkReprocess = () => {
    if (!reprocessTemplateId) {
      toast({
        title: "Template Required",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }
    bulkReprocessMutation.mutate({ 
      imageIds: selectedImages, 
      templateId: reprocessTemplateId,
      quality: "standard"
    });
  };

  return (
    <div className="space-y-6" data-testid="page-gallery">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Media Gallery</h1>
          <p className="text-muted-foreground">View and manage all your processed images</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleViewToggle}
            data-testid="button-toggle-view"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <GridIcon className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Link to="/upload" data-testid="link-new-project">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="flex gap-4 items-center p-4 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Images</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-template">
              <SelectValue placeholder="Filter by template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {uniqueTemplates.map(template => (
                <SelectItem key={template} value={template}>{template}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-images"
          />
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading images...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredImages.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground mb-4">
            {allImages.length === 0 
              ? "Start by uploading and processing some images" 
              : "No images match your current filters"}
          </p>
          <Link to="/upload">
            <Button data-testid="button-create-project">
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </Link>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && filteredImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="view-grid">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group relative overflow-hidden hover-elevate" data-testid={`card-image-${image.id}`}>
              {/* Checkbox overlay */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleImageSelection(image.id);
                }}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  selectedImages.includes(image.id)
                    ? 'bg-primary border-primary'
                    : 'bg-background/80 border-muted-foreground hover:border-primary'
                }`}>
                  {selectedImages.includes(image.id) && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              </div>
              <div className="aspect-square relative">
                <img
                  src={image.processedUrl || image.originalUrl}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                  data-testid={`img-${image.id}`}
                />
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/60 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDownload(image)}
                    data-testid={`button-download-${image.id}`}
                    className="no-default-hover-elevate"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handlePreview(image)}
                    data-testid={`button-preview-${image.id}`}
                    className="no-default-hover-elevate"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleReEdit(image)}
                    data-testid={`button-reedit-${image.id}`}
                    className="no-default-hover-elevate"
                  >
                    <RefreshCw className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs truncate" data-testid={`text-name-${image.id}`}>{image.originalName}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span data-testid={`text-date-${image.id}`}>{formatDate(image.jobCreatedAt)}</span>
                  <Badge 
                    variant={image.status === 'completed' ? 'outline' : 'default'}
                    data-testid={`badge-status-${image.id}`}
                  >
                    {image.status || image.jobStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && filteredImages.length > 0 && (
        <Card data-testid="view-list">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImages.map((image) => (
                <TableRow key={image.id} data-testid={`row-image-${image.id}`}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden">
                      <img
                        src={image.processedUrl || image.originalUrl}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{image.originalName}</TableCell>
                  <TableCell>{image.templateName}</TableCell>
                  <TableCell>
                    <Badge variant={image.status === 'completed' ? 'outline' : 'default'}>
                      {image.status || image.jobStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(image.jobCreatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDownload(image)}
                        data-testid={`button-list-download-${image.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePreview(image)}
                        data-testid={`button-list-preview-${image.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleReEdit(image)}
                        data-testid={`button-list-reedit-${image.id}`}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Bulk Action Toolbar */}
      {selectedImages.length > 0 && (
        <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="text-sm font-medium">
              {selectedImages.length} images selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBulkDownload}
                disabled={bulkDownloadMutation.isPending}
                data-testid="button-bulk-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as ZIP
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkReprocessDialogOpen(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reprocess
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                data-testid="button-bulk-delete"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="ghost"
                onClick={clearSelection}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl" data-testid="dialog-preview">
          <DialogHeader>
            <DialogTitle>{previewImage?.originalName}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              <ImageComparisonSlider
                beforeImage={previewImage.originalUrl}
                afterImage={previewImage.processedUrl || previewImage.originalUrl}
                beforeLabel="Original"
                afterLabel="Processed"
              />
              <div className="flex gap-2 text-sm text-muted-foreground">
                <div>Template: <span className="font-medium">{previewImage.templateName}</span></div>
                <div>•</div>
                <div>Date: <span className="font-medium">{formatDate(previewImage.jobCreatedAt)}</span></div>
                <div>•</div>
                <div>Status: <Badge variant={previewImage.status === 'completed' ? 'outline' : 'default'}>{previewImage.status || previewImage.jobStatus}</Badge></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => previewImage && handleReEdit(previewImage)}
              data-testid="button-preview-reedit"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-edit
            </Button>
            <Button
              onClick={() => previewImage && handleDownload(previewImage)}
              data-testid="button-preview-download"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reprocess Dialog */}
      <Dialog open={bulkReprocessDialogOpen} onOpenChange={setBulkReprocessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprocess {selectedImages.length} Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a new template to apply to selected images
            </p>
            <Select value={reprocessTemplateId} onValueChange={setReprocessTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkReprocessDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkReprocess}
                disabled={!reprocessTemplateId || bulkReprocessMutation.isPending}
              >
                {bulkReprocessMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reprocess
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
