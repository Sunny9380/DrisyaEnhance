import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TemplatePreviewProps {
  imageUrl: string | null;
  templateStyle: {
    backgroundStyle: string;
    gradientColors?: string[];
    lightingPreset?: string;
  } | null;
}

export function TemplatePreview({ imageUrl, templateStyle }: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl || !templateStyle || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsLoading(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;

      const { backgroundStyle, gradientColors, lightingPreset } = templateStyle;

      if (backgroundStyle === "gradient" && gradientColors && gradientColors.length >= 2) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, gradientColors[0]);
        gradient.addColorStop(1, gradientColors[1]);
        ctx.fillStyle = gradient;
      } else if (backgroundStyle === "velvet") {
        ctx.fillStyle = "#2D1B3D";
      } else if (backgroundStyle === "marble") {
        ctx.fillStyle = "#E8E4DC";
      } else if (backgroundStyle === "minimal") {
        ctx.fillStyle = "#F5F5F5";
      } else {
        ctx.fillStyle = "#FFFFFF";
      }

      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      if (lightingPreset === "spotlight") {
        const radGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 50,
          canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        radGrad.addColorStop(0, "rgba(255,255,255,0.1)");
        radGrad.addColorStop(1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, templateStyle]);

  if (!imageUrl || !templateStyle) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Select an image and template to preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Quick Preview</CardTitle>
        <p className="text-xs text-muted-foreground">
          Instant preview - actual results may vary
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md z-10">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-md border"
            data-testid="canvas-template-preview"
          />
        </div>
      </CardContent>
    </Card>
  );
}
