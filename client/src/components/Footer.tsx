import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Drisya</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional AI-powered image enhancement platform for businesses and individuals.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <nav className="space-y-2">
              <Link 
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors" 
                data-testid="link-footer-terms"
              >
                Terms of Service
              </Link>
              <Link 
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors" 
                data-testid="link-footer-privacy"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <nav className="space-y-2">
              <a 
                href="mailto:support@drisya.app" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-footer-support"
              >
                Help & Support
              </a>
              <a 
                href="mailto:contact@drisya.app" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-footer-contact"
              >
                Contact Us
              </a>
            </nav>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left" data-testid="text-copyright">
            © {currentYear} Drisya. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground text-center md:text-right">
            Built with AI-powered technology
          </p>
        </div>
      </div>
    </footer>
  );
}
