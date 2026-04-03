import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { GeneratedAvatar } from "../components/ui/GeneratedAvatar";
import { ComposeForm, PublishStatus } from "../components/sections/ComposeForm";
import { formatWalletLabel } from "../lib/format";
import { useAppState } from "../state/useAppState";
import { ComposeInput } from "../types/domain";

type ComposeLocationState = {
  draftText?: string;
  parentTitle?: string;
};

function toParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

export function ComposePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get("parentId");
  const { state, publishSignal } = useAppState();
  const locationState = (location.state ?? null) as ComposeLocationState | null;
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const walletAddress = state.session.walletAddress ?? "";
  const walletLabel = formatWalletLabel(walletAddress);

  async function handleSubmit(input: ComposeInput) {
    setError(null);

    try {
      setPublishStatus("encrypting");
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      setPublishStatus("uploading");
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      setPublishStatus("contract");
      await publishSignal(input);

      setShowSuccess(true);
      window.setTimeout(() => {
        setPublishStatus("idle");
        setShowSuccess(false);
        navigate(input.visibility === "public" ? "/discover" : "/me?tab=signals");
      }, 1300);
    } catch (submitError) {
      setPublishStatus("idle");
      setError(submitError instanceof Error ? submitError.message : "发布失败，请重试");
    }
  }

  const draftText = locationState?.draftText?.trim() ?? "";
  const initialValues: Partial<ComposeInput> | undefined = draftText
    ? {
        contentHtml: toParagraphs(draftText),
        hook: draftText.slice(0, 60),
        question:
          parentId && locationState?.parentTitle
            ? `你想把《${locationState.parentTitle}》继续传给谁？`
            : "",
        visibility: "public",
      }
    : undefined;

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0F1A] px-6 text-center text-[#E8E4F0]">
        <div className="animate-fade-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(196,168,90,0.2)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l4 4L19 8"
                stroke="#C4A85A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#C4A85A]">信号弹已升空！</h2>
          <p className="mt-2 text-sm text-gray-400">正在返回对应页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#E8E4F0]">
      <header className="sticky top-0 z-30 border-b border-[#1A1A2E] bg-[#0F0F1A]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/discover")}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-[#C4A85A]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            返回
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-[#1A1A2E] px-3 py-1.5">
              <GeneratedAvatar address={walletAddress} size={20} className="border-[#2A2A4A]" />
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">{walletLabel}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 space-y-3 text-center">
          <h1 className="text-3xl font-bold text-[#E8E4F0]">发出你的信号弹</h1>
          <p className="mx-auto max-w-md text-gray-500">
            在人群中寻找同频者。公开部分吸引目光，私密部分等待知音。
          </p>
        </div>

        <ComposeForm
          publishStatus={publishStatus}
          error={error}
          parentId={parentId}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
