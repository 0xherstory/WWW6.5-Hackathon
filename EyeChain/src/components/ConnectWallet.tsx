import { shortenAddress } from "@/lib/contract";
import heroImage from "@/assets/eyechain-hero.jpg";

interface Props {
  address: string | null;
  loading: boolean;
  onConnect: () => void;
}

export default function ConnectWallet({ address, loading, onConnect }: Props) {
  return (
    <div className="border-glow bg-card rounded-lg overflow-hidden mb-5 animate-fade-in-up">
      <div className="relative h-48 overflow-hidden">
        <img src={heroImage} alt="EyeChain" className="w-full h-full object-cover opacity-60" width={1280} height={512} />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="font-heading text-3xl md:text-4xl font-black text-primary tracking-widest">EYECHAIN</h1>
          <p className="font-mono text-sm text-muted-foreground tracking-widest mt-1">// Decentralized Visual Risk Intelligence Protocol</p>
          <p className="font-mono text-xs text-muted-foreground tracking-wider mt-0.5">// 去中心化视觉风险智能协议</p>
        </div>
      </div>
      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-mono">AVALANCHE FUJI TESTNET · CHAIN ID: 43113</p>
          <p className="text-muted-foreground text-xs font-mono">雪崩 Fuji 测试网 · 链 ID: 43113</p>
          {address && (
            <p className="text-primary font-mono mt-1 text-sm">
              Connected 已连接: <span className="text-foreground">{shortenAddress(address)}</span>
            </p>
          )}
        </div>
        <button
          onClick={onConnect}
          disabled={loading || !!address}
          className="px-6 py-3 rounded-lg font-mono text-sm tracking-wider uppercase border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting... 连接中..." : address ? "✓ Connected 已连接" : "Connect MetaMask 连接钱包"}
        </button>
      </div>
    </div>
  );
}
