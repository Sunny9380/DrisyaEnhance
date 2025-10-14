import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import type { Template } from "@shared/schema";

interface TemplateCards3DProps {
  templates: Template[];
  selectedTemplateId?: string;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateCards3D({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: TemplateCards3DProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {templates.map((template, index) => (
        <TemplateCard3D
          key={template.id}
          template={template}
          index={index}
          isSelected={selectedTemplateId === template.id}
          isHovered={hoveredId === template.id}
          onHover={() => setHoveredId(template.id)}
          onLeave={() => setHoveredId(null)}
          onSelect={() => onSelectTemplate(template.id)}
        />
      ))}
    </div>
  );
}

interface TemplateCard3DProps {
  template: Template;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}

function TemplateCard3D({
  template,
  index,
  isSelected,
  isHovered,
  onHover,
  onLeave,
  onSelect,
}: TemplateCard3DProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    onLeave();
  };

  // Get background color based on template style
  const getBackgroundStyle = () => {
    const style = template.backgroundStyle?.toLowerCase();
    switch (style) {
      case "velvet":
        return "bg-gradient-to-br from-purple-900/20 to-pink-900/20";
      case "marble":
        return "bg-gradient-to-br from-gray-100/20 to-gray-300/20";
      case "gradient":
        return "bg-gradient-to-br from-blue-500/20 to-purple-500/20";
      case "minimal":
        return "bg-gradient-to-br from-gray-50/20 to-gray-100/20";
      default:
        return "bg-gradient-to-br from-background to-accent/10";
    }
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      data-testid={`template-card-${template.id}`}
    >
      <motion.div
        className="relative h-72 rounded-2xl overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered ? 1.05 : isSelected ? 1.02 : 1,
          z: isHovered ? 50 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Card background with glassmorphism */}
        <div
          className={`absolute inset-0 ${getBackgroundStyle()} backdrop-blur-xl border ${
            isSelected ? "border-primary" : "border-white/10"
          }`}
          style={{
            transform: "translateZ(0)",
          }}
        />

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          style={{
            transform: "translateZ(1px)",
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between z-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <motion.h3
                className="text-xl font-bold mb-1"
                style={{ transform: "translateZ(20px)" }}
              >
                {template.name}
              </motion.h3>
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                style={{ transform: "translateZ(15px)" }}
              >
                <Sparkles className="w-3 h-3" />
                <span>{template.backgroundStyle}</span>
              </motion.div>
            </div>

            {/* Selection indicator */}
            <motion.div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isSelected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              }`}
              style={{ transform: "translateZ(25px)" }}
              animate={{ scale: isSelected ? 1.2 : 1 }}
            >
              {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
            </motion.div>
          </div>

          {/* Preview placeholder */}
          <motion.div
            className="flex-1 my-4 rounded-xl bg-gradient-to-br from-background/50 to-accent/30 backdrop-blur-sm flex items-center justify-center overflow-hidden relative"
            style={{ transform: "translateZ(10px)" }}
          >
            {/* Animated pattern */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, currentColor 0px, transparent 2px, transparent 4px, currentColor 6px)",
              }}
            />

            <div className="text-center z-10">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                {template.lightingPreset || "Custom"}
              </p>
            </div>
          </motion.div>

          {/* Footer - Premium badge and Select button */}
          <motion.div
            className="flex items-center justify-between"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className="flex items-center gap-2">
              {template.isPremium && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Premium</span>
                </div>
              )}
            </div>

            <motion.button
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent hover:bg-accent/80"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              data-testid={`button-select-template-${template.id}`}
            >
              {isSelected ? "Selected" : "Select"}
            </motion.button>
          </motion.div>
        </div>

        {/* Selected glow effect */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              boxShadow: "0 0 30px rgba(var(--primary), 0.5)",
            }}
          />
        )}
      </motion.div>

      {/* Shadow */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/20 blur-xl rounded-full"
        style={{
          scaleX: isHovered ? 1.2 : 1,
          opacity: isHovered ? 0.6 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
