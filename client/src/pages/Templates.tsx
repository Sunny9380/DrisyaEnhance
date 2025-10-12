import { useState } from "react";
import TemplateGallery from "@/components/TemplateGallery";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  const mockTemplates = [
    { id: "1", name: "Premium Dark Fabric", category: "Elegant" },
    { id: "2", name: "White Studio", category: "Studio" },
    { id: "3", name: "Blue Gradient", category: "Minimal" },
    { id: "4", name: "Wooden Table", category: "Natural" },
    { id: "5", name: "Pink Pastel", category: "Colorful" },
    { id: "6", name: "Black Premium", category: "Elegant" },
    { id: "7", name: "Gray Concrete", category: "Industrial" },
    { id: "8", name: "Green Nature", category: "Natural" },
    { id: "9", name: "Purple Vibrant", category: "Colorful" },
    { id: "10", name: "Marble Surface", category: "Elegant" },
    { id: "11", name: "Sunset Gradient", category: "Colorful" },
    { id: "12", name: "Clean White", category: "Minimal" },
    { id: "13", name: "Dark Wood", category: "Natural" },
    { id: "14", name: "Ocean Blue", category: "Colorful" },
    { id: "15", name: "Sand Texture", category: "Natural" },
    { id: "16", name: "Modern Gray", category: "Minimal" },
    { id: "17", name: "Rose Gold", category: "Elegant" },
    { id: "18", name: "Forest Green", category: "Natural" },
    { id: "19", name: "Sky Blue", category: "Minimal" },
  ];

  return (
    <div className="space-y-6" data-testid="page-templates">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Template Gallery</h1>
          <p className="text-muted-foreground">
            Choose from {mockTemplates.length} professional backgrounds
          </p>
        </div>
        {selectedTemplate && (
          <Link href="/upload">
            <Button size="lg" data-testid="button-use-template">
              Use Template
            </Button>
          </Link>
        )}
      </div>

      <TemplateGallery
        templates={mockTemplates}
        selectedTemplateId={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
      />
    </div>
  );
}
