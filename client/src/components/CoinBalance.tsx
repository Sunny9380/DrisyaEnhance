import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

interface CoinBalanceProps {
  balance: number;
  onAddCoins?: () => void;
}

export default function CoinBalance({ balance, onAddCoins }: CoinBalanceProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg" data-testid="component-coin-balance">
        <Coins className="w-4 h-4 text-chart-4" />
        <span className="font-mono font-semibold text-sm" data-testid="text-coin-balance">
          {balance.toLocaleString()}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddCoins}
        data-testid="button-add-coins"
      >
        Add Coins
      </Button>
    </div>
  );
}
