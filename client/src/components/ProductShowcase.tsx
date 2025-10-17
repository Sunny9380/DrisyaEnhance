import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Placeholder images - replace with actual demo images later
const earringsWhiteBg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzI4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9yaWdpbmFsIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
const earringsDarkBg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2Y5ZmFmYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVuaGFuY2VkIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

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
