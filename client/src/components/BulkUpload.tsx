import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Upload, FileImage, Zap, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface BulkUploadProps {
  templates: Array<{
    id: string;
    name: string;
    description: string;
    coinCost: number;
  }>;
}

interface UploadProgress {
  jobId: string;
  status: string;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  progressPercentage: number;
  estimatedTimeRemaining: string;
  zipUrl?: string;
}

export default function BulkUpload({ templates }: BulkUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [quality, setQuality] = useState<string>('standard');
  const [enableBlurDetection, setEnableBlurDetection] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 10000) {
      setError('Maximum 10,000 images allowed per bulk upload');
      return;
    }
    setFiles(acceptedFiles);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff']
    },
    multiple: true,
    maxFiles: 10000
  });

  const handleBulkUpload = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (files.length === 0) {
      setError('Please select images to upload');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      formData.append('templateId', selectedTemplate);
      formData.append('quality', quality);
      formData.append('enableBlurDetection', enableBlurDetection.toString());
      
      if (customPrompt.trim()) {
        formData.append('enhancementPrompt', customPrompt.trim());
      }

      const response = await fetch('/api/jobs/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      // Start polling for progress
      const jobId = result.job.id;
      pollProgress(jobId);

    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  const pollProgress = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/bulk/${jobId}/progress`);
      const result = await response.json();

      if (response.ok) {
        setUploadProgress(result.progress);

        // Continue polling if not completed
        if (result.progress.status === 'processing' || result.progress.status === 'queued') {
          setTimeout(() => pollProgress(jobId), 2000); // Poll every 2 seconds
        } else {
          setIsUploading(false);
        }
      } else {
        throw new Error(result.message || 'Failed to get progress');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get progress');
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (uploadProgress?.zipUrl) {
      window.open(`/api/jobs/${uploadProgress.jobId}/download`, '_blank');
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const totalCost = selectedTemplateData ? files.length * selectedTemplateData.coinCost * (quality === 'high' ? 1.5 : quality === 'ultra' ? 2.5 : 1) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Bulk Image Upload & Enhancement
          </CardTitle>
          <CardDescription>
            Upload up to 10,000 images for AI-powered enhancement with blur detection and custom templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {files.length > 0 ? (
              <div>
                <p className="text-lg font-semibold">{files.length} images selected</p>
                <p className="text-sm text-gray-600">
                  {(files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB total
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images or click to browse'}
                </p>
                <p className="text-sm text-gray-600">
                  Supports JPG, PNG, WebP, GIF, BMP, TIFF (Max: 10,000 images)
                </p>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Enhancement Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select an enhancement template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{template.name}</span>
                      <span className="text-sm text-gray-500">{template.coinCost} coins/image</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Custom Enhancement Prompt (Optional)</Label>
            <Textarea
              id="prompt"
              placeholder="A dark, elegant matte blue velvet background with moody lighting..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Quality & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">Output Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (2x coins)</SelectItem>
                  <SelectItem value="high">High (3x coins)</SelectItem>
                  <SelectItem value="ultra">Ultra (5x coins)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="blur-detection"
                  checked={enableBlurDetection}
                  onCheckedChange={setEnableBlurDetection}
                />
                <Label htmlFor="blur-detection">Enable Blur Detection</Label>
              </div>
              <p className="text-sm text-gray-600">
                Automatically detect and enhance blurred images
              </p>
            </div>
          </div>

          {/* Cost Summary */}
          {selectedTemplateData && files.length > 0 && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(totalCost)} coins
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {files.length} images × {selectedTemplateData.coinCost} coins × {quality === 'high' ? '1.5' : quality === 'ultra' ? '2.5' : '1'} quality multiplier
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Processing Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{uploadProgress.progressPercentage}%</span>
                  </div>
                  <Progress value={uploadProgress.progressPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-semibold">{uploadProgress.totalImages}</div>
                  </div>
                  <div>
                    <span className="text-green-600">Completed:</span>
                    <div className="font-semibold text-green-600">{uploadProgress.completedImages}</div>
                  </div>
                  <div>
                    <span className="text-red-600">Failed:</span>
                    <div className="font-semibold text-red-600">{uploadProgress.failedImages}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">ETA:</span>
                    <div className="font-semibold">{uploadProgress.estimatedTimeRemaining}</div>
                  </div>
                </div>

                {uploadProgress.status === 'completed' && uploadProgress.zipUrl && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Processing completed! Your enhanced images are ready for download.</span>
                      <Button onClick={handleDownload} size="sm" className="ml-4">
                        <Download className="h-4 w-4 mr-2" />
                        Download ZIP
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleBulkUpload}
            disabled={isUploading || !selectedTemplate || files.length === 0}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Processing {files.length} images...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start Bulk Enhancement ({files.length} images)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
