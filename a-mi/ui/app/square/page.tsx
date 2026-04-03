"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { useTownSnapshot } from "../lib/ami-world";
import { mockUser } from "../lib/mock-user";

const notices = [
  "新的伙伴今天就可以写下自己的第一份约定。",
  "周末的花园小聚会会在晚上 7 点轻轻开始。",
  "别忘了回来看一眼，让你的成长被慢慢看见。",
];

type LandmarkLabelProps = {
  children: ReactNode;
  toneClassName?: string;
  className?: string;
};

export default function SquarePage() {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const townSnapshot = useTownSnapshot();

  return (
    <>
      <main className="min-h-screen bg-[#F7F3EF]">
        <div className="mx-auto max-w-[1800px] px-3 py-3">
          <div className="relative overflow-hidden rounded-[32px] bg-[#F7F3EF] shadow-[0_8px_30px_rgba(120,110,100,0.08)]">
            <div className="relative h-[78vh] min-h-[640px] max-h-[760px] w-full">
              <Image
                src="/assets/world/backgrounds/ami-square-map-bg.png"
                alt="小镇地图背景"
                fill
                priority
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,248,0.12)_0%,rgba(255,252,248,0.03)_36%,rgba(88,74,67,0.05)_100%)]" />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[45%] z-10 h-[19%] w-[19%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(176,155,128,0.12)_0%,rgba(160,138,110,0.08)_46%,rgba(125,105,85,0.05)_70%,rgba(125,105,85,0)_100%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[45%] z-10 h-[14%] w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,246,234,0.16)_0%,rgba(255,246,234,0.05)_58%,rgba(255,246,234,0)_100%)]"
              />

              <div className="absolute left-1/2 -top-8 z-30 -translate-x-1/2">
                <div className="relative flex items-center justify-center">
                  <div className="relative h-[232px] w-[582px]">
                    <Image
                      src="/assets/world/ui/cloud.png"
                      alt="云朵信息"
                      fill
                      className="object-contain opacity-[0.98] drop-shadow-[0_20px_36px_rgba(122,112,108,0.16)]"
                    />
                  </div>
                  <div className="absolute inset-x-0 top-[17%] bottom-[15%] flex flex-col items-center justify-center text-center">
                    <p className="text-[18px] font-semibold tracking-[0.08em] text-[#5F5751] [text-shadow:0_1px_0_rgba(255,255,255,0.4)]">
                      今日小镇
                    </p>
                    <p className="mt-2 text-[14px] tracking-[0.08em] text-[#7D716A] [text-shadow:0_1px_0_rgba(255,255,255,0.35)]">
                      2026年4月2日
                    </p>
                    <p className="mt-2 text-[15px] font-medium tracking-[0.08em] text-[#6E8B67] [text-shadow:0_1px_0_rgba(255,255,255,0.35)]">
                      {townSnapshot.totalOnline} 人在线
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/study"
                className="group absolute left-[12.9%] top-[-7.2%] z-20 flex w-[284px] flex-col items-center"
              >
                <div className="relative h-[230px] w-[288px] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
                  <Image
                    src="/assets/world/buildings/study-hall.png"
                    alt="学习小屋"
                    fill
                    className="object-contain drop-shadow-[0_14px_22px_rgba(120,110,100,0.18)]"
                  />
                </div>
                <LandmarkLabel toneClassName="text-[#75675F]" className="-mt-12">
                  学习小屋
                </LandmarkLabel>
              </Link>

              <button
                type="button"
                onClick={() => setIsNoticeOpen(true)}
                className="group absolute right-[-0.8%] top-[11.5%] z-20 flex w-[220px] flex-col items-center text-left"
              >
                <div className="relative h-[178px] w-[220px] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
                  <div className="absolute left-[23%] top-[24%] z-20 flex w-[54%] flex-col gap-1.5 rounded-[12px] bg-[rgba(255,250,245,0.42)] px-3 py-2 backdrop-blur-[1px]">
                    <span className="h-[5px] w-[76%] rounded-full bg-[rgba(255,241,227,0.86)]" />
                    <span className="h-[4px] w-[62%] rounded-full bg-[rgba(255,241,227,0.72)]" />
                    <span className="h-[4px] w-[69%] rounded-full bg-[rgba(255,241,227,0.58)]" />
                  </div>
                  <div className="absolute left-[30%] top-[40%] z-20 h-[18px] w-[50px] -rotate-[7deg] rounded-[5px] bg-[rgba(247,226,202,0.88)] shadow-[0_3px_8px_rgba(126,98,69,0.12)]" />
                  <div className="absolute left-[47%] top-[48%] z-20 h-[16px] w-[44px] rotate-[5deg] rounded-[5px] bg-[rgba(255,243,229,0.84)] shadow-[0_3px_8px_rgba(126,98,69,0.10)]" />
                  <Image
                    src="/assets/world/buildings/notice-board.png"
                    alt="公告板"
                    fill
                    className="object-contain drop-shadow-[0_12px_18px_rgba(120,110,100,0.14)]"
                  />
                </div>
                <LandmarkLabel toneClassName="text-[#856D5C]" className="-mt-4">
                  公告板
                </LandmarkLabel>
              </button>

              <Link
                href="/garden"
                className="group absolute left-[49.8%] top-[18.9%] z-20 flex w-[410px] -translate-x-1/2 flex-col items-center"
              >
                <div className="relative h-[316px] w-[410px] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]">
                  <Image
                    src="/assets/world/buildings/garden-club.png"
                    alt="花园社"
                    fill
                    className="object-contain drop-shadow-[0_20px_28px_rgba(111,124,98,0.18)]"
                  />
                </div>
                <LandmarkLabel toneClassName="text-[#678060]" className="-mt-6">
                  花园社
                </LandmarkLabel>
              </Link>

              <Link
                href="/profile"
                className="group absolute bottom-[18.8%] right-[-1.6%] z-20 flex w-[292px] flex-col items-center"
              >
                <div className="relative h-[242px] w-[292px] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[-1%] left-[-2%] z-10 h-[86px] w-[152px] rounded-[32px] bg-[radial-gradient(circle_at_bottom_left,rgba(242,234,215,0.72)_0%,rgba(236,224,202,0.42)_38%,rgba(232,220,197,0.14)_68%,rgba(232,220,197,0)_100%)] blur-xl"
                  />
                  <Image
                    src="/assets/world/buildings/my-cottage.png"
                    alt="我的小屋"
                    fill
                    className="relative z-20 object-contain drop-shadow-[0_16px_24px_rgba(120,110,100,0.16)]"
                  />
                </div>
                <LandmarkLabel toneClassName="text-[#85799B]" className="-mt-1">
                  我的小屋
                </LandmarkLabel>
              </Link>

              <div className="absolute left-6 top-6 z-20 rounded-full border border-[rgba(255,255,255,0.32)] bg-[rgba(255,252,250,0.62)] px-6 py-3 backdrop-blur-sm">
                <p className="text-[15px] tracking-[0.24em] text-[#85757A]">
                  小镇主城
                </p>
              </div>

              <div className="absolute left-6 top-[5.5rem] z-20 rounded-[24px] border border-[rgba(255,255,255,0.34)] bg-[rgba(255,252,250,0.7)] px-4 py-3 shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]">
                  当前在线住客
                </p>
                <p className="mt-1 text-[15px] font-semibold tracking-[0.08em] text-[#5F5751]">
                  {mockUser.username}
                </p>
                <p className="mt-1 text-[12px] tracking-[0.08em] text-[#6E8B67]">
                  {mockUser.status}
                </p>
              </div>

              <Link
                href="/"
                className="absolute right-6 top-6 z-20 rounded-full border border-[rgba(255,255,255,0.32)] bg-[rgba(255,252,250,0.62)] px-6 py-3 text-[15px] text-[#6E6765] backdrop-blur-sm transition hover:bg-[rgba(255,255,255,0.82)]"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </main>

      {isNoticeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,39,0.22)] px-4 backdrop-blur-[3px]"
          onClick={() => setIsNoticeOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-[rgba(255,249,242,0.96)] p-6 shadow-[0_24px_60px_rgba(83,64,46,0.18)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-board-title"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B7E60]">
              小镇公告板
            </p>
            <h2
              id="notice-board-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#5D5148]"
            >
              主城最近的小消息
            </h2>
            <div className="mt-4 rounded-[20px] border border-[rgba(205,186,166,0.24)] bg-white/75 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#9B7E60]">
                当前看板访客
              </p>
              <p className="mt-1 text-sm font-semibold tracking-[0.04em] text-[#5D5148]">
                {mockUser.username}
              </p>
              <p className="mt-1 text-xs tracking-[0.08em] text-[#7B6E68]">
                {mockUser.status}
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice}
                  className="rounded-[18px] bg-white/80 px-4 py-3 text-sm leading-6 text-[#685D55]"
                >
                  {notice}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsNoticeOpen(false)}
              className="mt-5 rounded-full bg-[#F0E3D3] px-5 py-2.5 text-sm text-[#65584D] transition hover:bg-[#EAD8C2]"
            >
              关闭
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function LandmarkLabel({
  children,
  toneClassName,
  className,
}: LandmarkLabelProps) {
  return (
    <span
      className={`rounded-full bg-[rgba(255,250,246,0.76)] px-4 py-1.5 text-center text-[16px] font-medium tracking-[0.14em] shadow-[0_6px_16px_rgba(120,110,100,0.08)] backdrop-blur-[2px] ${toneClassName ?? "text-[#756B65]"} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

