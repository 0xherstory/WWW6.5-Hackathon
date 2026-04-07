"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { avalancheFuji } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "@/lib/thirdweb-client";

// 合约配置
const HUT_CONTRACT_ADDRESS = "0xDf3ba211961da80819D37190da03A7253898A7BA";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const hutContract = getContract({
  client,
  chain: avalancheFuji,
  address: HUT_CONTRACT_ADDRESS,
});

// --- 子组件 1：单条经期记录 (Period Log) ---
function PeriodLogItem({ log, locale }: { log: any; locale: string }) {
  const [symptom, setSymptom] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 从合约获取的 symptomCid [cite: 7, 35]
    if (log.symptomCid && log.symptomCid !== "") {
      setLoading(true);
      fetch(`${IPFS_GATEWAY}${log.symptomCid}`)
        .then((res) => res.json())
        .then((data) => {
          // 尝试读取 IPFS 中的内容字段
          setSymptom(data.content || data.symptom || (locale === "zh" ? "已记录感受" : "Feeling recorded"));
        })
        .catch((err) => {
          console.error("IPFS Fetch Error:", err);
          setSymptom(locale === "zh" ? "详细感受加载失败" : "Failed to load symptoms");
        })
        .finally(() => setLoading(false));
    }
  }, [log.symptomCid, locale]);

  // 将合约中的 uint256 时间戳转换为日期 [cite: 7, 18, 20]
  const startStr = new Date(Number(log.startTime) * 1000).toLocaleDateString();
  const endStr = Number(log.endTime) > 0 
    ? new Date(Number(log.endTime) * 1000).toLocaleDateString() 
    : (locale === "zh" ? "进行中..." : "Ongoing...");

  const flowLabels = locale === "zh" 
    ? ["未知", "极少", "较少", "适中", "较多", "极多"]
    : ["Unknown", "Very Light", "Light", "Medium", "Heavy", "Very Heavy"];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white/60 p-5 transition-all hover:border-pink-300 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm">📅</span>
          <span className="font-bold text-[#9f1239]">{startStr} — {endStr}</span>
        </div>
        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
          {locale === "zh" ? "流量" : "Flow"}: {flowLabels[log.flowLevel] || log.flowLevel}
        </span>
      </div>
      <div className="rounded-xl bg-pink-50/30 p-3 text-sm text-[#4c1d95]">
        <p className="mb-1 text-xs font-semibold text-pink-400 uppercase tracking-wider">
          {locale === "zh" ? "详细感受 / Symptoms" : "Symptoms"}
        </p>
        {loading ? (
          <span className="animate-pulse text-pink-300">Loading...</span>
        ) : (
          <p className="leading-relaxed">
            {symptom || (locale === "zh" ? "本次记录未填写详细感受" : "No detailed symptoms recorded")}
          </p>
        )}
      </div>
    </div>
  );
}

