import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Hero3D from "@/components/3d/Hero3D";
import TemplateCards3D from "@/components/3d/TemplateCards3D";
import ProcessingAnimation3D from "@/components/3d/ProcessingAnimation3D";
import ImageCarousel3D from "@/components/3d/ImageCarousel3D";
import { Sparkles, Layers, Loader2, Images } from "lucide-react";

// Mock data for demo
const mockTemplates = [
  {
    id: "1",
    name: "Velvet Luxury",
    category: "premium",
    backgroundStyle: "velvet",
    lightingPreset: "moody",
    description: "Rich velvet background with moody lighting",
    thumbnailUrl: null,
    settings: {},
    isPremium: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Marble Elegance",
    category: "premium",
    backgroundStyle: "marble",
    lightingPreset: "soft-glow",
    description: "Elegant marble surface with soft glow",
    thumbnailUrl: null,
    settings: {},
    isPremium: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Modern Gradient",
    category: "standard",
    backgroundStyle: "gradient",
    lightingPreset: "studio",
    description: "Clean gradient with studio lighting",
    thumbnailUrl: null,
    settings: {},
    isPremium: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Minimal White",
    category: "standard",
    backgroundStyle: "minimal",
    lightingPreset: "spotlight",
    description: "Minimalist white background",
    thumbnailUrl: null,
    settings: {},
    isPremium: false,
    isActive: true,
    createdAt: new Date(),
  },
];

const mockImages = [
  {
    id: "1",
    url: "/api/placeholder/800/600",
    title: "Product Shot 1",
    processedUrl: "/api/placeholder/800/600",
  },
  {
    id: "2",
    url: "/api/placeholder/800/600",
    title: "Product Shot 2",
    processedUrl: "/api/placeholder/800/600",
  },
  {
    id: "3",
    url: "/api/placeholder/800/600",
    title: "Product Shot 3",
    processedUrl: "/api/placeholder/800/600",
  },
];

export default function Showcase3D() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("1");
  const [processingStatus, setProcessingStatus] = useState<"queued" | "processing" | "completed" | "failed">("processing");
  const [processingProgress, setProcessingProgress] = useState(45);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Drisya 3D Showcase</h1>
                <p className="text-sm text-muted-foreground">
                  Experience premium 3D animations
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="hero" className="w-full" data-testid="showcase-tabs">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="hero" className="flex items-center gap-2" data-testid="tab-hero">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2" data-testid="tab-templates">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2" data-testid="tab-processing">
              <Loader2 className="w-4 h-4" />
              <span className="hidden sm:inline">Processing</span>
            </TabsTrigger>
            <TabsTrigger value="carousel" className="flex items-center gap-2" data-testid="tab-carousel">
              <Images className="w-4 h-4" />
              <span className="hidden sm:inline">Carousel</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-accent/5"
            >
              <Hero3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">3D Template Gallery</h2>
                <p className="text-muted-foreground">
                  Hover over templates to see the 3D tilt effect. Click to select.
                </p>
              </div>
              <TemplateCards3D
                templates={mockTemplates}
                selectedTemplateId={selectedTemplateId}
                onSelectTemplate={setSelectedTemplateId}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="processing" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-accent/5 p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Processing Animation</h2>
                <p className="text-muted-foreground">
                  3D rotating cube with particle effects
                </p>
              </div>
              <ProcessingAnimation3D
                progress={processingProgress}
                status={processingStatus}
                imageCount={5}
              />
              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={() => setProcessingStatus("queued")}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                  data-testid="button-status-queued"
                >
                  Queued
                </button>
                <button
                  onClick={() => setProcessingStatus("processing")}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                  data-testid="button-status-processing"
                >
                  Processing
                </button>
                <button
                  onClick={() => setProcessingStatus("completed")}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                  data-testid="button-status-completed"
                >
                  Completed
                </button>
                <button
                  onClick={() => setProcessingProgress((p) => Math.min(100, p + 10))}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  data-testid="button-increase-progress"
                >
                  + Progress
                </button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="carousel" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-accent/5 p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">3D Image Carousel</h2>
                <p className="text-muted-foreground">
                  Navigate through images with 3D perspective and depth
                </p>
              </div>
              <ImageCarousel3D images={mockImages} autoplay={true} autoplayDelay={4000} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
