import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // Getting Started
  {
    question: "How do I create an account?",
    answer: "Click on 'Register' in the top right corner, fill in your details (name, email, password), and you'll get 100 welcome coins to start processing images immediately.",
    category: "getting-started"
  },
  {
    question: "How do I upload images?",
    answer: "Go to the Upload page from the sidebar, select a template, drag and drop your images or click to browse. You can upload single images or ZIP files containing multiple images.",
    category: "getting-started"
  },
  {
    question: "How do I select a template?",
    answer: "Visit the Templates page to browse all available templates. Click on any template to see details and preview. You can also favorite templates for quick access later.",
    category: "getting-started"
  },
  
  // Image Processing
  {
    question: "How does AI image processing work?",
    answer: "Our AI removes backgrounds, enhances lighting, and applies professional templates to your product images. The AI uses advanced machine learning models trained on millions of product photos to deliver studio-quality results.",
    category: "image-processing"
  },
  {
    question: "What image formats are supported?",
    answer: "We support JPG, JPEG, PNG, and WebP formats. For best results, use high-resolution images (at least 1000x1000 pixels).",
    category: "image-processing"
  },
  {
    question: "How long does processing take?",
    answer: "Single images typically process in 10-30 seconds. Batch processing time depends on the number of images - approximately 15-20 seconds per image.",
    category: "image-processing"
  },
  {
    question: "What is batch processing?",
    answer: "Batch processing allows you to upload multiple images at once (via ZIP file) and apply the same template to all of them. This saves time when you have many similar products to process.",
    category: "image-processing"
  },
  
  // Coin System
  {
    question: "How does the coin system work?",
    answer: "Coins are used to process images. Each image costs 5 coins to process. You get 100 free coins when you sign up. Additional coins can be purchased through our coin packages.",
    category: "coin-system"
  },
  {
    question: "How do I buy more coins?",
    answer: "Go to the Wallet page to view coin packages. Choose a package and select your payment method (WhatsApp/UPI or Bank Transfer). After payment, contact admin for verification.",
    category: "coin-system"
  },
  {
    question: "What are the coin package prices?",
    answer: "We offer various packages: Starter (100 coins - ₹500), Professional (500 coins - ₹2000), Business (1000 coins - ₹3500), Enterprise (5000 coins - ₹15000). Larger packages include discounts.",
    category: "coin-system"
  },
  {
    question: "Can I get a refund for unused coins?",
    answer: "Coins are non-refundable once purchased. However, they never expire, so you can use them anytime in the future.",
    category: "coin-system"
  },
  
  // Payment Methods
  {
    question: "What payment methods do you accept?",
    answer: "We accept WhatsApp/UPI payments and direct bank transfers. After making payment, you'll need to submit a payment request with your transaction details for admin verification.",
    category: "payment"
  },
  {
    question: "How long does payment approval take?",
    answer: "Most payments are verified and coins credited within 2-4 hours during business hours (9 AM - 6 PM IST). Outside business hours, it may take up to 24 hours.",
    category: "payment"
  },
  {
    question: "What if my payment is rejected?",
    answer: "If your payment is rejected, you'll receive a notification with the reason. Common reasons include incorrect transaction details or payment amount mismatch. You can submit a new request with corrected details.",
    category: "payment"
  },
  
  // Templates
  {
    question: "What template categories are available?",
    answer: "We offer templates for various categories: Jewelry, Fashion & Apparel, Electronics, Food & Beverages, Cosmetics, Home Decor, and more. Each category has multiple style variations.",
    category: "templates"
  },
  {
    question: "Can I request custom templates?",
    answer: "Yes! Enterprise users can request custom templates. Contact our support team with your requirements, and we'll create templates tailored to your brand.",
    category: "templates"
  },
  {
    question: "How do I save favorite templates?",
    answer: "Click the heart icon on any template to add it to your favorites. Access your favorite templates quickly from the Templates page.",
    category: "templates"
  },
  
  // Troubleshooting
  {
    question: "Why did my processing job fail?",
    answer: "Jobs can fail due to: unsupported image format, corrupted files, images too large (>25MB), or network issues. Check the error message for specific details. Try re-uploading with properly formatted images.",
    category: "troubleshooting"
  },
  {
    question: "Processing is taking too long. What should I do?",
    answer: "Processing times vary based on server load. If a job takes more than 5 minutes, refresh the page. If it still shows 'processing', contact support with your job ID.",
    category: "troubleshooting"
  },
  {
    question: "I can't download my processed images",
    answer: "Make sure the job status shows 'completed'. Click the download button to get your ZIP file. If download fails, try a different browser or check your internet connection.",
    category: "troubleshooting"
  },
  
  // Account & Security
  {
    question: "How do I change my password?",
    answer: "Go to Profile page, click 'Change Password', enter your current password and new password. You'll receive a confirmation email once changed.",
    category: "account"
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use industry-standard encryption for all data transmission and storage. Your images are stored securely and never shared with third parties. You can delete your processed images anytime from the Media Library.",
    category: "account"
  },
  {
    question: "How do I delete my account?",
    answer: "Contact our support team at support@drisya.app to request account deletion. All your data will be permanently removed within 30 days.",
    category: "account"
  },
];

const categories = [
  { id: "all", label: "All Questions" },
  { id: "getting-started", label: "Getting Started" },
  { id: "image-processing", label: "Image Processing" },
  { id: "coin-system", label: "Coin System" },
  { id: "payment", label: "Payment Methods" },
  { id: "templates", label: "Templates" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "account", label: "Account & Security" },
];

const popularQuestions = [
  "How does the coin system work?",
  "How do I upload images?",
  "What payment methods do you accept?",
  "How long does processing take?",
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFeedback = (helpful: boolean, question: string) => {
    toast({
      title: helpful ? "Thank you!" : "Thanks for your feedback",
      description: helpful
        ? "We're glad this was helpful!"
        : "We'll work on improving this answer.",
    });
  };

  return (
    <div className="space-y-8" data-testid="page-help">
      <div>
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about Drisya
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-faq"
          />
        </div>
      </Card>

      {/* Popular Questions */}
      {!searchQuery && activeCategory === "all" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-4"
                onClick={() => setSearchQuery(question)}
                data-testid={`button-popular-${index}`}
              >
                {question}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs md:text-sm py-2"
              data-testid={`tab-${category.id}`}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <Card className="p-6">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">No questions found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or browse other categories
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger
                      className="text-left"
                      data-testid={`faq-question-${index}`}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground mb-4">{faq.answer}</p>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          Was this helpful?
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(true, faq.question)}
                          data-testid={`button-helpful-yes-${index}`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(false, faq.question)}
                          data-testid={`button-helpful-no-${index}`}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          No
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5">
        <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
        <p className="text-muted-foreground mb-4">
          Our support team is here to help you with any questions
        </p>
        <Button data-testid="button-contact-support">
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </Card>
    </div>
  );
}
