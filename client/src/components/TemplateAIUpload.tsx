import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { formatRelativeTime, getCurrentTimestamp } from '@/utils/timeUtils';

interface TemplateAIUploadProps {
  templateId: string;
  templateName: string;
  onClose?: () => void;
}

interface ProcessingResult {
  success: boolean;
  outputUrl?: string;
  error?: string;
  processingTime?: number;
  cost?: number;
  completedAt?: number;
}

export default function TemplateAIUpload({ templateId, templateName, onClose }: TemplateAIUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Determine endpoint based on template
      let endpoint = '/api/template-ai/enhance';
      if (templateId === 'dark-blue-velvet' || templateName === 'Dark Blue Velvet Luxury') {
        endpoint = '/api/template-ai/dark-blue-velvet';
      } else {
        formData.append('templateName', templateName);
      }

      const response = await fetch(endpoint, {
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
      link.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-enhanced.png`;
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{templateName}</h2>
        <p className="text-muted-foreground">
          Upload your jewelry image to apply the template background and lighting
        </p>
      </div>

      {/* Template Description */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Image className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Template Features</h3>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
              {templateId === 'dark-blue-velvet' || templateName === 'Dark Blue Velvet Luxury' 
                ? "Dark elegant matte blue velvet background with moody cinematic lighting, criss-cross windowpane shadows, and focused spotlight on product area."
                : "Professional background replacement with studio-quality lighting while preserving your jewelry's original design and colors."
              }
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600 dark:text-blue-300">
              <span>• Output: 1080×1080px</span>
              <span>• Cost: ~$0.04</span>
              <span>• Processing: 15-30s</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <div
            {...getRootProps()}
            className={`p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-muted/50' : 'hover:bg-muted/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your image here' : 'Upload Jewelry Image'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop or click to select your jewelry photo
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WebP • Max 10MB
            </p>
          </div>
        </Card>
      )}

      {/* Preview and Processing */}
      {uploadedFile && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Preview</h3>
              <Button variant="outline" size="sm" onClick={reset}>
                Upload Different Image
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Original Image */}
              <div>
                <h4 className="text-sm font-medium mb-2">Original</h4>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Result Image */}
              <div>
                <h4 className="text-sm font-medium mb-2">Enhanced</h4>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {processing ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Processing...</p>
                    </div>
                  ) : result?.success && result.outputUrl ? (
                    <img
                      src={result.outputUrl}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Image className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Enhanced image will appear here</p>
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
                    <span className="text-sm font-medium">Processing with OpenAI DALL-E 3</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
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
                      Template applied successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Completed: {result.completedAt ? formatRelativeTime(result.completedAt) : 'just now'} • 
                      Cost: ${result.cost?.toFixed(2) || '0.04'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Processing failed
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
              <Button onClick={processImage} className="flex-1">
                <Image className="w-4 h-4 mr-2" />
                Apply {templateName}
              </Button>
            )}
            
            {result?.success && (
              <>
                <Button onClick={downloadResult} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Enhanced Image
                </Button>
                <Button variant="outline" onClick={reset}>
                  Process Another Image
                </Button>
              </>
            )}

            {result?.success === false && (
              <Button onClick={processImage} variant="outline" className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
