"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { SpaceBadge, SpaceButton, SpaceListItem } from "../components/space-shell";
import { COMMITMENT_STORAGE_KEY, useTownSnapshot } from "../lib/ami-world";
import { mockUser } from "../lib/mock-user";

type CommitmentDraft = {
  title?: string;
  description?: string;
  duration?: string;
  buddy?: string;
  status?: string;
  createdAt?: string;
};

type ActiveModal = "records" | "desk" | "table" | null;
type FullscreenDeskView = "list" | "create" | null;

const witnessRecords = [
  {
    title: "回到小屋的第 9 天",
    description: "今天也有回来看看自己，墙上多了一枚浅浅的日期印章。",
    meta: "见证记录",
  },
  {
    title: "窗边专注 45 分钟",
    description: "把学习小屋里的那份安静，带回到了自己的房间里。",
    meta: "见证记录",
  },
];

const supportRecords = [
  {
    title: "来自阿米搭子的留言",
    description: "继续按自己的节奏来就很好，慢一点也没关系。",
    meta: "支持记录",
  },
  {
    title: "花园社小卡片",
    description: "你最近的状态很温柔，也很稳定，记得给自己一点夸奖。",
    meta: "支持记录",
  },
];

const rewardRecords = [
  {
    title: "小星灯贴纸",
    description: "累计完成 3 次回访后获得，可以点亮书桌角落。",
    meta: "小奖励",
  },
  {
    title: "柔雾书签",
    description: "写下第一份约定后获得，提醒你别忘了最初的心意。",
    meta: "小奖励",
  },
];

const friends = [
  { title: "Mori", description: "最近常在学习小屋出现，晚间专注状态很好。", meta: "在线" },
  { title: "Luna", description: "今天在花园社更新了新的植物观察卡。", meta: "刚刚活跃" },
  { title: "Nana", description: "给你点了一个小鼓励，说记得早点休息。", meta: "留言中" },
];

const groups = [
  { title: "hersolidity", description: "300 个 a.mi 正在学习 Solidity", meta: "活跃中" },
  {
    title: "sweet corner",
    description: "3 个 a.mi 正在打卡“每日写 3 件开心的事”",
    meta: "活跃中",
  },
  { title: "23:30 准时睡觉", description: "已经 30 天没有新动态", meta: "近期安静" },
  {
    title: "乌啦啦申博互助会",
    description: "最近没有新的留言和打卡",
    meta: "近期安静",
  },
  {
    title: "下班后三小时打卡群",
    description: "最近暂时没有新的记录",
    meta: "近期安静",
  },
];

const draftCommitmentCards = [
  { label: "当前约定", value: "每周完成 4 次晚间学习，保持稳定节奏。" },
  { label: "约定周期", value: "2026 年 4 月 · 第一阶段" },
  { label: "同行伙伴", value: "Mori / 晚风专注组" },
];

const newCommitmentPrompts = [
  "这次我想认真对待的一件小事是什么？",
  "我希望自己以什么样的节奏持续下去？",
  "当我想放弃时，希望看到怎样的一句提醒？",
];

