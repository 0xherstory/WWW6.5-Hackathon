"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { WalletStatusCard } from "../components/wallet-status-card";
import { SceneStatusCard, SceneStatusRail } from "../components/scene-status";
import {
  SpaceButton,
  SpaceBadge,
  SpaceField,
  SpaceInput,
} from "../components/space-shell";
import { useWalletConnection } from "../hooks/use-wallet-connection";
import { STUDY_CHECKIN_STORAGE_KEY, useTownSnapshot } from "../lib/ami-world";
import { formatAddress } from "../services/support/supportService";

type StudyCheckIn = {
  goal: string;
  focusTime: string;
  note: string;
  createdAt: string;
};

type SeatState = "empty" | "active";
type OverlayMode = "focus" | "status" | null;

type Seat = {
  id: string;
  state: SeatState;
  label: string;
  goal?: string;
  remainingMinutes?: number;
  occupant?: string;
  isCurrentUser?: boolean;
  x: string;
  y: string;
  width: string;
  zIndex: number;
  bubbleAlign?: "left" | "center" | "right";
};

const focusGoalOptions = ["阅读", "写作", "学 Solidity", "完成今日打卡"];
const focusDurationOptions = [15, 25, 45, 60];

const initialSeats: Seat[] = [
  {
    id: "seat-a",
    state: "empty",
    label: "我的学习位",
    x: "50%",
    y: "78%",
    width: "28%",
    zIndex: 26,
    bubbleAlign: "center",
  },
  {
    id: "seat-b",
    state: "active",
    label: "窗边陪伴位",
    occupant: "Mori",
    goal: "写作",
    remainingMinutes: 18,
    x: "66%",
    y: "62%",
    width: "17%",
    zIndex: 18,
    bubbleAlign: "left",
  },
  {
    id: "seat-c",
    state: "active",
    label: "靠墙陪伴位",
    occupant: "柚子",
    goal: "阅读",
    remainingMinutes: 42,
    x: "30%",
    y: "68%",
    width: "16%",
    zIndex: 16,
    bubbleAlign: "right",
  },
];

