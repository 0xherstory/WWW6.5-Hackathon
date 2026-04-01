"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { keccak256, toBytes } from "viem";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { reviewContractAbi, reviewContractAddress } from "@/lib/contract";
import { uploadReview } from "@/lib/uploadReview";

// ─── Types ────────────────────────────────────────────────────────────────────

type SbtInfo = {
  tokenId: string;
  companyName: string;
  companyId: string;
};

type TargetType = "mentor" | "company";

const DIM_LABELS = ["成长支持", "预期清晰度", "沟通质量", "工作强度", "尊重与包容"] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const router = useRouter();
  const { address, chainId, status } = useAccount();

  const wrongNetwork = chainId != null && chainId !== avalancheFuji.id;
  const isConnected = status === "connected" && !!address;

  // SBT from localStorage (set by /auth after minting)
  const [sbt, setSbt] = useState<SbtInfo | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rmm_sbt");
      if (raw) setSbt(JSON.parse(raw) as SbtInfo);
    } catch {}
  }, []);

  // Form state
  const [targetType, setTargetType] = useState<TargetType>("mentor");
  const [targetName, setTargetName] = useState("");
  const [overallScore, setOverallScore] = useState(0);
  const [dimScores, setDimScores] = useState([0, 0, 0, 0, 0]);
  const [reviewText, setReviewText] = useState("");

  // Upload + submit state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    writeContract,
    data: txHash,
    error: writeError,
    isPending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) setSubmitted(true);
  }, [isConfirmed]);

  // Derive bytes32 targetId from name
  const targetId = useMemo(
    () => keccak256(toBytes(targetName.trim() || "unknown")),
    [targetName]
  );

  const canSubmit =
    isConnected &&
    !wrongNetwork &&
    !!sbt &&
    targetName.trim().length > 0 &&
    overallScore >= 1 &&
    dimScores.every((s) => s >= 1) &&
    reviewText.trim().length >= 20 &&
    !isPending &&
    !uploading;

  async function handleSubmit() {
    if (!sbt) return;
    setUploadError(null);
    setUploading(true);

    try {
      const { cidBytes32 } = await uploadReview(reviewText.trim());
      setUploading(false);

      writeContract({
        address: reviewContractAddress,
        abi: reviewContractAbi,
        functionName: "submitReview",
        args: [
          BigInt(sbt.tokenId),
          targetId,
          targetType,
          overallScore,
          dimScores as unknown as [number, number, number, number, number],
          cidBytes32,
        ],
      });
    } catch (e) {
      setUploading(false);
      setUploadError(e instanceof Error ? e.message : "上传失败，请重试");
    }
  }

  // ─── Guard: not connected ─────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h1 className="text-2xl font-semibold">请先连接钱包</h1>
        <p className="mt-2 text-sm text-muted-foreground">连接钱包后才能提交评价。</p>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold">请切换到 Fuji 测试网</h1>
        <p className="mt-2 text-sm text-muted-foreground">当前链 ID：{chainId}，需要 Fuji (43113)。</p>
      </div>
    );
  }

  // ─── Guard: no SBT ───────────────────────────────────────────────────────

  if (!sbt) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-semibold">需要先验证实习身份</h1>
        <p className="text-sm text-muted-foreground">
          提交评价需要持有实习 SBT 凭证。请先完成身份验证并铸造 SBT。
        </p>
        <Button onClick={() => router.push("/auth")}>去验证身份 →</Button>
      </div>
    );
  }

  // ─── Success ─────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20">
        <Card className="p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-semibold">评价已成功上链！</h2>
          <p className="text-sm text-muted-foreground">
            你对 <b>{targetName}</b> 的评价已永久记录在 Avalanche Fuji 链上。
          </p>
          {txHash && (
            <a
              href={`https://testnet.snowtrace.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 underline block"
            >
              在 Snowtrace 查看交易 ↗
            </a>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/mentors")}>
              查看导师列表
            </Button>
            <Button className="flex-1" onClick={() => {
              setSubmitted(false);
              setTargetName("");
              setReviewText("");
              setOverallScore(0);
              setDimScores([0, 0, 0, 0, 0]);
            }}>
              再写一条
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Main form ───────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">写评价</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          以 <span className="font-medium text-foreground">{sbt.companyName}</span> 实习生身份匿名提交，内容加密存储在 IPFS，评分永久上链。
        </p>
      </div>

      {/* Target */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-medium">评价对象</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setTargetType("mentor")}
            className={`flex-1 py-2 rounded-lg text-sm border transition-colors
              ${targetType === "mentor" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
          >
            导师
          </button>
          <button
            onClick={() => setTargetType("company")}
            className={`flex-1 py-2 rounded-lg text-sm border transition-colors
              ${targetType === "company" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
          >
            公司
          </button>
        </div>

        <Input
          placeholder={targetType === "mentor" ? "输入导师姓名（如：张三）" : "输入公司名称（如：字节跳动）"}
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
        />
      </Card>

      {/* Overall score */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-medium">综合评分</h2>
        <StarPicker value={overallScore} onChange={setOverallScore} />
      </Card>

      {/* Dimension scores */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-medium">维度评分</h2>
        <div className="space-y-3">
          {DIM_LABELS.map((label, i) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground w-24">{label}</span>
              <StarPicker value={dimScores[i]} onChange={(v) => {
                const next = [...dimScores];
                next[i] = v;
                setDimScores(next);
              }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Review text */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-medium">评价内容</h2>
        <Textarea
          placeholder="请写下你的真实体验：工作内容、带教风格、成长收获等（至少 20 字）"
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground text-right">{reviewText.length} 字</p>
      </Card>

      {/* Submit */}
      {uploadError && (
        <p className="text-sm text-red-500">{uploadError}</p>
      )}
      {writeError && (
        <p className="text-sm text-red-500">{writeError.message}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {uploading
          ? "加密上传中…"
          : isPending
          ? "等待钱包确认…"
          : isConfirming
          ? "链上确认中…"
          : "提交评价"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        评价内容经 AES 加密后存储在 IPFS，链上仅记录哈希，无法被删除或篡改。
      </p>
    </div>
  );
}

// ─── StarPicker ──────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl transition-transform hover:scale-110
            ${star <= (hovered || value) ? "text-yellow-400" : "text-muted"}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
