"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { avalancheFuji } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { useActiveAccount, useWalletBalance, useReadContract, ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdweb-client";
import { getIdentityForWallet, HutIdentityRecord } from "@/lib/hut-identity-storage";
import { hutConnectButtonClassName, hutConnectTheme } from "@/lib/thirdweb-connect-theme";

const MOON_TOKEN_ADDRESS = "0x0e99AE008922E4547EE0e35388a0a4FD907C6c01";
const HUT_CONTRACT_ADDRESS = "0xDf3ba211961da80819D37190da03A7253898A7BA";

const hutContract = getContract({
  client,
  chain: avalancheFuji,
  address: HUT_CONTRACT_ADDRESS,
});

export default function ProfilePage() {
  const account = useActiveAccount();
  const walletConnected = !!account?.address;

  // 1. 读取 MOON 代币余额
  const { data: moonBalance } = useWalletBalance({
    client,
    chain: avalancheFuji,
    address: account?.address,
    tokenAddress: MOON_TOKEN_ADDRESS,
  });

  // 2. 读取链上的经期打卡记录
  const { data: myPeriods, isLoading: isLoadingPeriods } = useReadContract({
    contract: hutContract,
    method: "function getMyPeriods() view returns ((uint256 startTime, uint256 endTime, uint8 flowLevel, string symptomCid)[])",
    params: [],
    queryOptions: { enabled: !!account?.address },
  });

  // 3. 读取本地小屋身份
  const [identityInfo, setIdentityInfo] = useState<HutIdentityRecord | undefined>(undefined);

  useEffect(() => {
    if (account?.address) {
      setIdentityInfo(getIdentityForWallet(account.address));
    } else {
      setIdentityInfo(undefined);
    }
  }, [account?.address]);

  // 辅助函数：格式化时间戳
  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return "至今 (Ongoing)";
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] px-4 py-10 text-[#4c1d95]">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/60 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#9f1239]">个人中心 / Profile</h1>
            <p className="mt-2 text-sm text-[#9f1239]/80">
              数据主权属于你。你的链上记录与身份状态。
            </p>
          </div>
          <div className="glow-hover shrink-0">
            <ConnectButton
              client={client}
              chain={avalancheFuji}
              theme={hutConnectTheme}
              connectButton={{
                label: "连接钱包",
                className: hutConnectButtonClassName,
              }}
            />
          </div>
        </div>

        {!walletConnected ? (
          <div className="mt-10 rounded-2xl bg-white/60 p-8 text-center text-[#9f1239]/70">
            <p>请先连接钱包，以查看你的小屋信息。</p>
            <p className="text-xs mt-1">Please connect your wallet to view your profile.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* 资产与身份卡片 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[#9f1239]/80">我的 MOON 余额</h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#d946ef]">
                    {moonBalance?.displayValue || "0"}
                  </span>
                  <span className="text-sm font-medium text-[#d946ef]/80">MOON</span>
                </div>
              </div>

              <div className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[#9f1239]/80">小屋身份状态</h2>
                {identityInfo ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                      已绑定手机号
                    </p>
                    <p className="text-xs font-mono text-[#9f1239]/60">
                      {identityInfo.phone.replace(/(\+\d{2})(\d{3})\d{4}(\d{4})/, "$1 $2****$3")}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                      未完善身份
                    </p>
                    <p className="text-xs text-[#9f1239]/60 mt-1">可在首页顶部进行绑定</p>
                  </div>
                )}
              </div>
            </div>

            {/* 经期记录历史 */}
            <div className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#9f1239]">周期记录历史 / Period Logs</h2>
              </div>
              
              {isLoadingPeriods ? (
                <p className="text-sm text-[#9f1239]/60 animate-pulse py-4">正在从链上读取记录...</p>
              ) : myPeriods && myPeriods.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#4c1d95]">
                    <thead className="border-b border-pink-100 text-xs text-[#9f1239]/70">
                      <tr>
                        <th className="pb-2 font-medium">开始时间</th>
                        <th className="pb-2 font-medium">结束时间</th>
                        <th className="pb-2 font-medium">流量级别</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {/* 倒序排列，最新的在最上面 */}
                      {[...myPeriods].reverse().map((period, idx) => (
                        <tr key={idx} className="transition hover:bg-pink-50/30">
                          <td className="py-3">{formatDate(period.startTime)}</td>
                          <td className="py-3">
                            {period.endTime === BigInt(0) ? (
                              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-500/10">
                                进行中
                              </span>
                            ) : (
                              formatDate(period.endTime)
                            )}
                          </td>
                          <td className="py-3">Level {period.flowLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[#9f1239]/60 py-4">
                  你还没有在链上记录过经期，去首页开启你的周期守护吧 🌙
                </p>
              )}
            </div>

            {/* 快捷导航 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/my-archive"
                className="glow-hover flex-1 rounded-xl border border-pink-200 bg-[#fff7fb] px-4 py-3 text-center text-sm font-semibold text-[#9f1239] transition"
              >
                查看我的经验帖归档
              </Link>
              <Link
                href="/"
                className="glow-hover flex-1 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition"
              >
                返回首页
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}