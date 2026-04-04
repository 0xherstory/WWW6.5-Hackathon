"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { WalletStatusCard } from "../components/wallet-status-card";
import { SceneStatusCard, SceneStatusRail } from "../components/scene-status";
import { SpaceBadge, SpaceListItem } from "../components/space-shell";
import { useTownSnapshot } from "../lib/ami-world";

type ActiveSpot = "active" | "inactive" | "recommend" | null;

type GroupItem = {
  title: string;
  description: string;
  meta?: string;
};

const gardenSpots = [
  {
    id: "active" as const,
    label: "我的群组 · 活跃中",
    subtitle: "最近还有人在这里轻轻说话，也有人把学习和打卡继续带了进来。",
    asset: "/assets/spaces/garden/garden_group_active.png",
    alt: "活跃群组花盆",
    className:
      "left-[34%] top-[57%] z-[16] w-[18vw] min-w-[140px] max-w-[230px] -translate-x-1/2 md:left-[37%] md:top-[56%]",
    badge: "2 个群组",
    groups: [
      {
        title: "hersolidity",
        description: "300 个 a.mi 正在学习 Solidity",
        meta: "正在发芽",
      },
      {
        title: "sweet corner",
        description: "3 个 a.mi 正在打卡“每日写 3 件开心的事”",
        meta: "今天有人来过",
      },
    ],
  },
  {
    id: "inactive" as const,
    label: "我的群组 · 近期安静",
    subtitle: "这几个花盆最近比较安静，但它们还好好地留在这里，等下一次有人回来。",
    asset: "/assets/spaces/garden/garden_group_inactive.png",
    alt: "不活跃群组花盆",
    className:
      "left-1/2 top-[60%] z-[26] w-[18vw] min-w-[140px] max-w-[220px] -translate-x-1/2 md:top-[59%]",
    badge: "3 个群组",
    groups: [
      {
        title: "23:30 准时睡觉",
        description: "已经 30 天没有新动态",
        meta: "先安静休息一下",
      },
      {
        title: "乌啦啦申博互助会",
        description: "最近没有新的留言和打卡",
        meta: "还在等一条消息",
      },
      {
        title: "下班后三小时打卡群",
        description: "最近暂时没有新的记录",
        meta: "节奏慢一点也没关系",
      },
    ],
  },
  {
    id: "recommend" as const,
    label: "推荐群组",
    subtitle: "如果想随便逛逛，这里有一些轻松又有点可爱的群组正在等人加入。",
    asset: "/assets/spaces/garden/garden_group_recommend.png",
    alt: "推荐群组花盆",
    className:
      "left-[66%] top-[64%] z-[24] w-[15vw] min-w-[116px] max-w-[180px] -translate-x-1/2 md:left-[63%] md:top-[63%]",
    badge: "5 个推荐",
    groups: [
      {
        title: "拖延症假装自律联盟",
        description: "今天也有人认真列计划，顺便继续拖延",
        meta: "轻松围观中",
      },
      {
        title: "先睡了但其实还在刷手机",
        description: "深夜活跃度异常稳定",
        meta: "夜间常亮",
      },
      {
        title: "奶茶戒断互助会",
        description: "已经有人坚持到第 2 天了",
        meta: "温柔努力中",
      },
      {
        title: "周末想早起但没成功小组",
        description: "气氛轻松，失败经验很多",
        meta: "欢迎坦诚分享",
      },
      {
        title: "情绪稳定全靠小蛋糕",
        description: "欢迎带着甜点和故事加入",
        meta: "适合慢慢聊天",
      },
    ],
  },
];

