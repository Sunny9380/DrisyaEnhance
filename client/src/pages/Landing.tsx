import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Layers,
  Zap,
  ChevronDown,
} from "lucide-react";
import earringsWhiteBg from "@assets/WhatsApp Image 2025-10-12 at 14.02.54_bef9f90d_1760283307730.jpg";
import earringsDarkBg from "@assets/WhatsApp Image 2025-10-12 at 14.03.27_c425ce07_1760283310185.jpg";
import ThemeToggle from "@/components/ThemeToggle";

// Section component with scroll-triggered reveal
function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax text component
function ParallaxText({ children, offset = 50 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -offset]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: springY }}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <h1 className="font-bold text-xl">Drisya</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-nav-login">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-nav-register">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Image Enhancement</span>
          </motion.div>

          <ParallaxText offset={30}>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight"
            >
              <span className="block text-foreground/90">Unique</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Imagery
              </span>
            </motion.h1>
          </ParallaxText>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Transform your product photos with professional AI backgrounds,
            lighting effects, and instant enhancements. Elevate your e-commerce
            visuals to luxury standards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-10 py-6 rounded-full"
                data-testid="button-hero-cta"
              >
                Start now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-sm text-muted-foreground">Start scrolling to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
      </section>

      {/* Feature Section 1: "Forever Created to Last" */}
      <ScrollSection className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ParallaxText offset={40}>
              <div className="space-y-6">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Forever
                </p>
                <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-foreground/90">created to</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    last
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Professional-grade image processing that preserves every detail.
                  Our AI-powered enhancement ensures your products look pristine
                  across all platforms, forever maintaining their quality.
                </p>
              </div>
            </ParallaxText>

            <ParallaxText offset={60}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                <img
                  src={earringsWhiteBg}
                  alt="Professional product"
                  className="relative rounded-3xl shadow-2xl w-full"
                />
              </motion.div>
            </ParallaxText>
          </div>
        </div>
      </ScrollSection>

      {/* Feature Section 2: "Share Your Emotions" */}
      <ScrollSection className="min-h-screen flex items-center bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ParallaxText offset={60}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative group order-2 lg:order-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                <img
                  src={earringsDarkBg}
                  alt="Enhanced product"
                  className="relative rounded-3xl shadow-2xl w-full"
                />
              </motion.div>
            </ParallaxText>

            <ParallaxText offset={40}>
              <div className="space-y-6 order-1 lg:order-2">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Emotions
                </p>
                <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-foreground/90">share your</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    vision
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  From minimalist backgrounds to vibrant gradients, our templates
                  bring your creative vision to life. Transform ordinary product
                  photos into emotional masterpieces that connect with your audience.
                </p>
                <Link href="/register">
                  <Button size="lg" className="mt-4" data-testid="button-customize">
                    Customize it
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ParallaxText>
          </div>
        </div>
      </ScrollSection>

      {/* Features Grid Section */}
      <ScrollSection className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create stunning product imagery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Enhancement",
                description: "Automatic quality enhancement with advanced algorithms",
              },
              {
                icon: Layers,
                title: "Background Removal",
                description: "Professional-grade edge detection and removal",
              },
              {
                icon: ImageIcon,
                title: "100+ Templates",
                description: "Extensive library of premium backgrounds",
              },
              {
                icon: Zap,
                title: "Bulk Processing",
                description: "Process thousands of images simultaneously",
              },
              {
                icon: ImageIcon,
                title: "Fast Results",
                description: "Get enhanced images in minutes",
              },
              {
                icon: Sparkles,
                title: "Enterprise Ready",
                description: "Secure, reliable, and scalable",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-card border border-border hover-elevate active-elevate-2"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* Final CTA */}
      <ScrollSection className="py-32 bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to transform your images?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of businesses creating professional product imagery
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12 py-6 rounded-full" data-testid="button-final-cta">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </ScrollSection>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">D</span>
              </div>
              <span className="font-semibold text-lg">Drisya</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Created with precision. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
