import { useState, useCallback } from "react";

export interface AnalysisResult {
  tags: string[];
  scores: Record<string, number>;
  sentiment: "positive" | "neutral" | "negative";
}

export interface UseAIAnalysisReturn {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  analyze: (comment: string, rating: number) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for analyzing review comments with AI
 * Automatically extracts tags, scores and sentiment from review text
 */
export function useAIAnalysis(): UseAIAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (comment: string, rating: number) => {
    if (!comment.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error("AI 分析失败");
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "分析失败，请重试";
      setError(errorMessage);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyze,
    reset,
  };
}
