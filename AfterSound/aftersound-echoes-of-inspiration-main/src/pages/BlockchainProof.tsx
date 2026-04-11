import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Contract, keccak256, toUtf8Bytes } from "ethers";
import { MUSIC_REGISTRY_ABI, CONTRACT_ADDRESS, CHAIN_CONFIG } from "@/contracts/abi";
import { Mic, Square, Hash, Search, Link2, Loader2, Check, Wallet, Shield } from "lucide-react";

type Step = "record" | "hash" | "check" | "chain";

export default function BlockchainProof() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { address, signer, connecting, connect, hasMetaMask } = useWallet();

  const [step, setStep] = useState<Step>("record");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [hash, setHash] = useState("");
  const [checking, setChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);
  const [anchoring, setAnchoring] = useState(false);
  const [txHash, setTxHash] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Step 1: Record
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      toast.error(t("Microphone access denied", "麦克风权限被拒绝"));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // Step 2: Generate Hash
  const generateHash = useCallback(async () => {
    if (!audioBlob) return;
    const buffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // Use keccak256 of audio bytes
    const h = keccak256(bytes);
    setHash(h);
    setStep("check");
    toast.success(t("Hash generated!", "Hash 已生成！"));
  }, [audioBlob, t]);

  // Step 3: Check duplicate
  const checkDuplicate = useCallback(async () => {
    setChecking(true);
    try {
      // If wallet connected and contract deployed, check on-chain
      if (signer && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const contract = new Contract(CONTRACT_ADDRESS, MUSIC_REGISTRY_ABI, signer);
        const dup = await contract.isDuplicate(hash);
        setIsDuplicate(dup);
      } else {
        // Check locally via database
        const { data } = await supabase.from("music_works").select("id").eq("hash", hash).limit(1);
        setIsDuplicate(data && data.length > 0);
      }
      setStep("chain");
    } catch (e) {
      console.error(e);
      toast.error(t("Check failed", "查重失败"));
    } finally {
      setChecking(false);
    }
  }, [hash, signer, t]);

  // Step 4: Anchor on-chain
  const anchorOnChain = useCallback(async () => {
    if (!signer || !user) {
      toast.error(t("Connect wallet first", "请先连接钱包"));
      return;
    }
    setAnchoring(true);
    try {
      // Save work to DB first
      const { data: work, error: workErr } = await supabase.from("music_works").insert({
        user_id: user.id,
        title: title || t("Untitled Recording", "未命名录音"),
        work_type: "recording",
        hash,
        is_on_chain: true,
      }).select().single();
      if (workErr) throw workErr;

      if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const contract = new Contract(CONTRACT_ADDRESS, MUSIC_REGISTRY_ABI, signer);
        const tx = await contract.storeHash(hash);
        const receipt = await tx.wait();
        setTxHash(receipt.hash);

        // Save blockchain record
        await supabase.from("blockchain_records").insert({
          work_id: work.id,
          user_id: user.id,
          tx_hash: receipt.hash,
          chain_name: CHAIN_CONFIG.chainName,
          content_hash: hash,
          block_number: receipt.blockNumber,
        });
      } else {
        // Demo mode — simulate tx
        const fakeTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setTxHash(fakeTx);
        await supabase.from("blockchain_records").insert({
          work_id: work.id,
          user_id: user.id,
          tx_hash: fakeTx,
          chain_name: CHAIN_CONFIG.chainName + " (Demo)",
          content_hash: hash,
        });
      }

      toast.success(t("Anchored on-chain!", "已上链！"));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("Transaction failed", "交易失败"));
    } finally {
      setAnchoring(false);
    }
  }, [signer, user, hash, title, t]);

  // Save without chain (free)
  const saveWithoutChain = useCallback(async () => {
    if (!user) { toast.error(t("Please login first", "请先登录")); return; }
    await supabase.from("music_works").insert({
      user_id: user.id,
      title: title || t("Untitled Recording", "未命名录音"),
      work_type: "recording",
      hash,
    });
    toast.success(t("Saved to your vault!", "已保存到灵感库！"));
  }, [user, hash, title, t]);

  const steps = [
    { key: "record", labelCn: "录音", labelEn: "Record", icon: Mic, free: true },
    { key: "hash", labelCn: "生成Hash", labelEn: "Generate Hash", icon: Hash, free: true },
    { key: "check", labelCn: "查重", labelEn: "Check", icon: Search, free: true },
    { key: "chain", labelCn: "上链", labelEn: "On-Chain", icon: Link2, free: false },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen pt-24 pb-16 noise-bg">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-glow-cyan/10 mb-4">
            <Shield className="w-8 h-8 text-glow-cyan" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            {t("Blockchain Proof", "链上证明")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("Record → Hash → Check → On-Chain", "录音 → 生成Hash → 查重 → 上链")}
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => { if (i <= stepIndex) setStep(s.key as Step); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                  i <= stepIndex ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground/40 border border-glass-border"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t(s.labelCn, s.labelEn)}</span>
                {s.free && <span className="text-[9px] text-glow-cyan/60">{t("免费", "Free")}</span>}
              </button>
              {i < steps.length - 1 && <div className={`w-6 h-px mx-1 ${i < stepIndex ? "bg-primary/30" : "bg-glass-border"}`} />}
            </div>
          ))}
        </div>

        {/* Wallet Connect */}
        <div className="flex justify-end mb-6">
          {address ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-glow-cyan/10 border border-glow-cyan/20 text-xs">
              <Wallet className="w-3 h-3 text-glow-cyan" />
              <span className="font-mono text-glow-cyan">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={connect} disabled={connecting} className="gap-1.5 text-xs">
              <Wallet className="w-3.5 h-3.5" />
              {connecting ? t("连接中...", "Connecting...") : t("连接钱包", "Connect Wallet")}
            </Button>
          )}
        </div>

        {/* Step Content */}
        <Card className="glass-card border-glass-border">
          <CardContent className="p-8">
            {/* RECORD */}
            {step === "record" && (
              <div className="text-center space-y-6">
                <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center border-2 transition-all duration-500"
                  style={{
                    borderColor: recording ? "hsl(var(--destructive))" : "hsl(var(--glass-border))",
                    background: recording ? "hsla(0, 60%, 50%, 0.1)" : "transparent",
                    animation: recording ? "breathing-glow 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  {recording ? (
                    <button onClick={stopRecording} className="p-4"><Square className="w-8 h-8 text-destructive" /></button>
                  ) : (
                    <button onClick={startRecording} className="p-4"><Mic className="w-8 h-8 text-foreground/40 hover:text-foreground/60 transition-colors" /></button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {recording ? t("录音中… 点击停止", "Recording… Click to stop") : t("点击开始录音", "Click to start recording")}
                </p>
                {audioUrl && (
                  <div className="space-y-4">
                    <audio src={audioUrl} controls className="mx-auto" />
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("给你的作品起个名字", "Name your work")} className="bg-secondary border-glass-border" />
                    <Button variant="glow" onClick={() => { setStep("hash"); generateHash(); }} className="gap-2">
                      <Hash className="w-4 h-4" />{t("生成 Hash", "Generate Hash")}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* HASH */}
            {step === "hash" && (
              <div className="text-center space-y-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">{t("正在生成音频指纹…", "Generating audio fingerprint…")}</p>
              </div>
            )}

            {/* CHECK */}
            {step === "check" && (
              <div className="space-y-6">
                <div className="bg-secondary/30 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground mb-2">{t("音频 Hash", "Audio Hash")}</p>
                  <p className="font-mono text-sm text-foreground/70 break-all">{hash}</p>
                </div>
                <Button variant="glow" onClick={checkDuplicate} disabled={checking} className="w-full gap-2">
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {t("开始查重", "Check for Duplicates")}
                </Button>
                {isDuplicate !== null && (
                  <div className={`p-4 rounded-xl border text-sm ${isDuplicate ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-glow-cyan/10 border-glow-cyan/20 text-glow-cyan"}`}>
                    {isDuplicate ? t("⚠️ 该音频指纹已存在", "⚠️ This fingerprint already exists") : t("✅ 该音频指纹为原创", "✅ This fingerprint is original")}
                  </div>
                )}
              </div>
            )}

            {/* CHAIN */}
            {step === "chain" && (
              <div className="space-y-6">
                {txHash ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-glow-cyan/10 mx-auto flex items-center justify-center"><Check className="w-8 h-8 text-glow-cyan" /></div>
                    <p className="text-lg font-display gradient-text">{t("上链成功！", "On-Chain Success!")}</p>
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">TX Hash</p>
                      <p className="font-mono text-xs text-foreground/60 break-all">{txHash}</p>
                    </div>
                    <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      {t("在区块浏览器查看 →", "View on Explorer →")}
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-secondary/30 rounded-xl p-5">
                      <p className="text-xs text-muted-foreground mb-2">{t("原创状态", "Originality Status")}</p>
                      <p className={`text-sm ${isDuplicate ? "text-destructive" : "text-glow-cyan"}`}>
                        {isDuplicate === false ? t("✅ 原创", "✅ Original") : isDuplicate === true ? t("⚠️ 已存在", "⚠️ Exists") : t("未检查", "Not checked")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={saveWithoutChain} className="gap-1.5">
                        {t("仅保存", "Save Only")}
                      </Button>
                      <Button variant="glow" onClick={address ? anchorOnChain : connect} disabled={anchoring} className="gap-1.5">
                        {anchoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                        {!address ? t("连接钱包上链", "Connect & Anchor") : t("上链", "Anchor")}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 text-center">
                      {t("上链需要 Avalanche Fuji 测试网 AVAX", "On-chain requires Avalanche Fuji testnet AVAX")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
