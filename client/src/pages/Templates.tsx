import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Crown, Sparkles, Palette, Sun, Star, Info } from "lucide-react";
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
              className={`group cursor-pointer transition-all hover-elevate active-elevate-2 overflow-hidden ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectTemplate(template.id)}
              data-testid={`template-card-${template.id}`}
            >
              {/* Visual Preview */}
              <div className="relative h-48 flex items-center justify-center overflow-hidden">
                {template.thumbnailUrl ? (
                  // Display uploaded template image
                  <img
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Fallback to gradient background
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: template.settings?.gradientColors && template.settings.gradientColors.length > 1
                          ? `linear-gradient(135deg, ${template.settings.gradientColors.join(', ')})`
                          : template.backgroundStyle === 'velvet' 
                            ? 'linear-gradient(135deg, #1a0a1f 0%, #3d1f4d 100%)'
                            : template.backgroundStyle === 'marble'
                              ? 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 50%, #d0d0d0 100%)'
                              : template.backgroundStyle === 'minimal'
                                ? '#ffffff'
                                : template.backgroundStyle === 'festive'
                                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)'
                                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    />
                    {/* Lighting Effect Overlay */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: template.lightingPreset === 'moody'
                          ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)'
                          : template.lightingPreset === 'soft-glow'
                            ? 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)'
                            : template.lightingPreset === 'spotlight'
                              ? 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)'
                              : 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)',
                      }}
                    />
                    
                    {/* Product Placeholder */}
                    <div className="relative z-10 w-32 h-32 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                      <Sparkles className="h-12 w-12 text-white/80" />
                    </div>
                  </>
                )}

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                    <Crown className="h-3 w-3" />
                    Premium
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      Selected
                    </div>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-4 space-y-3">
                {/* Header */}
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
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

                {/* Category & Actions */}
                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {template.category}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/template/${template.id}`);
                    }}
                    data-testid={`button-view-details-${template.id}`}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
