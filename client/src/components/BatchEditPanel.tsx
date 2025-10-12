import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface BatchEditPanelProps {
  onApply?: (settings: BatchSettings) => void;
  imageCount?: number;
}

export interface BatchSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  quality: string;
}

export default function BatchEditPanel({
  onApply,
  imageCount = 0,
}: BatchEditPanelProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [quality, setQuality] = useState("standard");

  const qualityPresets = [
    { id: "standard", name: "E-commerce Standard", description: "1500x1500, optimized for web" },
    { id: "social", name: "Social Media", description: "1080x1080, Instagram/Facebook ready" },
    { id: "print", name: "Print Quality", description: "3000x3000, high resolution" },
  ];

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSharpness(0);
    setQuality("standard");
  };

  const handleApply = () => {
    onApply?.({
      brightness,
      contrast,
      saturation,
      sharpness,
      quality,
    });
  };

  return (
    <Card className="p-6" data-testid="component-batch-edit-panel">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Batch Edit Settings</h3>
            <p className="text-sm text-muted-foreground">
              Apply adjustments to {imageCount} images
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            data-testid="button-reset-settings"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <Separator />

        {/* Quality Presets */}
        <div className="space-y-3">
          <Label>Quality Preset</Label>
          <div className="grid grid-cols-1 gap-2">
            {qualityPresets.map((preset) => (
              <Card
                key={preset.id}
                className={`p-3 cursor-pointer hover-elevate active-elevate-2 ${
                  quality === preset.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setQuality(preset.id)}
                data-testid={`preset-${preset.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{preset.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                  {quality === preset.id && (
                    <Badge variant="default" className="ml-2">Active</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Brightness</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {brightness > 0 ? '+' : ''}{brightness}
            </span>
          </div>
          <Slider
            value={[brightness]}
            onValueChange={(val) => setBrightness(val[0])}
            min={-50}
            max={50}
            step={1}
            data-testid="slider-brightness"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Contrast</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {contrast > 0 ? '+' : ''}{contrast}
            </span>
          </div>
          <Slider
            value={[contrast]}
            onValueChange={(val) => setContrast(val[0])}
            min={-50}
            max={50}
            step={1}
            data-testid="slider-contrast"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Saturation</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {saturation > 0 ? '+' : ''}{saturation}
            </span>
          </div>
          <Slider
            value={[saturation]}
            onValueChange={(val) => setSaturation(val[0])}
            min={-50}
            max={50}
            step={1}
            data-testid="slider-saturation"
          />
        </div>

        {/* Sharpness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Sharpness</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {sharpness > 0 ? '+' : ''}{sharpness}
            </span>
          </div>
          <Slider
            value={[sharpness]}
            onValueChange={(val) => setSharpness(val[0])}
            min={0}
            max={100}
            step={1}
            data-testid="slider-sharpness"
          />
        </div>

        <Separator />

        <Button
          className="w-full"
          onClick={handleApply}
          data-testid="button-apply-settings"
        >
          Apply to All Images
        </Button>
      </div>
    </Card>
  );
}
