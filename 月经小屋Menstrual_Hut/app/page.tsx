"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { avalancheFuji } from "thirdweb/chains";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import "react-day-picker/style.css";

import { RegisterDialog } from "@/components/RegisterDialog";
import { getExperienceBody } from "@/lib/experience-content";
import { isIdentityRegistered } from "@/lib/hut-identity-storage";
import {
  hutConnectButtonClassName,
  hutConnectTheme,
} from "@/lib/thirdweb-connect-theme";
import { thirdwebClient } from "@/lib/thirdweb-client";

type Locale = "zh" | "en";
type ShareMode = "free" | "paid" | "private";
type UploadPhase = "idle" | "prepare" | "ipfs" | "chain" | "mint" | "success";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TEXT_FILE_MAX_BYTES = 512 * 1024;
const TEXT_FILE_ACCEPT = ".txt,.md,.markdown,.csv,.log,.json,text/plain,text/markdown,application/json";

function isLikelyTextFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  if (file.type === "application/json") return true;
  if (file.type === "" || file.type === "application/octet-stream") {
    const n = file.name.toLowerCase();
    return /\.(txt|md|markdown|csv|log|json|text)$/i.test(n);
  }
  return false;
}

const messages = {
  zh: {
    brand: "Menstrual Hut | 月经小屋",
    slogan: "No uterus, no opinion",
    connectWallet: "连接钱包",
    uploadTitle: "来小屋存储你的生命经验吧 🌙",
    textareaPlaceholder:
      "今天我感觉怎样，我的月经颜色如何……（完全匿名，写下你的感受，最多 1000 字）",
    radioPaid: "公开收费经验贴",
    tipPaid: "感谢你！你的经验将会帮助其他姐妹，同时为你赚取 MOON 代币",
    radioFree: "公开免费经验贴",
    tipFree: "感谢你！你的经验将会帮助其他姐妹",
    radioPrivate: "隐私模式（放入小屋保险箱）",
    tipPrivate: "完全隐私，仅自己可见，上链加密存储",
    submit: "上传到小屋",
    connectFirst: "请先连接钱包",
    stepPrepare: "正在准备你的感受...",
    stepIpfs: "上传到永久存储 (IPFS)...",
    stepChain: "记录到 Avalanche Fuji 区块链...",
    stepMint: "正在铸造 MOON 代币奖励...",
    stepSuccess: "上传成功！你的感受已成为链上永恒的一部分 ✨",
    viewMyArchive: "查看我的小屋",
    personalCenter: "个人中心",
    uploadHint: "匿名 · 不可篡改 · 上链永恒 · 数据主权属于你",
    textFromFile: "上传文件",
    textFileHint: "支持 .txt、.md 等纯文本；内容会填入上方输入框（最多保留 1000 字）",
    textFileTypeError: "请选择纯文本文件（如 .txt、.md、.csv）",
    textFileReadError: "无法读取该文件，请重试",
    textFileEmpty: "文件里没有可读文字",
    textFileTooBig: "文件过大，请选择小于 512KB 的文本文件",
    guardian: "我的周期守护者",
    noData: "请在日历中选择你最近一次经期的开始日期",
    averageCycle: "平均周期",
    averageCycleInput: "输入你的平均月经周期（天）",
    confirm: "确认",
    daysLeft: "距离下一次潮汐",
    dayUnit: "天",
    explorePlaceholder: "有什么问题？来看看姐妹们是怎么解决的……",
    search: "搜索",
    searching: "正在寻找公开的帖子…",
    noResults: "没有找到匹配的公开帖子，让我们换个关键词试试吧。",
    topics: [
      "我解决了痛经",
      "女性妇科医生推荐",
      "如何在成年后改姓随母姓？",
      "保护婚内财产的小Tips",
      "月经杯使用心得",
      "经前期综合症",
    ],
    marquee: [
      "月经是人类体内的潮汐",
      "先有月经才有月",
      "你的身体如月亮，盈亏有期，却始终完整",
      "温柔对待每一次潮起潮落",
    ],
    network: "当前网络：Avalanche Fuji Testnet",
    footer: "Made with care for every woman's body",
    completeIdentityBtn: "完善身份",
    identityComplete: "已完善身份",
    connectFirstForIdentity: "请先连接钱包，再完善小屋身份",
    registerDialogTitle: "完善你的小屋身份 🌙",
    registerDialogSubtitle: "为了让你即使忘记钱包密码也能回来，我们需要绑定以下信息",
    registerWalletHint: "当前绑定钱包",
    registerPhone: "手机号",
    registerPhonePh: "11 位手机号",
    registerId: "身份证号",
    registerIdPh: "18 位身份证号码",
    registerPassword: "设置登录密码",
    registerPasswordPh: "至少 6 位",
    registerPasswordConfirm: "确认登录密码",
    registerPasswordConfirmPh: "再次输入密码",
    registerSubmit: "确认绑定并注册",
    registerSubmitting: "正在保存…",
    registerPrivacy:
      "所有信息将加密存储在本地演示空间中，仅用于找回小屋身份示意，不会公开。正式上线请使用服务端与合规方案。",
    registerSuccessTitle: "绑定成功",
    registerSuccessBody: "身份绑定成功！你现在可以用手机号 + 密码登录了 ✨",
    registerClose: "好的",
    registerNoWallet: "请先连接钱包，再完成身份绑定。",
    registerPhoneError: "请输入有效的 11 位中国大陆手机号。",
    registerIdError: "请输入 18 位身份证号（末位可为 X）。",
    registerPwdShort: "密码至少 6 位，请设置更易记又安全的组合。",
    registerPwdMismatch: "两次输入的密码不一致，请再确认一次。",
    registerAlready: "该钱包已绑定过身份。",
    registerSaveError: "保存失败，请稍后重试。",
  },
  en: {
    brand: "Menstrual Hut | 月经小屋",
    slogan: "No uterus, no opinion",
    connectWallet: "Connect Wallet",
    uploadTitle: "Store your life experience in the hut 🌙",
    textareaPlaceholder:
      "How do you feel today? What is your flow like... (fully anonymous, max 1000 characters)",
    radioPaid: "Public paid experience",
    tipPaid: "Thank you! Your story helps other sisters and can earn you MOON tokens",
    radioFree: "Public free experience",
    tipFree: "Thank you! Your story helps other sisters",
    radioPrivate: "Private mode (hut vault)",
    tipPrivate: "Fully private, only visible to you, encrypted on-chain storage",
    submit: "Upload to the hut",
    connectFirst: "Please connect your wallet first",
    stepPrepare: "Preparing your feeling...",
    stepIpfs: "Uploading to permanent storage (IPFS)...",
    stepChain: "Recording on Avalanche Fuji...",
    stepMint: "Minting your MOON reward...",
    stepSuccess: "Uploaded! Your feeling is now part of the chain forever ✨",
    viewMyArchive: "View my hut",
    personalCenter: "Profile",
    uploadHint: "Anonymous · Tamper-proof · On-chain forever · Your data sovereignty",
    textFromFile: "Upload file",
    textFileHint: "Plain text like .txt or .md; fills the box above (max 1000 characters kept)",
    textFileTypeError: "Please choose a plain text file (.txt, .md, .csv, …)",
    textFileReadError: "Could not read this file. Try again.",
    textFileEmpty: "This file has no readable text",
    textFileTooBig: "File is too large. Use a text file under 512KB.",
    guardian: "My Cycle Guardian",
    noData: "Please pick the start date of your latest period from the calendar",
    averageCycle: "Average cycle",
    averageCycleInput: "Enter your average cycle length (days)",
    confirm: "Confirm",
    daysLeft: "Days until next tide",
    dayUnit: "days",
    explorePlaceholder: "Any question? See how sisters solved it...",
    search: "Search",
    searching: "Looking for public posts…",
    noResults: "No matching public posts found. Try another keyword gently.",
    topics: [
      "I solved period pain",
      "Trusted female gynecologists",
      "How to change surname to mother's?",
      "Tips to protect marital assets",
      "Menstrual cup user notes",
      "Premenstrual syndrome",
    ],
    marquee: [
      "Menstruation is the tide inside human bodies",
      "Menstruation comes before moon",
      "Your body is like the moon: cyclical, yet always whole",
      "Be gentle with every rise and fall",
    ],
    network: "Network: Avalanche Fuji Testnet",
    footer: "Made with care for every woman's body",
    completeIdentityBtn: "Complete identity",
    identityComplete: "Identity saved",
    connectFirstForIdentity: "Connect your wallet first to complete your hut identity",
    registerDialogTitle: "Complete your hut identity 🌙",
    registerDialogSubtitle:
      "So you can find your way back even if you forget your wallet password, we need to bind the following",
    registerWalletHint: "Wallet to bind",
    registerPhone: "Mobile number",
    registerPhonePh: "11-digit number",
    registerId: "ID number",
    registerIdPh: "18-digit ID",
    registerPassword: "Login password",
    registerPasswordPh: "At least 6 characters",
    registerPasswordConfirm: "Confirm password",
    registerPasswordConfirmPh: "Re-enter password",
    registerSubmit: "Confirm and register",
    registerSubmitting: "Saving…",
    registerPrivacy:
      "Demo only: data is stored locally for illustration. Production must use a secure server and compliant practices. Never exposed publicly.",
    registerSuccessTitle: "You’re all set",
    registerSuccessBody:
      "Identity bound! You’ll be able to sign in with phone + password when we enable it ✨",
    registerClose: "Close",
    registerNoWallet: "Please connect your wallet before binding your identity.",
    registerPhoneError: "Enter a valid 11-digit China mainland mobile number.",
    registerIdError: "Enter an 18-digit ID (last digit may be X).",
    registerPwdShort: "Use at least 6 characters for your password.",
    registerPwdMismatch: "The two passwords don’t match. Please try again.",
    registerAlready: "This wallet is already registered.",
    registerSaveError: "Could not save. Please try again.",
  },
} as const;

