import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { cn } from "@/lib/utils";
import { useDemoModeStore } from "@/store/demoModeStore";

export default function WalletConnect({ className }: { className?: string }) {
  const demoMode = useDemoModeStore((state) => state.enabled);
  const demoWallet = useDemoModeStore((state) => state.wallet);
  const setDemoMode = useDemoModeStore((state) => state.setEnabled);
  const {
    shortAddress,
    balanceAvax,
    isConnected,
    isFuji,
    needsNetworkSwitch,
    wrongNetworkOpen,
    setWrongNetworkOpen,
    connectMetaMask,
    isConnecting,
    switchToFuji,
    isSwitching,
    fujiChain,
  } = useWalletConnect();

  const onConnect = async () => {
    try {
      await connectMetaMask();
      toast.success("钱包已连接");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "连接失败";
      toast.error(msg);
    }
  };

  const onSwitch = async () => {
    try {
      await switchToFuji();
      toast.success("已切换到 Avalanche Fuji");
      setWrongNetworkOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "切换网络失败";
      toast.error(msg);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {demoMode ? (
        <>
          <div className="paper-card px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm max-w-[min(100%,20rem)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/80 shrink-0" aria-hidden />
              <span className="font-hand text-foreground">演示模式</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {demoWallet.slice(0, 6)}…{demoWallet.slice(-4)}
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="font-hand text-base border border-border"
            onClick={() => setDemoMode(false)}
          >
            连接真实钱包
          </Button>
        </>
      ) : isConnected && isFuji && shortAddress ? (
        <div className="paper-card px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm max-w-[min(100%,20rem)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary/80 shrink-0" aria-hidden />
            <span className="font-mono text-foreground">{shortAddress}</span>
          </div>
          {balanceAvax !== null && (
            <span className="text-muted-foreground font-sans">
              <span className="font-hand text-foreground">{balanceAvax}</span> AVAX
            </span>
          )}
        </div>
      ) : isConnected && needsNetworkSwitch ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="font-hand text-base border border-border"
          onClick={() => setWrongNetworkOpen(true)}
        >
          切换至 Fuji 测试网
        </Button>
      ) : (
        <Button
          type="button"
          variant="cyber"
          size="sm"
          className="font-hand text-base"
          disabled={isConnecting}
          onClick={onConnect}
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? "连接中…" : "连接 MetaMask"}
        </Button>
      )}

      {!demoMode && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="font-hand text-base"
          onClick={() => setDemoMode(true)}
        >
          跳过验证
        </Button>
      )}

      <AlertDialog open={wrongNetworkOpen} onOpenChange={setWrongNetworkOpen}>
        <AlertDialogContent className="bg-card border-border sm:max-w-md rounded-[1rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand text-2xl text-foreground">
              请切换到 Avalanche Fuji
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2 text-left font-body">
              <p>当前钱包网络不是 Fuji 测试网，无法与 Pacta 合约交互。</p>
              <ul className="text-sm list-disc pl-4 space-y-1 border border-dashed border-border/80 rounded-lg p-3 bg-muted/30">
                <li>网络名称：{fujiChain.name}</li>
                <li>Chain ID：{fujiChain.id}</li>
                <li>货币：AVAX</li>
                <li className="break-all">RPC：{fujiChain.rpcUrls.default.http[0]}</li>
                <li className="break-all">浏览器：{fujiChain.blockExplorers.default.url}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
            <AlertDialogCancel className="font-hand mt-0">稍后再说</AlertDialogCancel>
            <Button
              type="button"
              className="gradient-cyber text-primary-foreground glow-cyber font-hand text-lg border-0"
              disabled={isSwitching}
              onClick={() => void onSwitch()}
            >
              {isSwitching ? "处理中…" : "一键切换 / 添加网络"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
