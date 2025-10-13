import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Phone, MessageCircle, Check, Clock, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  coinBalance: number;
}

interface CoinPackage {
  id: string;
  name: string;
  coinAmount: number;
  priceInINR: number;
  discount: number;
  description: string | null;
  isActive: boolean;
}

interface ManualTransaction {
  id: string;
  coinAmount: number;
  priceInINR: number;
  paymentMethod: string;
  paymentReference: string | null;
  status: string;
  createdAt: string;
  package?: { name: string };
}

export default function Wallet() {
  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
  });
  const user = userData?.user;

  const { data: packagesData } = useQuery<{ packages: CoinPackage[] }>({
    queryKey: ["/api/wallet/packages"],
  });

  const { data: txnsData } = useQuery<{ transactions: ManualTransaction[] }>({
    queryKey: ["/api/wallet/transactions"],
  });

  const packages = packagesData?.packages || [];
  const transactions = txnsData?.transactions || [];
  const pendingTxns = transactions.filter(t => t.status === "pending");

  const handleWhatsAppContact = (packageName: string, coinAmount: number, price: number) => {
    const message = `Hi! I want to purchase ${packageName} (${coinAmount} coins for ₹${price}). My email: ${user?.email}`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "+919876543210"; // Replace with actual admin phone
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="space-y-8" data-testid="page-wallet">
      <div>
        <h1 className="text-3xl font-bold mb-2">Coin Wallet</h1>
        <p className="text-muted-foreground">
          Purchase coins to process your images professionally
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <div className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-600" />
                <span className="text-3xl font-bold font-mono" data-testid="text-coin-balance">
                  {user?.coinBalance || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="text-3xl font-bold font-mono" data-testid="text-pending-count">
                {pendingTxns.length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
            <div className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              <span className="text-3xl font-bold font-mono" data-testid="text-completed-count">
                {transactions.filter(t => t.status === "completed").length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="p-6 hover-elevate" data-testid={`card-package-${pkg.id}`}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-1">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-xs text-muted-foreground">{pkg.description}</p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Coins className="h-8 w-8 text-yellow-600" />
                <span className="text-4xl font-bold font-mono">{pkg.coinAmount}</span>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold">₹{pkg.priceInINR}</div>
                {pkg.discount > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {pkg.discount}% OFF
                  </Badge>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => handleWhatsAppContact(pkg.name, pkg.coinAmount, pkg.priceInINR)}
                data-testid={`button-whatsapp-${pkg.id}`}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Buy via WhatsApp
              </Button>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No packages available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact admin for custom coin purchases.
            </p>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Payment History</h2>
        
        {pendingTxns.length > 0 && (
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals ({pendingTxns.length})
            </h3>
            <div className="space-y-2">
              {pendingTxns.map(txn => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 bg-background rounded border"
                  data-testid={`pending-txn-${txn.id}`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      {txn.coinAmount} coins
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{txn.priceInINR} • {txn.paymentMethod}
                      {txn.paymentReference && ` • ${txn.paymentReference}`}
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Your payment is being verified by admin. You'll be notified once approved.
            </p>
          </Card>
        )}

        <Card>
          <div className="divide-y">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No payment history yet. Purchase your first coin package above!
              </div>
            ) : (
              transactions.map(txn => (
                <div
                  key={txn.id}
                  className="p-4 flex items-center justify-between"
                  data-testid={`txn-${txn.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={
                      txn.status === "completed" ? "text-green-600" :
                      txn.status === "pending" ? "text-orange-600" :
                      "text-red-600"
                    }>
                      {txn.status === "completed" && <Check className="h-5 w-5" />}
                      {txn.status === "pending" && <Clock className="h-5 w-5" />}
                      {txn.status === "rejected" && <X className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        {txn.coinAmount} coins
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString()} • ₹{txn.priceInINR}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      txn.status === "completed" ? "default" :
                      txn.status === "pending" ? "secondary" :
                      "destructive"
                    }
                  >
                    {txn.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Phone className="h-5 w-5" />
          How to Purchase Coins
        </h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Click "Buy via WhatsApp" on any package above</li>
          <li>2. This will open WhatsApp with a pre-filled message</li>
          <li>3. Send the message to our admin</li>
          <li>4. Make payment via UPI/Bank Transfer as instructed</li>
          <li>5. Share payment screenshot/reference</li>
          <li>6. Admin will verify and credit coins to your account within 24 hours</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-4">
          💡 Need help? Contact us on WhatsApp: +91-9876543210
        </p>
      </Card>
    </div>
  );
}
