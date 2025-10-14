import { motion } from "framer-motion";
import { Loader2, Sparkles, Zap, Image as ImageIcon } from "lucide-react";

interface ProcessingAnimation3DProps {
  progress?: number;
  status?: "queued" | "processing" | "completed" | "failed";
  imageCount?: number;
}

export default function ProcessingAnimation3D({
  progress = 0,
  status = "processing",
  imageCount = 1,
}: ProcessingAnimation3DProps) {
  return (
    <div className="relative w-full h-96 flex items-center justify-center perspective-[1000px]">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              y: [null, (Math.random() - 0.5) * 200],
              x: [null, (Math.random() - 0.5) * 200],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Central 3D rotating cube */}
      <div className="relative">
        <motion.div
          className="w-64 h-64 relative"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: status === "processing" ? 360 : 0,
            rotateX: status === "processing" ? [0, 10, 0] : 0,
          }}
          transition={{
            rotateY: {
              duration: 4,
              repeat: status === "processing" ? Infinity : 0,
              ease: "linear",
            },
            rotateX: {
              duration: 2,
              repeat: status === "processing" ? Infinity : 0,
              ease: "easeInOut",
            },
          }}
        >
          {/* Cube faces */}
          {[
            { transform: "rotateY(0deg) translateZ(128px)", bg: "from-primary/20 to-primary/40" },
            { transform: "rotateY(90deg) translateZ(128px)", bg: "from-purple-500/20 to-purple-500/40" },
            { transform: "rotateY(180deg) translateZ(128px)", bg: "from-blue-500/20 to-blue-500/40" },
            { transform: "rotateY(-90deg) translateZ(128px)", bg: "from-pink-500/20 to-pink-500/40" },
            { transform: "rotateX(90deg) translateZ(128px)", bg: "from-cyan-500/20 to-cyan-500/40" },
            { transform: "rotateX(-90deg) translateZ(128px)", bg: "from-orange-500/20 to-orange-500/40" },
          ].map((face, i) => (
            <motion.div
              key={i}
              className={`absolute w-64 h-64 bg-gradient-to-br ${face.bg} backdrop-blur-sm border border-white/10 flex items-center justify-center`}
              style={{
                transform: face.transform,
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {i === 0 && <Sparkles className="w-12 h-12 text-primary" />}
                {i === 1 && <Zap className="w-12 h-12 text-purple-500" />}
                {i === 2 && <ImageIcon className="w-12 h-12 text-blue-500" />}
                {i === 3 && <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Orbiting particles */}
        {status === "processing" && (
          <>
            {[0, 120, 240].map((angle) => (
              <motion.div
                key={angle}
                className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full"
                style={{
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  rotateY: [angle, angle + 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div
                  style={{
                    transform: "translateX(-50%) translateY(-50%) translateZ(150px)",
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Status text */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold mb-2">
          {status === "queued" && "Queued for Processing"}
          {status === "processing" && "Processing Your Images"}
          {status === "completed" && "Processing Complete!"}
          {status === "failed" && "Processing Failed"}
        </h3>
        
        {status === "processing" && (
          <>
            <p className="text-muted-foreground mb-4">
              {imageCount} {imageCount === 1 ? "image" : "images"} being enhanced...
            </p>
            
            {/* Progress bar */}
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </>
        )}

        {status === "completed" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
