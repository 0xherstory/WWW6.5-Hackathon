import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FUJI_CHAIN_ID_HEX, useWeb3 } from "@/contexts/Web3Context";
import { contentRegistryAbi } from "@/lib/contentRegistryAbi";
import {
  Shield,
  Lock,
  ExternalLink,
  Clock,
  User,
  Hash,
  CheckCircle,
} from "lucide-react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getAddress,
  http,
  isAddress,
  keccak256,
  stringToBytes,
  type Address,
} from "viem";
import { avalancheFuji } from "viem/chains";

const FUJI_NETWORK_LABEL = "Avalanche Fuji C-Chain";
const FUJI_TX_EXPLORER = "https://testnet.snowtrace.io/tx/";

interface ContentProofProps {
  contentId: string;
  title: string;
  author?: string;
  createdAt?: string;
  size?: "small" | "medium";
}

interface ProofInfo {
  blockchainNetwork: string;
  transactionHash: string;
  blockNumber: string;
  timestamp: string;
  contentHashHex: string;
  smartContractAddress: string;
}

function proveErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? (err as { code: unknown }).code
      : null;
  if (code === 4001) {
    return "您已在钱包中取消交易";
  }
  if (code === -32603 || code === "ACTION_REJECTED") {
    return "交易被拒绝，请检查网络与合约地址";
  }
  if (err instanceof Error) {
    if (err.message === "NO_WALLET") {
      return "请安装 MetaMask 或 Core 等浏览器钱包";
    }
    if (err.message.includes("User denied")) {
      return "您已拒绝钱包请求";
    }
  }
  return "存证失败，请确认已连接 Fuji、有足够 AVAX，且合约地址正确";
}

function buildContentPayload(
  contentId: string,
  title: string,
  author: string,
  createdAt: string,
): string {
  return JSON.stringify({
    author,
    contentId,
    createdAt,
    title,
  });
}

