import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  SiShopify,
  SiWoo,
  SiAmazon,
  SiGoogledrive,
  SiDropbox,
} from "react-icons/si";
import { ExternalLink, Check } from "lucide-react";

export default function Integrations() {
  const integrations = [
    {
      name: "Shopify",
      icon: SiShopify,
      description: "Sync product images directly to your Shopify store",
      status: "available",
      connected: false,
    },
    {
      name: "WooCommerce",
      icon: SiWoo,
      description: "Auto-upload processed images to WooCommerce products",
      status: "available",
      connected: false,
    },
    {
      name: "Amazon Seller Central",
      icon: SiAmazon,
      description: "Manage Amazon product photography at scale",
      status: "available",
      connected: false,
    },
    {
      name: "Google Drive",
      icon: SiGoogledrive,
      description: "Auto-save processed images to Google Drive",
      status: "connected",
      connected: true,
    },
    {
      name: "Dropbox",
      icon: SiDropbox,
      description: "Backup processed images to Dropbox",
      status: "available",
      connected: false,
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-integrations">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect Drisya with your favorite platforms and tools
        </p>
      </div>

      {/* Auto-save Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Auto-save Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically save processed images to connected platforms
            </p>
          </div>
          <Switch data-testid="switch-auto-save" />
        </div>
      </Card>

      {/* Available Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration, index) => (
          <Card key={index} className="p-6" data-testid={`integration-${index}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <integration.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{integration.name}</h3>
                    {integration.connected && (
                      <Badge variant="default" className="gap-1">
                        <Check className="w-3 h-3" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                </div>
              </div>
            </div>
            {integration.connected ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configure
                  </Button>
                  <Button variant="ghost" size="sm">
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="w-full" data-testid={`button-connect-${index}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect {integration.name}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Webhook Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Webhook Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Get notified when batch processing completes
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              placeholder="https://your-app.com/webhook"
              data-testid="input-webhook-url"
            />
          </div>
          <Button data-testid="button-save-webhook">Save Webhook</Button>
        </div>
      </Card>
    </div>
  );
}
