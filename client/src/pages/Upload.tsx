import { useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import TemplateCard from "@/components/TemplateCard";
import BatchEditPanel from "@/components/BatchEditPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Coins } from "lucide-react";

export default function Upload() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("1");
  const [files, setFiles] = useState<File[]>([]);

  const mockTemplates = [
    { id: "1", name: "Premium Dark Fabric", category: "Elegant" },
    { id: "2", name: "White Studio", category: "Studio" },
    { id: "3", name: "Blue Gradient", category: "Minimal" },
    { id: "4", name: "Rose Gold", category: "Elegant" },
  ];

  const estimatedCoins = files.length * 2;

  return (
    <div className="space-y-8" data-testid="page-upload">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload & Process</h1>
        <p className="text-muted-foreground">
          Select a template and upload your images for processing
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Step 1: Select Template</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              isSelected={selectedTemplate === template.id}
              onClick={() => setSelectedTemplate(template.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Step 2: Upload Images</h2>
        <UploadDropzone
          onFilesSelected={(selectedFiles) => {
            setFiles(selectedFiles);
            console.log("Files selected:", selectedFiles);
          }}
        />
      </div>

      {files.length > 0 && (
        <>
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Processing <span className="font-mono font-semibold">{files.length}</span> images will cost{" "}
                <span className="font-mono font-semibold">{estimatedCoins}</span> coins
              </span>
              <Badge variant="secondary" className="ml-2">
                <Coins className="w-3 h-3 mr-1" />
                2 coins/image
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
                  onClick={() => console.log("Start processing")}
                  data-testid="button-start-processing"
                >
                  Start Processing
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
                onApply={(settings) => console.log("Apply settings:", settings)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
