"use client";

import { useState, useCallback, useEffect } from "react";
import { Star, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
  error?: string | null;
  onSubmit?: (review: {
    rating: number;
    comment: string;
    tags: string[];
    scores?: Record<string, number>;
  }) => void | Promise<void>;
}

interface AnalysisResult {
  tags: string[];
  scores: Record<string, number>;
  sentiment: "positive" | "neutral" | "negative";
}

export function ReviewDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
  error: externalError,
  onSubmit,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当弹窗打开时，如果有外部错误，显示它
  useEffect(() => {
    if (open && externalError) {
      setError(externalError);
    }
  }, [open, externalError]);

  // 当弹窗关闭时，重置所有状态
  useEffect(() => {
    console.log("open",open)
    if (!open) {
      // 清理所有状态，防止订阅错误
      setRating(5);
      setHoverRating(0);
      setComment("");
      setIsAnalyzing(false);
      setAnalysis(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  // 当评论内容改变时，自动分析
  const analyzeReview = useCallback(async () => {
    if (!comment.trim()) {
      setAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    // 防止在弹窗关闭时执行
    if (!open) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/analyze-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
          rating,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("AI分析失败");
      }

      const data: AnalysisResult = await response.json();
      // 仅在弹窗仍然打开时更新状态
      setAnalysis(data);
      setIsAnalyzing(false);
    } catch (err) {
      // 无论成功失败，都要关闭 loading 状态
      setIsAnalyzing(false);
      setAnalysis(null);

      // 仅在弹窗开启时显示错误
      if (open) {
        const errorMsg = err instanceof Error ? err.message : "分析失败，请重试";
        // 忽略因为弹窗关闭而导致的abort错误
        if (!errorMsg.includes("abort") && !errorMsg.includes("cancelled")) {
          setError(errorMsg);
        }
      }
    }
  }, [comment, rating, open]);

  // 防抖：输入完毕 500ms 后自动分析
  useEffect(() => {
    if (!open) return; // 弹窗关闭时不分析

    const timer = setTimeout(() => {
      if (comment.trim()) {
        analyzeReview();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [comment, rating, analyzeReview, open]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("请输入评价内容");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // 调用 onSubmit，由父组件决定是否成功
      // 如果失败，父组件会设置 externalError
      // 如果成功，父组件会关闭弹窗
      await onSubmit?.({
        rating,
        comment,
        tags: analysis?.tags || [],
        scores: analysis?.scores,
      });
      // 如果没有抛出错误，说明成功，关闭弹窗
      onOpenChange(false);
    } catch (err) {
      // onSubmit 抛出错误时显示
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消按钮：安全关闭弹窗
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    open&&<Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 dark:bg-slate-950">
        {/* 标题 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">评价 {mentorName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            分享你的真实体验，帮助社区做出更好的选择
          </p>
        </div>

        <div className="space-y-6">
          {/* 评价内容 - 放在最上面 */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">你的评价 *</label>
            <Textarea
              placeholder="请详细描述你的评价体验...（最少 10 字）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length} 字 · AI 会自动分析你的评价
            </p>
          </div>

          {/* 评分 */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">总体评分</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        (hoverRating || rating) > i
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium">
                {hoverRating || rating}/5
              </span>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* AI 分析结果 */}
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 py-4 dark:bg-blue-950">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-700 dark:text-blue-200">AI 正在分析你的评价...</p>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <div className="space-y-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  AI 分析结果
                </h3>

                {/* 分析标签 */}
                {analysis.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {analysis.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 分析评分 */}
                {Object.keys(analysis.scores).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(analysis.scores).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        communication: "沟通能力",
                        technical: "技术水平",
                        responsiveness: "响应速度",
                        overall: "综合评分",
                      };
                      return (
                        <div key={key}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-emerald-900 dark:text-emerald-100">
                              {labels[key] || key}
                            </span>
                            <span className="font-medium text-emerald-900 dark:text-emerald-100">
                              {(value * 20).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-emerald-200 dark:bg-emerald-800">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${value * 20}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 情感分析 */}
                <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-300">
                  情感分析：
                  <span className="ml-1 font-medium">
                    {analysis.sentiment === "positive"
                      ? "积极 😊"
                      : analysis.sentiment === "negative"
                        ? "消极 😞"
                        : "中性 😐"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交评价"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
