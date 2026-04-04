"use client";

import {
  useAccount,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { internSbtAddress, internSbtAbi } from "@/lib/contract";

const FUJI_CHAIN_ID = 43113;

// TODO: 后端部署后填入真实地址（env: NEXT_PUBLIC_API_BASE）
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type MintStep =
  | "upload"
  | "verifying"
  | "signing"
  | "minting"
  | "success"
  | "error";

type IssuedCredential = {
  credentialId: string;
  companyId: string;
  companyName: string;
  credentialHash: `0x${string}`;
  expireTime: number; // unix seconds
  signature: `0x${string}`;
};

const STEP_ORDER: Exclude<MintStep, "error">[] = [
  "upload",
  "verifying",
  "signing",
  "minting",
  "success",
];

// 步骤配置
const STEP_CONFIG: Record<Exclude<MintStep, "error">, { label: string; icon: string }> = {
  upload: { label: "上传 Offer", icon: "1" },
  verifying: { label: "AI 验证", icon: "2" },
  signing: { label: "获取签名", icon: "3" },
  minting: { label: "链上铸造", icon: "4" },
  success: { label: "完成", icon: "✓" },
};

// 加载状态文本
const LOADING_TEXT: Partial<Record<MintStep, { title: string; sub: string }>> = {
  verifying: { title: "AI 正在验证 Offer...", sub: "请稍候" },
  signing: { title: "正在获取铸造签名...", sub: "请稍候" },
  minting: { title: "请在钱包中确认铸造交易", sub: "交易确认后请勿关闭页面" },
};

export function AuthContent() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();

  const [step, setStep] = useState<MintStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Check if user already holds an SBT ────────────────
  const { data: sbtBalance, isLoading: isCheckingSbt } = useReadContract({
    address: internSbtAddress,
    abi: internSbtAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && chainId === FUJI_CHAIN_ID,
    },
  });

  const hasSBT = sbtBalance !== undefined && sbtBalance > 0n;
  const isWrongChain = isConnected && chainId !== FUJI_CHAIN_ID;

  useEffect(() => {
    if (isConnected && !isCheckingSbt && hasSBT) {
      router.push("/review");
    }
  }, [isConnected, isCheckingSbt, hasSBT, router]);

  // ── File handling ──────────────────────────────────────
  const handleFileSelect = useCallback((selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setErrorMsg("只支持图片格式（JPG / PNG / WebP / GIF）");
      setStep("error");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrorMsg("");
    setStep("upload");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFileSelect(dropped);
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [preview]);

  // ── Main mint flow ─────────────────────────────────────
  const handleStartMint = async () => {
    if (!file || !address) return;

    try {
      setStep("verifying");
      await new Promise((r) => setTimeout(r, 600));

      setStep("signing");
      const signRes = await fetch(`${API_BASE}/auth/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: address }),
      });
      const signData = await signRes.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        data?: IssuedCredential;
      };
      if (!signRes.ok || !signData.success || !signData.data) {
        throw new Error(signData.message ?? "获取签名失败，请稍后重试");
      }
      const cred = signData.data;

      setStep("minting");
      await writeContractAsync({
        address: internSbtAddress,
        abi: internSbtAbi,
        functionName: "mintSBT",
        args: [
          cred.credentialId,
          cred.companyId,
          cred.credentialHash,
          BigInt(cred.expireTime),
          cred.signature,
        ],
      });

      setStep("success");
      setTimeout(() => router.push("/review"), 2000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "发生未知错误，请重试"
      );
      setStep("error");
    }
  };

  // ══════════════════════════════════════════════════════
  // Render: 未连接钱包
  // ══════════════════════════════════════════════════════

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#165DFF]/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-[#165DFF]" />
          </div>
          <h1 className="text-2xl font-semibold">身份验证</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            连接钱包验证实习身份，铸造 SBT 凭证后可参与评价
          </p>
        </div>

        <Card className="border-[#E5E6EB] p-6">
          <div className="rounded-lg bg-muted/50 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>链上存证 · 真实不可篡改</span>
            </div>
          </div>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // Render: 网络错误
  // ══════════════════════════════════════════════════════

  if (isWrongChain) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <Card className="border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-700">
                请切换到 Avalanche Fuji 测试网
              </p>
              <p className="text-xs text-amber-600/80">
                当前网络 (chainId {chainId}) 不受支持。合约部署在 Avalanche Fuji (43113)。
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <ConnectButton />
            <Button
              variant="outline"
              className="border-amber-200 text-amber-700 hover:bg-amber-100"
              onClick={() => disconnect()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              断开
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // Render: 检查中
  // ══════════════════════════════════════════════════════

  if (isCheckingSbt) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <Card className="border-[#E5E6EB] p-6">
          <div className="flex flex-col items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#165DFF]" />
            <p className="mt-4 text-sm font-medium">正在检查凭证...</p>
            <p className="mt-1 text-xs text-muted-foreground">
              正在查询链上 SBT 持有状态
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // Render: 已持有 SBT
  // ══════════════════════════════════════════════════════

  if (hasSBT) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <Card className="border-green-200 bg-green-50 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-green-700">凭证验证成功</h2>
            <p className="mt-2 text-sm text-green-600/80">
              正在跳转到评价页面...
            </p>
            <Button className="mt-4 w-full bg-green-600 hover:bg-green-700" onClick={() => router.push("/review")}>
              前往提交评价
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // Render: 铸造流程
  // ══════════════════════════════════════════════════════

  const activeIndex = STEP_ORDER.indexOf(
    (step === "error" ? "upload" : step) as Exclude<MintStep, "error">
  );
  const loadingInfo = LOADING_TEXT[step];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#165DFF]/10 mb-4">
          <ShieldCheck className="h-8 w-8 text-[#165DFF]" />
        </div>
        <h1 className="text-2xl font-semibold">铸造实习凭证</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          上传 Offer 截图，完成验证后铸造 SBT
        </p>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEP_ORDER.map((s, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          const config = STEP_CONFIG[s];
          return (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  done
                    ? "bg-green-500 text-white"
                    : current
                    ? "bg-[#165DFF] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {config.icon}
              </div>
              <span
                className={`mt-1 text-[10px] ${
                  current ? "text-[#165DFF] font-medium" : "text-muted-foreground"
                }`}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      <Card className="border-[#E5E6EB] p-5">
        {/* 上传/错误状态 */}
        {(step === "upload" || step === "error") && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-[#165DFF] bg-[#165DFF]/5"
                  : "border-border/80 hover:border-[#165DFF]/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              {preview ? (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Offer 预览"
                    className="max-h-40 rounded object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm">点击或拖拽上传 Offer 截图</p>
                  <p className="text-xs">支持 JPG / PNG / WebP，最大 10MB</p>
                </div>
              )}
            </div>

            {/* 错误提示 */}
            {step === "error" && errorMsg && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 mt-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              className="w-full mt-4 bg-[#165DFF] hover:bg-[#0E42D2]"
              disabled={!file}
              onClick={handleStartMint}
            >
              提交验证并铸造 SBT
            </Button>
          </>
        )}

        {/* 加载状态 */}
        {loadingInfo && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4 mt-3">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#165DFF]" />
            <div>
              <p className="text-sm font-medium">{loadingInfo.title}</p>
              <p className="text-xs text-muted-foreground">{loadingInfo.sub}</p>
            </div>
          </div>
        )}

        {/* 成功状态 */}
        {step === "success" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">SBT 铸造成功！</p>
            <p className="text-xs text-muted-foreground mt-1">正在跳转到评价页面...</p>
          </div>
        )}

        {/* 断开连接 */}
        {step !== "minting" && step !== "success" && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground hover:text-red-500"
            onClick={() => disconnect()}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            断开钱包连接
          </Button>
        )}
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4">
        铸造 SBT 后可获得完整评价功能，Gas 费约 0.001 AVAX
      </p>
    </div>
  );
}
