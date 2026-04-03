"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import CheckInAction from "@/components/CheckInAction";
import { CHECKIN_CONTRACT_ADDRESS } from "@/contracts/checkinConfig";
import { checkinAbi } from "@/contracts/checkinAbi";
import PageWalletBar from "@/components/PageWalletBar";
import MusicFloatingToggle from "@/components/MusicFloatingToggle";
import { useBackgroundAudio } from "@/components/BackgroundAudioProvider";

type SessionStatus = "done" | "pending";

type RecordItem = {
  day: string;
  label: string;
  completed: boolean;
};

function formatMonthDay(date: Date) {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month}. ${day}`;
}

function formatWeekday(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday}.`;
}

export default function CheckInPage() {
  const { address, isConnected } = useAccount();
  const { playTrack, pauseTrack } = useBackgroundAudio();
  const [mounted, setMounted] = useState(false);
  const hasAutoPlayedRef = useRef(false);

    useEffect(() => {
      setMounted(true);
    }, []);

  const { data: hasCheckedInToday } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "hasCheckedInToday",
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: streakDays } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "getStreak",
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: totalCheckIns } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "getTotalCheckIns",
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const currentDayNumber = Math.floor(Date.now() / 1000 / 86400);

  const recentDayNumbers = [
    currentDayNumber,
    currentDayNumber - 1,
    currentDayNumber - 2,
    currentDayNumber - 3,
  ];

  const { data: recentCheck0 } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "checkedInOnDay",
    args: address ? [address, BigInt(recentDayNumbers[0])] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: recentCheck1 } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "checkedInOnDay",
    args: address ? [address, BigInt(recentDayNumbers[1])] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: recentCheck2 } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "checkedInOnDay",
    args: address ? [address, BigInt(recentDayNumbers[2])] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: recentCheck3 } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "checkedInOnDay",
    args: address ? [address, BigInt(recentDayNumbers[3])] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  });

  const todayStatus: SessionStatus =
    hasCheckedInToday === true ? "done" : "pending";

  const recentChecks = [recentCheck0, recentCheck1, recentCheck2, recentCheck3];

  const recentRecords: RecordItem[] = recentDayNumbers.map((dayNumber, index) => {
    const date = new Date(dayNumber * 86400 * 1000);
    const checked = recentChecks[index] as boolean | undefined;

    let dayLabel = formatWeekday(date);
    if (index === 0) dayLabel = "Today";
    if (index === 1) dayLabel = "Yesterday";

    return {
      day: dayLabel,
      label: formatMonthDay(date),
      completed: checked ?? false,
    };
  });

  const orbScaleStyle = useMemo(() => {
    if (todayStatus === "done") {
      return {
        transform: "scale(1.015)",
        transition: "transform 2.8s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    return {
      transform: "scale(0.97)",
      opacity: 0.92,
      transition: "all 2.8s cubic-bezier(0.22, 1, 0.36, 1)",
    };
  }, [todayStatus]);

  const outerWaveStyle = useMemo(() => {
    if (todayStatus === "done") {
      return {
        transform: "scale(1.12)",
        opacity: 0.14,
        transition: "all 2.8s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    return {
      transform: "scale(1.03)",
      opacity: 0.08,
      transition: "all 2.8s cubic-bezier(0.22, 1, 0.36, 1)",
    };
  }, [todayStatus]);

  const innerWaveStyle = useMemo(() => {
    if (todayStatus === "done") {
      return {
        transform: "scale(1.07)",
        opacity: 0.1,
        transition: "all 2.8s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    return {
      transform: "scale(1.01)",
      opacity: 0.05,
      transition: "all 2.8s cubic-bezier(0.22, 1, 0.36, 1)",
    };
  }, [todayStatus]);

  const todayStatusText = todayStatus === "done" ? "已完成" : "待记录";

  const todayStatusDescription =
    todayStatus === "done"
      ? "本次训练已完成，今日链上打卡已完成，无需重复记录。"
      : "今天还没有记录节律，完成一次训练后，就可以留下今日的温柔打卡。";

  const centerTitle = todayStatus === "done" ? "今日节律已记录" : "今天还未打卡";

  const centerDescription =
    todayStatus === "done"
      ? "每一次轻柔完成，都会慢慢变成身体熟悉的支持感。"
      : "开始一次练习后，再回来收下属于今天的鼓励签。";

  useEffect(() => {
    if (todayStatus === "done" && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;

      playTrack("checkin", {
        loop: false,
        reset: true,
        forceEnable: true,
      });
      return;
    }

    if (todayStatus !== "done") {
      hasAutoPlayedRef.current = false;
      pauseTrack();
    }
  }, [todayStatus, playTrack, pauseTrack]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(248,244,240,0.98),rgba(246,240,235,0.98)_28%,rgba(243,236,231,0.98)_56%,rgba(245,242,239,1)_100%)] text-[#48544d]">
      <PageWalletBar />
      {todayStatus === "done" && <MusicFloatingToggle track="checkin" />}

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-8 pt-5 pb-4 md:px-12 md:pt-5 md:pb-4 lg:px-16 xl:px-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[2%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#f5eee8]/82 blur-3xl md:h-[500px] md:w-[500px]" />
          <div className="absolute left-[9%] top-[44%] h-[260px] w-[260px] rounded-full bg-[#f8efe7]/54 blur-3xl" />
          <div className="absolute right-[9%] top-[15%] h-[280px] w-[280px] rounded-full bg-[#f3e9e1]/56 blur-3xl" />
          <div className="absolute left-1/2 top-[16%] h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-[#f1ede7]/40 blur-3xl" />
          <div className="absolute bottom-[-34px] left-1/2 h-[160px] w-[72%] -translate-x-1/2 rounded-full bg-white/22 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex rounded-full border border-[#e0dbd4] bg-white/58 px-4 py-2 text-sm text-[#7a827b] shadow-[0_8px_22px_rgba(130,124,118,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/76 hover:shadow-[0_14px_28px_rgba(130,124,118,0.12)]"
          >
            ← Back
          </Link>
        </div>

        {mounted && !isConnected && (
          <div className="mb-1 text-center text-sm text-[#9b9c95]">
            连接钱包后即可查看今日打卡状态
          </div>
        )}

        <div className="relative z-10 mt-2 text-center md:mt-3">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#9b9990] md:text-xs">
            Gentle Completion
          </p>

          <h1 className="mt-3 text-[38px] font-semibold tracking-[0.018em] text-[#4b5750] md:text-[56px] lg:text-[60px]">
            今日打卡
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-[#9b9c95]">
            把一次温柔完成，留作今天身体记得的节奏。
          </p>
        </div>

        <div className="relative z-10 mt-1 grid grid-cols-1 gap-y-6 xl:mt-2 xl:grid-cols-[1.18fr_1.08fr_1.18fr] xl:items-start xl:gap-x-20 2xl:gap-x-28">
          <aside className="order-2 space-y-5 xl:order-1 xl:pt-8">
            <div className="rounded-[28px] border border-white/40 bg-[rgba(255,250,246,0.56)] p-7 shadow-[0_16px_34px_rgba(145,135,125,0.08)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#b0aba2]">
                today status
              </p>

              <div className="mt-5">
                <p className="text-[30px] font-medium tracking-[0.01em] text-[#667268] md:text-[34px]">
                  {todayStatusText}
                </p>

                <p className="mt-4 max-w-[360px] text-[16px] leading-8 text-[#91978f]">
                  {todayStatusDescription}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/38 bg-[rgba(255,250,247,0.48)] p-6 shadow-[0_10px_22px_rgba(145,135,125,0.05)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#b0aba2]">
                total rhythm
              </p>

              <p className="mt-4 text-[15px] leading-7 text-[#949991]">
                累计已完成
              </p>

              <p className="mt-2 text-[38px] font-medium tracking-[0.01em] text-[#667268]">
                {totalCheckIns !== undefined ? Number(totalCheckIns) : "--"}
              </p>

              <p className="mt-1 text-[13px] text-[#abada6]">
                check-ins recorded
              </p>
            </div>
          </aside>

          <div className="order-1 flex flex-col items-center xl:order-2">
            <div className="relative flex h-[372px] w-[372px] items-center justify-center md:h-[420px] md:w-[420px]">
              <div
                className="absolute h-[328px] w-[328px] rounded-full border border-white/26 bg-[#f7f0e8]/18 blur-[3px] md:h-[372px] md:w-[372px]"
                style={outerWaveStyle}
              />

              <div
                className="absolute h-[296px] w-[296px] rounded-full border border-white/34 bg-[#f4ede6]/20 md:h-[334px] md:w-[334px]"
                style={innerWaveStyle}
              />

              <div
                className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full border border-white/60 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.94),rgba(248,244,240,0.98)_38%,rgba(239,237,231,0.93)_68%,rgba(228,236,224,0.84)_100%)] shadow-[0_28px_80px_rgba(130,122,112,0.11),0_10px_26px_rgba(130,122,112,0.05),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md md:h-[316px] md:w-[316px]"
                style={orbScaleStyle}
              >
                <div className="px-8 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#93958d]">
                    {todayStatus === "done" ? "recorded" : "waiting"}
                  </p>

                  <div className="mt-5 space-y-4">
                    <p className="mx-auto max-w-[220px] text-[32px] font-medium leading-[1.32] tracking-[0.02em] text-[#5f6962] md:max-w-[246px] md:text-[38px]">
                      {centerTitle}
                    </p>

                    <p className="mx-auto max-w-[232px] text-[17px] leading-8 text-[#a1a39b] md:max-w-[258px] md:text-[18px]">
                      {centerDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {mounted &&isConnected && todayStatus !== "done" && (
              <div className="mt-4 flex justify-center">
                <CheckInAction onSuccess={() => window.location.reload()} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/breathing"
                className="rounded-full border border-white/30 bg-[#dbe4d6] px-6 py-3 text-sm tracking-[0.03em] text-[#3a463f] shadow-[0_16px_32px_rgba(110,122,103,0.14),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d6e0d1] hover:shadow-[0_20px_38px_rgba(110,122,103,0.18)] active:scale-[0.988]"
              >
                腹式呼吸
              </Link>

              <Link
                href="/"
                className="rounded-full border border-white/38 bg-[rgba(255,250,247,0.7)] px-6 py-3 text-sm tracking-[0.03em] text-[#7a8078] shadow-[0_10px_22px_rgba(130,124,118,0.07),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-white/86 hover:shadow-[0_16px_28px_rgba(130,124,118,0.1)] active:scale-[0.988]"
              >
                返回首页
              </Link>

              <Link
                href="/kegel"
                className="rounded-full border border-white/30 bg-[#dbe4d6] px-6 py-3 text-sm tracking-[0.03em] text-[#3a463f] shadow-[0_16px_32px_rgba(110,122,103,0.14),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d6e0d1] hover:shadow-[0_20px_38px_rgba(110,122,103,0.18)] active:scale-[0.988]"
              >
                凯格尔训练
              </Link>
            </div>
          </div>

          <aside className="order-3 space-y-5 xl:pt-8">
            <div className="rounded-[28px] border border-white/40 bg-[rgba(255,250,246,0.56)] p-7 shadow-[0_16px_34px_rgba(145,135,125,0.08)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#b0aba2]">
                streak days
              </p>

              <div className="mt-5 flex items-end gap-3">
                <p className="text-[48px] font-medium leading-none tracking-[0.01em] text-[#667268] md:text-[56px]">
                  {streakDays !== undefined ? Number(streakDays) : "--"}
                </p>
                <p className="pb-1.5 text-[16px] text-[#91978f]">days</p>
              </div>

              <p className="mt-4 max-w-[360px] text-[16px] leading-8 text-[#91978f]">
                连续打卡会让练习从一次动作，慢慢变成身体熟悉的日常节奏。
              </p>
            </div>

            <div className="rounded-[24px] border border-white/38 bg-[rgba(255,250,247,0.48)] p-6 shadow-[0_10px_22px_rgba(145,135,125,0.05)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#b0aba2]">
                recent notes
              </p>

              <div className="mt-4 space-y-3">
                {recentRecords.map((item) => (
                  <div
                    key={`${item.day}-${item.label}`}
                    className="flex items-center justify-between rounded-[18px] border border-white/30 bg-[rgba(255,255,255,0.34)] px-4 py-3.5"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-[#667167]">
                        {item.day}
                      </p>
                      <p className="mt-1 text-[12px] text-[#a4a79f]">
                        {item.label}
                      </p>
                    </div>

                    <div className="text-right">
                      {item.completed ? (
                        <span className="inline-flex items-center rounded-full bg-[#edf4ed] px-3 py-1.5 text-[12px] text-[#758073]">
                          √ 已完成
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#f4efe9] px-3 py-1.5 text-[12px] text-[#a8aba5]">
                          ○ 未记录
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="relative z-10 mt-6 flex justify-between border-t border-[#e7e2db] pt-5 text-sm text-[#7b8079]">
          <p>Daily check-in · gentle ritual · body awareness</p>
          <p>streak · completion · small encouragements</p>
        </div>
      </section>
    </main>
  );
}