function HomeContent({
  locale,
  onToggleLocale,
}: {
  locale: Locale;
  onToggleLocale: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const account = useActiveAccount();
  const walletConnected = !!account?.address;

  const [entry, setEntry] = useState("");
  const [shareMode, setShareMode] = useState<ShareMode>("paid");
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadError, setUploadError] = useState("");
  const [periodStart, setPeriodStart] = useState<Date | undefined>();
  const [cycleDays, setCycleDays] = useState(28);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [filePickError, setFilePickError] = useState("");
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [identityRev, setIdentityRev] = useState(0);

  const walletAddrLower = account?.address?.toLowerCase() ?? "";
  const identityRegistered = useMemo(() => {
    if (!walletAddrLower) return false;
    return isIdentityRegistered(walletAddrLower);
  }, [walletAddrLower, identityRev]);

  const entryLen = entry.length;
  const isUploading =
    uploadPhase === "prepare" ||
    uploadPhase === "ipfs" ||
    uploadPhase === "chain" ||
    uploadPhase === "mint";

  const statusText = useMemo(() => {
    if (uploadPhase === "prepare") return t("stepPrepare");
    if (uploadPhase === "ipfs") return t("stepIpfs");
    if (uploadPhase === "chain") return t("stepChain");
    if (uploadPhase === "mint") return t("stepMint");
    if (uploadPhase === "success") return t("stepSuccess");
    return "";
  }, [t, uploadPhase]);

  const handleHutUpload = async () => {
    const text = entry.trim();
    if (!text) return;
    if (!walletConnected) {
      setUploadError(t("connectFirst"));
      return;
    }
    if (entryLen > 1000) return;

    setUploadError("");
    setUploadPhase("prepare");
    await sleep(900);
    setUploadPhase("ipfs");
    await sleep(1200);
    setUploadPhase("chain");
    await sleep(1200);
    setUploadPhase("mint");
    await sleep(1200);
    setUploadPhase("success");
    setEntry("");
  };

  const handleTextFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setFilePickError("");
    if (!file) return;
    if (file.size > TEXT_FILE_MAX_BYTES) {
      setFilePickError(t("textFileTooBig"));
      return;
    }
    if (!isLikelyTextFile(file)) {
      setFilePickError(t("textFileTypeError"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      if (!raw.trim()) {
        setFilePickError(t("textFileEmpty"));
        return;
      }
      setUploadError("");
      setUploadPhase((prev) => (prev === "success" ? "idle" : prev));
      setEntry(raw.slice(0, 1000));
    };
    reader.onerror = () => setFilePickError(t("textFileReadError"));
    reader.readAsText(file, "UTF-8");
  };

  const daysUntilNext = useMemo(() => {
    if (!periodStart) return null;
    const next = new Date(periodStart);
    next.setDate(next.getDate() + cycleDays);
    const diff = Math.ceil(
      (next.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
    );
    return Math.max(diff, 0);
  }, [periodStart, cycleDays]);

  const liquidPercent = useMemo(() => {
    if (daysUntilNext == null) return 24;
    return Math.min(90, Math.max(18, 100 - (daysUntilNext / cycleDays) * 100));
  }, [daysUntilNext, cycleDays]);

  const filteredTopics = useMemo(() => {
    const raw = messages[locale].topics;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter((topic) => topic.toLowerCase().includes(q));
  }, [locale, searchQuery]);

  const openExperience = (topicTitle: string) => {
    const body = getExperienceBody(locale, topicTitle);
    const detail =
      body ||
      (locale === "zh"
        ? `「${topicTitle}」的详细内容稍后由社区补充。\n\n这是一段占位文字：谢谢你愿意点开阅读。若你有真实经验，也欢迎上传到小屋，让更多姐妹看见。`
        : `Details for “${topicTitle}” will be filled in by the community.\n\nThis is placeholder copy—thank you for reading gently. When you are ready, upload your story to the hut.`);
    const qs = new URLSearchParams({
      lang: locale,
      title: topicTitle,
      content: detail,
    });
    router.push(`/experience?${qs.toString()}`);
  };

  // Mock contract read: if wallet connected, try to fetch last period start + average cycle.
  // Replace this block with real thirdweb contract calls later.
  useEffect(() => {
    if (!walletConnected) return;

    const mock = {
      latestPeriodStart: null as Date | null,
      avgCycleDays: 28,
    };

    setCycleDays(mock.avgCycleDays);
    setPeriodStart(mock.latestPeriodStart ?? undefined);
  }, [walletConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] text-[#4c1d95]">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/65 px-4 py-3 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f9a8d4] bg-white/90 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#9f1239]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 13c3.5-1 5.6-4.3 7.5-8 0 6 2.5 8 8.5 8-3.8 1.1-5.7 3.2-7.1 7-1.2-2.7-3.5-4.2-8.9-7z" />
              </svg>
            </span>
            <p className="text-sm font-semibold md:text-base">{t("brand")}</p>
          </div>
          <p className="hidden text-center text-sm italic text-[#9f1239] md:block">{t("slogan")}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="glow-hover flex shrink-0 items-center">
              <ConnectButton
                client={thirdwebClient}
                chain={avalancheFuji}
                theme={hutConnectTheme}
                connectButton={{
                  label: t("connectWallet"),
                  className: hutConnectButtonClassName,
                }}
                onConnect={(w) => {
                  const addr = w.getAccount()?.address;
                  if (addr && !isIdentityRegistered(addr.toLowerCase())) {
                    setRegisterOpen(true);
                  }
                }}
              />
            </div>
            {walletConnected && identityRegistered ? (
              <Link
                href="/profile"
                className="glow-hover inline-flex max-w-[8.5rem] truncate rounded-full border border-emerald-200/90 bg-emerald-50/90 px-3 py-2 text-sm font-medium text-emerald-900"
              >
                {t("identityComplete")}
              </Link>
            ) : walletConnected ? (
              <button
                type="button"
                onClick={() => setRegisterOpen(true)}
                className="glow-hover rounded-full border border-[#f9a8d4] bg-white px-3 py-2 text-sm font-medium text-[#9f1239]"
              >
                {t("completeIdentityBtn")}
              </button>
            ) : (
              <button
                type="button"
                disabled
                title={t("connectFirstForIdentity")}
                className="cursor-not-allowed rounded-full border border-pink-200/80 bg-white/50 px-3 py-2 text-sm font-medium text-[#9f1239]/45"
              >
                {t("completeIdentityBtn")}
              </button>
            )}
            <Link
              href="/profile"
              className="glow-hover rounded-full border border-[#f9a8d4] bg-white px-3 py-2 text-sm font-medium text-[#9f1239]"
            >
              {t("personalCenter")}
            </Link>
            <button
              onClick={onToggleLocale}
              className="glow-hover rounded-full border border-[#f9a8d4] bg-white px-3 py-2 text-sm font-medium text-[#9f1239]"
            >
              {locale === "zh" ? "中 / EN" : "EN / 中"}
            </button>
          </div>
        </nav>
      </header>

      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        walletAddress={account?.address}
        onRegistered={() => setIdentityRev((n) => n + 1)}
      />

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-12">
        <section className="panel col-span-1 space-y-4 lg:col-span-3">
          <h1 className="text-2xl font-bold leading-snug text-[#9f1239]">{t("uploadTitle")}</h1>
          <div>
            <textarea
              value={entry}
              onChange={(e) => {
                setUploadError("");
                if (uploadPhase === "success") setUploadPhase("idle");
                setEntry(e.target.value.slice(0, 1000));
              }}
              maxLength={1000}
              disabled={isUploading}
              placeholder={t("textareaPlaceholder")}
              className="min-h-48 w-full rounded-2xl border border-pink-200/90 bg-white/80 p-4 text-sm text-[#4c1d95] outline-none ring-[#d946ef]/45 placeholder:text-[#9f1239]/55 focus:ring-2 disabled:opacity-60"
            />
            <p className="mt-1 text-right text-xs text-[#9f1239]/75">{entryLen}/1000</p>
            <input
              ref={textFileInputRef}
              type="file"
              accept={TEXT_FILE_ACCEPT}
              className="sr-only"
              tabIndex={-1}
              disabled={isUploading}
              onChange={handleTextFileChange}
            />
            <div className="mt-2 flex flex-col gap-1.5">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => textFileInputRef.current?.click()}
                className="glow-hover w-full rounded-xl border border-pink-200/90 bg-white/90 px-3 py-2.5 text-sm font-medium text-[#9f1239] shadow-sm transition hover:border-[#f9a8d4] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-describedby="text-file-hint"
              >
                {t("textFromFile")}
              </button>
              <p id="text-file-hint" className="text-xs leading-relaxed text-[#9f1239]/70">
                {t("textFileHint")}
              </p>
              {filePickError ? (
                <p className="text-xs text-rose-700" role="alert">
                  {filePickError}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <label
              title={t("tipPaid")}
              className="glow-hover flex cursor-pointer items-center gap-3 rounded-xl border border-pink-200 bg-white/80 px-3 py-2 transition hover:border-[#f9a8d4]/90"
            >
              <input
                type="radio"
                name="mode"
                checked={shareMode === "paid"}
                onChange={() => setShareMode("paid")}
                disabled={isUploading}
                className="h-4 w-4 accent-[#d946ef]"
              />
              <span>{t("radioPaid")}</span>
            </label>
            <label
              title={t("tipFree")}
              className="glow-hover flex cursor-pointer items-center gap-3 rounded-xl border border-pink-200 bg-white/80 px-3 py-2 transition hover:border-[#f9a8d4]/90"
            >
              <input
                type="radio"
                name="mode"
                checked={shareMode === "free"}
                onChange={() => setShareMode("free")}
                disabled={isUploading}
                className="h-4 w-4 accent-[#d946ef]"
              />
              <span>{t("radioFree")}</span>
            </label>
            <label
              title={t("tipPrivate")}
              className="glow-hover flex cursor-pointer items-center gap-3 rounded-xl border border-pink-200 bg-white/80 px-3 py-2 transition hover:border-[#f9a8d4]/90"
            >
              <input
                type="radio"
                name="mode"
                checked={shareMode === "private"}
                onChange={() => setShareMode("private")}
                disabled={isUploading}
                className="h-4 w-4 accent-[#d946ef]"
              />
              <span>{t("radioPrivate")}</span>
            </label>
          </div>
          <button
            type="button"
            onClick={handleHutUpload}
            disabled={isUploading || entry.trim().length === 0 || entryLen > 1000}
            className="glow-hover w-full rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("submit")}
          </button>
          <Link
            href="/my-archive"
            className="glow-hover block w-full rounded-2xl border-2 border-[#9f1239] bg-[#fff7fb] px-4 py-3 text-center text-sm font-semibold text-[#9f1239] shadow-sm transition"
          >
            {t("viewMyArchive")}
          </Link>
          {uploadError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2 text-sm text-rose-800" role="alert">
              {uploadError}
            </p>
          ) : null}
          {uploadPhase !== "idle" ? (
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                uploadPhase === "success"
                  ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-900"
                  : "border-pink-200/80 bg-white/75 text-[#9f1239]"
              }`}
              role="status"
              aria-live="polite"
            >
              {isUploading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d946ef] border-t-transparent"
                    aria-hidden
                  />
                  {statusText}
                </span>
              ) : (
                statusText
              )}
            </div>
          ) : null}
          <p className="text-xs text-[#9f1239]/80">{t("uploadHint")}</p>
        </section>

        <section className="panel col-span-1 space-y-4 lg:col-span-6">
          <h2 className="text-center text-2xl font-semibold text-[#9f1239]">{t("guardian")}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setPeriodDialogOpen(true);
              }}
              onClick={() => setPeriodDialogOpen(true)}
              className="glow-hover cursor-pointer rounded-2xl border border-pink-200/80 bg-white/75 p-3"
            >
              <div className="space-y-2">
                <p className={`text-sm ${periodStart ? "text-[#9f1239]" : "text-[#9f1239]/90"}`}>
                  {periodStart
                    ? `${t("averageCycle")}: ${cycleDays}${locale === "zh" ? "天" : " days"}`
                    : t("noData")}
                </p>
                <p className="text-xs text-[#9f1239]/70">
                  {periodStart
                    ? `${locale === "zh" ? "最近经期开始：" : "Latest start: "}${periodStart.toLocaleDateString()}`
                    : locale === "zh"
                      ? "点击选择日期"
                      : "Click to pick a date"}
                </p>
                <div className="pt-1">
                  <label className="mb-1 block text-xs text-[#9f1239]/80">{t("averageCycleInput")}</label>
                  <input
                    type="number"
                    min={18}
                    max={60}
                    value={cycleDays}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isNaN(n) && n >= 18 && n <= 60) setCycleDays(n);
                    }}
                    className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-[#4c1d95] outline-none ring-[#d946ef]/40 focus:ring-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-pink-200/80 bg-white/70 p-4">
              <div className="glass-sphere" style={{ ["--fill" as string]: `${liquidPercent}%` }} />
              <p className="text-sm text-[#9f1239]">
                {t("daysLeft")}:
                {" "}
                <span className="font-semibold">
                  {daysUntilNext ?? "--"} {t("dayUnit")}
                </span>
              </p>
            </div>
          </div>
          <div className="marquee-wrap rounded-full border border-pink-200/80 bg-white/80 py-2">
            <div className="marquee-track text-sm text-[#9f1239]">
              {[...Array(2)].map((_, row) => (
                <span key={row} className="mr-8">
                  {messages[locale].marquee.join("  •  ")}
                </span>
              ))}
            </div>
          </div>
        </section>

        {periodDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-pink-200/80 bg-white/92 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[#9f1239]">{t("noData")}</h3>
              </div>
              <div className="mt-3 rounded-xl bg-white p-2">
                <DayPicker
                  mode="single"
                  selected={periodStart}
                  onSelect={(date) => {
                    if (date) setPeriodStart(date);
                  }}
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setPeriodDialogOpen(false)}
                  className="glow-hover w-full rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  {t("confirm")}
                </button>
              </div>
            </div>
          </div>
        )}

        <section id="explore" className="panel scroll-mt-24 col-span-1 space-y-4 lg:col-span-3">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setSearching(true);
                  setTimeout(() => setSearching(false), 400);
                }
              }}
              className="w-full rounded-xl border border-pink-200 bg-white/85 px-4 py-3 text-sm outline-none ring-[#d946ef]/40 placeholder:text-[#9f1239]/60 focus:ring-2"
              placeholder={t("explorePlaceholder")}
            />
            <button
              type="button"
              onClick={() => {
                setSearching(true);
                setTimeout(() => setSearching(false), 400);
              }}
              className="glow-hover shrink-0 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
            >
              {t("search")}
            </button>
          </div>
          <div className="space-y-3">
            {searching ? (
              <p className="text-sm text-[#9f1239]/90">{t("searching")}</p>
            ) : filteredTopics.length === 0 ? (
              <p className="text-sm text-[#9f1239]/90">{t("noResults")}</p>
            ) : (
              filteredTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => openExperience(topic)}
                  className="glow-hover w-full rounded-xl border border-pink-200 bg-white/85 px-4 py-3 text-left text-sm text-[#9f1239] transition hover:border-[#f9a8d4]"
                >
                  {topic}
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 pb-8 text-sm text-[#9f1239] md:flex-row">
        <p>{t("network")}</p>
        <p className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ec4899]" />
          MOON:
          {" "}
          {walletConnected ? "88.8" : "--"}
        </p>
        <p>{t("footer")}</p>
      </footer>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("zh");

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale] as unknown as AbstractIntlMessages}
    >
      <HomeContent
        locale={locale}
        onToggleLocale={() => setLocale((l) => (l === "zh" ? "en" : "zh"))}
      />
    </NextIntlClientProvider>
  );
}
