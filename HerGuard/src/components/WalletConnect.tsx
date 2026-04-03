import { useWallet, shortenAddress } from "@/hooks/useWallet";
import { Wallet, LogOut, AlertTriangle } from "lucide-react";

interface WalletConnectProps {
  contractAddress: string;
  walletHook: ReturnType<typeof useWallet>;
}

export default function WalletConnect({ walletHook }: WalletConnectProps) {
  const { wallet, connect, disconnect, switchToFuji } = walletHook;

  if (!wallet.isConnected) {
    return (
      <button
        onClick={connect}
        className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
      >
        <Wallet className="h-4 w-4" />
        连接钱包
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!wallet.isCorrectNetwork && (
        <button
          onClick={switchToFuji}
          className="flex items-center gap-1 rounded-lg bg-wallet-warning/20 px-2 py-1.5 text-xs font-medium text-wallet-warning transition-colors hover:bg-wallet-warning/30"
        >
          <AlertTriangle className="h-3 w-3" />
          切换网络
        </button>
      )}
      <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2">
        <div
          className={`h-2 w-2 rounded-full ${
            wallet.isCorrectNetwork ? "bg-wallet-connected" : "bg-wallet-warning"
          }`}
        />
        <span className="font-mono text-xs text-secondary-foreground">
          {shortenAddress(wallet.address!)}
        </span>
      </div>
      <button
        onClick={disconnect}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
