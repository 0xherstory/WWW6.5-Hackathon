//链路：
// 连钱包
// 写自由文本评价
// 调 AI 提取结构化评分
// 用户确认/微调
// 上传到后端拿 cidBytes32
// 调合约 submitReview

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

type SbtInfo = {
  tokenId: string;
  companyName: string;
  companyId: string;
};

type TargetType = "mentor" | "company";

type AIReviewResult = {
  overallScore: number;
  dimensionScores: Array<{
    dimension: string;
    score: number;
    comment: string;
  }>;
  summary: string;
  tags: string[];
  isQualified: boolean;
  unqualifiedReason: string;
};

type DialogState = null | "confirm_mint" | "ai_extract_failed";
type Phase = "input" | "extracting" | "review_ai_result" | "submitting" | "submitted";

// 强制类型为 Phase 以解决严格的字面量类型检查
const INPUT_PHASE: Phase = "input" satisfies Phase;
const EXTRACTING_PHASE: Phase = "extracting" satisfies Phase;
const SUBMITTING_PHASE: Phase = "submitting" satisfies Phase;
const REVIEW_AI_RESULT_PHASE: Phase = "review_ai_result" satisfies Phase;
const SUBMITTED_PHASE: Phase = "submitted" satisfies Phase;

const DIM_LABELS = ["成长支持", "预期清晰度", "沟通质量", "工作强度", "尊重与包容"] as const;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