export const Web3ContentProof = ({
  contentId,
  title,
  author,
  createdAt,
  size = "medium",
}: ContentProofProps) => {
  const [isProving, setIsProving] = useState(false);
  const [proofData, setProofData] = useState<ProofInfo | null>(null);
  const { toast } = useToast();
  const { address, ensureFuji, isFujiChain } = useWeb3();

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: avalancheFuji,
        transport: http(),
      }),
    [],
  );

  const handleProveContent = async () => {
    const raw = import.meta.env.VITE_CONTENT_REGISTRY_ADDRESS?.trim();
    if (!raw) {
      toast({
        title: "未配置合约地址",
        description: "请在项目根目录的 .env.local 中设置 VITE_CONTENT_REGISTRY_ADDRESS，并重启 npm run dev。",
        variant: "destructive",
      });
      return;
    }

    if (!isAddress(raw)) {
      toast({
        title: "合约地址无效",
        description: "VITE_CONTENT_REGISTRY_ADDRESS 不是合法的以太坊地址。",
        variant: "destructive",
      });
      return;
    }

    const contractAddress = getAddress(raw) as Address;

    if (!window.ethereum) {
      toast({
        title: "未检测到钱包",
        description: "请安装 MetaMask 或 Core 浏览器扩展。",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "请先连接钱包",
        description: "点击导航栏「连接钱包」后再提交链上存证。",
        variant: "destructive",
      });
      return;
    }

    setIsProving(true);

    try {
      await ensureFuji();
    } catch {
      setIsProving(false);
      toast({
        title: "网络切换失败",
        description: "无法切换到 Avalanche Fuji，请在钱包中手动选择 Fuji 测试网。",
        variant: "destructive",
      });
      return;
    }

    const chainId = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string;
    if (chainId.toLowerCase() !== FUJI_CHAIN_ID_HEX.toLowerCase()) {
      setIsProving(false);
      toast({
        title: "网络不正确",
        description: "请将钱包切换到 Avalanche Fuji C-Chain（Chain ID 43113）后再试。",
        variant: "destructive",
      });
      return;
    }

    const payload = buildContentPayload(
      contentId,
      title,
      author ?? "",
      createdAt ?? "",
    );
    const contentHash = keccak256(stringToBytes(payload));

    const walletClient = createWalletClient({
      account: address,
      chain: avalancheFuji,
      transport: custom(window.ethereum),
    });

    try {
      const txHash = await walletClient.writeContract({
        address: contractAddress,
        abi: contentRegistryAbi,
        functionName: "storeHash",
        args: [contentHash],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const block = await publicClient.getBlock({
        blockNumber: receipt.blockNumber,
      });
      const timestamp =
        new Date(Number(block.timestamp) * 1000)
          .toISOString()
          .replace("T", " ")
          .split(".")[0] + " UTC";

      setProofData({
        blockchainNetwork: FUJI_NETWORK_LABEL,
        transactionHash: txHash,
        blockNumber: receipt.blockNumber.toString(),
        timestamp,
        contentHashHex: contentHash,
        smartContractAddress: contractAddress,
      });

      toast({
        title: "内容存证成功",
        description: "交易已确认，可在 Snowtrace 上查看。",
      });
    } catch (error) {
      toast({
        title: "存证失败",
        description: proveErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsProving(false);
    }
  };

  const handleViewOnChain = () => {
    if (!proofData?.transactionHash) return;
    const url = `${FUJI_TX_EXPLORER}${proofData.transactionHash}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "已在浏览器中打开",
      description: "Avalanche Fuji Snowtrace 交易详情",
    });
  };

  if (size === "small") {
    return (
      <div className="flex items-center gap-2">
        {proofData ? (
          <Dialog>
            <DialogTrigger asChild>
              <Badge variant="outline" className="cursor-pointer font-fangsong">
                <Shield className="w-3 h-3 mr-1" />
                已存证
              </Badge>
            </DialogTrigger>
            <DialogContent className="ancient-card-dialog max-w-md">
              <DialogHeader>
                <DialogTitle className="font-fangsong flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  区块链存证信息
                </DialogTitle>
              </DialogHeader>
              <ProofDetails proofData={proofData} title={title} onViewOnChain={handleViewOnChain} />
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleProveContent}
            disabled={isProving}
            className="font-fangsong"
          >
            <Lock className="w-3 h-3 mr-1" />
            {isProving ? "存证中..." : "链上存证"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium font-fangsong text-primary">内容溯源</h4>
        {proofData ? (
          <Badge variant="outline" className="font-fangsong">
            <CheckCircle className="w-4 h-4 mr-1" />
            已在链上存证
          </Badge>
        ) : (
          <Badge variant="outline" className="font-fangsong opacity-60">
            <Lock className="w-4 h-4 mr-1" />
            未存证
          </Badge>
        )}
      </div>

      {address && !isFujiChain && (
        <p className="text-xs text-amber-700 font-fangsong bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          当前钱包网络不是 Fuji，存证前将请求切换到 Avalanche Fuji C-Chain。
        </p>
      )}

      {proofData ? (
        <div className="p-4 bg-green-50/50 border border-green-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            <span className="font-medium font-fangsong">内容已受区块链保护</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground font-fangsong">网络:</span>
              <p className="font-medium">{proofData.blockchainNetwork}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-fangsong">区块:</span>
              <p className="font-medium">#{proofData.blockNumber}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground font-fangsong">内容哈希 (keccak256):</span>
              <p className="font-mono text-xs break-all">{proofData.contentHashHex}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground font-fangsong">交易哈希:</span>
              <p className="font-mono text-xs break-all">{proofData.transactionHash}</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleViewOnChain}
            className="w-full font-fangsong"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            在 Snowtrace 中查看
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
          <p className="text-sm text-muted-foreground font-fangsong">
            将您的创作内容永久记录在 Avalanche Fuji 上，获得可验证的内容哈希存证
          </p>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>内容字段将序列化后计算 keccak256 并写入合约</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>上链时间以 Fuji 区块时间为准</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>交易由当前连接的钱包地址发送</span>
            </div>
          </div>

          <Button onClick={handleProveContent} disabled={isProving} className="w-full font-fangsong">
            <Lock className="w-4 h-4 mr-2" />
            {isProving ? "正在存证..." : "提交到区块链"}
          </Button>
        </div>
      )}
    </div>
  );
};

const ProofDetails = ({
  proofData,
  title,
  onViewOnChain,
}: {
  proofData: ProofInfo;
  title: string;
  onViewOnChain: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 rounded-lg">
        <h5 className="font-medium font-fangsong text-green-800 mb-2">《{title}》</h5>
        <p className="text-sm text-green-700 font-fangsong">
          此内容已在 Avalanche Fuji 上存证，可通过交易哈希在 Snowtrace 验证。
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium font-fangsong">区块链网络</span>
          <p className="text-sm text-muted-foreground">{proofData.blockchainNetwork}</p>
        </div>

        <div>
          <span className="text-sm font-medium font-fangsong">内容哈希</span>
          <p className="text-xs font-mono text-muted-foreground break-all">{proofData.contentHashHex}</p>
        </div>

        <div>
          <span className="text-sm font-medium font-fangsong">交易哈希</span>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {proofData.transactionHash}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-sm font-medium font-fangsong">区块高度</span>
            <p className="text-sm text-muted-foreground">#{proofData.blockNumber}</p>
          </div>
          <div>
            <span className="text-sm font-medium font-fangsong">上链时间</span>
            <p className="text-sm text-muted-foreground">{proofData.timestamp}</p>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium font-fangsong">智能合约</span>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {proofData.smartContractAddress}
          </p>
        </div>
      </div>

      <Button onClick={onViewOnChain} className="w-full font-fangsong">
        <ExternalLink className="w-4 h-4 mr-2" />
        在 Snowtrace 中验证
      </Button>
    </div>
  );
};
