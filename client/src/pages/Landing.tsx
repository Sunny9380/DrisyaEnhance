import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Image as ImageIcon,
  Layers,
  Clock,
  Star,
  ChevronDown,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import earringsWhiteBg from "@assets/WhatsApp Image 2025-10-12 at 14.02.54_bef9f90d_1760283307730.jpg";
import earringsDarkBg from "@assets/WhatsApp Image 2025-10-12 at 14.03.27_c425ce07_1760283310185.jpg";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Enhancement",
      description: "Advanced algorithms automatically enhance image quality, colors, and lighting",
    },
    {
      icon: Layers,
      title: "Background Removal",
      description: "Professional-grade background removal with edge detection",
    },
    {
      icon: ImageIcon,
      title: "100+ Templates",
      description: "Choose from our extensive library of premium backgrounds",
    },
    {
      icon: Zap,
      title: "Bulk Processing",
      description: "Process thousands of images simultaneously with our queue system",
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Get your processed images in minutes, not hours",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your valuable product images",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹499",
      coins: 500,
      features: [
        "500 coin balance",
        "~250 images processed",
        "All templates access",
        "Basic support",
        "Download as ZIP",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "₹1,599",
      coins: 2000,
      features: [
        "2,000 coin balance",
        "~1,000 images processed",
        "All templates access",
        "Priority support",
        "Bulk upload (ZIP)",
        "20% cost savings",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "₹3,499",
      coins: 5000,
      features: [
        "5,000 coin balance",
        "~2,500 images processed",
        "All templates access",
        "Dedicated support",
        "Custom templates",
        "30% cost savings",
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "E-commerce Store Owner",
      content: "Drisya transformed our product photography workflow. We now process 500+ images per day with professional results. Our conversion rate increased by 35%!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Jewelry Business",
      content: "The AI background removal is incredibly accurate. It saves us hours of manual editing. The premium templates make our jewelry pieces look stunning online.",
      rating: 5,
    },
    {
      name: "Anjali Verma",
      role: "Product Photographer",
      content: "As a professional photographer, I was skeptical at first. But Drisya's quality and speed are impressive. It's now an essential tool in my workflow.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "How does the coin system work?",
      answer: "Each image processed costs coins based on quality: Standard (2 coins), High (3 coins), or Ultra (5 coins). You buy coin packages that never expire, so you only pay for what you use.",
    },
    {
      question: "What's included in the free trial?",
      answer: "New users get 100 free coins to test the platform. This allows you to process 50 images at standard quality, or fewer at higher quality levels. No credit card required!",
    },
    {
      question: "Can I upload images in bulk?",
      answer: "Yes! You can upload up to 1,000 images at once via ZIP file. Our system processes them in batches and provides a downloadable ZIP with all enhanced images.",
    },
    {
      question: "What file formats are supported?",
      answer: "We support all major image formats including JPG, PNG, JPEG, and WEBP. For best results, we recommend high-resolution source images.",
    },
    {
      question: "How long does processing take?",
      answer: "Most images are processed within 1-2 minutes. Bulk orders are completed within 10-30 minutes depending on the queue. You'll receive an email notification when your images are ready.",
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "We offer a 7-day money-back guarantee on all coin purchases. If you're not satisfied with the results, contact our support team for a full refund.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <h1 className="font-bold text-xl">Drisya</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" data-testid="button-nav-login">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-nav-register">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
              AI-Powered Image Enhancement
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Transform Your Product Photography
              <span className="block text-primary mt-2">In Minutes, Not Hours</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional background removal, enhancement, and template placement
              for e-commerce, jewelry, and product photography
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8" data-testid="button-hero-start">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-hero-learn"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Product Showcase */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-white relative">
                <img
                  src={earringsWhiteBg}
                  alt="Before processing"
                  className="w-full h-full object-contain p-8"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">Before</Badge>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden ring-2 ring-primary">
              <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 relative">
                <img
                  src={earringsDarkBg}
                  alt="After processing"
                  className="w-full h-full object-contain p-8"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">After - Enhanced</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything You Need for Professional Results
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for e-commerce businesses, jewelry stores, and product photographers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover-elevate" data-testid={`feature-${index}`}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple 3-step process to transform your images
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold">Select Template</h3>
              <p className="text-muted-foreground">
                Choose from 100+ professional background templates
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold">Upload Images</h3>
              <p className="text-muted-foreground">
                Bulk upload up to 1,000 images via ZIP or individual files
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold">Download Results</h3>
              <p className="text-muted-foreground">
                Get professionally enhanced images ready for your store
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Pay only for what you use with our coin-based system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
                data-testid={`pricing-plan-${index}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.coins} coins</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    data-testid={`button-select-${plan.name.toLowerCase()}`}
                  >
                    Get Started
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All plans include: ✓ No subscription ✓ No expiry ✓ Add coins anytime
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied businesses using Drisya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6" data-testid={`testimonial-${index}`}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Drisya
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline" data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary/5">
            <TrendingUp className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Product Images?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses using Drisya to create professional product photography
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8" data-testid="button-cta-start">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">D</span>
                </div>
                <h3 className="font-bold text-lg">Drisya</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered image enhancement platform for professional product photography
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Templates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Contact</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Drisya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
