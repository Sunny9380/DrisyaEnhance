import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";

interface FloatingImage {
  id: number;
  before: string;
  after: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// Memoized particles with stable random positions
const createParticles = () =>
  Array.from({ length: 50 }, (_, i) => ({
    id: i,
    initialX: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
    initialY: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
    targetY: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
    duration: Math.random() * 10 + 10,
  }));

export default function Hero3D() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animations for mouse movement
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Create base transforms at top level (not in map loop)
  const baseRotateY = useTransform(smoothMouseX, [-20, 20], [-10, 10]);
  const baseRotateX = useTransform(smoothMouseY, [-20, 20], [10, -10]);

  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  // Memoize particles to prevent regeneration on re-renders
  const particles = useMemo(() => createParticles(), []);

  // Sample floating images (you can replace with real data)
  const floatingImages: FloatingImage[] = useMemo(
    () => [
      {
        id: 1,
        before: "/api/placeholder/200/200",
        after: "/api/placeholder/200/200",
        x: -300,
        y: -100,
        rotation: -15,
        scale: 0.9,
      },
      {
        id: 2,
        before: "/api/placeholder/200/200",
        after: "/api/placeholder/200/200",
        x: 300,
        y: -50,
        rotation: 12,
        scale: 1.1,
      },
      {
        id: 3,
        before: "/api/placeholder/200/200",
        after: "/api/placeholder/200/200",
        x: -200,
        y: 150,
        rotation: 8,
        scale: 0.85,
      },
      {
        id: 4,
        before: "/api/placeholder/200/200",
        after: "/api/placeholder/200/200",
        x: 250,
        y: 180,
        rotation: -10,
        scale: 0.95,
      },
    ],
    []
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 20);
    mouseY.set((clientY / innerHeight - 0.5) * 20);
  };

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-accent/5"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
            }}
            animate={{
              y: particle.targetY,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Image Enhancement</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Transform Your
            <br />
            Product Photos
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Professional image processing with AI backgrounds, lighting effects, and
            instant transformations. Elevate your e-commerce visuals in seconds.
          </motion.p>

          <motion.div
            className="mt-8 flex gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-hero-start"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-hero-demo"
            >
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating 3D images */}
        <div className="relative w-full max-w-6xl h-96 perspective-[1000px]">
          {floatingImages.map((image, index) => (
            <FloatingImageCard
              key={image.id}
              image={image}
              index={index}
              baseRotateY={baseRotateY}
              baseRotateX={baseRotateX}
              hoveredImage={hoveredImage}
              onHoverStart={() => setHoveredImage(image.id)}
              onHoverEnd={() => setHoveredImage(null)}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span className="text-sm text-muted-foreground">Scroll to explore</span>
        <motion.div
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full p-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div className="w-1 h-2 bg-primary rounded-full mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Separate component to handle individual floating image with transforms
function FloatingImageCard({
  image,
  index,
  baseRotateY,
  baseRotateX,
  hoveredImage,
  onHoverStart,
  onHoverEnd,
}: {
  image: FloatingImage;
  index: number;
  baseRotateY: any;
  baseRotateX: any;
  hoveredImage: number | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  // Now we can safely use hooks at the top level of this component
  const imageRotateY = useTransform(baseRotateY, (v) => v + image.rotation);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 cursor-pointer"
      style={{
        x: image.x,
        y: image.y,
        rotateY: imageRotateY,
        rotateX: baseRotateX,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: image.scale,
      }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      whileHover={{ scale: 1.2, z: 50 }}
    >
      <div
        className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glass morphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-white/20" />

        {/* Image container with flip effect */}
        <motion.div
          className="relative w-full h-full"
          animate={{
            rotateY: hoveredImage === image.id ? 180 : 0,
          }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front - Before image */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={image.before}
              alt="Before"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <span className="text-white text-xs font-semibold">
                Original
              </span>
            </div>
          </div>

          {/* Back - After image */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <img
              src={image.after}
              alt="After"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/60 to-transparent p-3">
              <span className="text-white text-xs font-semibold">
                Enhanced
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
