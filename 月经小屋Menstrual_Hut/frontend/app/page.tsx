"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { avalancheFuji } from "thirdweb/chains";
import { client } from "@/lib/thirdweb-client";
import { getContract, prepareContractCall } from "thirdweb";
import { useWalletBalance, ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import "react-day-picker/style.css";

import { RegisterDialog } from "@/components/RegisterDialog";
import { getExperienceBody } from "@/lib/experience-content";
import { isIdentityRegistered } from "@/lib/hut-identity-storage";
import {
  hutConnectButtonClassName,
  hutConnectTheme,
} from "@/lib/thirdweb-connect-theme";

const MOON_TOKEN_ADDRESS = "0x0e99AE008922E4547EE0e35388a0a4FD907C6c01";
const HUT_CONTRACT_ADDRESS = "0xFe33db86B9d73DE2EeA4290A41fca2Cfdc90E71D";

const moonTokenContract = getContract({
  client,
  chain: avalancheFuji,
  address: MOON_TOKEN_ADDRESS,
});

// 常量：IPFS 访问网关
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/"; // 若遇到网络问题可换成 "https://ipfs.io/ipfs/"

// --- 新增：单条真实帖子组件 ---
function PostItem({ index, locale }: { index: number; locale: string }) {
  // ① 读取合约记录（新增 postType uint8 和 price uint256）
  const { data: record, isLoading } = useReadContract({
    contract: hutContract,
    method: "function records(uint256) view returns (string cid, address author, uint256 timestamp, bool isHelp, bool isDonation, uint8 postType, uint256 price)",
    params: [BigInt(index)],
  });

  const [postContent, setPostContent] = useState<string>("");
  const [isFetchingIpfs, setIsFetchingIpfs] = useState(false);
  const [unlocking, setUnlocking] = useState(false);   // 新增：解锁中状态
  const [unlockError, setUnlockError] = useState("");   // 新增：解锁错误提示

  const account = useActiveAccount();                   // 新增：当前钱包
  const viewerAddress = account?.address;
  const { mutateAsync: sendTransaction } = useSendTransaction(); // 新增：发交易

  // ② 读取当前用户是否有权限查看（仅收费帖需要，其余直接 true）
  const { data: canView, refetch: refetchCanView } = useReadContract({
    contract: hutContract,
    method: "function canViewRecord(uint256 _recordId, address _viewer) view returns (bool)",
    params: [BigInt(index), viewerAddress ?? "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      // 只有收费帖且钱包已连接时才查链
      enabled: !!viewerAddress && record?.[5] === 1,
    },
  });

  // 是否可以直接看内容：免费帖(0)/隐私帖(2)由内容本身决定；收费帖(1)看 canView
  const isUnlocked = !record || record[5] !== 1 || (canView ?? false) || record[1].toLowerCase() === viewerAddress?.toLowerCase();

  // ③ 拉取 IPFS 内容（已解锁才拉，避免白拉）
  useEffect(() => {
    if (record && record[0] && isUnlocked) {
      const cid = record[0];
      setIsFetchingIpfs(true);
      fetch(`${IPFS_GATEWAY}${cid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.content) setPostContent(data.content);
        })
        .catch((err) => {
          console.error("Fetch IPFS error:", err);
          setPostContent(locale === "zh" ? "内容加载失败..." : "Failed to load content...");
        })
        .finally(() => setIsFetchingIpfs(false));
    }
  }, [record, locale, isUnlocked]);

  // ④ 解锁函数：approve → viewPaidRecord（两步交易）
  const handleUnlock = async () => {
    if (!viewerAddress || !record) return;
    setUnlocking(true);
    setUnlockError("");
    try {
      const priceWei = record[6] as bigint;

      // 第一步：授权 MenstrualHut 合约花费 MOON
      const approveTx = prepareContractCall({
        contract: moonTokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [HUT_CONTRACT_ADDRESS, priceWei],
      });
      await sendTransaction(approveTx);

      // 第二步：调用付费查看，合约内完成转账
      const viewTx = prepareContractCall({
        contract: hutContract,
        method: "function viewPaidRecord(uint256 _recordId) public",
        params: [BigInt(index)],
      });
      await sendTransaction(viewTx);

      // 刷新权限状态，触发内容拉取
      await refetchCanView();
    } catch (e) {
      console.error("解锁失败", e);
      if (e instanceof Error) {
        if (e.message.includes("user rejected") || e.message.includes("User denied")) {
          setUnlockError(locale === "zh" ? "已取消交易" : "Transaction cancelled");
        } else {
          setUnlockError(locale === "zh" ? `解锁失败：${e.message.slice(0, 60)}` : `Unlock failed: ${e.message.slice(0, 60)}`);
        }
      }
    } finally {
      setUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-3 text-sm text-[#4c1d95]/50 animate-pulse">
        正在加载链上数据...
      </div>
    );
  }

  if (!record) return null;

  // 隐私帖：不显示在公开列表中
  if (record[5] === 2) return null;

  const authorShort = `${record[1].slice(0, 6)}...${record[1].slice(-4)}`;
  const dateStr = new Date(Number(record[2]) * 1000).toLocaleString();
  const priceDisplay = (Number(record[6]) / 1e18).toFixed(0);

  return (
    <div className="rounded-xl bg-white p-4 text-sm text-[#4c1d95] shadow-sm transition hover:shadow-md">
      {/* 作者 + 时间 */}
      <div className="mb-2 flex items-center justify-between text-xs text-[#9f1239]/60">
        <span className="font-mono bg-pink-50 px-2 py-0.5 rounded-md">{authorShort}</span>
        <span>{dateStr}</span>
      </div>

      {/* 内容区：收费未解锁显示付费墙，其余正常显示 */}
      <div className="whitespace-pre-wrap leading-relaxed">
        {record[5] === 1 && !isUnlocked ? (
          // 付费墙
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-[#9f1239]/70">
              🔒 这是一篇收费经验贴，需要 {priceDisplay} MOON 才能阅读
            </p>
            {!viewerAddress ? (
              <p className="text-xs text-[#9f1239]/50">请先连接钱包</p>
            ) : (
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unlocking ? "处理中（共需 2 次确认）…" : `花 ${priceDisplay} MOON 解锁`}
              </button>
            )}
            {unlockError && (
              <p className="text-xs text-rose-600">{unlockError}</p>
            )}
          </div>
        ) : (
        <>
          {/* 作者看自己的收费帖时，加一个提示 */}
          {record[5] === 1 && record[1].toLowerCase() === viewerAddress?.toLowerCase() && (
            <p className="mb-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
              👑 你是作者，免费查看 · 其他姐妹需付 {priceDisplay} MOON
            </p>
          )}
          {isFetchingIpfs ? (
            <span className="animate-pulse text-[#9f1239]/60">正在从 IPFS 解析感受...</span>
          ) : (
            postContent || "（无文字内容）"
          )}
        </>
        )}
      </div>

      {/* 类型徽章 */}
      <div className="mt-2 flex gap-2">
        {record[5] === 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">免费公开</span>
        )}
        {record[5] === 1 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
            收费 {priceDisplay} MOON
          </span>
        )}
      </div>
    </div>
  );
}


const hutContract = getContract({
  client,
  chain: avalancheFuji,
  address: HUT_CONTRACT_ADDRESS,
});

type Locale = "zh" | "en";
type ShareMode = "free" | "paid" | "private";
type UploadPhase = "idle" | "prepare" | "ipfs" | "chain" | "mint" | "success";

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
    endPeriod: "结束经期",
    endingPeriod: "正在结束...",
    periodDetail: "经期详细",
    postBrowsing: "帖子浏览",
    mockPost1: "🌙 今天第一天，肚子有点酸，给自己泡了杯热红糖水，姐妹们也要照顾好自己呀。",
    mockPost2: "✨ 终于鼓起勇气去了医院做常规检查，女医生非常温柔，大家有不舒服千万别硬扛！",
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
    endPeriod: "End Period",
    endingPeriod: "Ending...",
    periodDetail: "Period Detail",
    postBrowsing: "Community Posts",
    mockPost1: "🌙 First day today. A bit of cramps, but ginger tea helps. Take care of yourselves, sisters.",
    mockPost2: "✨ Finally went for my checkup. The female doctor was so gentle. Don't ignore your body's signals!",
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
  // 新增状态：判断当前是否处于经期、控制经期详细弹窗
const [isPeriodActive, setIsPeriodActive] = useState(false);
const [periodDetailOpen, setPeriodDetailOpen] = useState(false);

  const { data: moonBalance } = useWalletBalance({
    client,
    chain: avalancheFuji,
    address: account?.address,       // 当前登录的钱包地址
    tokenAddress: MOON_TOKEN_ADDRESS // MOON币的合约地址
  });

  const { mutateAsync: sendTransaction } = useSendTransaction();

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
  const [paidPrice, setPaidPrice] = useState<string>("5");

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
    if (!entry.trim()) return;

    // 验证钱包连接
    if (!walletConnected) {
      setUploadError(t("connectFirst"));
      return;
    }

    setUploadPhase("prepare");
    setUploadError("");

    try {
      // 步骤 1：上传文本到 IPFS
      console.log("开始上传到 IPFS...");
      console.log("API 端点: /api/upload");
      const ipfsRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           content: entry,
           timestamp: new Date().toISOString(),
           isPublic: shareMode !== "private" 
        }),
      });

      console.log(`IPFS 响应状态: ${ipfsRes.status}`);
      console.log(`响应 URL: ${ipfsRes.url}`);
      console.log(`响应类型: ${ipfsRes.type}`);

      if (!ipfsRes.ok) {
        // Response body 只能读取一次，所以先读取为 text，然后尝试 parse
        const responseText = await ipfsRes.text();
        console.error("API 错误响应:", responseText);
        
        let errorMsg = `API 返回 ${ipfsRes.status}`;
        try {
          const errData = JSON.parse(responseText);
          errorMsg += `: ${errData.error || responseText}`;
        } catch {
          errorMsg += `: ${responseText}`;
        }
        throw new Error(errorMsg);
      }

      const resData = await ipfsRes.json();
      const cid = resData.cid;
      if (!cid) throw new Error("IPFS 上传失败：没有返回 CID");

      console.log(`成功获得 CID: ${cid}`);
      setUploadPhase("chain");

      // 步骤 2：构造智能合约调用
      const postTypeMap: Record<ShareMode, number> = { free: 0, paid: 1, private: 2 };
      const priceInWei =
        shareMode === "paid"
          ? BigInt(Math.floor(parseFloat(paidPrice || "0") * 1e18))
          : BigInt(0);

      const transaction = prepareContractCall({
        contract: hutContract,
        method: "function uploadRecord(string memory _cid, bool _isHelp, bool _isDonation, uint8 _postType, uint256 _price) public",
        params: [cid, false, false, postTypeMap[shareMode], priceInWei],
      });

      // 步骤 3：唤起钱包签名并发送上链
      console.log("准备发送交易到区块链...");
      await sendTransaction(transaction);
      
      console.log("交易成功!");
      setUploadPhase("success");
      setEntry(""); // 清空输入框
      
      // 3 秒后重置为 idle
      setTimeout(() => {
        setUploadPhase("idle");
      }, 3000);

    } catch (error) {
      console.error("上传失败:", error);
      setUploadPhase("idle");
      
      let errorMsg = "上传失败";
      if (error instanceof Error) {
        if (
          error.message.includes("User denied") || 
          error.message.includes("user rejected") || 
          error.message.includes("4001")
        ) {
          errorMsg = locale === "zh" ? "您已取消交易签名" : "Transaction rejected by user";
        }else if (error.message.includes("404")) {
          errorMsg = locale === "zh" 
            ? "API 端点不存在，请确保服务器已启动" 
            : "API endpoint not found. Please ensure the server is running.";
        } else if (error.message.includes("IPFS")) {
          errorMsg = error.message;
        } else if (error.message.includes("execution reverted") || error.message.includes("Execution Reverted")) {
          errorMsg = locale === "zh" 
            ? "合约执行失败，请检查钱包权限或代币配置" 
            : "Contract execution failed";
        } else {
          errorMsg = error.message;
        }
      } else {
        errorMsg = locale === "zh" 
          ? "上传失败，请确保钱包已连接且有足够的测试网 AVAX" 
          : "Upload failed. Please check your wallet connection and balance.";
      }
      
      setUploadError(errorMsg);
    }
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

  // --- 新增经期打卡上链函数 ---
  const handleRecordPeriod = async () => {
    if (!periodStart) {
      return;
    }

    if (!walletConnected) {
      setPeriodDialogOpen(false);
      setUploadError(t("connectFirst"));
      return;
    }

    try {
      console.log("准备发送经期打卡交易...");
      console.log("钱包地址:", account?.address);
      console.log("合约地址:", HUT_CONTRACT_ADDRESS);
      
      // 1. 验证流量级别（1-3）
      const flowLevel = 1; // 默认正常流量
      if (flowLevel < 1 || flowLevel > 3) {
        throw new Error("Invalid flow level, must be 1-3");
      }

      // 2. 准备合约调用：对应 MenstrualHut.sol 中的 startPeriod 函数
      const transaction = prepareContractCall({
        contract: hutContract,
        method: "function startPeriod(uint8 _flowLevel, string memory _symptomCid) public",
        params: [flowLevel, ""],
      });

      console.log("交易已准备，等待用户签名...");
      
      // 3. 发送交易并等待钱包签名确认
      const txResult = await sendTransaction(transaction);
      
      console.log("交易已提交，结果:", txResult);

      // 4. 成功后的反馈
      setPeriodDialogOpen(false);
      setUploadError(""); // 清除之前的错误
      
      // 3 秒后重置
      setTimeout(() => {
        setUploadError("");
      }, 3000);
      
    } catch (error) {
      console.error("经期打卡失败:", error);
      let errorMsg = "";
      
      if (error instanceof Error) {
        // 处理常见的智能合约错误
        if (error.message.includes("execution reverted") || error.message.includes("Execution Reverted")) {
          errorMsg = locale === "zh" 
            ? `合约执行失败。可能原因：\n1. MOON 代币配置错误\n2. 合约权限不足\n3. 冷却时间还未到达\n错误信息: ${error.message.substring(0, 100)}` 
            : `Contract execution failed. Possible causes:\n1. MOON token configuration error\n2. Insufficient contract permissions\n3. Cooldown period not reached\nError: ${error.message.substring(0, 100)}`;
        } else if (error.message.includes("user rejected") || error.message.includes("User denied") || error.message.includes("reject")) {
          errorMsg = locale === "zh" 
            ? "您已拒绝交易" 
            : "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds") || error.message.includes("insufficient balance")) {
          errorMsg = locale === "zh" 
            ? "钱包余额不足，请确保有足够的 AVAX" 
            : "Insufficient wallet balance. Please ensure you have enough AVAX";
        } else if (error.message.includes("network") || error.message.includes("connection")) {
          errorMsg = locale === "zh" 
            ? "网络连接错误，请检查网络并重试" 
            : "Network connection error. Please check your network and try again";
        } else {
          errorMsg = locale === "zh" 
            ? `发生错误: ${error.message}` 
            : `An error occurred: ${error.message}`;
        }
      } else {
        errorMsg = locale === "zh" 
          ? "发生未知错误，请查看控制台日志" 
          : "Unknown error occurred. Please check console logs";
      }
      
      setUploadError(errorMsg);
    }
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

  const { data: myPeriods, isLoading: isLoadingPeriods } = useReadContract({
    contract: hutContract,
    method: "function getMyPeriods() view returns ((uint256 startTime, uint256 endTime, uint8 flowLevel, string symptomCid)[])",
    params: [],
    queryOptions: { enabled: !!account?.address } 
  });

  // 获取全站总记录数
  const { data: totalRecords } = useReadContract({
    contract: hutContract,
    method: "function getTotalRecords() view returns (uint256)",
    params: [],
  });

  // 计算最新 N 条记录的索引（这里展示最新 5 条）
  const latestPostIndices = useMemo(() => {
    if (!totalRecords) return [];
    const total = Number(totalRecords);
    const indices = [];
    // 倒序排列，最新的排在最前面
    const start = Math.max(0, total - 5);
    for (let i = total - 1; i >= start; i--) {
      indices.push(i);
    }
    return indices;
  }, [totalRecords]);

  const handleEndPeriod = async () => {
    if (!walletConnected) {
      setUploadError(t("connectFirst"));
      return;
    }
    try {
      const transaction = prepareContractCall({
        contract: hutContract,
        method: "function endPeriod() public",
        params: [],
      });
      
      await sendTransaction(transaction);
      
      // 乐观更新前端状态
      setIsPeriodActive(false);
      setUploadError(""); 
    } catch (error) {
      console.error("结束经期失败:", error);
      setUploadError(locale === "zh" ? "结束经期失败，请重试" : "Failed to end period");
    }
  };

  useEffect(() => {
    // 只有当钱包连接了，且合约成功返回了数据数组时才执行
    if (!walletConnected || !myPeriods || myPeriods.length === 0) {
        // 如果没数据，保持默认值
        return;
    }

    // 获取数组中的最后一条经期记录（最近一次打卡）
    const lastRecord = myPeriods[myPeriods.length - 1];
    
    // 合约存的是 Unix 时间戳（秒），BigInt 类型
    // 我们需要转成毫秒并转换成 JS 的 Date 对象，供前端日历和计算使用
    if (lastRecord.startTime > BigInt(0)) {
      const startDate = new Date(Number(lastRecord.startTime) * 1000);
      setPeriodStart(startDate);
      console.log("成功同步链上经期数据，开始日期:", startDate);
      setIsPeriodActive(lastRecord.endTime === BigInt(0));
    }
    // 如果你的合约里未来存储了用户的平均周期，也可以在这里 setCycleDays
  }, [walletConnected, myPeriods]);

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
                client={client}
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
          {shareMode === "paid" && (
            <div className="rounded-xl border border-pink-200 bg-white/80 px-3 py-2">
              <label className="mb-1 block text-xs text-[#9f1239]/70">
                设置阅读价格（MOON 代币数量）
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={paidPrice}
                onChange={(e) => setPaidPrice(e.target.value)}
                disabled={isUploading}
                className="w-full rounded-lg border border-pink-100 bg-white px-3 py-2 text-sm text-[#4c1d95] outline-none focus:ring-2 focus:ring-[#d946ef]/40"
                placeholder="例如：5"
              />
            </div>
          )}

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
            {/* 左侧：经期信息与按钮 */}
            <div className="glow-hover rounded-2xl border border-pink-200/80 bg-white/75 p-4 flex flex-col justify-between">
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
                      ? "未记录最近经期"
                      : "No latest period recorded"}
                </p>
                <div className="pt-2">
                  <input
                    type="number"
                    min={18}
                    max={60}
                    value={cycleDays}
                    placeholder={t("averageCycleInput")}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isNaN(n) && n >= 18 && n <= 60) setCycleDays(n);
                    }}
                    className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-[#4c1d95] outline-none ring-[#d946ef]/40 focus:ring-2 mb-3"
                  />
                </div>
              </div>

              {/* 新增操作按钮组 */}
              <div className="flex flex-col gap-2 mt-auto">
                {isPeriodActive ? (
                  <button
                    onClick={handleEndPeriod}
                    className="w-full rounded-lg bg-pink-100 px-3 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-200"
                  >
                    {t("endPeriod")}
                  </button>
                ) : (
                  <button
                    onClick={() => setPeriodDialogOpen(true)}
                    className="w-full rounded-lg bg-[#9f1239]/10 px-3 py-2 text-sm font-medium text-[#9f1239] transition hover:bg-[#9f1239]/20"
                  >
                    {locale === "zh" ? "记录新经期" : "Log New Period"}
                  </button>
                )}
                
                {/* 示意图中的绿色边框“经期详细”按钮 */}
                <button
                  onClick={() => setPeriodDetailOpen(true)}
                  className="w-full rounded-lg border border-rose-300 bg-rose-50/80 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  {t("periodDetail")}
                </button>
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
          <div className="flex-1 mt-2 rounded-2xl border border-purple-300 bg-purple-50/60 p-4 min-h-[200px]">
            <h3 className="text-center text-sm font-semibold text-purple-900 mb-4">{t("postBrowsing")}</h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {latestPostIndices.length > 0 ? (
                latestPostIndices.map((index) => (
                  <PostItem key={index} index={index} locale={locale} />
                ))
              ) : (
                <div className="rounded-xl bg-white p-4 text-center text-sm text-[#4c1d95]/70 shadow-sm">
                  {locale === "zh" ? "小屋目前还没有公开记录，来分享第一篇吧 🌙" : "No posts yet. Be the first to share 🌙"}
                </div>
              )}
            </div>
          </div>
        </section>

        {periodDialogOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setPeriodDialogOpen(false)}
          >
            <div 
              className="absolute inset-0 bg-black/35 pointer-events-none" 
              aria-hidden="true"
            />
            <div 
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-pink-200/80 bg-white/92 p-4 shadow-xl backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[#9f1239]">{t("noData")}</h3>
                <button
                  type="button"
                  onClick={() => setPeriodDialogOpen(false)}
                  className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-100/60 hover:bg-pink-200/80 text-[#9f1239] transition"
                  aria-label="Close dialog"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPeriodDialogOpen(false)}
                  className="flex-1 rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm font-semibold text-[#9f1239] hover:bg-pink-50/50 transition"
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleRecordPeriod}
                  className="flex-1 glow-hover rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  {t("confirm")}
                </button>
              </div>
            </div>
          </div>
        )}

        {periodDetailOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setPeriodDetailOpen(false)}
          >
            <div className="absolute inset-0 bg-black/35 pointer-events-none" aria-hidden="true" />
            <div 
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-pink-200/80 bg-white/92 p-6 shadow-xl backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#9f1239] mb-4">{t("periodDetail")}</h3>
              <p className="text-sm text-[#9f1239]/80 mb-4">
                {locale === "zh" ? "在这里可以记录你的流量、痛感和详细感受（后续可接入合约的 _flowLevel 和 _symptomCid）。" : "Log your flow level, pain, and feelings here."}
              </p>
              
              <textarea
                placeholder={locale === "zh" ? "例如：今天量很多，伴有轻微偏头痛..." : "e.g., Heavy flow today, mild headache..."}
                className="min-h-32 w-full rounded-xl border border-pink-200 bg-white p-3 text-sm text-[#4c1d95] outline-none focus:ring-2 focus:ring-[#d946ef]/40"
              />
              
              <button
                onClick={() => setPeriodDetailOpen(false)}
                className="mt-4 w-full glow-hover rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 text-sm font-semibold text-white shadow-sm"
              >
                {locale === "zh" ? "保存记录" : "Save Record"}
              </button>
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
          {walletConnected ? (moonBalance?.displayValue || "0") : "--"}
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
      timeZone="Asia/Shanghai"
    >
      <HomeContent
        locale={locale}
        onToggleLocale={() => setLocale((l) => (l === "zh" ? "en" : "zh"))}
      />
    </NextIntlClientProvider>
  );
}


