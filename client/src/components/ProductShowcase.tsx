import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import earringsWhiteBg from "@assets/WhatsApp Image 2025-10-12 at 14.02.54_bef9f90d_1760283307730.jpg";
import earringsDarkBg from "@assets/WhatsApp Image 2025-10-12 at 14.03.27_c425ce07_1760283310185.jpg";

interface ProductShowcaseProps {
  showBeforeAfter?: boolean;
}

export default function ProductShowcase({ showBeforeAfter = true }: ProductShowcaseProps) {
  return (
    <div className="space-y-6" data-testid="component-product-showcase">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Professional Results</h2>
        <p className="text-muted-foreground">
          See how our AI transforms your product photography
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="aspect-square bg-white relative">
            <img
              src={earringsWhiteBg}
              alt="Gold earrings on white background"
              className="w-full h-full object-contain p-8"
            />
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">Original</Badge>
            </div>
          </div>
          <div className="p-4 bg-muted">
            <p className="text-sm font-medium">Before Processing</p>
            <p className="text-xs text-muted-foreground mt-1">
              Basic white background
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden ring-2 ring-primary">
          <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 relative">
            <img
              src={earringsDarkBg}
              alt="Gold earrings on premium background"
              className="w-full h-full object-contain p-8"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground">Enhanced</Badge>
            </div>
          </div>
          <div className="p-4 bg-card">
            <p className="text-sm font-medium">After Processing</p>
            <p className="text-xs text-muted-foreground mt-1">
              Premium dark fabric background with enhanced lighting
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">100%</p>
          <p className="text-xs text-muted-foreground mt-1">Background Removed</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-chart-2">2x</p>
          <p className="text-xs text-muted-foreground mt-1">Clarity Enhanced</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-chart-4">Auto</p>
          <p className="text-xs text-muted-foreground mt-1">Color Correction</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-chart-5">Smart</p>
          <p className="text-xs text-muted-foreground mt-1">Shadow Placement</p>
        </div>
      </div>
    </div>
  );
}
