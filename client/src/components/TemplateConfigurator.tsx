import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Layers,
  Sun,
  Palette,
  ChevronRight,
  Check,
  Circle,
  Square,
  Hexagon,
  Triangle,
  Droplet,
  Moon,
  Zap,
  Lightbulb,
  Sun as SunIcon,
} from "lucide-react";

interface TemplateConfig {
  background: string;
  lighting: string;
  effects: string[];
}

interface ConfigOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const backgroundOptions: ConfigOption[] = [
  { id: "velvet", name: "Velvet", icon: Droplet, color: "from-purple-500 to-pink-500" },
  { id: "marble", name: "Marble", icon: Circle, color: "from-gray-300 to-gray-500" },
  { id: "minimal", name: "Minimal", icon: Square, color: "from-white to-gray-200" },
  { id: "gradient", name: "Gradient", icon: Layers, color: "from-blue-400 to-purple-500" },
  { id: "festive", name: "Festive", icon: Sparkles, color: "from-red-400 to-yellow-400" },
];

const lightingOptions: ConfigOption[] = [
  { id: "moody", name: "Moody", icon: Moon, color: "from-indigo-600 to-purple-600" },
  { id: "soft-glow", name: "Soft Glow", icon: Zap, color: "from-amber-300 to-orange-400" },
  { id: "spotlight", name: "Spotlight", icon: Lightbulb, color: "from-yellow-400 to-yellow-600" },
  { id: "studio", name: "Studio", icon: SunIcon, color: "from-blue-300 to-blue-400" },
];

const effectOptions = [
  { id: "shadow", name: "Shadow", description: "Window-pane shadow effect" },
  { id: "vignette", name: "Vignette", description: "Subtle edge darkening" },
  { id: "color-grade", name: "Color Grade", description: "Professional color grading" },
  { id: "sharpen", name: "Sharpen", description: "Enhanced sharpness" },
];

export default function TemplateConfigurator({
  onConfigChange,
}: {
  onConfigChange?: (config: TemplateConfig) => void;
}) {
  const [activeSection, setActiveSection] = useState<"background" | "lighting" | "effects">("background");
  const [config, setConfig] = useState<TemplateConfig>({
    background: "velvet",
    lighting: "soft-glow",
    effects: ["shadow", "color-grade"],
  });

  const updateConfig = (updates: Partial<TemplateConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const toggleEffect = (effectId: string) => {
    const newEffects = config.effects.includes(effectId)
      ? config.effects.filter((e) => e !== effectId)
      : [...config.effects, effectId];
    updateConfig({ effects: newEffects });
  };

  return (
    <div className="space-y-8">
      {/* Section Selector */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSection("background")}
          className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
            activeSection === "background"
              ? "border-primary bg-primary/10"
              : "border-border hover-elevate"
          }`}
          data-testid="button-section-background"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Background</h3>
              <p className="text-sm text-muted-foreground capitalize">{config.background}</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSection("lighting")}
          className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
            activeSection === "lighting"
              ? "border-primary bg-primary/10"
              : "border-border hover-elevate"
          }`}
          data-testid="button-section-lighting"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Lighting</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {config.lighting.replace("-", " ")}
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSection("effects")}
          className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
            activeSection === "effects"
              ? "border-primary bg-primary/10"
              : "border-border hover-elevate"
          }`}
          data-testid="button-section-effects"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Effects</h3>
              <p className="text-sm text-muted-foreground">
                {config.effects.length} active
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Options Display */}
      <AnimatePresence mode="wait">
        {activeSection === "background" && (
          <motion.div
            key="background"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-5 gap-4"
          >
            {backgroundOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateConfig({ background: option.id })}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    config.background === option.id
                      ? "border-primary"
                      : "border-border hover-elevate"
                  }`}
                  data-testid={`option-background-${option.id}`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium">{option.name}</p>
                  </div>
                  {config.background === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {activeSection === "lighting" && (
          <motion.div
            key="lighting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-4 gap-4"
          >
            {lightingOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateConfig({ lighting: option.id })}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    config.lighting === option.id
                      ? "border-primary"
                      : "border-border hover-elevate"
                  }`}
                  data-testid={`option-lighting-${option.id}`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium">{option.name}</p>
                  </div>
                  {config.lighting === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {activeSection === "effects" && (
          <motion.div
            key="effects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {effectOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleEffect(option.id)}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  config.effects.includes(option.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover-elevate"
                }`}
                data-testid={`option-effect-${option.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{option.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  {config.effects.includes(option.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Summary */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Current Configuration
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {config.background}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {config.lighting.replace("-", " ")}
          </Badge>
          {config.effects.map((effect) => (
            <Badge key={effect} variant="secondary" className="capitalize">
              {effect.replace("-", " ")}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
