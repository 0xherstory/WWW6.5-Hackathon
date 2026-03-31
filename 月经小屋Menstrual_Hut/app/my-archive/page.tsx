"use client";

import Link from "next/link";

export default function MyArchivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] px-4 py-10 text-[#4c1d95]">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_10px_30px_rgba(159,18,57,0.1)]">
        <h1 className="text-center text-2xl font-bold text-[#9f1239]">我的小屋</h1>
        <p className="mt-4 text-center text-sm text-[#9f1239]/90">
          这里将展示你链上的记录与 MOON 奖励。合约接入后，内容会自动同步。
        </p>
        <Link
          href="/"
          className="glow-hover mt-8 block w-full rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-3 text-center text-sm font-semibold text-white shadow-md"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