export default function StudyViewPage() {
  const townSnapshot = useTownSnapshot();
  const { walletAddress } = useWalletConnection();
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [selectedGoal, setSelectedGoal] = useState(focusGoalOptions[2]);
  const [customGoal, setCustomGoal] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  const selectedSeat = useMemo(
    () => seats.find((seat) => seat.id === selectedSeatId) ?? null,
    [seats, selectedSeatId],
  );

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeatId(seat.id);
    setOverlayMode(seat.state === "empty" ? "focus" : "status");
  };

  const handleCloseOverlay = () => {
    setOverlayMode(null);
    setSelectedSeatId(null);
  };

  const handleStartStudy = () => {
    if (!selectedSeat || selectedSeat.state !== "empty") {
      return;
    }

    const finalGoal = customGoal.trim() || selectedGoal;
    const nextCheckIn: StudyCheckIn = {
      goal: finalGoal,
      focusTime: `${selectedDuration} 分钟`,
      note: "",
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(STUDY_CHECKIN_STORAGE_KEY, JSON.stringify(nextCheckIn));

    setSeats((currentSeats) =>
      currentSeats.map((seat) =>
        seat.id === selectedSeat.id
          ? {
              ...seat,
              state: "active",
              occupant: walletAddress ? formatAddress(walletAddress) : "我的钱包",
              isCurrentUser: true,
              goal: finalGoal,
              remainingMinutes: selectedDuration,
            }
          : seat,
      ),
    );

    handleCloseOverlay();
    setCustomGoal("");
  };

  return (
    <>
      <main className="min-h-screen bg-[#F3EDE5] px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1800px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#F8F3EC] shadow-[0_8px_30px_rgba(120,110,100,0.08)]">
            <div className="relative h-[84vh] min-h-[700px] w-full max-md:min-h-[780px]">
              <Image
                src="/assets/spaces/study/study_bg_v3.png"
                alt="学习教室背景"
                fill
                priority
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,246,0.08)_0%,rgba(255,250,246,0.02)_40%,rgba(120,95,80,0.14)_100%)]" />

              <div className="absolute left-5 top-5 z-20 rounded-full border border-[rgba(255,255,255,0.36)] bg-[rgba(255,252,250,0.62)] px-6 py-3 backdrop-blur-sm">
                <p className="text-[15px] tracking-[0.24em] text-[#8B7A73]">学习小屋</p>
              </div>

              <SceneStatusRail className="absolute left-5 top-20 z-30 hidden w-[280px] xl:block">
                <WalletStatusCard
                  className="rounded-[24px] border border-[rgba(255,255,255,0.34)] bg-[rgba(255,252,250,0.72)] px-4 py-3 shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm"
                  labelClassName="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]"
                  addressClassName="mt-1 text-[15px] font-semibold tracking-[0.08em] text-[#5F5751]"
                  statusClassName="mt-1 text-[12px] tracking-[0.08em] text-[#6E8B67]"
                />
                <SceneStatusCard
                  eyebrow="学习小屋"
                  title={`${seats.filter((seat) => seat.state === "active").length} 个专注座位正在使用`}
                  description="左侧状态卡会避开中间的座位区域，让你仍然可以轻松点击房间中的学习位置。"
                  tone="amber"
                  className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
                />
                <SceneStatusCard
                  eyebrow="其他房间"
                  title={townSnapshot.commitmentTitle}
                  description={`花园社当前氛围是“${townSnapshot.gardenMood}”，最近的专注记录为 ${townSnapshot.studyFocusTime}。`}
                  tone="rose"
                  className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
                />
              </SceneStatusRail>

              <div className="absolute inset-0">
                {seats.map((seat) => (
                  <StudySeatButton key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} />
                ))}
              </div>

              <div className="pointer-events-none absolute right-6 top-24 z-10 max-w-[250px] rounded-[24px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,250,246,0.3)] px-4 py-3 shadow-[0_12px_28px_rgba(79,64,52,0.05)] backdrop-blur-[4px] max-md:hidden">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2A5]">学习教室</p>
                <p className="mt-2 text-sm leading-6 text-[#665C57]">
                  已有 {seats.filter((seat) => seat.state === "active").length} 位 a.mi 在专注
                </p>
                <p className="mt-1 text-sm text-[#7A8F93]">安静开放中</p>
              </div>

              <div className="absolute left-5 bottom-5 z-30 flex flex-wrap gap-3">
                <NavPill href="/square" label="去主城" />
                <NavPill href="/garden" label="花园社" tone="sage" />
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
              eyebrow="学习小屋"
              title={`${seats.filter((seat) => seat.state === "active").length} 个专注座位正在使用`}
              description="左侧状态卡会避开中间的座位区域，让你仍然可以轻松点击房间中的学习位置。"
              tone="amber"
              className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
            />
            <SceneStatusCard
              eyebrow="其他房间"
              title={townSnapshot.commitmentTitle}
              description={`花园社当前氛围是“${townSnapshot.gardenMood}”，最近的专注记录为 ${townSnapshot.studyFocusTime}。`}
              tone="rose"
              className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px]"
            />
          </SceneStatusRail>
        </div>
      </main>

      <StudyModal
        open={overlayMode === "focus" && selectedSeat?.state === "empty"}
        title="开始专注"
        subtitle={selectedSeat ? `你选中了“${selectedSeat.label}”。先决定这一轮想安静完成什么。` : ""}
        onClose={handleCloseOverlay}
        closeLabel="取消"
      >
        <div className="grid gap-5">
          <ModalBlock title="专注目标" badge="可先用预设">
            <div className="flex flex-wrap gap-3">
              {focusGoalOptions.map((goal) => {
                const active = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition ${
                      active
                        ? "border-[rgba(186,139,155,0.34)] bg-[rgba(255,241,245,0.94)] text-[#835E6E]"
                        : "border-[rgba(194,179,172,0.24)] bg-[rgba(255,255,255,0.72)] text-[#6A5A56] hover:bg-[rgba(255,255,255,0.92)]"
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <SpaceField label="自定义目标">
                <SpaceInput
                  value={customGoal}
                  onChange={(event) => setCustomGoal(event.target.value)}
                  placeholder="比如：整理一章笔记、写完今日总结"
                />
              </SpaceField>
            </div>
          </ModalBlock>

          <ModalBlock title="专注时长" badge="轻一点也可以">
            <div className="grid gap-3 sm:grid-cols-4">
              {focusDurationOptions.map((duration) => {
                const active = selectedDuration === duration;
                return (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setSelectedDuration(duration)}
                    className={`rounded-[22px] border px-4 py-4 text-sm transition ${
                      active
                        ? "border-[rgba(144,184,181,0.32)] bg-[rgba(240,250,248,0.96)] text-[#55716E]"
                        : "border-[rgba(194,179,172,0.24)] bg-[rgba(255,255,255,0.72)] text-[#6A5A56] hover:bg-[rgba(255,255,255,0.92)]"
                    }`}
                  >
                    {duration} 分钟
                  </button>
                );
              })}
            </div>
          </ModalBlock>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCloseOverlay}
              className="rounded-full bg-[rgba(240,231,222,0.95)] px-5 py-3 text-sm text-[#6A5B52] transition hover:bg-[rgba(234,221,209,0.96)]"
            >
              取消
            </button>
            <SpaceButton onClick={handleStartStudy}>开始学习</SpaceButton>
          </div>
        </div>
      </StudyModal>

      <StudyModal
        open={overlayMode === "status" && selectedSeat?.state === "active"}
        title={selectedSeat?.isCurrentUser ? "我的座位状态" : `${selectedSeat?.occupant ?? "这位同学"} 的座位`}
        subtitle={selectedSeat ? `这是“${selectedSeat.label}”现在的学习状态。` : ""}
        onClose={handleCloseOverlay}
        closeLabel="返回教室"
      >
        {selectedSeat ? (
          <div className="grid gap-4">
            <StatusCard label="当前状态" value={`正在${selectedSeat.goal}`} />
            <StatusCard label="剩余时间" value={`${selectedSeat.remainingMinutes ?? 0} 分钟`} />
            <StatusCard
              label="座位说明"
              value={
                selectedSeat.isCurrentUser
                  ? "这就是你刚刚坐下来的位置，先安心把这一轮完成。"
                  : "这位同学已经进入专注状态，教室会继续保持安静。"
              }
            />
          </div>
        ) : null}
      </StudyModal>
    </>
  );
}

