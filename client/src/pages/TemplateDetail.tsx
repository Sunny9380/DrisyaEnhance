import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Check, 
  Star, 
  Crown,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Template } from "@shared/schema";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface UseCase {
  title: string;
  description: string;
  imageUrl?: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatarUrl?: string;
  rating: number;
}

export default function TemplateDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: templateData, isLoading } = useQuery<{ template: Template }>({
    queryKey: ["/api/templates", id],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const template = templateData?.template;

  const handleSelectTemplate = () => {
    if (template) {
      localStorage.setItem('selectedTemplateId', template.id);
      setLocation('/upload');
    }
  };

  const getIconComponent = (iconName: string): LucideIcon => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Sparkles;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
        <Button onClick={() => setLocation('/templates')} data-testid="button-back-templates">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }

  const features = (template.features as Feature[]) || [];
  const benefits = (template.benefits as string[]) || [];
  const useCases = (template.useCases as UseCase[]) || [];
  const testimonials = (template.testimonials as Testimonial[]) || [];

  return (
    <div className="min-h-screen pb-12" data-testid="page-template-detail">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/templates')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Template Preview */}
          <div className="relative">
            <Card className="overflow-hidden p-0">
              <div
                className="aspect-square flex items-center justify-center"
                style={{
                  background: template.settings?.gradientColors && (template.settings.gradientColors as string[]).length > 1
                    ? `linear-gradient(135deg, ${(template.settings.gradientColors as string[]).join(', ')})`
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
              >
                <div className="text-6xl opacity-20">
                  {template.isPremium ? <Crown /> : <Sparkles />}
                </div>
              </div>
            </Card>
            {template.isPremium && (
              <Badge className="absolute top-4 right-4 gap-1" data-testid="badge-premium">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            )}
          </div>

          {/* Template Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3" data-testid="badge-category">
                {template.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-3" data-testid="text-template-name">
                {template.name}
              </h1>
              <p className="text-muted-foreground text-lg" data-testid="text-template-description">
                {template.description || "Professional AI-powered background template"}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-4 py-4 border-y border-border">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" data-testid="text-coin-cost">
                    {template.coinCost || 1}
                  </span>
                  <span className="text-muted-foreground">coins per image</span>
                </div>
                {template.pricePerImage && (
                  <p className="text-sm text-muted-foreground mt-1" data-testid="text-price-per-image">
                    ₹{template.pricePerImage} equivalent
                  </p>
                )}
              </div>
            </div>

            {/* Why Buy */}
            {template.whyBuy && (
              <Card className="p-6 bg-muted/50">
                <p className="text-sm leading-relaxed" data-testid="text-why-buy">
                  {template.whyBuy}
                </p>
              </Card>
            )}

            {/* CTA */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleSelectTemplate}
              data-testid="button-select-template"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Select This Template
            </Button>

            {/* Template Specs */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Background Style</p>
                <p className="font-semibold capitalize" data-testid="text-background-style">
                  {template.backgroundStyle}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lighting Preset</p>
                <p className="font-semibold capitalize" data-testid="text-lighting-preset">
                  {template.lightingPreset?.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-7xl mx-auto" />

      {/* Features Section */}
      {features.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced capabilities designed to elevate your product photography
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <Card key={index} className="p-6 hover-elevate" data-testid={`feature-card-${index}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2" data-testid={`feature-title-${index}`}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`feature-description-${index}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <>
          <Separator className="max-w-7xl mx-auto" />
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Key Benefits</h2>
              <p className="text-muted-foreground">
                Why professionals choose this template
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                  data-testid={`benefit-${index}`}
                >
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="flex-1 text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Use Cases Section */}
      {useCases.length > 0 && (
        <>
          <Separator className="max-w-7xl mx-auto" />
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Perfect For</h2>
              <p className="text-muted-foreground">
                Ideal use cases for this template
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <Card key={index} className="overflow-hidden hover-elevate" data-testid={`use-case-card-${index}`}>
                  {useCase.imageUrl && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={useCase.imageUrl}
                        alt={useCase.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold mb-2" data-testid={`use-case-title-${index}`}>
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`use-case-description-${index}`}>
                      {useCase.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <>
          <Separator className="max-w-7xl mx-auto" />
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">What Users Say</h2>
              <p className="text-muted-foreground">
                Trusted by professionals worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6" data-testid={`testimonial-card-${index}`}>
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" data-testid={`testimonial-content-${index}`}>
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm" data-testid={`testimonial-name-${index}`}>
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`testimonial-role-${index}`}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <Card className="p-12 text-center bg-muted/50">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Transform your product images with this professional template
          </p>
          <Button
            size="lg"
            onClick={handleSelectTemplate}
            data-testid="button-select-template-bottom"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Select This Template
          </Button>
        </Card>
      </section>
    </div>
  );
}
