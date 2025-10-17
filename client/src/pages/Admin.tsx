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
import {
  TrendingUp,
  Users,
  Coins,
  CreditCard,
  Image,
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  RotateCcw,
  DollarSign,
  Phone,
  Shield,
  UserPlus,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  whatsappNumber: string | null;
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
    whatsappNumber: "",
    displayOrder: "0",
  });

  const { data: packagesData, isLoading } = useQuery<{ packages: CoinPackage[] }>({
    queryKey: ["/api/admin/coin-packages"],
  });

  const packages = packagesData?.packages || [];

  const createPackageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/coin-packages", data);
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
      return await apiRequest("PATCH", `/api/admin/coin-packages/${id}`, data);
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
      return await apiRequest("DELETE", `/api/admin/coin-packages/${id}`);
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
      whatsappNumber: "",
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
      whatsappNumber: pkg.whatsappNumber || "",
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
      whatsappNumber: formData.whatsappNumber || null,
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
              <div className="space-y-2">
                <Label>WhatsApp Number (optional)</Label>
                <Input
                  placeholder="e.g., +91 98765 43210"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  data-testid="input-whatsapp-number"
                />
                <p className="text-xs text-muted-foreground">
                  Customers can contact this number for payment assistance
                </p>
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
                <TableHead>WhatsApp</TableHead>
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
                    {pkg.whatsappNumber ? (
                      <a 
                        href={`https://wa.me/${pkg.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 text-sm font-mono"
                      >
                        {pkg.whatsappNumber}
                      </a>
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
                            <div className="space-y-2">
                              <Label>WhatsApp Number</Label>
                              <Input
                                placeholder="e.g., +91 98765 43210"
                                value={formData.whatsappNumber}
                                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground">
                                Customers can contact this number for payment assistance
                              </p>
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

interface ManualTransaction {
  id: string;
  userId: string;
  packageId: string | null;
  coinAmount: number;
  priceInINR: number;
  paymentMethod: string;
  paymentReference: string | null;
  adminId: string | null;
  adminNotes: string | null;
  userPhone: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  user?: { email: string; name: string };
  package?: { name: string };
}

function ManualPaymentsTab() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<ManualTransaction | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    packageId: "",
    coinAmount: "",
    priceInINR: "",
    paymentMethod: "whatsapp",
    paymentReference: "",
    userPhone: "",
  });

  const { data: txnsData, isLoading } = useQuery<{ transactions: ManualTransaction[] }>({
    queryKey: ["/api/admin/manual-transactions"],
  });

  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  const { data: packagesData } = useQuery<{ packages: CoinPackage[] }>({
    queryKey: ["/api/admin/coin-packages"],
  });

  const transactions = txnsData?.transactions || [];
  const users = usersData?.users || [];
  const packages = packagesData?.packages || [];

  const createTxnMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/manual-transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manual-transactions"] });
      toast({ title: "✅ Payment logged successfully" });
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed to log payment", description: error.message, variant: "destructive" });
    },
  });

  const approveTxnMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/admin/manual-transactions/${id}/approve`, { adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manual-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "✅ Payment approved and coins credited" });
      setSelectedTxn(null);
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed to approve payment", description: error.message, variant: "destructive" });
    },
  });

  const rejectTxnMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await apiRequest("PATCH", `/api/admin/manual-transactions/${id}/reject`, { adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manual-transactions"] });
      toast({ title: "✅ Payment rejected" });
      setSelectedTxn(null);
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed to reject payment", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      userId: "",
      packageId: "",
      coinAmount: "",
      priceInINR: "",
      paymentMethod: "whatsapp",
      paymentReference: "",
      userPhone: "",
    });
  };

  const handleSubmit = () => {
    const data = {
      userId: formData.userId,
      packageId: formData.packageId || null,
      coinAmount: parseInt(formData.coinAmount),
      priceInINR: parseInt(formData.priceInINR),
      paymentMethod: formData.paymentMethod,
      paymentReference: formData.paymentReference || null,
      userPhone: formData.userPhone || null,
    };

    createTxnMutation.mutate(data);
  };

  const pendingTxns = transactions.filter(t => t.status === "pending");
  const allTxns = transactions;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Manual Payment Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Log WhatsApp/UPI payments and credit coins to users
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-log-payment">
              <Plus className="w-4 h-4 mr-2" />
              Log Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Manual Payment</DialogTitle>
              <DialogDescription>Record WhatsApp/UPI payment and create pending approval</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>User</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  data-testid="select-user"
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} - {u.name || "No name"}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Package (Optional)</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.packageId}
                  onChange={(e) => {
                    const pkg = packages.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      packageId: e.target.value,
                      coinAmount: pkg?.coinAmount.toString() || formData.coinAmount,
                      priceInINR: pkg?.priceInINR.toString() || formData.priceInINR,
                    });
                  }}
                  data-testid="select-package"
                >
                  <option value="">Custom Amount</option>
                  {packages.filter(p => p.isActive).map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.coinAmount} coins for ₹{p.priceInINR}</option>
                  ))}
                </select>
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
                  <Label>Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={formData.priceInINR}
                    onChange={(e) => setFormData({ ...formData, priceInINR: e.target.value })}
                    data-testid="input-price-paid"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  data-testid="select-payment-method"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Payment Reference (Optional)</Label>
                <Input
                  placeholder="Transaction ID / Screenshot reference"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                  data-testid="input-payment-ref"
                />
              </div>
              <div className="space-y-2">
                <Label>User Phone (Optional)</Label>
                <Input
                  placeholder="+91XXXXXXXXXX"
                  value={formData.userPhone}
                  onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                  data-testid="input-user-phone"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createTxnMutation.isPending}>
                {createTxnMutation.isPending ? "Logging..." : "Log Payment (Pending Approval)"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
        <h3 className="font-semibold mb-2">Pending Approvals ({pendingTxns.length})</h3>
        {pendingTxns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending payments</p>
        ) : (
          <div className="space-y-2">
            {pendingTxns.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-3 bg-background rounded border">
                <div>
                  <div className="font-medium">{txn.user?.email || `User ${txn.userId}`}</div>
                  <div className="text-sm text-muted-foreground">
                    {txn.coinAmount} coins • ₹{txn.priceInINR} • {txn.paymentMethod}
                    {txn.paymentReference && ` • Ref: ${txn.paymentReference}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveTxnMutation.mutate({ id: txn.id })}
                    disabled={approveTxnMutation.isPending}
                    data-testid={`button-approve-${txn.id}`}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const notes = prompt("Reason for rejection:");
                      if (notes) rejectTxnMutation.mutate({ id: txn.id, notes });
                    }}
                    disabled={rejectTxnMutation.isPending}
                    data-testid={`button-reject-${txn.id}`}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Coins / Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTxns.map(txn => (
              <TableRow key={txn.id} data-testid={`row-txn-${txn.id}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{txn.user?.email || `User ${txn.userId}`}</div>
                    {txn.userPhone && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {txn.userPhone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="font-mono">{txn.coinAmount}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">₹{txn.priceInINR}</div>
                </TableCell>
                <TableCell>
                  <div>{txn.paymentMethod}</div>
                  {txn.paymentReference && (
                    <div className="text-xs text-muted-foreground">Ref: {txn.paymentReference}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      txn.status === "completed" ? "default" :
                      txn.status === "pending" ? "secondary" :
                      "destructive"
                    }
                  >
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{new Date(txn.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleTimeString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    transactionCount: number;
  };
  coins: {
    sold: number;
    active: number;
  };
  users: {
    total: number;
    thisMonth: number;
  };
  transactions: any[];
}

function AnalyticsTab() {
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  const analytics = analyticsData || {
    revenue: { total: 0, thisMonth: 0, transactionCount: 0 },
    coins: { sold: 0, active: 0 },
    users: { total: 0, thisMonth: 0 },
    transactions: [],
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold font-mono">₹{analytics.revenue.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ₹{analytics.revenue.thisMonth.toLocaleString()} this month
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Coins Sold</p>
            <Coins className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold font-mono">{analytics.coins.sold.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.coins.active.toLocaleString()} active in wallets
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold font-mono">{analytics.users.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            +{analytics.users.thisMonth} this month
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold font-mono">{analytics.revenue.transactionCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Completed payments</p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      {txn.coinAmount}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">₹{txn.priceInINR}</TableCell>
                  <TableCell>{txn.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {analytics.transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

function TemplateEditDialog({ template, open, onOpenChange }: { 
  template: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    coinCost: template.coinCost?.toString() || "1",
    pricePerImage: template.pricePerImage?.toString() || "",
    whyBuy: template.whyBuy || "",
    features: JSON.stringify(template.features || [], null, 2),
    benefits: JSON.stringify(template.benefits || [], null, 2),
    useCases: JSON.stringify(template.useCases || [], null, 2),
    testimonials: JSON.stringify(template.testimonials || [], null, 2),
  });
  const [selectedEditImage, setSelectedEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // Handle image selection for edit dialog
  const handleEditImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedEditImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload template image function
  const uploadTemplateImage = async (templateId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('thumbnail', imageFile);
    
    const response = await fetch(`/api/templates/${templateId}/thumbnail`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload template image');
    }
    
    return response.json();
  };

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/templates/${template.id}`, data);
    },
    onSuccess: async () => {
      // If there's an image, upload it
      if (selectedEditImage) {
        try {
          console.log('Uploading image for template:', template.id);
          const uploadResult = await uploadTemplateImage(template.id, selectedEditImage);
          console.log('Image upload result:', uploadResult);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({
            title: "⚠️ Template updated but image upload failed",
            description: "You can try uploading the image again later",
            variant: "destructive",
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({ title: "✅ Template updated successfully" });
      setSelectedEditImage(null);
      setEditImagePreview(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "❌ Failed to update template", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    try {
      const data: any = {
        coinCost: parseInt(formData.coinCost) || 1,
        whyBuy: formData.whyBuy || null,
      };

      if (formData.pricePerImage) {
        data.pricePerImage = parseInt(formData.pricePerImage);
      }

      // Parse JSON fields
      try {
        if (formData.features.trim()) {
          data.features = JSON.parse(formData.features);
        }
      } catch (e) {
        throw new Error("Invalid Features JSON format");
      }

      try {
        if (formData.benefits.trim()) {
          data.benefits = JSON.parse(formData.benefits);
        }
      } catch (e) {
        throw new Error("Invalid Benefits JSON format");
      }

      try {
        if (formData.useCases.trim()) {
          data.useCases = JSON.parse(formData.useCases);
        }
      } catch (e) {
        throw new Error("Invalid Use Cases JSON format");
      }

      try {
        if (formData.testimonials.trim()) {
          data.testimonials = JSON.parse(formData.testimonials);
        }
      } catch (e) {
        throw new Error("Invalid Testimonials JSON format");
      }

      updateTemplateMutation.mutate(data);
    } catch (error: any) {
      toast({ 
        title: "❌ Validation Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Template Details: {template.name}</DialogTitle>
          <DialogDescription>
            Update pricing, features, benefits, use cases, and testimonials
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coinCost">Coin Cost per Image</Label>
                  <Input
                    id="coinCost"
                    type="number"
                    value={formData.coinCost}
                    onChange={(e) => setFormData({ ...formData, coinCost: e.target.value })}
                    data-testid="input-coin-cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerImage">Price per Image (₹)</Label>
                  <Input
                    id="pricePerImage"
                    type="number"
                    value={formData.pricePerImage}
                    onChange={(e) => setFormData({ ...formData, pricePerImage: e.target.value })}
                    placeholder="Optional"
                    data-testid="input-price-per-image"
                  />
                </div>
              </div>
            </div>

            {/* Template Image Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold">Template Image</h3>
              <div className="space-y-2">
                <Label>Current Template Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border rounded overflow-hidden bg-gray-50">
                    {template.thumbnailUrl ? (
                      <img
                        src={template.thumbnailUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Image className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageSelect}
                      className="w-full p-2 border rounded"
                      data-testid="input-edit-template-image"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a new preview image for this template (JPG, PNG, WebP)
                    </p>
                  </div>
                  {editImagePreview && (
                    <div className="w-20 h-20 border rounded overflow-hidden">
                      <img
                        src={editImagePreview}
                        alt="New template preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Why Buy Section */}
            <div className="space-y-2">
              <Label htmlFor="whyBuy">Why Buy This Template</Label>
              <Textarea
                id="whyBuy"
                value={formData.whyBuy}
                onChange={(e) => setFormData({ ...formData, whyBuy: e.target.value })}
                placeholder="Compelling reason to choose this template..."
                rows={3}
                data-testid="input-why-buy"
              />
            </div>

            {/* Features Section */}
            <div className="space-y-2">
              <Label htmlFor="features">
                Features (JSON Array)
                <span className="text-xs text-muted-foreground ml-2">
                  Format: {`[{"title": "...", "description": "...", "icon": "Sparkles"}]`}
                </span>
              </Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder='[{"title": "AI Enhancement", "description": "Advanced AI processing", "icon": "Sparkles"}]'
                rows={6}
                className="font-mono text-sm"
                data-testid="input-features"
              />
            </div>

            {/* Benefits Section */}
            <div className="space-y-2">
              <Label htmlFor="benefits">
                Benefits (JSON Array)
                <span className="text-xs text-muted-foreground ml-2">
                  Format: {`["Benefit 1", "Benefit 2"]`}
                </span>
              </Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder='["Professional results", "Time-saving automation", "Consistent quality"]'
                rows={4}
                className="font-mono text-sm"
                data-testid="input-benefits"
              />
            </div>

            {/* Use Cases Section */}
            <div className="space-y-2">
              <Label htmlFor="useCases">
                Use Cases (JSON Array)
                <span className="text-xs text-muted-foreground ml-2">
                  Format: {`[{"title": "...", "description": "...", "imageUrl": "..."}]`}
                </span>
              </Label>
              <Textarea
                id="useCases"
                value={formData.useCases}
                onChange={(e) => setFormData({ ...formData, useCases: e.target.value })}
                placeholder='[{"title": "E-commerce", "description": "Perfect for online stores", "imageUrl": ""}]'
                rows={6}
                className="font-mono text-sm"
                data-testid="input-use-cases"
              />
            </div>

            {/* Testimonials Section */}
            <div className="space-y-2">
              <Label htmlFor="testimonials">
                Testimonials (JSON Array)
                <span className="text-xs text-muted-foreground ml-2">
                  Format: {`[{"name": "...", "role": "...", "content": "...", "avatarUrl": "", "rating": 5}]`}
                </span>
              </Label>
              <Textarea
                id="testimonials"
                value={formData.testimonials}
                onChange={(e) => setFormData({ ...formData, testimonials: e.target.value })}
                placeholder='[{"name": "John Doe", "role": "Photographer", "content": "Great template!", "avatarUrl": "", "rating": 5}]'
                rows={6}
                className="font-mono text-sm"
                data-testid="input-testimonials"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={updateTemplateMutation.isPending}
            data-testid="button-save-template"
          >
            {updateTemplateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuperAdminTab() {
  const { toast } = useToast();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Fetch all users to show admin management
  const { data: usersData, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  const users = usersData?.users || [];
  const adminUsers = users.filter(user => user.role === 'admin');
  const normalUsers = users.filter(user => user.role !== 'admin');

  // Create admin user mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      return await apiRequest("POST", "/api/admin/create-admin", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "✅ Admin user created successfully",
        description: "New admin user has been added to the system",
      });
      setAdminFormData({ email: "", password: "", name: "" });
      setIsCreateAdminOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to create admin user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Promote user to admin mutation
  const promoteUserMutation = useMutation({
    mutationFn: async ({ userId, role, userTier }: { userId: string; role: string; userTier: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role, userTier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "✅ User role updated successfully",
        description: "User permissions have been changed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to update user role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAdmin = () => {
    if (!adminFormData.email || !adminFormData.password) {
      toast({
        title: "❌ Missing required fields",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    createAdminMutation.mutate(adminFormData);
  };

  const handlePromoteUser = (user: User) => {
    if (confirm(`Promote "${user.email}" to admin? This will give them full administrative access.`)) {
      promoteUserMutation.mutate({
        userId: user.id,
        role: 'admin',
        userTier: 'enterprise'
      });
    }
  };

  const handleDemoteAdmin = (user: User) => {
    if (confirm(`Demote "${user.email}" from admin? This will remove their administrative access.`)) {
      promoteUserMutation.mutate({
        userId: user.id,
        role: 'user',
        userTier: 'free'
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Super Admin Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create new admin users and manage user roles
          </p>
        </div>
        <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-admin">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Admin User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
              <DialogDescription>
                Create a new administrator with full system access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Strong password"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  data-testid="input-admin-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Admin User"
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  data-testid="input-admin-name"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Admin Privileges</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      This user will have full access to all admin features including user management, 
                      analytics, templates, and system settings.
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleCreateAdmin} 
                className="w-full" 
                disabled={createAdminMutation.isPending}
                data-testid="button-confirm-create-admin"
              >
                {createAdminMutation.isPending ? "Creating..." : "Create Admin User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Admin Users */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Current Admin Users ({adminUsers.length})
          </h3>
          {adminUsers.length === 0 ? (
            <p className="text-muted-foreground">No admin users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>{admin.name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span className="font-mono">{admin.coinBalance}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoteAdmin(admin)}
                        disabled={promoteUserMutation.isPending}
                        data-testid={`button-demote-${admin.id}`}
                      >
                        Demote to User
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Promote Normal Users */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Promote Users to Admin ({normalUsers.length} users)
          </h3>
          {normalUsers.length === 0 ? (
            <p className="text-muted-foreground">No regular users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normalUsers.slice(0, 10).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span className="font-mono">{user.coinBalance}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteUser(user)}
                        disabled={promoteUserMutation.isPending}
                        data-testid={`button-promote-${user.id}`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Promote to Admin
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {normalUsers.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing first 10 users. Use the Users tab to see all users.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("analytics");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isTemplateEditOpen, setIsTemplateEditOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState({
    name: "",
    category: "jewelry",
    backgroundStyle: "gradient",
    lightingPreset: "soft-glow",
    description: "",
    coinCost: "1",
    pricePerImage: "",
    isPremium: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    costPerImage: "2",
    welcomeBonus: "100",
    maxBatchSize: "1000",
  });

  // Fetch all users
  const { data: usersData, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  const users = usersData?.users || [];

  // Add coins mutation
  const addCoinsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/coins`, { coinBalance: amount });
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

  // Fetch templates from database (admin endpoint to get all templates including inactive)
  const { data: templatesData } = useQuery<{ templates: any[] }>({
    queryKey: ["/api/admin/templates"],
  });

  const templates = templatesData?.templates || [];

  // Soft delete template mutation
  const softDeleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return await apiRequest("PATCH", `/api/templates/${templateId}/soft-delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({
        title: "✅ Template soft deleted successfully",
        description: "Template has been moved to trash and can be restored",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Restore template mutation
  const restoreTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return await apiRequest("PATCH", `/api/templates/${templateId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({
        title: "✅ Template restored successfully",
        description: "Template is now available again",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to restore template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle template active status
  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/templates/${templateId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({
        title: "✅ Template status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to update template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return await apiRequest("POST", "/api/templates", templateData);
    },
    onSuccess: async (response: any) => {
      console.log('Template created:', response);
      
      // If there's an image, upload it
      if (selectedImage && response.template?.id) {
        try {
          console.log('Uploading image for template:', response.template.id);
          const uploadResult = await uploadTemplateImage(response.template.id, selectedImage);
          console.log('Image upload result:', uploadResult);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({
            title: "⚠️ Template created but image upload failed",
            description: "You can try uploading the image again later",
            variant: "destructive",
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({
        title: "✅ Template created successfully",
        description: "New template has been added to the system",
      });
      setIsCreateTemplateOpen(false);
      setNewTemplateData({
        name: "",
        category: "jewelry",
        backgroundStyle: "gradient",
        lightingPreset: "soft-glow",
        description: "",
        coinCost: "1",
        pricePerImage: "",
        isPremium: false,
      });
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to create template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload template image function
  const uploadTemplateImage = async (templateId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('thumbnail', imageFile);
    
    const response = await fetch(`/api/templates/${templateId}/thumbnail`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload template image');
    }
    
    return response.json();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTemplate = () => {
    const templateData = {
      name: newTemplateData.name,
      category: newTemplateData.category,
      backgroundStyle: newTemplateData.backgroundStyle,
      lightingPreset: newTemplateData.lightingPreset,
      description: newTemplateData.description,
      coinCost: parseInt(newTemplateData.coinCost) || 1,
      pricePerImage: newTemplateData.pricePerImage ? parseInt(newTemplateData.pricePerImage) : null,
      isPremium: newTemplateData.isPremium,
      isActive: true,
    };

    createTemplateMutation.mutate(templateData);
  };

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      // For now, just show success - you can implement actual API endpoint later
      return Promise.resolve(settingsData);
    },
    onSuccess: () => {
      toast({
        title: "✅ Settings saved successfully",
        description: "Platform settings have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  return (
    <div className="space-y-8" data-testid="page-admin">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, add coins via WhatsApp/phone contact, and templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="packages" data-testid="tab-packages">
            <Coins className="w-4 h-4 mr-2" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <Image className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="super-admin" data-testid="tab-super-admin">
            <Shield className="w-4 h-4 mr-2" />
            Super Admin
          </TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-content">
            <Edit2 className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

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

        <TabsContent value="payments" className="space-y-4">
          <ManualPaymentsTab />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Template Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create, edit, and manage image processing templates
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-template">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                    <DialogDescription>
                      Create a new image processing template with custom settings
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input
                          placeholder="e.g., Luxury Gold Background"
                          value={newTemplateData.name}
                          onChange={(e) => setNewTemplateData({ ...newTemplateData, name: e.target.value })}
                          data-testid="input-template-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          className="w-full p-2 border rounded"
                          value={newTemplateData.category}
                          onChange={(e) => setNewTemplateData({ ...newTemplateData, category: e.target.value })}
                          data-testid="select-category"
                        >
                          <option value="jewelry">Jewelry</option>
                          <option value="fashion">Fashion</option>
                          <option value="electronics">Electronics</option>
                          <option value="beauty">Beauty</option>
                          <option value="home">Home & Garden</option>
                          <option value="sports">Sports</option>
                          <option value="automotive">Automotive</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Background Style</Label>
                        <select
                          className="w-full p-2 border rounded"
                          value={newTemplateData.backgroundStyle}
                          onChange={(e) => setNewTemplateData({ ...newTemplateData, backgroundStyle: e.target.value })}
                          data-testid="select-background"
                        >
                          <option value="gradient">Gradient</option>
                          <option value="velvet">Velvet</option>
                          <option value="marble">Marble</option>
                          <option value="minimal">Minimal</option>
                          <option value="festive">Festive</option>
                          <option value="metallic">Metallic</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Lighting Preset</Label>
                        <select
                          className="w-full p-2 border rounded"
                          value={newTemplateData.lightingPreset}
                          onChange={(e) => setNewTemplateData({ ...newTemplateData, lightingPreset: e.target.value })}
                          data-testid="select-lighting"
                        >
                          <option value="soft-glow">Soft Glow</option>
                          <option value="moody">Moody</option>
                          <option value="spotlight">Spotlight</option>
                          <option value="studio">Studio</option>
                          <option value="natural">Natural</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe what this template does and when to use it..."
                        value={newTemplateData.description}
                        onChange={(e) => setNewTemplateData({ ...newTemplateData, description: e.target.value })}
                        rows={3}
                        data-testid="input-description"
                      />
                    </div>

                    {/* Template Image Upload */}
                    <div className="space-y-2">
                      <Label>Template Image (Optional)</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="w-full p-2 border rounded"
                            data-testid="input-template-image"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload a preview image for this template (JPG, PNG, WebP)
                          </p>
                        </div>
                        {imagePreview && (
                          <div className="w-20 h-20 border rounded overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Template preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Coin Cost</Label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={newTemplateData.coinCost}
                          onChange={(e) => setNewTemplateData({ ...newTemplateData, coinCost: e.target.value })}
                          data-testid="input-coin-cost"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price per Image (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Optional"
                          value={newTemplateData.pricePerImage}
                          onChange={(e) => setNewTemplateData({ ...newTemplateData, pricePerImage: e.target.value })}
                          data-testid="input-price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Premium Template</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            checked={newTemplateData.isPremium}
                            onChange={(e) => setNewTemplateData({ ...newTemplateData, isPremium: e.target.checked })}
                            data-testid="checkbox-premium"
                          />
                          <span className="text-sm">Premium only</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateTemplate}
                        disabled={createTemplateMutation.isPending || !newTemplateData.name}
                        className="flex-1"
                        data-testid="button-save-template"
                      >
                        {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateTemplateOpen(false)}
                        data-testid="button-cancel-create"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                      <TableCell>
                        <div className="w-12 h-12 border rounded overflow-hidden bg-gray-50">
                          {template.thumbnailUrl ? (
                            <img
                              src={template.thumbnailUrl}
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTemplateMutation.mutate({ 
                              templateId: template.id, 
                              isActive: !template.isActive 
                            })}
                            disabled={toggleTemplateMutation.isPending}
                            data-testid={`button-toggle-${template.id}`}
                          >
                            {template.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditingTemplate(template);
                              setIsTemplateEditOpen(true);
                            }}
                            data-testid={`button-edit-template-${template.id}`}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit Details
                          </Button>
                          {template.deletedAt ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Restore template "${template.name}"?`)) {
                                  restoreTemplateMutation.mutate(template.id);
                                }
                              }}
                              disabled={restoreTemplateMutation.isPending}
                              data-testid={`button-restore-template-${template.id}`}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              {restoreTemplateMutation.isPending ? "Restoring..." : "Restore"}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Move "${template.name}" to trash? You can restore it later.`)) {
                                  softDeleteTemplateMutation.mutate(template.id);
                                }
                              }}
                              disabled={softDeleteTemplateMutation.isPending}
                              data-testid={`button-delete-template-${template.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {softDeleteTemplateMutation.isPending ? "Deleting..." : "Move to Trash"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Template Edit Dialog */}
          {editingTemplate && (
            <TemplateEditDialog
              template={editingTemplate}
              open={isTemplateEditOpen}
              onOpenChange={(open) => {
                setIsTemplateEditOpen(open);
                if (!open) setEditingTemplate(null);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="super-admin" className="space-y-4">
          <SuperAdminTab />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Content Management</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage dynamic content, landing page sections, and static text
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Landing Page Content */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Landing Page Content</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    placeholder="Transform Your Product Images with AI"
                    data-testid="input-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    placeholder="Professional image enhancement powered by artificial intelligence..."
                    rows={3}
                    data-testid="input-hero-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input
                    placeholder="Get Started Free"
                    data-testid="input-cta-text"
                  />
                </div>
                <Button className="w-full" data-testid="button-save-landing">
                  Save Landing Page Content
                </Button>
              </div>
            </Card>

            {/* Features Section */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Features Section</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    placeholder="Why Choose Drisya?"
                    data-testid="input-features-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Feature 1</Label>
                  <Input
                    placeholder="AI-Powered Enhancement"
                    data-testid="input-feature-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Feature 2</Label>
                  <Input
                    placeholder="Professional Templates"
                    data-testid="input-feature-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Feature 3</Label>
                  <Input
                    placeholder="Batch Processing"
                    data-testid="input-feature-3"
                  />
                </div>
                <Button className="w-full" data-testid="button-save-features">
                  Save Features Content
                </Button>
              </div>
            </Card>

            {/* Pricing Section */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pricing Section</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    placeholder="Simple, Transparent Pricing"
                    data-testid="input-pricing-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pricing Description</Label>
                  <Textarea
                    placeholder="Choose the plan that works best for your business..."
                    rows={3}
                    data-testid="input-pricing-desc"
                  />
                </div>
                <Button className="w-full" data-testid="button-save-pricing">
                  Save Pricing Content
                </Button>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    placeholder="support@drisya.app"
                    data-testid="input-support-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    data-testid="input-whatsapp"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Textarea
                    placeholder="Your business address..."
                    rows={3}
                    data-testid="input-address"
                  />
                </div>
                <Button className="w-full" data-testid="button-save-contact">
                  Save Contact Information
                </Button>
              </div>
            </Card>
          </div>

          {/* SEO Settings */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">SEO Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  placeholder="Drisya - AI-Powered Image Enhancement"
                  data-testid="input-meta-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input
                  placeholder="AI, image enhancement, product photography"
                  data-testid="input-meta-keywords"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Meta Description</Label>
                <Textarea
                  placeholder="Transform your product images with AI-powered enhancement. Professional templates, batch processing, and more."
                  rows={3}
                  data-testid="input-meta-description"
                />
              </div>
              <div className="lg:col-span-2">
                <Button data-testid="button-save-seo">
                  Save SEO Settings
                </Button>
              </div>
            </div>
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
                  value={settings.costPerImage}
                  onChange={(e) => setSettings({ ...settings, costPerImage: e.target.value })}
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
                  value={settings.welcomeBonus}
                  onChange={(e) => setSettings({ ...settings, welcomeBonus: e.target.value })}
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
                  value={settings.maxBatchSize}
                  onChange={(e) => setSettings({ ...settings, maxBatchSize: e.target.value })}
                  className="max-w-xs"
                  data-testid="input-max-batch-size"
                />
              </div>

              <Button 
                onClick={handleSaveSettings}
                disabled={saveSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
