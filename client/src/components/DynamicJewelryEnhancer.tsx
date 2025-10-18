import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Download, AlertCircle, CheckCircle, Loader2, Sparkles, Palette } from 'lucide-react';
import { formatRelativeTime, getCurrentTimestamp } from '@/utils/timeUtils';

interface BackgroundTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
}

interface ProcessingResult {
  success: boolean;
  outputUrl?: string;
  error?: string;
  processingTime?: number;
  cost?: number;
  jewelryName?: string;
  backgroundStyle?: string;
  prompt?: string;
  completedAt?: number; // Timestamp when processing completed
}

export default function DynamicJewelryEnhancer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [jewelryName, setJewelryName] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('Velvet Blue');
  const [backgrounds, setBackgrounds] = useState<BackgroundTemplate[]>([]);

  // Load available backgrounds on component mount
  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        const response = await fetch('/api/template-ai/backgrounds');
        const data = await response.json();
        if (data.success) {
          setBackgrounds(data.backgrounds);
        }
      } catch (error) {
        console.error('Failed to load backgrounds:', error);
      }
    };

    loadBackgrounds();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      
      // Auto-detect jewelry name from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const cleanName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      setJewelryName(cleanName);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processImage = async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('jewelryName', jewelryName || 'jewelry piece');
      formData.append('backgroundStyle', selectedBackground);
      formData.append('imageSize', '1080x1080');
      formData.append('quality', 'high');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 800);

      const response = await fetch('/api/template-ai/jewelry-enhance', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          outputUrl: data.outputUrl,
          processingTime: data.processingTime,
          cost: data.cost,
          jewelryName: data.jewelryName,
          backgroundStyle: data.backgroundStyle,
          prompt: data.prompt,
          completedAt: getCurrentTimestamp()
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Processing failed'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Network error occurred'
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.outputUrl) {
      const link = document.createElement('a');
      link.href = result.outputUrl;
      link.download = `${(jewelryName || 'jewelry').toLowerCase().replace(/\s+/g, '-')}-${(selectedBackground || 'enhanced').toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setPreviewUrl('');
    setResult(null);
    setProgress(0);
    setJewelryName('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const selectedBg = backgrounds.find(bg => bg.name === selectedBackground);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Dynamic Jewelry Enhancement
        </h2>
        <p className="text-muted-foreground">
          Upload your jewelry image and choose from 12+ professional backgrounds
        </p>
      </div>

      {/* Configuration Panel */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="jewelry-name" className="text-sm font-medium">
              Jewelry Description
            </Label>
            <Input
              id="jewelry-name"
              placeholder="e.g., Gold Diamond Spiral Earrings"
              value={jewelryName}
              onChange={(e) => setJewelryName(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describe your jewelry for better AI results
            </p>
          </div>
          
          <div>
            <Label htmlFor="background-select" className="text-sm font-medium">
              Background Style
            </Label>
            <Select value={selectedBackground} onValueChange={setSelectedBackground}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select background style" />
              </SelectTrigger>
              <SelectContent>
                {backgrounds.map((bg) => (
                  <SelectItem key={bg.id} value={bg.name}>
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4" />
                      <span>{bg.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBg && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedBg.description}
              </p>
            )}
          </div>
        </div>

        {/* Background Preview */}
        {selectedBg && (
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{selectedBg.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  ${selectedBg.cost.toFixed(2)} per image
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                1080×1080px • Ultra-realistic quality
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <div
            {...getRootProps()}
            className={`p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-muted/50' : 'hover:bg-muted/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? 'Drop your jewelry image here' : 'Upload Jewelry Image'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop or click to select your jewelry photo
            </p>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG, WebP • Max 10MB • Best results with clear, well-lit jewelry
            </p>
          </div>
        </Card>
      )}

      {/* Preview and Processing */}
      {uploadedFile && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview & Enhancement</h3>
              <Button variant="outline" size="sm" onClick={reset}>
                Upload Different Image
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Original Image */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Image className="w-4 h-4 mr-2" />
                  Original Image
                </h4>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>

              {/* Enhanced Image */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhanced with {selectedBackground}
                </h4>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                  {processing ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3 text-primary" />
                      <p className="text-sm font-medium">Processing with OpenAI DALL-E 3</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applying {selectedBackground} background...
                      </p>
                    </div>
                  ) : result?.success && result.outputUrl ? (
                    <img
                      src={result.outputUrl}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">Enhanced image will appear here</p>
                      <p className="text-xs mt-1">
                        {jewelryName || 'Your jewelry'} on {selectedBackground}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Progress Bar */}
          {processing && (
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Enhancing {jewelryName || 'jewelry'} with {selectedBackground}
                    </span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Using OpenAI DALL-E 3 • Estimated time: 15-30 seconds
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-red-200 bg-red-50 dark:bg-red-950"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Enhancement completed successfully! ✨
                    </p>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                      <p>• Jewelry: {result.jewelryName}</p>
                      <p>• Background: {result.backgroundStyle}</p>
                      <p>• Completed: {result.completedAt ? formatRelativeTime(result.completedAt) : 'just now'}</p>
                      <p>• Cost: ${result.cost?.toFixed(2) || '0.04'}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Enhancement failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {result.error}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!processing && !result && (
              <Button onClick={processImage} className="flex-1" size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Enhance with {selectedBackground}
              </Button>
            )}
            
            {result?.success && (
              <>
                <Button onClick={downloadResult} className="flex-1" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download Enhanced Image
                </Button>
                <Button variant="outline" onClick={reset} size="lg">
                  Process Another Image
                </Button>
              </>
            )}

            {result?.success === false && (
              <Button onClick={processImage} variant="outline" className="flex-1" size="lg">
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Available Backgrounds Grid */}
      {backgrounds.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Background Styles</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedBackground === bg.name 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => setSelectedBackground(bg.name)}
              >
                <div className="text-sm font-medium mb-1">{bg.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {bg.description}
                </div>
                <div className="text-xs text-primary mt-1">
                  ${bg.cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
