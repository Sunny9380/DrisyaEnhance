import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Download, Cookie, Settings } from "lucide-react";

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
        <p className="text-muted-foreground" data-testid="text-last-updated">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <button
              onClick={() => scrollToSection("introduction")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-intro"
            >
              1. Introduction
            </button>
            <button
              onClick={() => scrollToSection("data-collection")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-collection"
            >
              2. Data We Collect
            </button>
            <button
              onClick={() => scrollToSection("data-usage")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-usage"
            >
              3. How We Use Data
            </button>
            <button
              onClick={() => scrollToSection("data-storage")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-storage"
            >
              4. Data Storage & Security
            </button>
            <button
              onClick={() => scrollToSection("user-rights")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-rights"
            >
              5. Your Rights (GDPR)
            </button>
            <button
              onClick={() => scrollToSection("cookies")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-cookies"
            >
              6. Cookies Policy
            </button>
            <button
              onClick={() => scrollToSection("third-party")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-third-party"
            >
              7. Third-Party Services
            </button>
            <button
              onClick={() => scrollToSection("data-retention")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-retention"
            >
              8. Data Retention
            </button>
            <button
              onClick={() => scrollToSection("children")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-children"
            >
              9. Children's Privacy
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full"
              data-testid="link-toc-contact"
            >
              10. Contact Us
            </button>
          </nav>
        </Card>

        <div className="lg:col-span-3 space-y-8">
          <section id="introduction">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              1. Introduction
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                At Drisya, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our AI-powered image enhancement platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using Drisya, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </div>
          </section>

          <Separator />

          <section id="data-collection">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              2. What Data We Collect
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <h3 className="text-lg font-semibold mt-6 mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Account Information:</strong> Email address, name, password (encrypted)</li>
                <li><strong>Contact Information:</strong> Phone number (optional, for WhatsApp support)</li>
                <li><strong>Profile Data:</strong> Avatar/profile picture (optional)</li>
                <li><strong>Payment Information:</strong> Transaction details, payment method (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect information about your interaction with our Service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Processing History:</strong> Images uploaded, templates used, processing jobs, coins consumed</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
                <li><strong>Analytics Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Security Logs:</strong> Login attempts, IP addresses, session information</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">Image Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you upload images for processing:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Original Images:</strong> Temporarily stored for processing</li>
                <li><strong>Processed Images:</strong> Enhanced outputs stored for download</li>
                <li><strong>Image Metadata:</strong> File name, size, format, upload timestamp</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section id="data-usage">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              3. How We Use Your Data
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We use the collected data for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Service Delivery:</strong> To process your images, apply AI enhancements, and deliver results</li>
                <li><strong>Account Management:</strong> To create and manage your account, track coin balance, process payments</li>
                <li><strong>Communication:</strong> To send transactional emails (job completion, payment confirmation), service updates, and support responses</li>
                <li><strong>Security:</strong> To monitor for fraudulent activity, prevent unauthorized access, ensure platform security</li>
                <li><strong>Improvement:</strong> To analyze usage patterns, improve AI models, enhance user experience (anonymized data only)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations, resolve disputes, enforce our terms</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do <strong>NOT</strong> sell your personal data to third parties or use your images for marketing without explicit consent.
              </p>
            </div>
          </section>

          <Separator />

          <section id="data-storage">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              4. Data Storage & Security
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <h3 className="text-lg font-semibold mt-6 mb-3">Security Measures</h3>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
                <li><strong>Password Protection:</strong> Passwords are hashed using bcrypt with salt</li>
                <li><strong>Secure Storage:</strong> Data is stored on secure servers with restricted access</li>
                <li><strong>Regular Backups:</strong> Automatic backups to prevent data loss</li>
                <li><strong>Access Controls:</strong> Role-based access control for team members</li>
                <li><strong>Security Audits:</strong> Regular security assessments and updates</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">Data Location</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data is stored on secure cloud infrastructure. We use reputable cloud service providers with data centers located in compliance with applicable data protection laws.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Image Storage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Uploaded and processed images are stored temporarily:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Original Images:</strong> Deleted after processing is complete</li>
                <li><strong>Processed Images:</strong> Available for download for 30 days, then permanently deleted</li>
                <li><strong>User-Initiated Deletion:</strong> You can request immediate deletion at any time</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section id="user-rights">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              5. Your Rights (GDPR Compliance)
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Under GDPR and other data protection regulations, you have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Right to Access:</strong> Request a copy of your personal data we hold</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise any of these rights, please contact us at <strong>privacy@drisya.app</strong>. We will respond to your request within 30 days.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You also have the right to lodge a complaint with a supervisory authority if you believe your data protection rights have been violated.
              </p>
            </div>
          </section>

          <Separator />

          <section id="cookies">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              6. Cookies Policy
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Drisya uses cookies and similar tracking technologies to enhance your experience:
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Types of Cookies We Use</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for authentication, security, and core functionality (e.g., session cookies)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings, theme preferences, language choices</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform (anonymized)</li>
                <li><strong>Security Cookies:</strong> Detect fraud, prevent unauthorized access, protect user accounts</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">Managing Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of the Service. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies from being set</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section id="third-party">
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We may share your data with trusted third-party service providers who assist in operating our platform:
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Service Providers</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Payment Processors:</strong> For secure payment processing (they have their own privacy policies)</li>
                <li><strong>Cloud Hosting:</strong> For data storage and server infrastructure</li>
                <li><strong>Email Service:</strong> For transactional and notification emails</li>
                <li><strong>Analytics Tools:</strong> For understanding platform usage (anonymized data)</li>
                <li><strong>AI/ML Infrastructure:</strong> For image processing and enhancement</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                These third parties are contractually obligated to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use your data only for the specific services they provide to us</li>
                <li>Implement appropriate security measures</li>
                <li>Not sell or share your data with others</li>
                <li>Comply with applicable data protection laws</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>
            </div>
          </section>

          <Separator />

          <section id="data-retention">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We retain your data only as long as necessary to provide the Service and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active, deleted within 90 days of account closure</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for accounting and legal compliance</li>
                <li><strong>Original Images:</strong> Deleted immediately after processing completion</li>
                <li><strong>Processed Images:</strong> Retained for 30 days for download, then permanently deleted</li>
                <li><strong>Security Logs:</strong> Retained for 1 year for security and fraud prevention</li>
                <li><strong>Analytics Data:</strong> Anonymized and retained indefinitely for platform improvement</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can request early deletion of your data at any time by contacting our privacy team.
              </p>
            </div>
          </section>

          <Separator />

          <section id="children">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Drisya is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If we become aware that we have collected personal data from a child under 18 without parental consent, we will take steps to delete that information as quickly as possible.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <strong>privacy@drisya.app</strong>.
              </p>
            </div>
          </section>

          <Separator />

          <section id="contact">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us for Privacy Concerns</h2>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                <p className="text-muted-foreground"><strong>Privacy Team:</strong> privacy@drisya.app</p>
                <p className="text-muted-foreground"><strong>Data Protection Officer:</strong> dpo@drisya.app</p>
                <p className="text-muted-foreground"><strong>General Support:</strong> support@drisya.app</p>
                <p className="text-muted-foreground"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy was last updated on {lastUpdated}. We may update this policy periodically to reflect changes in our practices or legal requirements. We will notify you of any material changes via email or prominent notice on our platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of Drisya after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
