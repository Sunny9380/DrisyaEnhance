import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export default function Terms() {
  const lastUpdated = "October 13, 2025";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-terms-title">Terms of Service</h1>
        <p className="text-muted-foreground" data-testid="text-last-updated">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <button
              onClick={() => scrollToSection("acceptance")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-acceptance"
            >
              1. Acceptance of Terms
            </button>
            <button
              onClick={() => scrollToSection("service-description")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-service"
            >
              2. Service Description
            </button>
            <button
              onClick={() => scrollToSection("user-accounts")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-accounts"
            >
              3. User Accounts
            </button>
            <button
              onClick={() => scrollToSection("coin-system")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-coins"
            >
              4. Coin System & Pricing
            </button>
            <button
              onClick={() => scrollToSection("payment-terms")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-payment"
            >
              5. Payment Terms
            </button>
            <button
              onClick={() => scrollToSection("user-content")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-content"
            >
              6. User Content & Data
            </button>
            <button
              onClick={() => scrollToSection("intellectual-property")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-ip"
            >
              7. Intellectual Property
            </button>
            <button
              onClick={() => scrollToSection("prohibited-use")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-prohibited"
            >
              8. Prohibited Use
            </button>
            <button
              onClick={() => scrollToSection("termination")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-termination"
            >
              9. Termination
            </button>
            <button
              onClick={() => scrollToSection("disclaimers")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-disclaimers"
            >
              10. Disclaimers & Limitations
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-contact"
            >
              11. Contact Information
            </button>
          </nav>
        </Card>

        <div className="lg:col-span-3 space-y-8">
          <section id="acceptance">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Drisya ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </div>
          </section>

          <Separator />

          <section id="service-description">
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Drisya is a professional AI-powered image enhancement platform designed for businesses and individuals who need to process product images at scale. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>AI-powered background removal</li>
                <li>Professional template-based image enhancement</li>
                <li>Bulk image processing capabilities</li>
                <li>High-quality output for e-commerce and marketing use</li>
                <li>Downloadable processed images in various formats</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
              </p>
            </div>
          </section>

          <Separator />

          <section id="user-accounts">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Responsibilities</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may not use another person's account without permission. We reserve the right to refuse service, terminate accounts, or remove or edit content at our sole discretion.
              </p>
            </div>
          </section>

          <Separator />

          <section id="coin-system">
            <h2 className="text-2xl font-semibold mb-4">4. Coin System & Pricing</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Drisya operates on a coin-based credit system:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Free Trial:</strong> New users receive 100 free coins upon registration as a welcome bonus</li>
                <li><strong>Coin Usage:</strong> Each image processing operation consumes a specific number of coins based on the template and settings used</li>
                <li><strong>Coin Packages:</strong> Additional coins can be purchased through our pricing packages</li>
                <li><strong>Non-Refundable:</strong> Coins are non-refundable once purchased, except as required by law</li>
                <li><strong>No Expiration:</strong> Purchased coins do not expire and remain in your account until used</li>
                <li><strong>Pricing Changes:</strong> We reserve the right to modify pricing and coin package offerings at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                The current pricing for coin packages is displayed in the Wallet section of your account and may be updated periodically.
              </p>
            </div>
          </section>

          <Separator />

          <section id="payment-terms">
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Payment for coin packages can be made through:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Online Payment:</strong> Credit/debit cards, UPI, and other supported payment methods</li>
                <li><strong>Manual Payment:</strong> Bank transfer or WhatsApp-based payment coordination with our team</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                All prices are listed in Indian Rupees (INR). You agree to pay all fees and applicable taxes incurred by you or anyone using your account. We reserve the right to change our prices at any time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For manual payments, coins will be credited to your account only after payment verification by our team. Processing time may vary from a few hours to 1-2 business days.
              </p>
            </div>
          </section>

          <Separator />

          <section id="user-content">
            <h2 className="text-2xl font-semibold mb-4">6. User Content & Data Usage</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to the images and content you upload to the Service. By uploading content, you grant Drisya:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>A limited license to process, store, and enhance your images as necessary to provide the Service</li>
                <li>The right to use uploaded images solely for the purpose of AI model improvement (images are anonymized and stripped of metadata)</li>
                <li>The right to display processed images in your account for download</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We will not sell, distribute, or publicly display your images without your explicit permission. Processed images are stored securely for 30 days and then permanently deleted from our servers.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for ensuring you have the right to upload and process all images you submit to the Service.
              </p>
            </div>
          </section>

          <Separator />

          <section id="intellectual-property">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by Drisya and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may not:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service without express written permission</li>
                <li>Reverse engineer or attempt to extract the source code of our AI models or algorithms</li>
                <li>Use our templates, branding, or technology for any commercial purpose outside of the Service</li>
                <li>Remove, alter, or obscure any copyright, trademark, or other proprietary rights notices</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section id="prohibited-use">
            <h2 className="text-2xl font-semibold mb-4">8. Prohibited Use</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Upload illegal, harmful, threatening, abusive, or objectionable content</li>
                <li>Process images containing copyrighted material without proper authorization</li>
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
                <li>Use the Service for any automated or bulk processing beyond reasonable use limits</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section id="termination">
            <h2 className="text-2xl font-semibold mb-4">9. Termination Policy</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Your right to use the Service will cease immediately</li>
                <li>You will lose access to your account, processed images, and any unused coins</li>
                <li>We will delete your data in accordance with our Privacy Policy</li>
                <li>No refunds will be provided for unused coins, except as required by law</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your account at any time by contacting our support team. Upon cancellation, unused coins will be forfeited.
              </p>
            </div>
          </section>

          <Separator />

          <section id="disclaimers">
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimers & Limitations of Liability</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We do not guarantee that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
                <li>The quality of any products, services, information, or other material purchased or obtained will meet your expectations</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Drisya be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </div>
          </section>

          <Separator />

          <section id="contact">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                <p className="text-muted-foreground"><strong>Email:</strong> legal@drisya.app</p>
                <p className="text-muted-foreground"><strong>Support:</strong> support@drisya.app</p>
                <p className="text-muted-foreground"><strong>WhatsApp:</strong> Available through your account settings</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service were last updated on {lastUpdated}. We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
