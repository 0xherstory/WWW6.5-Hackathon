"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { avalancheFuji } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "@/lib/thirdweb-client";

const HUT_CONTRACT_ADDRESS = "0xFe33db86B9d73DE2EeA4290A41fca2Cfdc90E71D";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const hutContract = getContract({
  client,
  chain: avalancheFuji,
  address: HUT_CONTRACT_ADDRESS,
});

// 单条属于自己的帖子组件
function ArchivePostItem({ index, userAddress }: { index: number; userAddress: string }) {
  const { data: record, isLoading } = useReadContract({
    contract: hutContract,
    method: "function records(uint256) view returns (string cid, address author, uint256 timestamp, bool isHelp, bool isDonation, uint8 postType, uint256 price)",
    params: [BigInt(index)],
  });

  const [postContent, setPostContent] = useState<string>("");
  const [isFetchingIpfs, setIsFetchingIpfs] = useState(false);

  useEffect(() => {
    // 只有当这条帖子的作者是当前登录用户时，才去 IPFS 拉取内容，节省资源
    if (record && record[1].toLowerCase() === userAddress.toLowerCase()) {
      const cid = record[0];
      setIsFetchingIpfs(true);
      fetch(`${IPFS_GATEWAY}${cid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.content) {
            setPostContent(data.content);
          }
        })
        .catch((err) => {
          console.error("Fetch IPFS error:", err);
          setPostContent("内容解析失败...");
        })
        .finally(() => setIsFetchingIpfs(false));
    }
  }, [record, userAddress]);

  if (isLoading) return null; // 还在读合约时先不显示
  if (!record) return null;
  // 如果不是自己的帖子，直接隐藏
  if (record[1].toLowerCase() !== userAddress.toLowerCase()) return null;

  const dateStr = new Date(Number(record[2]) * 1000).toLocaleString();

  return (
    <div className="rounded-2xl border border-pink-200 bg-white/90 p-5 text-sm text-[#4c1d95] shadow-sm mb-4 transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between text-xs text-[#9f1239]/60 border-b border-pink-100 pb-2">
        <span className="font-semibold">我的记录 #{index}</span>
        <span>{dateStr}</span>
      </div>
      <div className="whitespace-pre-wrap leading-relaxed text-base">
        {isFetchingIpfs ? (
          <span className="animate-pulse text-[#9f1239]/60">正在从 IPFS 唤醒你的记忆...</span>
        ) : (
          postContent || "（无文字内容）"
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {record[3] && <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">求助贴</span>}
        {record[4] && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">捐赠/申领</span>}
        {record[5] === 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">免费公开</span>}
        {record[5] === 1 && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
            收费 {(Number(record[6]) / 1e18).toFixed(0)} MOON
          </span>
        )}
        {record[5] === 2 && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">🔒 隐私</span>}
      </div>
    </div>
  );
}

export default function MyArchivePage() {
  const account = useActiveAccount();
  const walletConnected = !!account?.address;

  // 读取总记录数
  const { data: totalRecords, isLoading: isTotalLoading } = useReadContract({
    contract: hutContract,
    method: "function getTotalRecords() view returns (uint256)",
    params: [],
  });

  // 生成所有记录的索引数组（倒序，最新的在最上面）
  const postIndices = useMemo(() => {
    if (!totalRecords) return [];
    const total = Number(totalRecords);
    const indices = [];
    for (let i = total - 1; i >= 0; i--) {
      indices.push(i);
    }
    return indices;
  }, [totalRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] px-4 py-10 text-[#4c1d95]">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/70 bg-white/85 p-6 sm:p-10 shadow-[0_10px_30px_rgba(159,18,57,0.1)]">
        <div className="flex items-center justify-between border-b border-pink-200/60 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-[#9f1239]">我的小屋 / My Archive</h1>
          <Link
            href="/"
            className="glow-hover rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-[#9f1239] transition hover:bg-pink-50"
          >
            返回首页
          </Link>
        </div>

        {!walletConnected ? (
          <div className="rounded-2xl bg-white/60 p-8 text-center text-[#9f1239]/70">
            <p>请先连接钱包，才能查看属于你的链上记忆。</p>
          </div>
        ) : isTotalLoading ? (
          <div className="animate-pulse text-center text-[#9f1239]/60 py-10">
            正在翻阅小屋的档案...
          </div>
        ) : postIndices.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-[#9f1239]/80 mb-6">
              这里安全地存放着你所有的上链记录。它们被加密保护在 IPFS 中，数据主权完全属于你。
            </p>
            {postIndices.map((index) => (
              <ArchivePostItem key={index} index={index} userAddress={account.address} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/60 p-8 text-center text-[#9f1239]/70">
            <p>你还没有在小屋留下过记录。</p>
          </div>
        )}
      </div>
    </div>
  );
}