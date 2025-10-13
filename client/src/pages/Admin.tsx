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

interface CoinPackage {
  id: string;
  name: string;
  coinAmount: number;
  priceInINR: number;
  discount: number;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

function CoinPackagesTab() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    coinAmount: "",
    priceInINR: "",
    discount: "0",
    description: "",
    displayOrder: "0",
  });

  const { data: packagesData, isLoading } = useQuery<{ packages: CoinPackage[] }>({
    queryKey: ["/api/admin/coin-packages"],
  });

  const packages = packagesData?.packages || [];

  const createPackageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/coin-packages", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coin-packages"] });
      toast({ title: "✅ Package created successfully" });
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed to create package", description: error.message, variant: "destructive" });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/admin/coin-packages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coin-packages"] });
      toast({ title: "✅ Package updated successfully" });
      resetForm();
      setEditingPackage(null);
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed to update package", description: error.message, variant: "destructive" });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/coin-packages/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coin-packages"] });
      toast({ title: "✅ Package deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed to delete package", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      coinAmount: "",
      priceInINR: "",
      discount: "0",
      description: "",
      displayOrder: "0",
    });
  };

  const handleEdit = (pkg: CoinPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      coinAmount: pkg.coinAmount.toString(),
      priceInINR: pkg.priceInINR.toString(),
      discount: pkg.discount.toString(),
      description: pkg.description || "",
      displayOrder: pkg.displayOrder.toString(),
    });
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      coinAmount: parseInt(formData.coinAmount),
      priceInINR: parseInt(formData.priceInINR),
      discount: parseInt(formData.discount),
      description: formData.description || null,
      displayOrder: parseInt(formData.displayOrder),
      isActive: true,
    };

    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, data });
    } else {
      createPackageMutation.mutate(data);
    }
  };

  const toggleActive = (pkg: CoinPackage) => {
    updatePackageMutation.mutate({
      id: pkg.id,
      data: { isActive: !pkg.isActive },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Coin Package Pricing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define pricing packages for users to purchase coins
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-package">
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Coin Package</DialogTitle>
              <DialogDescription>Define a new pricing package for coin purchases</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input
                  placeholder="e.g., Starter Pack"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-package-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coin Amount</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.coinAmount}
                    onChange={(e) => setFormData({ ...formData, coinAmount: e.target.value })}
                    data-testid="input-coin-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={formData.priceInINR}
                    onChange={(e) => setFormData({ ...formData, priceInINR: e.target.value })}
                    data-testid="input-price"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    data-testid="input-discount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    data-testid="input-display-order"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="e.g., Best value for regular users"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-description"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createPackageMutation.isPending}>
                {createPackageMutation.isPending ? "Creating..." : "Create Package"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">Loading packages...</Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id} data-testid={`row-package-${pkg.id}`}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{pkg.name}</div>
                      {pkg.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{pkg.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="font-mono">{pkg.coinAmount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">₹{pkg.priceInINR}</TableCell>
                  <TableCell>
                    {pkg.discount > 0 ? (
                      <Badge variant="secondary">{pkg.discount}% off</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(pkg)}
                        disabled={updatePackageMutation.isPending}
                        data-testid={`button-toggle-${pkg.id}`}
                      >
                        {pkg.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Dialog open={editingPackage?.id === pkg.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingPackage(null);
                          resetForm();
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pkg)}
                            data-testid={`button-edit-${pkg.id}`}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Coin Package</DialogTitle>
                            <DialogDescription>Update package pricing and details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Package Name</Label>
                              <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Coin Amount</Label>
                                <Input
                                  type="number"
                                  value={formData.coinAmount}
                                  onChange={(e) => setFormData({ ...formData, coinAmount: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={formData.priceInINR}
                                  onChange={(e) => setFormData({ ...formData, priceInINR: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input
                                  type="number"
                                  value={formData.discount}
                                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input
                                  type="number"
                                  value={formData.displayOrder}
                                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              />
                            </div>
                            <Button onClick={handleSubmit} className="w-full" disabled={updatePackageMutation.isPending}>
                              {updatePackageMutation.isPending ? "Updating..." : "Update Package"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete package "${pkg.name}"?`)) {
                            deletePackageMutation.mutate(pkg.id);
                          }
                        }}
                        disabled={deletePackageMutation.isPending}
                        data-testid={`button-delete-${pkg.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
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

  // Fetch templates from database
  const { data: templatesData } = useQuery<{ templates: any[] }>({
    queryKey: ["/api/templates"],
  });

  const templates = templatesData?.templates || [];

  return (
    <div className="space-y-8" data-testid="page-admin">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, add coins via WhatsApp/phone contact, and templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            User Coins (WhatsApp)
          </TabsTrigger>
          <TabsTrigger value="packages" data-testid="tab-packages">
            <Coins className="w-4 h-4 mr-2" />
            Coin Packages
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

        <TabsContent value="packages" className="space-y-4">
          <CoinPackagesTab />
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
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell className="font-mono">—</TableCell>
                      <TableCell>
                        <Badge
                          variant={template.isActive ? "default" : "secondary"}
                        >
                          {template.isActive ? 'active' : 'inactive'}
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
                  ))
                )}
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