export default function ReviewPage() {
  const router = useRouter();
  const { address, chainId, status } = useAccount();

  const wrongNetwork = chainId != null && chainId !== avalancheFuji.id;
  const isConnected = status === "connected" && !!address;

  const [sbt, setSbt] = useState<SbtInfo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rmm_sbt");
      if (raw) {
        setSbt(JSON.parse(raw) as SbtInfo);
      }
    } catch {
      setSbt(null);
    }

    }, []);

  const [phase, setPhase] = useState<Phase>("input");
  const [targetName, setTargetName] = useState("");
  const [department, setDepartment] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  const [aiResult, setAiResult] = useState<AIReviewResult | null>(null);
  const [dimScores, setDimScores] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const [overallScore, setOverallScore] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const {
    writeContract,
    data: txHashFromWrite,
    error: writeError,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHashFromWrite,
    });

  useEffect(() => {
    if (txHashFromWrite) {
      setTxHash(txHashFromWrite);
    }
  }, [txHashFromWrite]);

  useEffect(() => {
    if (isConfirmed) {
      setPhase("submitted");
    }
  }, [isConfirmed]);

  const targetId = useMemo(
    () => keccak256(toBytes(targetName.trim() || "unknown")),
    [targetName]
  );

  function resetForm() {
    setPhase("input");
    setDepartment("mentor");
    setTargetName("");
    setReviewText("");
    setDialog(null);
    setAiResult(null);
    setDimScores([0, 0, 0, 0, 0]);
    setOverallScore(0);
    setAiError(null);
    setUploadError(null);
    setTxHash(null);
  }

  function getSafeDimensionScore(index: number): number {
    const score = aiResult?.dimensionScores?.[index]?.score;
    if (typeof score === "number" && score >= 1 && score <= 5) {
      return Math.round(score);
    }
    return 0;
  }

  function getSafeDimensionComment(index: number): string {
    return aiResult?.dimensionScores?.[index]?.comment ?? "";
  }

  async function handleExtractAI() {
    if (!targetName.trim()) {
      setAiError("请先填写评价对象");
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 20) {
      setAiError("评价内容至少需要 20 字");
      return;
    }

    setPhase("extracting");
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch(`${API_BASE}/ai/extract-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawContent: reviewText.trim(),
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setAiError(json.message ?? "AI 提取失败");
        setPhase("input");
        setDialog("ai_extract_failed");
        return;
      }

      const result = json.data as AIReviewResult;

      if (!result.isQualified) {
        setAiError(`内容不合格：${result.unqualifiedReason}`);
        setPhase("input");
        setDialog("ai_extract_failed");
        return;
      }

      setAiResult(result);
      setOverallScore(Math.max(1, Math.min(5, Math.round(result.overallScore))));
      setDimScores([
        getScoreOrDefault(result.dimensionScores?.[0]?.score),
        getScoreOrDefault(result.dimensionScores?.[1]?.score),
        getScoreOrDefault(result.dimensionScores?.[2]?.score),
        getScoreOrDefault(result.dimensionScores?.[3]?.score),
        getScoreOrDefault(result.dimensionScores?.[4]?.score),
      ]);
      setPhase("review_ai_result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "网络错误";
      setAiError(msg);
      setPhase("input");
      setDialog("ai_extract_failed");
    }
  }

  async function handleSubmit() {
    if (!sbt) {
      setDialog("confirm_mint");
      return;
    }

    setPhase("submitting");
    setUploadError(null);

    try {
      const { cidBytes32 } = await uploadReview(reviewText.trim());

      // 转换为 bytes32 格式 (0x... 格式)
      const cidBytes = cidBytes32.startsWith("0x")
        ? cidBytes32 as `0x${string}`
        : `0x${cidBytes32}` as `0x${string}`;

      writeContract({
        address: reviewContractAddress,
        abi: reviewContractAbi,
        functionName: "submitReview",
        args: [
          BigInt(sbt.tokenId),
          targetId,
          department,
          overallScore,
          dimScores,
          cidBytes32 as `0x${string}`,
        ],
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "上传失败");
      setPhase("review_ai_result");
    }
  }

  // if (!isConnected) {
  //   return (
  //     <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
  //       <div className="mb-4 text-4xl">🔗</div>
  //       <h1 className="text-2xl font-semibold">请先连接钱包</h1>
  //       <p className="mt-2 text-sm text-muted-foreground">
  //         连接钱包后才能提交评价。
  //       </p>
  //     </div>
  //   );
  // }

  if (wrongNetwork) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="text-xl font-semibold">请切换到 Fuji 测试网</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          当前链 ID：{chainId}，需要 Fuji（43113）。
        </p>
      </div>
    );
  }

  if (phase === SUBMITTED_PHASE) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20">
        <Card className="space-y-4 p-8 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-semibold">评价已成功上链</h2>
          <p className="text-sm text-muted-foreground">
            你对 <b>{targetName}</b> 的评价已永久记录在 Avalanche Fuji 链上。
          </p>

          {txHash && (
            <a
              href={`https://testnet.snowtrace.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-blue-500 underline"
            >
              在 Snowtrace 查看交易 ↗
            </a>
          )}

          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/mentors")}
            >
              查看企业榜单
            </Button>
            <Button className="flex-1" onClick={resetForm}>
              再写一条
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "input" || phase === "extracting") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">写评价</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            用自由文本描述你的实习体验，AI 会帮你提取结构化评分。
          </p>
        </div>

        {sbt ? (
          <Card className="border-green-200 bg-green-50 p-3">
            <p className="text-xs text-green-700">
              ✓ 已持有实习 SBT 凭证（{sbt.companyName}）
            </p>
          </Card>
        ) : (
          <Card className="border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              💡 提示：首次提交前需要先完成身份验证并铸造 SBT。
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 pl-1 text-blue-700 underline"
                onClick={() => router.push("/auth")}
              >
                立即去验证
              </Button>
            </p>
          </Card>
        )}

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-medium">评价内容</h2>

          <Input
            placeholder="企业名称（如：字节跳动）"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
          />

          <Input
            placeholder="机构/部门（如：抖音电商运营部）"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <Textarea
            placeholder="写下你的真实评价...（至少 20 字）"
            rows={6}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <p className="text-right text-xs text-muted-foreground">
            {reviewText.length} 字
          </p>
        </Card>

        {aiError && <p className="text-sm text-red-500">{aiError}</p>}

        <Button
          className="w-full"
          size="lg"
          onClick={handleExtractAI}
          disabled={!targetName.trim() || reviewText.trim().length < 20 || phase === EXTRACTING_PHASE}
        >
          {phase === EXTRACTING_PHASE ? (
            <span className="flex items-center gap-2">
              <Spinner />
              AI 正在分析…
            </span>
          ) : (
            "让 AI 帮我评分"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          AI 会分析你的文字内容，并生成 5 个维度的评分建议。
        </p>
      </div>
    );
  }

  if ((phase === "review_ai_result" || phase === "submitting") && aiResult) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">确认评分</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI 已根据你的描述生成评分建议，你可以接受或手动调整。
          </p>
        </div>

        <Card className="space-y-2 p-5">
          <h3 className="text-sm font-medium">你的原始评价</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {reviewText}
          </p>
        </Card>

        <Card className="space-y-3 border-blue-200 bg-blue-50 p-5">
          <h3 className="text-sm font-medium text-blue-900">📊 AI 分析总结</h3>
          <p className="text-xs text-blue-800">{aiResult.summary}</p>

          {aiResult.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {aiResult.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-blue-200 px-2 py-1 text-xs text-blue-900"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">综合评分</h2>
            <span className="text-xs text-muted-foreground">
              AI 建议：{Math.round(aiResult.overallScore)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StarPicker value={overallScore} onChange={setOverallScore} />
            <span className="w-8 text-sm font-semibold">{overallScore}</span>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-medium">维度评分（可调整）</h2>

          <div className="space-y-4">
            {DIM_LABELS.map((label, i) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    AI：{getSafeDimensionScore(i)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StarPicker
                    value={dimScores[i]}
                    onChange={(v) => {
                      const next: [number, number, number, number, number] = [...dimScores];
                      next[i] = v;
                      setDimScores(next);
                    }}
                  />
                  <span className="w-8 text-sm font-semibold">{dimScores[i]}</span>
                </div>

                <p className="text-xs italic text-muted-foreground">
                  {getSafeDimensionComment(i)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        {writeError && <p className="text-sm text-red-500">{writeError.message}</p>}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setPhase("input");
              setAiResult(null);
              setAiError(null);
            }}
          >
            ← 重新写评价
          </Button>

          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isPending || isConfirming || phase === SUBMITTING_PHASE}
          >
            {isPending || isConfirming ? (
              <span className="flex items-center gap-2">
                <Spinner />
                提交中…
              </span>
            ) : (
              "确认并提交"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          评价内容会先加密存储到 IPFS，链上记录其对应标识，提交后不可篡改。
        </p>
      </div>
    );
  }

  if (phase === SUBMITTING_PHASE) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-20 text-center">
        <Spinner />
        <h2 className="text-lg font-semibold">提交中…</h2>
        <p className="text-sm text-muted-foreground">
          正在上传评价到 IPFS，并发起链上交易…
        </p>
      </div>
    );
  }

  if (dialog === "confirm_mint") {
    return (
      <Dialog>
        <div className="space-y-3 p-4">
          <h2 className="font-semibold">首次提交需要 SBT 凭证</h2>
          <p className="text-sm text-muted-foreground">
            为了确保评价的真实性，首次评分前需要先绑定你的实习身份。现在去验证并铸造 SBT 吗？
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDialog(null);
                setPhase("review_ai_result");
              }}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setDialog(null);
                router.push("/auth");
              }}
            >
              去验证身份
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  if (dialog === "ai_extract_failed") {
    return (
      <Dialog>
        <div className="space-y-3 p-4">
          <h2 className="font-semibold">AI 分析失败</h2>
          <p className="text-sm text-muted-foreground">{aiError}</p>
          <p className="text-xs text-muted-foreground">
            请检查评价内容是否完整、真实，并且与评价对象相关。
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setDialog(null);
              setPhase("input");
              setAiError(null);
            }}
          >
            返回编辑
          </Button>
        </div>
      </Dialog>
    );
  }

  return null;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl transition-transform hover:scale-110 ${
            star <= (hovered || value) ? "text-yellow-400" : "text-muted"
          }`}
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

function Dialog({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-sm">{children}</Card>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
}

function getScoreOrDefault(score: unknown): number {
  if (typeof score === "number" && score >= 1 && score <= 5) {
    return Math.round(score);
  }
  return 0;
}



// "use client";

// import { Card } from "@/components/ui/card";
// import { Star } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { MOCK_MENTOR_DETAIL } from "@/data/detail-mock";
// import Link from "next/link";

// export default function ReviewPage() {
//   const mentors = Object.values(MOCK_MENTOR_DETAIL).slice(0, 3);

//   return (
//     <div className="mx-auto w-full max-w-4xl px-4 py-16">
//       <h1 className="text-2xl font-semibold tracking-tight">发布评价</h1>
//       <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
//         选择 Mentor、点击评价按钮进入 Mentor 详情页面、填写评分与文字评价；AI 自动分析提取标签和评分；提交后上链或存证。
//       </p>

//       <div className="mt-8 space-y-8">
//         {/* 选择 Mentor */}
//         <div>
//           <h2 className="mb-4 text-lg font-semibold">选择 Mentor</h2>
//           <div className="grid gap-4 md:grid-cols-2">
//             {mentors.map((mentor) => (
//               <Card key={mentor.id} className="p-4">
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1">
//                     <h3 className="font-semibold">{mentor.name}</h3>
//                     <p className="mt-1 text-sm text-muted-foreground">
//                       {mentor.title}
//                     </p>
//                     <div className="mt-2 flex items-center gap-2">
//                       <div className="flex">
//                         {Array.from({ length: 5 }).map((_, i) => (
//                           <Star
//                             key={i}
//                             className={`h-3.5 w-3.5 ${
//                               i < Math.floor(mentor.rating)
//                                 ? "fill-amber-400 text-amber-400"
//                                 : "fill-muted text-muted"
//                             }`}
//                           />
//                         ))}
//                       </div>
//                       <span className="text-xs text-muted-foreground">
//                         {mentor.rating} ({mentor.reviewCount} 条评价)
//                       </span>
//                     </div>
//                   </div>
//                   <Link href={`/mentor/${encodeURIComponent(mentor.id)}`}>
//                     <Button size="sm">
//                       评价
//                     </Button>
//                   </Link>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* 提示信息 */}
//         <div>
//           <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
//             <p className="text-sm text-blue-800 dark:text-blue-200">
//               💡 点击 "评价" 按钮进入 Mentor 详情页面，在详情页面点击 "写评价" 按钮即可评价该 Mentor。
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
