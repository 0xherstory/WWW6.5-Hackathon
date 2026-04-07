import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, User, ChevronDown, LogOut, Shield } from "lucide-react";

function connectErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? (err as { code: unknown }).code
      : null;
  if (code === 4001) {
    return "您已取消连接或签名请求";
  }
  if (err instanceof Error) {
    if (err.message === "NO_WALLET") {
      return "请安装 MetaMask 或 Core 等浏览器钱包";
    }
    if (err.message === "NO_ACCOUNTS") {
      return "未获得账户授权，请在钱包中允许连接";
    }
  }
  return "连接失败，请稍后重试";
}

export const Web3WalletConnect = () => {
  const {
    address,
    balanceLabel,
    isConnected,
    isFujiChain,
    isConnecting,
    connect,
    disconnect,
    ensureFuji,
    refreshBalance,
  } = useWeb3();
  const { toast } = useToast();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  const connectWallet = async () => {
    try {
      await connect();
      toast({
        title: "钱包连接成功",
        description: "已连接并切换到 Avalanche Fuji 测试网",
      });
    } catch (error) {
      toast({
        title: "连接失败",
        description: connectErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast({
      title: "钱包已断开",
      description: "您已成功断开钱包连接",
    });
  };

  const switchToFuji = async () => {
    setIsSwitchingChain(true);
    try {
      await ensureFuji();
      await refreshBalance();
      toast({
        title: "已切换到 Fuji",
        description: "当前网络：Avalanche Fuji C-Chain",
      });
    } catch (error) {
      toast({
        title: "切换失败",
        description: connectErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSwitchingChain(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 p-2 rounded-lg book-spine cursor-pointer hover:bg-accent/10 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium font-fangsong">
                {formatAddress(address)}
              </span>
              <span className="text-xs text-muted-foreground">
                {balanceLabel ?? "—"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </DialogTrigger>

        <DialogContent className="ancient-card-dialog max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fangsong flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Web3 身份
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium font-fangsong">{formatAddress(address)}</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{address}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fuji 余额（链上查询）：{balanceLabel ?? "—"}
                </p>
                {!isFujiChain && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-destructive font-fangsong">
                      当前钱包网络不是 Fuji，链上存证需要 Avalanche Fuji C-Chain。
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="w-full font-fangsong"
                      disabled={isSwitchingChain}
                      onClick={() => void switchToFuji()}
                    >
                      {isSwitchingChain ? "切换中..." : "切换到 Fuji 测试网"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium font-fangsong text-primary">已获得徽章</h4>
              <div className="grid grid-cols-3 gap-2">
                <Badge variant="outline" className="justify-center p-2 font-fangsong">
                  🎯 新手
                </Badge>
                <Badge variant="outline" className="justify-center p-2 font-fangsong">
                  📚 阅读者
                </Badge>
                <Badge variant="outline" className="justify-center p-2 font-fangsong opacity-50">
                  ✍️ 创作者
                </Badge>
              </div>
            </div>

            <Button variant="outline" onClick={disconnectWallet} className="w-full font-fangsong">
              <LogOut className="w-4 h-4 mr-2" />
              断开连接
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className="font-fangsong book-spine"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "连接中..." : "连接钱包"}
    </Button>
  );
};
