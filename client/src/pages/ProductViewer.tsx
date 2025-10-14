import { motion } from "framer-motion";
import ProductViewer3D from "@/components/3d/ProductViewer3D";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";
import earringsWhiteBg from "@assets/WhatsApp Image 2025-10-12 at 14.02.54_bef9f90d_1760283307730.jpg";
import earringsDarkBg from "@assets/WhatsApp Image 2025-10-12 at 14.03.27_c425ce07_1760283310185.jpg";

export default function ProductViewer() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-[100] border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-lg">3D Product Viewer</h1>
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
            Interactive Product Viewer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience your products in stunning 3D with drag-to-rotate, zoom, and
            fullscreen controls
          </p>
        </motion.div>

        {/* Main Viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="h-[600px]">
            <ProductViewer3D imageUrl={earringsWhiteBg} alt="Product showcase" />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              title: "Drag to Rotate",
              description: "Smoothly rotate products in any direction",
            },
            {
              title: "Button Zoom",
              description: "Zoom in to see every detail",
            },
            {
              title: "Fullscreen Mode",
              description: "Immersive viewing experience",
            },
            {
              title: "Touch Friendly",
              description: "Perfect for mobile devices",
            },
          ].map((feature, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Additional Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-center">More Examples</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-[400px]">
              <ProductViewer3D
                imageUrl={earringsDarkBg}
                alt="Dark background variant"
              />
            </div>
            <div className="h-[400px]">
              <ProductViewer3D
                imageUrl={earringsWhiteBg}
                alt="Light background variant"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
