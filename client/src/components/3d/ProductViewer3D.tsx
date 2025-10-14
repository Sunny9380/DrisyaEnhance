import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { useState, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductViewer3DProps {
  imageUrl: string;
  alt?: string;
  showControls?: boolean;
}

export default function ProductViewer3D({
  imageUrl,
  alt = "Product",
  showControls = true,
}: ProductViewer3DProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for rotation
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring animations for smooth rotation
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 20 });

  const handlePan = (event: PointerEvent, info: PanInfo) => {
    const sensitivity = 0.3;
    rotateY.set(rotateY.get() + info.delta.x * sensitivity);
    rotateX.set(rotateX.get() - info.delta.y * sensitivity);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    rotateX.set(0);
    rotateY.set(0);
    setZoom(1);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-background via-muted/20 to-background rounded-2xl overflow-hidden"
    >
      {/* 3D Product Container */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
        <motion.div
          className={`relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            scale: zoom,
            transformStyle: "preserve-3d",
          }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0}
          onPan={handlePan}
          onPanStart={() => setIsDragging(true)}
          onPanEnd={() => setIsDragging(false)}
          whileHover={{ scale: zoom * 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative"
            animate={{
              rotateZ: [0, 0.5, 0, -0.5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Main Product Image */}
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[600px] rounded-xl shadow-2xl select-none"
              draggable={false}
            />

            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl pointer-events-none" />

            {/* Reflection Effect */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-30 rounded-xl pointer-events-none"
              style={{
                transform: "rotateX(180deg) translateY(100%)",
                transformOrigin: "bottom",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-card/90 backdrop-blur-xl p-2 rounded-full border border-border shadow-lg"
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleZoomOut}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="flex items-center px-3">
            <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleZoomIn}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleFullscreen}
            data-testid="button-fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Instructions */}
      {!isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/90 backdrop-blur-xl rounded-full border border-border text-sm text-muted-foreground z-10"
        >
          Drag to rotate • Use controls to zoom
        </motion.div>
      )}

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] opacity-20 pointer-events-none" />
    </div>
  );
}
