"use client";

import type { Metadata } from "next";
import { AuthContent } from "./_components/AuthContent";


import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { decodeEventLog } from "viem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { internSbtAbi, internSbtAddress } from "@/lib/contract";

// ─── Types ───────────────────────────────────────────────────────────────────

type IssuedCredential = {
  credentialId: string;
  companyId: string;
  companyName: string;
  credentialHash: string;
  expireTime: number;
  signature: string;
};

type Phase = "upload" | "verifying" | "ready_to_mint" | "minting" | "done";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

// ─── Component ───────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();
  const { address, chainId, status } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [credential, setCredential] = useState<IssuedCredential | null>(null);

  const wrongNetwork = chainId != null && chainId !== avalancheFuji.id;
  const isConnected = status === "connected" && !!address;

  // Mint SBT
  const { writeContract, data: txHash, error: writeError, isPending } = useWriteContract();
  const { data: receipt, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // After mint confirmed → extract tokenId from event log → store in localStorage
  useEffect(() => {
    if (!isConfirmed || !receipt || !credential) return;

    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: internSbtAbi,
          eventName: "SBTMinted",
          topics: log.topics,
          data: log.data,
        });
        tokenId = decoded.args.tokenId.toString();
        break;
      } catch {
        // not this event, skip
      }
    }

    localStorage.setItem(
      "rmm_sbt",
      JSON.stringify({
        tokenId: tokenId ?? "1",
        companyName: credential.companyName,
        companyId: credential.companyId,
      })
    );
    setPhase("done");
  }, [isConfirmed, receipt, credential]);

  // When mint tx is submitted
  useEffect(() => {
    if (isPending) setPhase("minting");
  }, [isPending]);

  // ── File pick ──
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setVerifyError(null);
    setPreviewUrl(URL.createObjectURL(f));
  }

  // ── Submit offer to backend ──
  async function handleVerify() {
    if (!file || !address) return;
    setPhase("verifying");
    setVerifyError(null);

    try {
      const formData = new FormData();
      formData.append("offer", file);
      formData.append("userAddress", address);

      const res = await fetch(`${API_BASE}/auth/submit-offer`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!json.success) {
        setVerifyError(json.message ?? "验证失败");
        setPhase("upload");
        return;
      }

      setCredential(json.data as IssuedCredential);
      setPhase("ready_to_mint");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "网络错误，请稍后重试");
      setPhase("upload");
    }
  }

  // ── Mint SBT ──
  function handleMint() {
    if (!credential) return;
    writeContract({
      address: internSbtAddress,
      abi: internSbtAbi,
      functionName: "mintSBT",
      args: [
        credential.credentialId,
        credential.companyId,
        credential.credentialHash as `0x${string}`,
        BigInt(credential.expireTime),
        credential.signature as `0x${string}`,
      ],
    });
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h1 className="text-2xl font-semibold tracking-tight">请先连接钱包</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          点击右上角「Connect Wallet」连接你的钱包后，再来验证实习身份。
        </p>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold">网络不对</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          请在钱包中切换到 <b>Avalanche Fuji (43113)</b> 测试网。
        </p>
      </div>
    );
  }

  // ── Done ──
  if (phase === "done") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20">
        <Card className="p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-semibold">SBT 铸造成功！</h2>
          <p className="text-sm text-muted-foreground">
            你的 <b>{credential?.companyName}</b> 实习凭证已上链，身份验证完成。
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
          <Button className="w-full mt-2" onClick={() => router.push("/review")}>
            去写评价 →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">身份验证</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        连接你的钱包以验证身份。支持 SIWE、OAuth 或 SBT 校验。
      </p>
      <div className="mt-8">
        <AuthContent />

      </div>

      {/* Step 1: Upload */}
      <Card className="p-5 space-y-4">
        <StepLabel step={1} label="上传 Offer Letter 图片" done={phase !== "upload" && phase !== "verifying"} />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="offer preview"
            className="w-full max-h-64 object-contain rounded border"
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {phase === "upload" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? "重新选择图片" : "选择图片"}
            </Button>
            {file && (
              <Button
                className="flex-1"
                onClick={handleVerify}
              >
                提交验证
              </Button>
            )}
          </div>
        )}

        {phase === "verifying" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> AI 正在识别 Offer Letter，请稍候…
          </div>
        )}

        {verifyError && (
          <p className="text-sm text-red-500">{verifyError}</p>
        )}
      </Card>

      {/* Step 2: Mint SBT */}
      {(phase === "ready_to_mint" || phase === "minting") && credential && (
        <Card className="p-5 space-y-4">
          <StepLabel step={2} label="铸造实习 SBT（可选）" done={false} />

          <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">公司</span>
              <span className="font-medium">{credential.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">有效期至</span>
              <span>{new Date(credential.expireTime * 1000).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">钱包</span>
              <span className="font-mono text-xs">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            点击铸造后 MetaMask 会弹出确认，Gas 费约 0.001 AVAX（Fuji 测试网可免费领取）。<br />
            也可以先跳过，在提交评价时再铸造。
          </p>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleMint}
              disabled={phase === "minting" || isPending}
            >
              {phase === "minting" || isPending ? (
                <span className="flex items-center gap-2"><Spinner />铸造中…</span>
              ) : (
                "铸造 SBT"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/review")}
            >
              跳过，去评价 →
            </Button>
          </div>

          {writeError && (
            <p className="text-xs text-red-500">{writeError.message}</p>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StepLabel({ step, label, done }: { step: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
          ${done ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}
      >
        {done ? "✓" : step}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