export default function GardenViewPage() {
  const [activeSpot, setActiveSpot] = useState<ActiveSpot>(null);
  const townSnapshot = useTownSnapshot();
  const activeSpotConfig = gardenSpots.find((spot) => spot.id === activeSpot) ?? null;

  return (
    <>
      <main className="min-h-screen bg-[#F3F0E8] px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1800px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#F7F4EE] shadow-[0_8px_30px_rgba(120,110,100,0.08)]">
            <div className="relative h-[82vh] min-h-[680px] w-full max-md:min-h-[760px]">
              <Image
                src="/assets/spaces/garden/garden_bg.png"
                alt="花园社温室背景"
                fill
                priority
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,251,246,0.12)_0%,rgba(255,251,246,0.02)_34%,rgba(100,88,64,0.12)_100%)]" />

              <div className="absolute left-5 top-5 z-20 rounded-full border border-[rgba(255,255,255,0.32)] bg-[rgba(255,252,250,0.62)] px-6 py-3 backdrop-blur-sm">
                <p className="text-[15px] tracking-[0.24em] text-[#7C8B70]">花园社</p>
              </div>

              <SceneStatusRail className="absolute left-5 top-20 z-30 hidden w-[280px] xl:block">
                <WalletStatusCard
                  className="rounded-[24px] border border-[rgba(255,255,255,0.34)] bg-[rgba(255,252,250,0.72)] px-4 py-3 shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm"
                  labelClassName="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]"
                  addressClassName="mt-1 text-[15px] font-semibold tracking-[0.08em] text-[#5F5751]"
                  statusClassName="mt-1 text-[12px] tracking-[0.08em] text-[#6E8B67]"
                />
                <SceneStatusCard
                  eyebrow="花园社"
                  title={`${gardenSpots.length} 组群组角落`}
                  description="左边花盆是活跃群组，中间花盆是近期安静的群组，右边花盆是推荐群组。状态卡会停在温室入口外侧。"
                  tone="amber"
                  className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
                />
                <SceneStatusCard
                  eyebrow="其他房间"
                  title={`学习小屋 ${townSnapshot.studyFocusTime}`}
                  description={`我的小屋当前连续记录 ${townSnapshot.profileStreak} 天，花园社现在的氛围是“${townSnapshot.gardenMood}”。`}
                  tone="rose"
                  className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
                />
              </SceneStatusRail>

              {gardenSpots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setActiveSpot(spot.id)}
                  className={`group absolute ${spot.className} text-left`}
                >
                  <InteractivePot src={spot.asset} alt={spot.alt} />
                </button>
              ))}

              <div className="absolute left-5 bottom-5 z-30 flex flex-wrap gap-3">
                <NavPill href="/square" label="去主城" />
                <NavPill href="/study" label="学习小屋" tone="rose" />
                <NavPill href="/profile" label="我的小屋" tone="lavender" />
              </div>
            </div>
          </div>

          <SceneStatusRail className="grid px-1 py-4 xl:hidden">
            <WalletStatusCard
              className="rounded-[24px] border border-[rgba(255,255,255,0.34)] bg-[rgba(255,252,250,0.72)] px-4 py-3 shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm"
              labelClassName="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]"
              addressClassName="mt-1 text-[15px] font-semibold tracking-[0.08em] text-[#5F5751]"
              statusClassName="mt-1 text-[12px] tracking-[0.08em] text-[#6E8B67]"
            />
            <SceneStatusCard
              eyebrow="花园社"
              title={`${gardenSpots.length} 组群组角落`}
              description="左边花盆是活跃群组，中间花盆是近期安静的群组，右边花盆是推荐群组。状态卡会停在温室入口外侧。"
              tone="amber"
              className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
            />
            <SceneStatusCard
              eyebrow="其他房间"
              title={`学习小屋 ${townSnapshot.studyFocusTime}`}
              description={`我的小屋当前连续记录 ${townSnapshot.profileStreak} 天，花园社现在的氛围是“${townSnapshot.gardenMood}”。`}
              tone="rose"
              className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
            />
          </SceneStatusRail>
        </div>
      </main>

      <GardenModal
        open={Boolean(activeSpotConfig)}
        title={activeSpotConfig?.label ?? ""}
        subtitle={activeSpotConfig?.subtitle ?? ""}
        badge={activeSpotConfig?.badge ?? ""}
        onClose={() => setActiveSpot(null)}
      >
        {activeSpotConfig?.groups.map((group) => (
          <GroupCard key={group.title} {...group} />
        ))}
      </GardenModal>
    </>
  );
}

function InteractivePot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.03]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain drop-shadow-[0_22px_34px_rgba(96,83,60,0.18)]"
      />
    </div>
  );
}

function NavPill({
  href,
  label,
  tone = "default",
}: {
  href: string;
  label: string;
  tone?: "default" | "rose" | "lavender";
}) {
  const toneClassName = {
    default: "text-[#6E6765] bg-[rgba(255,252,250,0.66)]",
    rose: "text-[#7B5B67] bg-[rgba(255,245,248,0.72)]",
    lavender: "text-[#6D6488] bg-[rgba(246,244,255,0.76)]",
  }[tone];

  return (
    <Link
      href={href}
      className={`rounded-full border border-[rgba(255,255,255,0.32)] px-5 py-3 text-sm shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm transition hover:bg-[rgba(255,255,255,0.82)] ${toneClassName}`}
    >
      {label}
    </Link>
  );
}

function GardenModal({
  open,
  title,
  subtitle,
  badge,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,39,0.24)] px-4 py-6 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] bg-[rgba(255,249,242,0.97)] shadow-[0_24px_60px_rgba(83,64,46,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-[rgba(205,186,166,0.24)] bg-[rgba(255,249,242,0.98)] px-6 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8CA177]">温室互动</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#5D5148]">
                  {title}
                </h2>
                {badge ? <SpaceBadge tone="sage">{badge}</SpaceBadge> : null}
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6F625A]">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#E4EEDC] px-4 py-2 text-sm text-[#5E6B54] transition hover:bg-[#D9E8CF]"
            >
              返回花园社
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function GroupCard({ title, description, meta }: GroupItem) {
  return (
    <section className="rounded-[24px] border border-[rgba(190,208,182,0.2)] bg-[linear-gradient(180deg,rgba(251,255,249,0.94)_0%,rgba(245,249,241,0.94)_100%)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#56624E]">{title}</h3>
        {meta ? <SpaceBadge tone="amber">{meta}</SpaceBadge> : null}
      </div>
      <div className="mt-4">
        <SpaceListItem title="群组近况" description={description} />
      </div>
    </section>
  );
}