export default function ProfileViewPage() {
  const townSnapshot = useTownSnapshot();
  const commitment = useMemo(() => getInitialCommitment(), []);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [deskFullscreen, setDeskFullscreen] = useState<FullscreenDeskView>(null);

  const currentCommitmentTitle =
    commitment?.title?.trim() || townSnapshot.commitmentTitle || "给自己留一份温柔约定";
  const currentCommitmentStatus = localizeStatus(commitment?.status) || "进行中";

  return (
    <>
      <main className="min-h-screen bg-[#F4EFE9] px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1800px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#F7F3EF] shadow-[0_8px_30px_rgba(120,110,100,0.08)]">
            <div className="relative h-[82vh] min-h-[680px] w-full max-md:min-h-[760px]">
              <Image
                src="/assets/spaces/cottage/cottage_bg_v2.png"
                alt="我的小屋背景"
                fill
                priority
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,246,0.18)_0%,rgba(255,250,246,0.05)_35%,rgba(81,64,55,0.14)_100%)]" />

              <div className="absolute right-5 top-5 z-30 rounded-[24px] border border-[rgba(255,255,255,0.34)] bg-[rgba(255,252,250,0.72)] px-4 py-3 shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]">当前住客</p>
                <p className="mt-1 text-[15px] font-semibold tracking-[0.08em] text-[#5F5751]">
                  {mockUser.username}
                </p>
                <p className="mt-1 text-[12px] tracking-[0.08em] text-[#6E8B67]">登录中</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal("records")}
                className="group absolute left-[8%] top-[12%] z-[18] w-[22%] min-w-[190px] max-w-[320px] text-left"
              >
                <InteractiveObject
                  src="/assets/spaces/cottage/cottage_wall_cert.png"
                  alt="奖状墙"
                  className="aspect-square"
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("desk")}
                className="group absolute right-[8%] top-[11%] z-[22] w-[37%] min-w-[360px] max-w-[560px] text-left"
              >
                <InteractiveObject
                  src="/assets/spaces/cottage/cottage_desk_window_v2.png"
                  alt="窗边书桌"
                  className="aspect-square"
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("table")}
                className="group absolute left-[45%] top-[39%] z-[24] w-[32%] min-w-[260px] max-w-[430px] -translate-x-1/2 text-left"
              >
                <InteractiveObject
                  src="/assets/spaces/cottage/cottage_table_user.png"
                  alt="圆桌"
                  className="aspect-square"
                />
              </button>

              <div className="absolute left-5 top-5 z-20 rounded-full border border-[rgba(255,255,255,0.32)] bg-[rgba(255,252,250,0.62)] px-6 py-3 backdrop-blur-sm">
                <p className="text-[15px] tracking-[0.24em] text-[#85757A]">MY COTTAGE</p>
              </div>

              <div className="absolute left-5 bottom-5 z-30 flex flex-wrap gap-3">
                <NavPill href="/square" label="去主城" />
                <NavPill href="/study" label="学习小屋" tone="rose" />
                <NavPill href="/garden" label="花园社" tone="sage" />
              </div>

              <div className="pointer-events-none absolute bottom-[15%] left-[7%] z-10 max-w-[320px] rounded-[28px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] px-5 py-4 shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px] max-md:hidden">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]">小屋状态</p>
                <p className="mt-2 text-lg font-semibold text-[#5F5751]">{currentCommitmentTitle}</p>
                <p className="mt-2 text-sm leading-6 text-[#6C615A]">
                  已连续回访 {townSnapshot.profileStreak} 天，当前状态为 {currentCommitmentStatus}。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BaseModal
        open={activeModal === "records"}
        title="奖状墙"
        subtitle="这里放着你的小屋见证和一路收下来的温柔反馈。"
        onClose={() => setActiveModal(null)}
      >
        <ModalSection title="见证记录" badge="2 条">
          {witnessRecords.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
        <ModalSection title="支持记录" badge="2 条">
          {supportRecords.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
        <ModalSection title="小奖励" badge="2 件">
          {rewardRecords.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
      </BaseModal>

      <BaseModal
        open={activeModal === "desk"}
        title="窗边书桌"
        subtitle="这里适合回看自己的约定，也适合重新写下新的开始。"
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DeskActionCard
            title="查看我的约定"
            description="打开当前约定的全屏卡片视图，看看自己正在坚持什么。"
            actionLabel="查看我的约定"
            onClick={() => setDeskFullscreen("list")}
          />
          <DeskActionCard
            title="写下新约定"
            description="打开全屏书写面板，用卡片形式整理新的目标和提醒。"
            actionLabel="写下新约定"
            onClick={() => setDeskFullscreen("create")}
          />
        </div>
      </BaseModal>

      <BaseModal
        open={activeModal === "table"}
        title="圆桌"
        subtitle="围坐在一起的人和小组，都被收在这张圆桌边。"
        onClose={() => setActiveModal(null)}
      >
        <ModalSection title="我的好友" badge={`${friends.length} 位`}>
          {friends.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
        <ModalSection title="我的群组" badge={`${groups.length} 个`}>
          {groups.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
      </BaseModal>

      <FullscreenModal
        open={deskFullscreen === "list"}
        title="我的约定"
        onClose={() => setDeskFullscreen(null)}
      >
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <CardPanel
            eyebrow="当前进行中"
            title={currentCommitmentTitle}
            description={
              commitment?.description?.trim() ||
              "这份约定提醒你，把想认真对待的事情留在每天都能看见的地方。"
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {draftCommitmentCards.map((item) => (
                <InfoCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </CardPanel>

          <CardPanel
            eyebrow="回访摘要"
            title="这段时间的小屋记录"
            description="卡片式记录会是之后接真实数据的主要承载区域。"
          >
            <div className="space-y-3">
              <SpaceListItem
                title="连续回访"
                description={`你已经连续 ${townSnapshot.profileStreak} 天回来看看自己。`}
                meta="本周"
              />
              <SpaceListItem
                title="最近一次专注"
                description={`最近一次在学习小屋留下的专注时长是 ${townSnapshot.todayFocus}。`}
                meta="学习"
              />
              <SpaceListItem
                title="当前状态"
                description={`这份约定现在显示为“${currentCommitmentStatus}”。`}
                meta="状态"
              />
            </div>
          </CardPanel>
        </div>
      </FullscreenModal>

      <FullscreenModal
        open={deskFullscreen === "create"}
        title="写下新约定"
        onClose={() => setDeskFullscreen(null)}
      >
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <CardPanel
            eyebrow="新的开始"
            title="先把心意整理成几张卡片"
            description="现在先使用 mock 内容展示结构，后面接真实表单时可以直接替换这里的卡片数据。"
          >
            <div className="space-y-3">
              <InfoCard label="约定标题" value="比如：四月把晚间学习节奏重新找回来" />
              <InfoCard label="预计周期" value="比如：连续 21 天，每周至少完成 4 次" />
              <InfoCard label="给自己的提醒" value="就算只完成一点点，也算今天认真来过。" />
            </div>
          </CardPanel>

          <CardPanel
            eyebrow="书写提示"
            title="可以从这些问题开始"
            description="先把想法写清楚，比一下子把计划写完整更重要。"
          >
            <div className="space-y-3">
              {newCommitmentPrompts.map((prompt, index) => (
                <div
                  key={prompt}
                  className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.72)] px-5 py-4"
                >
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">
                    提示 {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#5f4b54]">{prompt}</p>
                </div>
              ))}
            </div>
          </CardPanel>
        </div>
      </FullscreenModal>
    </>
  );
}

function getInitialCommitment() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(COMMITMENT_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as CommitmentDraft;
  } catch {
    return null;
  }
}

function localizeStatus(value?: string) {
  if (!value) {
    return "进行中";
  }

  const normalized = value.toLowerCase();

  if (normalized === "checked in today") return "今日已打卡";
  if (normalized === "active") return "进行中";

  return value;
}

function InteractiveObject({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.03] ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain drop-shadow-[0_20px_32px_rgba(94,73,56,0.20)]"
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
  tone?: "default" | "rose" | "sage";
}) {
  const toneClassName = {
    default: "text-[#6E6765] bg-[rgba(255,252,250,0.66)]",
    rose: "text-[#7B5B67] bg-[rgba(255,245,248,0.72)]",
    sage: "text-[#5F7960] bg-[rgba(245,252,246,0.72)]",
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

function BaseModal({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle: string;
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
              <p className="text-xs uppercase tracking-[0.2em] text-[#9B7E60]">小屋互动</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#5D5148]">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6F625A]">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#F0E3D3] px-4 py-2 text-sm text-[#65584D] transition hover:bg-[#EAD8C2]"
            >
              返回我的小屋
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FullscreenModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-[rgba(48,36,31,0.34)] px-4 py-6 backdrop-blur-md sm:px-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mx-auto max-w-6xl rounded-[36px] border border-[rgba(255,255,255,0.24)] bg-[linear-gradient(180deg,rgba(255,250,246,0.95)_0%,rgba(247,241,236,0.95)_100%)] p-6 shadow-[0_30px_90px_rgba(83,64,46,0.24)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B7E60]">书桌展开视图</p>
            <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#5D5148]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F0E3D3] px-5 py-2.5 text-sm text-[#65584D] transition hover:bg-[#EAD8C2]"
          >
            返回书桌
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function ModalSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[rgba(205,186,166,0.24)] bg-white/70 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#5D5148]">{title}</h3>
        <SpaceBadge tone="amber">{badge}</SpaceBadge>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DeskActionCard({
  title,
  description,
  actionLabel,
  onClick,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[rgba(188,176,203,0.16)] bg-[linear-gradient(180deg,rgba(248,245,251,0.96)_0%,rgba(241,235,248,0.92)_100%)] p-5 shadow-[0_18px_44px_rgba(109,87,97,0.05)]">
      <h3 className="text-lg font-semibold text-[#4F4255]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#6A5D70]">{description}</p>
      <div className="mt-5">
        <SpaceButton tone="lavender" onClick={onClick}>
          {actionLabel}
        </SpaceButton>
      </div>
    </div>
  );
}

function CardPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_44px_rgba(109,87,97,0.05)] sm:p-6">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#967684]">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#4E3C44]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#685760]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.82)] px-5 py-4">
      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#5f4b54]">{value}</p>
    </div>
  );
}