function StudySeatButton({ seat, onClick }: { seat: Seat; onClick: () => void }) {
  const isPrimarySeat = seat.label === "我的学习位";
  const alignClassName =
    seat.bubbleAlign === "left"
      ? "items-start text-left"
      : seat.bubbleAlign === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute text-left"
      style={{
        left: seat.x,
        top: seat.y,
        width: seat.width,
        zIndex: seat.zIndex,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={`pointer-events-none absolute left-1/2 flex min-w-[180px] -translate-x-1/2 flex-col ${alignClassName} ${
          isPrimarySeat ? "-top-18" : "-top-14"
        }`}
      >
        {seat.state === "active" ? (
          <div className="rounded-[18px] border border-[rgba(255,255,255,0.28)] bg-[rgba(255,252,249,0.84)] px-4 py-2.5 text-xs leading-5 text-[#5F5550] shadow-[0_12px_26px_rgba(110,92,82,0.08)] backdrop-blur-sm">
            <p className="font-semibold text-[#5B5250]">
              正在{seat.goal} · 剩余 {seat.remainingMinutes} 分钟
            </p>
          </div>
        ) : (
          <div
            className={`border text-[11px] tracking-[0.12em] backdrop-blur-sm ${
              isPrimarySeat
                ? "rounded-full border-[rgba(210,186,168,0.34)] bg-[rgba(255,248,242,0.92)] px-4 py-2 text-[#7F665C] shadow-[0_14px_30px_rgba(110,92,82,0.1)]"
                : "rounded-full border-[rgba(255,255,255,0.28)] bg-[rgba(255,252,249,0.72)] px-3 py-1.5 text-[#8B756F] shadow-[0_10px_22px_rgba(110,92,82,0.06)]"
            }`}
          >
            {isPrimarySeat ? "我的学习位 · 点击开始" : "空位 · 点击开始"}
          </div>
        )}
      </div>

      <div
        className={`relative aspect-square w-full transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.03] ${
          isPrimarySeat ? "drop-shadow-[0_0_36px_rgba(255,244,232,0.9)]" : ""
        }`}
      >
        <Image
          src={
            seat.state === "active"
              ? "/assets/spaces/study/study_seat_active_v4.png"
              : "/assets/spaces/study/study_seat_empty_v4.png"
          }
          alt={seat.label}
          fill
          className="object-contain drop-shadow-[0_22px_34px_rgba(109,90,78,0.18)]"
        />
      </div>
    </button>
  );
}

function NavPill({
  href,
  label,
  tone = "default",
}: {
  href: string;
  label: string;
  tone?: "default" | "sage" | "lavender";
}) {
  const toneClassName = {
    default: "text-[#6E6765] bg-[rgba(255,252,250,0.66)]",
    sage: "text-[#5F7960] bg-[rgba(245,252,246,0.72)]",
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

function StudyModal({
  open,
  title,
  subtitle,
  children,
  onClose,
  closeLabel,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
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
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] bg-[rgba(255,249,242,0.97)] shadow-[0_24px_60px_rgba(83,64,46,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-[rgba(205,186,166,0.24)] bg-[rgba(255,249,242,0.98)] px-6 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8EA1A5]">教室互动</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#5D5148]">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6F625A]">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#E8F0F1] px-4 py-2 text-sm text-[#5D6B6D] transition hover:bg-[#DDE9EA]"
            >
              {closeLabel}
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7">{children}</div>
      </div>
    </div>
  );
}

function ModalBlock({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[rgba(188,175,166,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(252,247,242,0.92)_100%)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#5C524D]">{title}</h3>
        <SpaceBadge tone="amber">{badge}</SpaceBadge>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(186,175,168,0.16)] bg-[linear-gradient(180deg,rgba(251,255,255,0.92)_0%,rgba(247,249,248,0.92)_100%)] px-5 py-4">
      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#8A9498]">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#5C5552]">{value}</p>
    </div>
  );
}




