import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import UploadDropzone from "@/components/UploadDropzone";
import BatchEditPanel from "@/components/BatchEditPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Info, Coins, Sparkles, FileArchive, Zap, Crown, Gem, ExternalLink, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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

  // AI edit mutation
  const aiEditMutation = useMutation({
    mutationFn: async ({ imageId, prompt, aiModel }: { imageId: string; prompt: string; aiModel: string }) => {
      const res = await apiRequest("POST", "/api/ai-edits", {
        imageId,
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

    // For now, use the first file. In a full implementation, 
    // we would upload the file first to get an imageId
    // TODO: Implement file upload to get imageId before calling AI edit
    const placeholderImageId = "temp-" + Date.now();
    
    aiEditMutation.mutate({
      imageId: placeholderImageId,
      prompt: aiPrompt,
      aiModel: aiModel,
    });
  };

  const handleCloneEdit = (edit: AIEdit) => {
    setAiPrompt(edit.prompt);
    setAiModel(edit.aiModel);
    toast({
      title: "Prompt Loaded",
      description: `Reusing: "${edit.prompt}"`,
    });
    // Scroll to AI editing panel
    document.querySelector('[data-testid="input-ai-prompt"]')?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="space-y-8" data-testid="page-upload">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload & Process</h1>
        <p className="text-muted-foreground">
          Upload your images for AI-powered background enhancement
        </p>
      </div>

      {/* Selected Template Display */}
      {selectedTemplate && (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{selectedTemplate.name}</h3>
                {selectedTemplate.isPremium && (
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant="outline">{selectedTemplate.backgroundStyle}</Badge>
                <Badge variant="outline">{selectedTemplate.lightingPreset}</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/templates')}
              data-testid="button-change-template"
            >
              Change Template
            </Button>
          </div>
        </Card>
      )}

      {!selectedTemplate && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            No template selected. Please{" "}
            <Button
              variant="ghost"
              className="p-0 h-auto underline"
              onClick={() => setLocation('/templates')}
              data-testid="link-select-template"
            >
              select a template
            </Button>{" "}
            first.
          </AlertDescription>
        </Alert>
      )}

      {/* Quality Selector */}
      {selectedTemplate && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Image Quality</Label>
              <p className="text-sm text-muted-foreground">
                Choose the quality level for your processed images
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`p-4 cursor-pointer hover-elevate ${quality === "standard" ? "border-primary" : ""}`}
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
                className={`p-4 cursor-pointer hover-elevate ${quality === "high" ? "border-primary" : ""}`}
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
                className={`p-4 cursor-pointer hover-elevate ${quality === "ultra" ? "border-primary" : ""}`}
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
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload Images</h2>
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
              <FileArchive className="w-4 h-4 mr-2" />
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
          <Badge variant="secondary" className="mt-2">
            {files.length} image{files.length !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </div>

      {/* AI Editing Panel */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">AI Image Editing (Beta)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Write a prompt to transform your images with AI
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      )}

      {/* AI Edit History Panel */}
      {user && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your AI Edit History</h3>
            <p className="text-sm text-muted-foreground">
              Recent AI transformations - click to reuse
            </p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {files.length > 0 && selectedTemplate && (
        <>
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
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
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Ready to Process</h2>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleStartProcessing}
                  disabled={createJobMutation.isPending}
                  data-testid="button-start-processing"
                >
                  {createJobMutation.isPending ? "Creating Job..." : "Start Processing"}
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
    </div>
  );
}
