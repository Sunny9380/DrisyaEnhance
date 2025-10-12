import { useState, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UploadDropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
}

export default function UploadDropzone({
  onFilesSelected,
  acceptedTypes = [".jpg", ".jpeg", ".png", ".zip"],
  maxFiles = 1000,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
      onFilesSelected?.(droppedFiles);
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      setFiles(selectedFiles);
      onFilesSelected?.(selectedFiles);
    },
    [onFilesSelected]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="w-full" data-testid="component-upload-dropzone">
      <div
        className={`min-h-[400px] border-2 border-dashed rounded-lg transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover-elevate"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Support for JPG, PNG, and ZIP files (up to {maxFiles} images)
            </p>
            <div className="flex gap-2 mb-4">
              {acceptedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="uppercase">
                  {type.replace(".", "")}
                </Badge>
              ))}
            </div>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              data-testid="input-file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild data-testid="button-browse-files">
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                data-testid="button-clear-files"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => removeFile(index)}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
