import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Users, Image, Settings as SettingsIcon } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("templates");

  const mockTemplates = [
    { id: "1", name: "Blue Gradient", category: "Minimal", uses: 1247, status: "active" },
    { id: "2", name: "White Studio", category: "Studio", uses: 892, status: "active" },
    { id: "3", name: "Wooden Table", category: "Natural", uses: 567, status: "active" },
    { id: "4", name: "Pink Pastel", category: "Colorful", uses: 234, status: "inactive" },
  ];

  const mockUsers = [
    { id: "1", username: "john.doe", email: "john@example.com", coins: 2500, processed: 3421 },
    { id: "2", username: "jane.smith", email: "jane@example.com", coins: 1200, processed: 892 },
    { id: "3", username: "bob.wilson", email: "bob@example.com", coins: 500, processed: 156 },
  ];

  return (
    <div className="space-y-8" data-testid="page-admin">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage templates, users, and platform settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" data-testid="tab-templates">
            <Image className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Template Management</h2>
            <Button data-testid="button-upload-template">
              <Upload className="w-4 h-4 mr-2" />
              Upload Template
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTemplates.map((template) => (
                  <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell className="font-mono">{template.uses}</TableCell>
                    <TableCell>
                      <Badge
                        variant={template.status === "active" ? "default" : "secondary"}
                      >
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-template-${template.id}`}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-delete-template-${template.id}`}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">User Management</h2>
            <Input
              type="search"
              placeholder="Search users..."
              className="max-w-xs"
              data-testid="input-search-users"
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-mono">{user.coins}</TableCell>
                    <TableCell className="font-mono">{user.processed}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-view-user-${user.id}`}>
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-lg font-semibold">Platform Settings</h2>

          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Cost Per Image (Coins)
                </label>
                <Input
                  type="number"
                  defaultValue="2"
                  className="max-w-xs"
                  data-testid="input-cost-per-image"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Welcome Bonus (Coins)
                </label>
                <Input
                  type="number"
                  defaultValue="100"
                  className="max-w-xs"
                  data-testid="input-welcome-bonus"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Max Images Per Batch
                </label>
                <Input
                  type="number"
                  defaultValue="1000"
                  className="max-w-xs"
                  data-testid="input-max-batch-size"
                />
              </div>

              <Button data-testid="button-save-settings">Save Settings</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
