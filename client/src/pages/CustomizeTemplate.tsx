import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import TemplateConfigurator from "@/components/TemplateConfigurator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Link } from "wouter";
import earringsWhiteBg from "@assets/WhatsApp Image 2025-10-12 at 14.02.54_bef9f90d_1760283307730.jpg";

interface TemplateConfig {
  background: string;
  lighting: string;
  effects: string[];
}

export default function CustomizeTemplate() {
  const [config, setConfig] = useState<TemplateConfig>({
    background: "velvet",
    lighting: "soft-glow",
    effects: ["shadow", "color-grade"],
  });

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  const springImageY = useSpring(imageY, { stiffness: 100, damping: 30 });

  // Map configuration to visual effects
  const getBackgroundStyle = () => {
    const backgrounds: Record<string, string> = {
      velvet: "from-purple-900/20 via-pink-900/20 to-purple-900/20",
      marble: "from-gray-100 via-white to-gray-100",
      minimal: "from-background via-muted to-background",
      gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
      festive: "from-red-500/20 via-yellow-500/20 to-orange-500/20",
    };
    return backgrounds[config.background] || backgrounds.velvet;
  };

  const getLightingEffect = () => {
    const lighting: Record<string, string> = {
      moody: "drop-shadow-2xl brightness-90 contrast-125",
      "soft-glow": "drop-shadow-xl brightness-110",
      spotlight: "drop-shadow-2xl brightness-125 contrast-110",
      studio: "brightness-105 contrast-105",
    };
    return lighting[config.lighting] || lighting["soft-glow"];
  };

  const getEffectsClasses = () => {
    let classes = "";
    if (config.effects.includes("shadow")) {
      classes += " drop-shadow-2xl";
    }
    if (config.effects.includes("vignette")) {
      classes += " ring-8 ring-black/10 ring-inset";
    }
    if (config.effects.includes("sharpen")) {
      classes += " contrast-110";
    }
    return classes;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/templates">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" data-testid="button-share">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" data-testid="button-apply">
              <Download className="w-4 h-4 mr-2" />
              Apply Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Customize your template
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experiment with backgrounds, lighting, and effects to create the perfect
            look for your product images
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-32"
          >
            <div className="relative">
              <motion.div
                style={{ y: springImageY, scale: imageScale }}
                className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${getBackgroundStyle()} p-12`}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <img
                    src={earringsWhiteBg}
                    alt="Product preview"
                    className={`w-full rounded-2xl transition-all duration-500 ${getLightingEffect()} ${getEffectsClasses()}`}
                    data-testid="preview-image"
                  />
                </motion.div>

                {/* Overlay Effects */}
                {config.effects.includes("vignette") && (
                  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20 pointer-events-none" />
                )}
              </motion.div>

              {/* Info Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Live Preview</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">Real-time updates</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Configurator */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TemplateConfigurator onConfigChange={setConfig} />
          </motion.div>
        </div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 p-12 rounded-3xl bg-muted/30 border border-border"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Background</h3>
              <p className="text-sm text-muted-foreground">
                Select from premium backgrounds designed for e-commerce
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Adjust Lighting</h3>
              <p className="text-sm text-muted-foreground">
                Fine-tune lighting presets for perfect illumination
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Add Effects</h3>
              <p className="text-sm text-muted-foreground">
                Apply professional effects to enhance your images
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
