import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";

interface Image3D {
  id: string;
  url: string;
  title?: string;
  processedUrl?: string;
}

interface ImageCarousel3DProps {
  images: Image3D[];
  autoplay?: boolean;
  autoplayDelay?: number;
}

export default function ImageCarousel3D({
  images,
  autoplay = false,
  autoplayDelay = 5000,
}: ImageCarousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [currentIndex, autoplay, autoplayDelay, images.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-accent/20 rounded-2xl">
        <p className="text-muted-foreground">No images to display</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full h-[600px] perspective-[2000px]" data-testid="carousel-3d">
      {/* Main carousel container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background blur effect */}
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl opacity-30"
          animate={{
            background: `radial-gradient(circle at center, hsl(var(--primary) / 0.3), transparent)`,
          }}
        />

        {/* 3D Carousel */}
        <div className="relative w-full max-w-5xl h-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  rotateY: direction > 0 ? 90 : -90,
                  opacity: 0,
                  scale: 0.8,
                  z: -500,
                }),
                center: {
                  rotateY: 0,
                  opacity: 1,
                  scale: 1,
                  z: 0,
                },
                exit: (direction: number) => ({
                  rotateY: direction > 0 ? -90 : 90,
                  opacity: 0,
                  scale: 0.8,
                  z: -500,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                rotateY: { type: "spring", stiffness: 100, damping: 20 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 },
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Main image card */}
              <motion.div
                className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-xl border border-white/10 z-10" />

                {/* Image */}
                <img
                  src={currentImage.processedUrl || currentImage.url}
                  alt={currentImage.title || `Image ${currentIndex + 1}`}
                  className="w-full h-full object-contain"
                  data-testid={`carousel-image-${currentImage.id}`}
                />

                {/* Image info overlay */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20"
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {currentImage.title || `Image ${currentIndex + 1}`}
                  </h3>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`button-download-${currentImage.id}`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </motion.button>
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`button-fullscreen-${currentImage.id}`}
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>View Full</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <motion.button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors"
                onClick={handlePrev}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                data-testid="button-carousel-prev"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors"
                onClick={handleNext}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                data-testid="button-carousel-next"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>

        {/* Side previews */}
        {images.length > 1 && (
          <>
            {/* Previous preview */}
            <motion.div
              className="absolute left-8 top-1/2 -translate-y-1/2 w-48 h-64 opacity-30 cursor-pointer"
              style={{
                rotateY: -45,
                z: -200,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ opacity: 0.6, scale: 1.1 }}
              onClick={handlePrev}
            >
              <img
                src={
                  images[(currentIndex - 1 + images.length) % images.length]
                    .processedUrl ||
                  images[(currentIndex - 1 + images.length) % images.length].url
                }
                alt="Previous"
                className="w-full h-full object-cover rounded-xl"
              />
            </motion.div>

            {/* Next preview */}
            <motion.div
              className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-64 opacity-30 cursor-pointer"
              style={{
                rotateY: 45,
                z: -200,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ opacity: 0.6, scale: 1.1 }}
              onClick={handleNext}
            >
              <img
                src={
                  images[(currentIndex + 1) % images.length].processedUrl ||
                  images[(currentIndex + 1) % images.length].url
                }
                alt="Next"
                className="w-full h-full object-cover rounded-xl"
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-primary scale-110"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
              onClick={() => handleSelect(index)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`thumbnail-${image.id}`}
            >
              <img
                src={image.processedUrl || image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
