import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

import { TAG_OPTIONS } from "../../data/seed";
import { cn } from "../../lib/cn";
import { stripHtml } from "../../lib/format";
import { ComposeInput, SignalVisibility, TagId } from "../../types/domain";

export type PublishStatus = "idle" | "encrypting" | "uploading" | "contract";

interface ComposeFormProps {
  publishStatus: PublishStatus;
  error: string | null;
  parentId: string | null;
  initialValues?: Partial<ComposeInput>;
  onSubmit: (input: ComposeInput) => Promise<void>;
}

export function ComposeForm({
  publishStatus,
  error,
  parentId,
  initialValues,
  onSubmit,
}: ComposeFormProps) {
  const initialContentHtml = initialValues?.contentHtml ?? "";
  const [hook, setHook] = useState(() => initialValues?.hook ?? "");
  const [question, setQuestion] = useState(() => initialValues?.question ?? "");
  const [contentHtml, setContentHtml] = useState(() => initialContentHtml);
  const [selectedTags, setSelectedTags] = useState<TagId[]>(() => initialValues?.tags ?? []);
  const [visibility, setVisibility] = useState<SignalVisibility>(() => initialValues?.visibility ?? "public");
  const [localError, setLocalError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPublishing = publishStatus !== "idle";

  useEffect(() => {
    if (!contentRef.current || !initialContentHtml) {
      return;
    }

    contentRef.current.innerHTML = initialContentHtml;
  }, [initialContentHtml]);

  function executeCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  }

  function toggleTag(tagId: TagId) {
    if (isPublishing) {
      return;
    }

    setSelectedTags((previous) => {
      if (previous.includes(tagId)) {
        return previous.filter((item) => item !== tagId);
      }

      if (previous.length >= 3) {
        return previous;
      }

      return [...previous, tagId];
    });
  }

  function getButtonText() {
    if (publishStatus === "encrypting") return "加密中...";
    if (publishStatus === "uploading") return "上传中...";
    if (publishStatus === "contract") return "发射中...";
    return "发出信号弹";
  }

  function validate() {
    if (visibility === "public") {
      if (hook.trim().length < 10) {
        return "引子太短了，再多写一点吧";
      }

      if (hook.trim().length > 200) {
        return "引子太长了，控制在 200 字以内";
      }

      if (question.trim().length < 5) {
        return "问题太短了";
      }

      if (question.trim().length > 100) {
        return "问题太长了，控制在 100 字以内";
      }
    }

    if (!stripHtml(contentHtml).trim()) {
      return "请写下你要分享的内容...";
    }

    if (!selectedTags.length) {
      return "请选择至少一个标签";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validate();
    setLocalError(validationError);

    if (validationError) {
      return;
    }

    const normalizedHook = visibility === "public" ? hook.trim() : "";
    const normalizedQuestion = visibility === "public" ? question.trim() : "";

    await onSubmit({
      hook: normalizedHook,
      question: normalizedQuestion,
      contentHtml: contentHtml.trim(),
      tags: selectedTags,
      parentId,
      visibility,
    });
  }

  const visibleError = error ?? localError;
  const isPrivateOnly = visibility === "private";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#9B7FD4]">📡 发布范围</label>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            disabled={isPublishing}
            className={cn(
              "rounded-xl border px-5 py-5 text-left transition-all duration-300 disabled:opacity-50",
              visibility === "public"
                ? "border-[#C4A85A] bg-[rgba(196,168,90,0.08)] text-[#C4A85A]"
                : "border-[#2A2A4A] bg-[#1A1A2E] text-gray-400 hover:border-[#C4A85A]",
            )}
          >
            <div className="text-lg font-medium">公开发出信号弹</div>
            <div className="mt-2 text-sm leading-7 text-[#6B7280]">进入首页 Feed，等待别人看见并回应。</div>
          </button>
          <button
            type="button"
            onClick={() => setVisibility("private")}
            disabled={isPublishing}
            className={cn(
              "rounded-xl border px-5 py-5 text-left transition-all duration-300 disabled:opacity-50",
              visibility === "private"
                ? "border-[#9B7FD4] bg-[rgba(155,127,212,0.08)] text-[#B39AE3]"
                : "border-[#2A2A4A] bg-[#1A1A2E] text-gray-400 hover:border-[#9B7FD4]",
            )}
          >
            <div className="text-lg font-medium">仅自己主页可见</div>
            <div className="mt-2 text-sm leading-7 text-[#6B7280]">不进入首页，会静静保留在你的个人页。</div>
          </button>
        </div>
      </div>

      {isPrivateOnly ? null : (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#9B7FD4]">🌟 公开引子</label>
            <textarea
              value={hook}
              onChange={(event) => setHook(event.target.value)}
              placeholder="写下能吸引同频者的第一束光..."
              className="w-full resize-none rounded-xl border border-[#2A2A4A] bg-[#1A1A2E] px-5 py-4 text-[#E8E4F0] outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#C4A85A]"
              rows={3}
              maxLength={200}
              disabled={isPublishing}
            />
            <div className="text-right text-xs text-gray-500">{hook.length} / 200</div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#9B7FD4]">❓ 秘密问题</label>
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="提出一个只有懂的人才能回答的问题..."
              className="w-full rounded-xl border border-[#2A2A4A] bg-[#1A1A2E] px-5 py-4 text-[#E8E4F0] outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#C4A85A]"
              maxLength={100}
              disabled={isPublishing}
            />
            <div className="text-right text-xs text-gray-500">{question.length} / 100</div>
          </div>
        </>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#9B7FD4]">🔒 私密正文</label>
        <div className="flex flex-wrap gap-2 px-2">
          <ToolbarButton disabled={isPublishing} onClick={() => executeCommand("formatBlock", "h2")}>
            H
          </ToolbarButton>
          <ToolbarButton disabled={isPublishing} onClick={() => executeCommand("bold")}>
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton disabled={isPublishing} onClick={() => executeCommand("italic")}>
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton disabled={isPublishing} onClick={() => executeCommand("insertUnorderedList")}>
            • 列表
          </ToolbarButton>
          <ToolbarButton disabled={isPublishing} onClick={() => executeCommand("insertOrderedList")}>
            1. 列表
          </ToolbarButton>
        </div>
        <div
          ref={contentRef}
          contentEditable={!isPublishing}
          suppressContentEditableWarning
          data-placeholder="写下你要分享的内容...将被加密后发送"
          onInput={(event) => setContentHtml(event.currentTarget.innerHTML)}
          className="content-editable min-h-[300px] w-full rounded-xl border border-[#2A2A4A] bg-[#1A1A2E] px-5 py-4 text-[#E8E4F0] outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#C4A85A]"
          style={{ wordBreak: "break-word" }}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#9B7FD4]">🏷️ 选择标签（1-3个）</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const selected = selectedTags.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                disabled={isPublishing}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-all duration-300 disabled:opacity-50",
                  selected
                    ? "bg-[#C4A85A] font-medium text-[#0F0F1A] shadow-lg"
                    : "border border-[#2A2A4A] bg-[#1A1A2E] text-gray-400 hover:border-[#C4A85A] hover:text-[#C4A85A]",
                )}
              >
                {tag.emoji} {tag.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-gray-500">已选择: {selectedTags.length} / 3</div>
      </div>

      {visibleError ? (
        <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-4 text-sm text-red-300">
          ⚠️ {visibleError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPublishing}
        className={cn(
          "w-full rounded-xl py-4 text-lg font-medium transition-all duration-300",
          !isPublishing
            ? "bg-[#C4A85A] text-[#0F0F1A] shadow-lg hover:-translate-y-0.5 hover:bg-[#D4B86A] hover:shadow-xl"
            : "cursor-not-allowed bg-gray-700 text-gray-500",
        )}
      >
        {getButtonText()}
      </button>

      <div className="text-center text-xs text-gray-600">
        {visibility === "public"
          ? "💡 公开部分所有人可见，私密部分将被加密，作者再决定是否开门"
          : "💡 这条内容不会进入首页，只会保留在你的个人页中"}
      </div>
    </form>
  );
}

function ToolbarButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
    >
      {children}
    </button>
  );
}
