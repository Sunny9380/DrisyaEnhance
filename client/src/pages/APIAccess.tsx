import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function APIAccess() {
  const { toast } = useToast();

  const apiKeys = [
    {
      name: "Production Key",
      key: "drisya_prod_a1b2c3d4e5f6...",
      created: "2 weeks ago",
      lastUsed: "2 hours ago",
    },
    {
      name: "Development Key",
      key: "drisya_dev_x9y8z7w6v5u4...",
      created: "1 month ago",
      lastUsed: "Yesterday",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  return (
    <div className="space-y-8" data-testid="page-api-access">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Access</h1>
        <p className="text-muted-foreground">
          Integrate Drisya into your workflow with our REST API
        </p>
      </div>

      {/* API Keys */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">API Keys</h2>
          <Button data-testid="button-create-key">
            <Key className="w-4 h-4 mr-2" />
            Create New Key
          </Button>
        </div>
        <div className="space-y-3">
          {apiKeys.map((apiKey, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
              data-testid={`api-key-${index}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{apiKey.name}</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm font-mono text-muted-foreground mb-2">
                  {apiKey.key}
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Created {apiKey.created}</span>
                  <span>•</span>
                  <span>Last used {apiKey.lastUsed}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(apiKey.key)}
                  data-testid={`button-copy-key-${index}`}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* API Documentation */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="status">Check Status</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload images for processing
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.drisya.app/v1/process \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "template_id=template_123" \\
  -F "file=@product.jpg"

# Response
{
  "job_id": "job_abc123",
  "status": "queued",
  "images_count": 1
}`}</code>
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="status" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Check processing status
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl https://api.drisya.app/v1/jobs/job_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Response
{
  "job_id": "job_abc123",
  "status": "completed",
  "progress": 100,
  "images_processed": 1
}`}</code>
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="download" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Download processed images
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl https://api.drisya.app/v1/jobs/job_abc123/download \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o processed.zip`}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Rate Limits */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Rate Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Requests per minute</p>
            <p className="text-2xl font-bold">60</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Concurrent jobs</p>
            <p className="text-2xl font-bold">5</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Max file size</p>
            <p className="text-2xl font-bold">25 MB</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
