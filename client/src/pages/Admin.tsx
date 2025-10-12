import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Users, Image, Settings as SettingsIcon, Phone, Coins, Plus } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  coinBalance: number;
  role: string;
  createdAt: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all users
  const { data: usersData, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  const users = usersData?.users || [];

  // Add coins mutation
  const addCoinsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/add-coins`, {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "✅ Coins added successfully",
        description: "User balance has been updated",
      });
      setCoinAmount("");
      setDescription("");
      setSelectedUser(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to add coins",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCoins = () => {
    if (!selectedUser) return;
    const amount = parseInt(coinAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid coin amount",
        variant: "destructive",
      });
      return;
    }

    addCoinsMutation.mutate({
      userId: selectedUser.id,
      amount,
      description: description || `Admin added ${amount} coins via WhatsApp/Phone`,
    });
  };

  const mockTemplates = [
    { id: "1", name: "Blue Gradient", category: "Minimal", uses: 1247, status: "active" },
    { id: "2", name: "White Studio", category: "Studio", uses: 892, status: "active" },
    { id: "3", name: "Wooden Table", category: "Natural", uses: 567, status: "active" },
    { id: "4", name: "Pink Pastel", category: "Colorful", uses: 234, status: "inactive" },
  ];

  return (
    <div className="space-y-8" data-testid="page-admin">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, add coins via WhatsApp/phone contact, and templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            User Coins (WhatsApp)
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <Image className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">User Coin Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add coins to users after WhatsApp/phone payment confirmation
              </p>
            </div>
          </div>

          {isLoading ? (
            <Card className="p-8 text-center">Loading users...</Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone/WhatsApp</TableHead>
                    <TableHead>Coin Balance</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.name || "—"}</TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-sm">{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-yellow-600" />
                          <span className="font-mono">{user.coinBalance}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) {
                            setSelectedUser(null);
                            setCoinAmount("");
                            setDescription("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDialogOpen(true);
                              }}
                              data-testid={`button-add-coins-${user.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Coins
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Coins to User</DialogTitle>
                              <DialogDescription>
                                Add coins after WhatsApp/phone payment confirmation
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="font-medium">{user.email}</div>
                                {user.phone && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground mt-1">
                                  Current balance: {user.coinBalance} coins
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="coin-amount">Coin Amount</Label>
                                <Input
                                  id="coin-amount"
                                  type="number"
                                  placeholder="Enter coin amount"
                                  value={coinAmount}
                                  onChange={(e) => setCoinAmount(e.target.value)}
                                  data-testid="input-coin-amount"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Input
                                  id="description"
                                  placeholder="e.g., WhatsApp payment received"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  data-testid="input-coin-description"
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={handleAddCoins}
                                  disabled={addCoinsMutation.isPending}
                                  className="flex-1"
                                  data-testid="button-confirm-add-coins"
                                >
                                  {addCoinsMutation.isPending ? "Adding..." : "Add Coins"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDialogOpen(false)}
                                  data-testid="button-cancel-add-coins"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

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
