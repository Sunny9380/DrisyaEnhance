import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Crown, Sparkles, Palette, Sun, Star } from "lucide-react";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [styleFilter, setStyleFilter] = useState<string>("all");

  // Load previously selected template from localStorage
  useEffect(() => {
    const savedTemplateId = localStorage.getItem('selectedTemplateId');
    if (savedTemplateId) {
      setSelectedTemplate(savedTemplateId);
    }
  }, []);

  // Handle template selection (save immediately)
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    localStorage.setItem('selectedTemplateId', templateId);
  };

  // Handle navigation to upload page
  const handleUseTemplate = () => {
    if (selectedTemplate) {
      setLocation('/upload');
    }
  };

  // Fetch templates from API
  const { data: templates, isLoading } = useQuery<{ templates: Template[] }>({
    queryKey: ["/api/templates"],
  });

  const templateList = templates?.templates || [];

  // Filter templates by background style
  const filteredTemplates = styleFilter === "all" 
    ? templateList 
    : templateList.filter(t => t.backgroundStyle === styleFilter);

  // Get unique background styles for filters
  const backgroundStyles = Array.from(new Set(templateList.map(t => t.backgroundStyle)));

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'velvet': return <Sparkles className="h-4 w-4" />;
      case 'marble': return <Crown className="h-4 w-4" />;
      case 'gradient': return <Palette className="h-4 w-4" />;
      case 'festive': return <Star className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const getLightingBadge = (preset: string) => {
    const colors = {
      'moody': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'soft-glow': 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      'spotlight': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'studio': 'bg-green-500/20 text-green-700 dark:text-green-300',
    };
    return colors[preset as keyof typeof colors] || 'bg-gray-500/20';
  };

  return (
    <div className="space-y-6" data-testid="page-templates">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Premium Template Gallery</h1>
          <p className="text-muted-foreground">
            {filteredTemplates.length} professional AI-powered backgrounds with advanced lighting
          </p>
        </div>
        {selectedTemplate && (
          <Button 
            size="lg" 
            onClick={handleUseTemplate}
            data-testid="button-use-template"
          >
            Use Template
          </Button>
        )}
      </div>

      {/* Style Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={styleFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStyleFilter("all")}
          data-testid="filter-all"
        >
          All Styles
        </Button>
        {backgroundStyles.map(style => (
          <Button
            key={style}
            variant={styleFilter === style ? "default" : "outline"}
            size="sm"
            onClick={() => setStyleFilter(style)}
            data-testid={`filter-${style}`}
            className="gap-2"
          >
            {getStyleIcon(style)}
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`group cursor-pointer transition-all hover-elevate active-elevate-2 ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectTemplate(template.id)}
              data-testid={`template-card-${template.id}`}
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  {template.isPremium && (
                    <Crown className="h-5 w-5 text-amber-500" data-testid="icon-premium" />
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    {getStyleIcon(template.backgroundStyle || 'minimal')}
                    {template.backgroundStyle}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={getLightingBadge(template.lightingPreset || 'soft-glow')}
                  >
                    {template.lightingPreset}
                  </Badge>
                </div>

                {/* Preview Colors (if gradient) */}
                {template.settings?.gradientColors && (
                  <div className="flex gap-2 mt-2">
                    {template.settings.gradientColors.slice(0, 3).map((color: string, idx: number) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                {/* Category */}
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {template.category}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
