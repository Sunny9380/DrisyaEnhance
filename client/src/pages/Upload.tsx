import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import UploadDropzone from "@/components/UploadDropzone";
import TemplateGallery from "@/components/TemplateGallery";
import BatchEditPanel from "@/components/BatchEditPanel";
import { TemplatePreview } from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  Info, 
  Coins, 
  Sparkles, 
  FileArchive, 
  Zap, 
  Crown, 
  Gem, 
  ExternalLink, 
  Loader2,
  ChevronDown,
  Upload as UploadIcon,
  Palette,
  Wand2,
  Play,
  X,
  Check,
  Image as ImageIcon,
  Archive
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { Template, AIEdit } from "@shared/schema";

// Helper function to format dates
function formatDate(dateString: string | Date) {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "MMM dd, yyyy");
  } catch {
    return String(dateString);
  }
}

// StatusBadge component
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "secondary" | "default" | "destructive" | "outline", label: string }> = {
    queued: { variant: "secondary", label: "Queued" },
    processing: { variant: "default", label: "Processing..." },
    completed: { variant: "outline", label: "Completed" },
    failed: { variant: "destructive", label: "Failed" },
  };
  
  const config = variants[status] || variants.queued;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function Upload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const zipInputRef = useRef<HTMLInputElement>(null);
  
  // Section collapse states
  const [uploadOpen, setUploadOpen] = useState(true);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [aiEnhancementOpen, setAiEnhancementOpen] = useState(false);
  const [processingOpen, setProcessingOpen] = useState(false);
  
  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<"standard" | "high" | "ultra">("standard");
  const [batchSettings, setBatchSettings] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
  });
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("auto");

  // Load selected template from localStorage
  useEffect(() => {
    const savedTemplateId = localStorage.getItem('selectedTemplateId');
    if (savedTemplateId) {
      setSelectedTemplateId(savedTemplateId);
    }
  }, []);

  // Auto-expand/collapse sections based on workflow progress
  useEffect(() => {
    if (files.length > 0) {
      setUploadOpen(false);
      setTemplateOpen(true);
    }
    
    if (files.length > 0 && selectedTemplateId) {
      setTemplateOpen(false);
      setProcessingOpen(true);
    }
  }, [files.length, selectedTemplateId]);

  // Fetch current user
  const { data: userData } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
  });

  const user = userData?.user;

  // Fetch templates from database
  const { data: templatesData } = useQuery<{ templates: Template[] }>({
    queryKey: ["/api/templates"],
  });

  const templates = templatesData?.templates || [];
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Create preview URL for the first uploaded image
  const firstImagePreviewUrl = useMemo(() => {
    if (files.length === 0) return null;
    return URL.createObjectURL(files[0]);
  }, [files]);

  // Cleanup preview URL on unmount or when files change
  useEffect(() => {
    return () => {
      if (firstImagePreviewUrl) {
        URL.revokeObjectURL(firstImagePreviewUrl);
      }
    };
  }, [firstImagePreviewUrl]);

  // Memoize template style to prevent unnecessary re-renders
  const templateStyle = useMemo(() => {
    if (!selectedTemplate) return null;
    return {
      backgroundStyle: selectedTemplate.backgroundStyle || "gradient",
      gradientColors: (selectedTemplate.settings as any)?.gradientColors,
      lightingPreset: selectedTemplate.lightingPreset || "soft-glow",
    };
  }, [selectedTemplate]);

  // Store file preview URLs to prevent memory leaks
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  // Create and cleanup preview URLs when files change
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setFilePreviewUrls(urls);
    
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Fetch AI usage quota
  const { data: aiUsageData } = useQuery<{ used: number; limit: number }>({
    queryKey: ["/api/ai-usage"],
  });

  const quotaUsed = aiUsageData?.used || 0;
  const quotaLimit = aiUsageData?.limit || 1000;
  const quotaRemaining = quotaLimit - quotaUsed;

  // Fetch user's AI edits
  const { data: editsData, isLoading: editsLoading } = useQuery<{ edits: AIEdit[] }>({
    queryKey: ["/api/ai-edits"],
    enabled: !!user,
  });

  const edits = editsData?.edits?.slice(0, 10) || [];

  // Calculate coins based on quality tier
  const qualityMultiplier = {
    standard: 2,
    high: 3,
    ultra: 5,
  }[quality];
  
  const estimatedCoins = files.length * qualityMultiplier;

  // ZIP upload and extraction mutation
  const uploadZipMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("zip", file);
      
      const res = await fetch("/api/upload/zip", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      return await res.json();
    },
    onSuccess: async (data: { images: Array<{ name: string; url: string }> }) => {
      toast({
        title: "✅ ZIP extracted!",
        description: `Found ${data.images.length} images`,
      });
      
      // Convert image URLs to File objects
      const imageFiles = await Promise.all(
        data.images.map(async (img) => {
          const response = await fetch(img.url);
          const blob = await response.blob();
          return new File([blob], img.name, { type: blob.type });
        })
      );
      
      setFiles((prev) => [...prev, ...imageFiles]);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to extract ZIP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create processing job mutation
  const createJobMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ Processing started!",
        description: `Job created with ${files.length} images`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setFiles([]);
      localStorage.removeItem('selectedTemplateId');
      setLocation('/history');
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to create job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload single image to get URL for AI transform
  const uploadSingleImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("/api/upload/single", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      return await res.json();
    },
  });

  // AI edit mutation
  const aiEditMutation = useMutation({
    mutationFn: async ({ inputImageUrl, prompt, aiModel }: { inputImageUrl: string; prompt: string; aiModel: string }) => {
      const res = await apiRequest("POST", "/api/ai-edits", {
        inputImageUrl,
        prompt,
        aiModel,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ AI edit started!",
        description: "Your image is being transformed. Check history for results.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-edits"] });
      setAiPrompt("");
    },
    onError: (error: Error) => {
      if (error.message.includes("403")) {
        toast({
          title: "❌ Quota exceeded",
          description: "You've reached your monthly AI edit limit.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ AI edit failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const handleZipUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      uploadZipMutation.mutate(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a ZIP file",
        variant: "destructive",
      });
    }
    if (zipInputRef.current) {
      zipInputRef.current.value = '';
    }
  };

  const handleAIEdit = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please write a prompt describing how you want to transform the image",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    if (quotaRemaining <= 0) {
      toast({
        title: "❌ Quota exceeded",
        description: "You've reached your monthly AI edit limit.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, upload the image to get a URL
      const uploadResult = await uploadSingleImageMutation.mutateAsync(files[0]);
      
      // Then trigger the AI edit with the uploaded image URL
      aiEditMutation.mutate({
        inputImageUrl: uploadResult.imageUrl,
        prompt: aiPrompt,
        aiModel: aiModel,
      });
    } catch (error: any) {
      toast({
        title: "❌ Upload failed",
        description: error.message || "Failed to upload image for AI transform",
        variant: "destructive",
      });
    }
  };

  const handleCloneEdit = (edit: AIEdit) => {
    setAiPrompt(edit.prompt);
    setAiModel(edit.aiModel);
    toast({
      title: "Prompt Loaded",
      description: `Reusing: "${edit.prompt}"`,
    });
    setAiEnhancementOpen(true);
    setTimeout(() => {
      document.querySelector('[data-testid="input-ai-prompt"]')?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleStartProcessing = async () => {
    if (!selectedTemplateId) {
      toast({
        title: "No template selected",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("templateId", selectedTemplateId);
    formData.append("batchSettings", JSON.stringify({ ...batchSettings, quality }));
    
    files.forEach((file) => {
      formData.append("images", file);
    });

    createJobMutation.mutate(formData);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    localStorage.setItem('selectedTemplateId', templateId);
  };

  // Calculate estimated processing time (rough estimate: 5 seconds per image)
  const estimatedTimeMinutes = Math.ceil((files.length * 5) / 60);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" data-testid="page-upload">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Studio</h1>
          <p className="text-muted-foreground">
            Transform your jewelry photos into professional product images
          </p>
        </div>
        <Link to="/history" data-testid="link-view-history">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View History
          </Button>
        </Link>
      </div>

      {/* Section 1: Upload & Images */}
      <Collapsible open={uploadOpen} onOpenChange={setUploadOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                  1
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="w-5 h-5" />
                    Upload Images
                  </CardTitle>
                  <CardDescription>
                    {files.length > 0 
                      ? `${files.length} image${files.length !== 1 ? 's' : ''} ready to process`
                      : 'Drag & drop your images or click to browse'
                    }
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {files.length > 0 && (
                  <Badge variant="secondary" className="gap-1" data-testid="badge-file-count">
                    <Check className="w-3 h-3" />
                    {files.length} files
                  </Badge>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-toggle-upload-section">
                    <ChevronDown className={`w-4 h-4 transition-transform ${uploadOpen ? '' : 'rotate-180'}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-muted-foreground">
                  Supports single images or ZIP files (up to 1000 images)
                </p>
                <div className="flex gap-2">
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleZipUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => zipInputRef.current?.click()}
                    disabled={uploadZipMutation.isPending}
                    data-testid="button-upload-zip"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    {uploadZipMutation.isPending ? "Extracting..." : "Upload ZIP"}
                  </Button>
                </div>
              </div>
              
              <UploadDropzone
                onFilesSelected={(selectedFiles) => {
                  setFiles(selectedFiles);
                }}
              />

              {files.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Uploaded Files</h4>
                      <Badge variant="outline" data-testid="badge-estimated-time">
                        <Zap className="w-3 h-3 mr-1" />
                        ~{estimatedTimeMinutes} min processing time
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square bg-muted rounded-lg overflow-hidden border"
                          data-testid={`file-item-${index}`}
                        >
                          <img
                            src={filePreviewUrls[index]}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveFile(index)}
                              data-testid={`button-remove-file-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-xs text-white truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Section 2: Choose Template & Style */}
      <Collapsible 
        open={templateOpen} 
        onOpenChange={setTemplateOpen}
        disabled={files.length === 0}
      >
        <Card className={files.length === 0 ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                  files.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Choose Template & Style
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate 
                      ? `Using "${selectedTemplate.name}" template`
                      : 'Select a template for your images'
                    }
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTemplateId && (
                  <Badge variant="secondary" className="gap-1" data-testid="badge-template-selected">
                    <Check className="w-3 h-3" />
                    Template selected
                  </Badge>
                )}
                <CollapsibleTrigger asChild disabled={files.length === 0}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={files.length === 0}
                    data-testid="button-toggle-template-section"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${templateOpen ? '' : 'rotate-180'}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {files.length === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Please upload images first to select a template
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <TemplateGallery
                    templates={templates}
                    selectedTemplateId={selectedTemplateId}
                    onTemplateSelect={handleTemplateSelect}
                  />

                  {/* Template Preview */}
                  {files.length > 0 && selectedTemplate && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TemplatePreview
                          imageUrl={firstImagePreviewUrl}
                          templateStyle={templateStyle}
                        />
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Preview Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Template:</span>
                                <span className="font-medium">{selectedTemplate.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Background:</span>
                                <span className="font-medium capitalize">{selectedTemplate.backgroundStyle}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Lighting:</span>
                                <span className="font-medium capitalize">{selectedTemplate.lightingPreset?.replace('-', ' ')}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Preview Image:</span>
                                <span className="font-medium">{files[0].name}</span>
                              </div>
                            </div>
                          </div>
                          <Alert>
                            <Info className="w-4 h-4" />
                            <AlertDescription>
                              This is an instant client-side preview. Actual processed images may have enhanced quality and additional effects applied.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTemplate && (
                    <>
                      <Separator />
                      
                      {/* Quality Selector */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-semibold">Image Quality</Label>
                          <p className="text-sm text-muted-foreground">
                            Choose the quality level for your processed images
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card 
                            className={`p-4 cursor-pointer hover-elevate ${quality === "standard" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setQuality("standard")}
                            data-testid="quality-standard"
                          >
                            <div className="flex items-start gap-3">
                              <Zap className={`w-5 h-5 ${quality === "standard" ? "text-primary" : "text-muted-foreground"}`} />
                              <div className="flex-1">
                                <h3 className="font-semibold">Standard</h3>
                                <p className="text-sm text-muted-foreground mt-1">Good quality for web use</p>
                                <Badge variant="secondary" className="mt-2">
                                  <Coins className="w-3 h-3 mr-1" />
                                  2 coins/image
                                </Badge>
                              </div>
                            </div>
                          </Card>

                          <Card 
                            className={`p-4 cursor-pointer hover-elevate ${quality === "high" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setQuality("high")}
                            data-testid="quality-high"
                          >
                            <div className="flex items-start gap-3">
                              <Crown className={`w-5 h-5 ${quality === "high" ? "text-primary" : "text-muted-foreground"}`} />
                              <div className="flex-1">
                                <h3 className="font-semibold">High</h3>
                                <p className="text-sm text-muted-foreground mt-1">Better backgrounds & sharpness</p>
                                <Badge variant="secondary" className="mt-2">
                                  <Coins className="w-3 h-3 mr-1" />
                                  3 coins/image
                                </Badge>
                              </div>
                            </div>
                          </Card>

                          <Card 
                            className={`p-4 cursor-pointer hover-elevate ${quality === "ultra" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setQuality("ultra")}
                            data-testid="quality-ultra"
                          >
                            <div className="flex items-start gap-3">
                              <Gem className={`w-5 h-5 ${quality === "ultra" ? "text-primary" : "text-muted-foreground"}`} />
                              <div className="flex-1">
                                <h3 className="font-semibold">Ultra</h3>
                                <p className="text-sm text-muted-foreground mt-1">Best quality, 4K output</p>
                                <Badge variant="secondary" className="mt-2">
                                  <Coins className="w-3 h-3 mr-1" />
                                  5 coins/image
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Section 3: AI Enhancement (Optional) */}
      <Collapsible open={aiEnhancementOpen} onOpenChange={setAiEnhancementOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold">
                  3
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    AI Enhancement (Optional)
                  </CardTitle>
                  <CardDescription>
                    Advanced AI transformations for your images
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Optional</Badge>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-toggle-ai-section">
                    <ChevronDown className={`w-4 h-4 transition-transform ${aiEnhancementOpen ? '' : 'rotate-180'}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* AI Editing Panel */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Image Editing (Beta)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Write a prompt to transform your images with AI
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Transformation Prompt</Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder="Examples:
- Change background to luxury marble with gold accents
- Make it look like professional jewelry photography
- Add sunset lighting and beach background"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      data-testid="input-ai-prompt"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select value={aiModel} onValueChange={setAiModel}>
                      <SelectTrigger id="ai-model" data-testid="select-ai-model">
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Best for your image)</SelectItem>
                        <SelectItem value="qwen-2509">Qwen Edit (E-commerce)</SelectItem>
                        <SelectItem value="flux-kontext">FLUX Kontext (Creative)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI Edit Quota</span>
                      <span className="font-mono font-semibold">
                        {quotaRemaining} of {quotaLimit} remaining
                      </span>
                    </div>
                    <Progress value={(quotaUsed / quotaLimit) * 100} />
                    <p className="text-xs text-muted-foreground">
                      {quotaRemaining} free AI edits remaining this month
                    </p>
                  </div>

                  <Button
                    onClick={handleAIEdit}
                    disabled={!aiPrompt.trim() || aiEditMutation.isPending || quotaRemaining <= 0}
                    data-testid="button-ai-edit"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {aiEditMutation.isPending ? "Transforming..." : "Transform with AI"}
                  </Button>
                </div>
              )}

              {/* AI Edit History */}
              {user && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Your AI Edit History</h3>
                      <p className="text-sm text-muted-foreground">
                        Recent AI transformations - click to reuse
                      </p>
                    </div>
                    
                    {editsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : edits?.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        No AI edits yet. Try transforming an image above!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {edits?.map((edit) => (
                          <div
                            key={edit.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover-elevate cursor-pointer"
                            onClick={() => handleCloneEdit(edit)}
                            data-testid={`ai-edit-history-item-${edit.id}`}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{edit.prompt}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Badge variant="outline">{edit.aiModel}</Badge>
                                <span>{formatDate(edit.createdAt)}</span>
                                <StatusBadge status={edit.status} />
                              </div>
                            </div>
                            {edit.status === "completed" && edit.outputImageUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (edit.outputImageUrl) {
                                    window.open(edit.outputImageUrl, "_blank");
                                  }
                                }}
                                data-testid={`button-view-result-${edit.id}`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Section 4: Processing & Results */}
      <Collapsible 
        open={processingOpen} 
        onOpenChange={setProcessingOpen}
        disabled={files.length === 0 || !selectedTemplateId}
      >
        <Card className={files.length === 0 || !selectedTemplateId ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                  files.length > 0 && selectedTemplateId ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  4
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Process & Download
                  </CardTitle>
                  <CardDescription>
                    Review settings and start processing
                  </CardDescription>
                </div>
              </div>
              <CollapsibleTrigger asChild disabled={files.length === 0 || !selectedTemplateId}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={files.length === 0 || !selectedTemplateId}
                  data-testid="button-toggle-processing-section"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${processingOpen ? '' : 'rotate-180'}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {files.length === 0 || !selectedTemplateId ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    {files.length === 0 
                      ? "Please upload images first"
                      : "Please select a template first"
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                      <span>
                        Processing <span className="font-mono font-semibold">{files.length}</span> images at{" "}
                        <span className="font-semibold capitalize">{quality}</span> quality will cost{" "}
                        <span className="font-mono font-semibold">{estimatedCoins}</span> coins
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        <Coins className="w-3 h-3 mr-1" />
                        {qualityMultiplier} coins/image
                      </Badge>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold">Ready to Process</h3>
                      <div className="flex gap-4">
                        <Button
                          size="lg"
                          className="flex-1"
                          onClick={handleStartProcessing}
                          disabled={createJobMutation.isPending}
                          data-testid="button-start-processing"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {createJobMutation.isPending ? "Creating Job..." : "Process All Images"}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setFiles([])}
                          data-testid="button-cancel-upload"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                    <div>
                      <BatchEditPanel
                        imageCount={files.length}
                        onApply={(settings) => setBatchSettings(settings)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