// --- 子组件 2：单条社区帖子 (Post Record) ---
function ArchivePostItem({ index, userAddress, locale }: { index: number; userAddress: string; locale: string }) {
  const { data: record, isLoading } = useReadContract({
    contract: hutContract,
    method: "function records(uint256) view returns (string cid, address author, uint256 timestamp, bool isHelp, bool isDonation, uint8 postType, uint256 price)",
    params: [BigInt(index)],
  });

  const [postContent, setPostContent] = useState<string>("");
  const [isFetchingIpfs, setIsFetchingIpfs] = useState(false);

  useEffect(() => {
    // 只有作者本人可以看到（或者根据 canViewRecord 逻辑） [cite: 3, 29]
    if (record && record[1].toLowerCase() === userAddress.toLowerCase()) {
      setIsFetchingIpfs(true);
      fetch(`${IPFS_GATEWAY}${record[0]}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.content) setPostContent(data.content);
        })
        .catch(() => setPostContent("Content failed to load"))
        .finally(() => setIsFetchingIpfs(false));
    }
  }, [record, userAddress]);

  if (isLoading || !record) return null;
  if (record[1].toLowerCase() !== userAddress.toLowerCase()) return null;

  const dateStr = new Date(Number(record[2]) * 1000).toLocaleString();

  return (
    <div className="mb-4 rounded-2xl border border-purple-100 bg-white/90 p-5 text-sm text-[#4c1d95] shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between border-b border-purple-50 pb-2 text-xs text-[#9f1239]/60">
        <span className="font-semibold">{locale === "zh" ? `我的帖子 #${index}` : `My Post #${index}`}</span>
        <span>{dateStr}</span>
      </div>
      <div className="whitespace-pre-wrap text-base leading-relaxed">
        {isFetchingIpfs ? <span className="animate-pulse text-purple-300">Loading...</span> : postContent || "..."}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {record[3] && <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">求助贴</span>}
        {record[5] === 2 && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">🔒 隐私</span>}
      </div>
    </div>
  );
}

// --- 主页面组件 ---
export default function MyArchivePage() {
  const account = useActiveAccount();
  const walletConnected = !!account?.address;
  
  // 修复点：定义 locale 状态，默认为中文
  const [locale, setLocale] = useState("zh");

  // 调用合约的 getMyPeriods 获取用户经期数组 [cite: 21]
  const { data: myPeriods, isLoading: isPeriodsLoading } = useReadContract({
    contract: hutContract,
    method: "function getMyPeriods(address _user) view returns ((uint256 startTime, uint256 endTime, uint8 flowLevel, string symptomCid)[])",
    params: [account?.address || ""],
  });

  // 获取社区帖子总数 [cite: 22]
  const { data: totalRecords, isLoading: isTotalLoading } = useReadContract({
    contract: hutContract,
    method: "function getTotalRecords() view returns (uint256)",
    params: [],
  });

  const postIndices = useMemo(() => {
    if (!totalRecords) return [];
    const total = Number(totalRecords);
    return Array.from({ length: total }, (_, i) => total - 1 - i);
  }, [totalRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] px-4 py-10 text-[#4c1d95]">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(159,18,57,0.1)] sm:p-10">
        <div className="mb-6 flex items-center justify-between border-b border-pink-200/60 pb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#9f1239]">我的小屋 / My Archive</h1>
            <button 
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="mt-1 text-left text-xs text-pink-400 hover:text-pink-600"
            >
              切换语言 / Switch Language
            </button>
          </div>
          <Link href="/" className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-[#9f1239] transition hover:bg-pink-50">
            {locale === "zh" ? "返回首页" : "Back Home"}
          </Link>
        </div>

        {!walletConnected ? (
          <div className="rounded-2xl bg-white/60 p-8 text-center text-[#9f1239]/70">
            <p>{locale === "zh" ? "请先连接钱包，查看你的链上记忆。" : "Please connect your wallet to view memories."}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 经期记录板块 */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">💧</span>
                <h2 className="text-lg font-bold text-[#9f1239]">
                  {locale === "zh" ? `经期记录 (${myPeriods?.length || 0} 条)` : `Period Logs (${myPeriods?.length || 0})`}
                </h2>
              </div>
              
              {isPeriodsLoading ? (
                <div className="py-4 text-center text-sm text-pink-400 animate-pulse">同步链上经期数据中...</div>
              ) : myPeriods && myPeriods.length > 0 ? (
                <div className="space-y-4">
                  {[...myPeriods].reverse().map((log, i) => (
                    <PeriodLogItem key={i} log={log} locale={locale} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-pink-200 p-8 text-center">
                   <p className="text-[#9f1239]/60">
                     {locale === "zh" ? "还没有经期记录，去 " : "No records yet, go to "}
                     <Link href="/" className="font-bold text-pink-500 hover:underline">
                       {locale === "zh" ? "首页" : "Home"}
                     </Link> 
                     {locale === "zh" ? " 记录吧 💗" : " to log one 💗"}
                   </p>
                </div>
              )}
            </section>

            <hr className="border-pink-100" />

            {/* 帖子记录板块 */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span>
                <h2 className="text-lg font-bold text-[#9f1239]">
                  {locale === "zh" ? `我的帖子 (${postIndices.length} 条)` : `My Posts (${postIndices.length})`}
                </h2>
              </div>
              {isTotalLoading ? (
                <div className="py-4 text-center text-sm text-purple-400 animate-pulse">翻阅档案中...</div>
              ) : postIndices.length > 0 ? (
                postIndices.map((index) => (
                  <ArchivePostItem key={index} index={index} userAddress={account.address} locale={locale} />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[#9f1239]/50">暂无发布的帖子</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}