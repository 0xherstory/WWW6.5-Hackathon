"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import CheckInAction from "@/components/CheckInAction";
import PageWalletBar from "@/components/PageWalletBar";
import { CHECKIN_CONTRACT_ADDRESS } from "@/contracts/checkinConfig";
import { checkinAbi } from "@/contracts/checkinAbi";
import MusicFloatingToggle from "@/components/MusicFloatingToggle";
import { useBackgroundAudio } from "@/components/BackgroundAudioProvider";

type Phase = "Inhale" | "Hold" | "Exhale";
type SessionState = "idle" | "active" | "paused" | "complete";

const DAILY_WHISPERS = [
  "慢一点，也是在向前。",
  "今天做一点点，也很好。",
  "柔软不是退让，是另一种力量。",
  "身体会记住每一次温柔的练习。",
  "不必急着证明，你已经在发生变化。",
  "先回到自己，再继续出发。",
  "允许自己慢下来，节律会重新回来。",
  "每一次安静的练习，都算数。",
  "你不需要很用力，也可以慢慢变好。",
  "先照顾好自己，很多答案会慢慢浮现。",
];

function getDailyWhisper() {
  const now = new Date();
  const text = DAILY_WHISPERS[now.getDate() % DAILY_WHISPERS.length];
  const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = now.getDate().toString().padStart(2, "0");

  return {
    text,
    label: `${month} ${day} · TODAY’S WHISPER`,
  };
}

const PHASES = [
  { name: "Inhale" as Phase, duration: 4 },
  { name: "Hold" as Phase, duration: 2 },
  { name: "Exhale" as Phase, duration: 6 },
];

export default function BreathingPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { enabled } = useBackgroundAudio();
  const dailyWhisper = getDailyWhisper();

  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(180);
  const [remainingTime, setRemainingTime] = useState(180);
  const [phaseRemaining, setPhaseRemaining] = useState(PHASES[0].duration);

  const [displayPhase, setDisplayPhase] = useState<Phase>("Inhale");
  const [textVisible, setTextVisible] = useState(true);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const switchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = PHASES[phaseIndex];
  const isRunning = sessionState === "active";

  const {
    data: hasCheckedInToday,
    refetch: refetchCheckedInToday,
  } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: "hasCheckedInToday",
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address && sessionState === "complete",
    },
  });

  useEffect(() => {
    if (sessionState !== "active") return;

    countdownRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setSessionState("complete");
          return 0;
        }
        return prev - 1;
      });

      setPhaseRemaining((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseIndex + 1) % PHASES.length;
          const nextPhase = PHASES[nextIndex];

          setTextVisible(false);

          if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
          switchTimerRef.current = setTimeout(() => {
            setPhaseIndex(nextIndex);
            setDisplayPhase(nextPhase.name);
            setTextVisible(true);
          }, 220);

          return nextPhase.duration;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [sessionState, phaseIndex]);

  useEffect(() => {
    if (sessionState === "complete") {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      refetchCheckedInToday();
    }
  }, [sessionState, refetchCheckedInToday]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  const phaseText = {
    Inhale: "吸气",
    Hold: "停留",
    Exhale: "呼气",
  }[displayPhase];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const mainOrbClass = useMemo(() => {
    if (sessionState === "idle") {
      return "h-[272px] w-[272px] md:h-[312px] md:w-[312px]";
    }

    return "h-[244px] w-[244px] md:h-[282px] md:w-[282px]";
  }, [sessionState]);

  const outerRingClass = useMemo(() => {
    if (sessionState === "idle") {
      return "h-[332px] w-[332px] md:h-[380px] md:w-[380px]";
    }

    return "h-[294px] w-[294px] md:h-[344px] md:w-[344px]";
  }, [sessionState]);

  const innerRingClass = useMemo(() => {
    if (sessionState === "idle") {
      return "h-[300px] w-[300px] md:h-[342px] md:w-[342px]";
    }

    return "h-[264px] w-[264px] md:h-[306px] md:w-[306px]";
  }, [sessionState]);

  const circleStyle = useMemo(() => {
    if (sessionState === "idle") {
      return {
        transform: "scale(1)",
        transition: "transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    if (sessionState === "paused") {
      const pausedScale =
        currentPhase.name === "Exhale" ? 0.94 : 1.1;

      return {
        transform: `scale(${pausedScale})`,
        transition: "transform 0.4s ease",
      };
    }

    if (sessionState === "complete") {
      return {
        transform: "scale(0.95)",
        opacity: 0.94,
        transition: "all 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    if (currentPhase.name === "Inhale") {
      return {
        transform: "scale(1.14)",
        transition: `transform ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (currentPhase.name === "Hold") {
      return {
        transform: "scale(1.14)",
        transition: `transform ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    return {
      transform: "scale(0.9)",
      transition: `transform ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [currentPhase, sessionState]);

  const outerWaveStyle = useMemo(() => {
    if (sessionState === "complete") {
      return {
        transform: "scale(1.08)",
        opacity: 0.07,
        transition: "all 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    if (sessionState === "paused") {
      return {
        transform: "scale(1.16)",
        opacity: 0.13,
        transition: "all 0.4s ease",
      };
    }

    if (!isRunning) {
      return {
        transform: "scale(1)",
        opacity: 0.22,
        transition: "all 2s ease",
      };
    }

    if (currentPhase.name === "Inhale") {
      return {
        transform: "scale(1.24)",
        opacity: 0.2,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (currentPhase.name === "Hold") {
      return {
        transform: "scale(1.24)",
        opacity: 0.16,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    return {
      transform: "scale(1.06)",
      opacity: 0.1,
      transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [currentPhase, isRunning, sessionState]);

  const innerWaveStyle = useMemo(() => {
    if (sessionState === "complete") {
      return {
        transform: "scale(1.03)",
        opacity: 0.05,
        transition: "all 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    if (sessionState === "paused") {
      return {
        transform: "scale(1.1)",
        opacity: 0.1,
        transition: "all 0.4s ease",
      };
    }

    if (!isRunning) {
      return {
        transform: "scale(1)",
        opacity: 0.15,
        transition: "all 2s ease",
      };
    }

    if (currentPhase.name === "Inhale") {
      return {
        transform: "scale(1.16)",
        opacity: 0.15,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (currentPhase.name === "Hold") {
      return {
        transform: "scale(1.16)",
        opacity: 0.12,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    return {
      transform: "scale(1.02)",
      opacity: 0.065,
      transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [currentPhase, isRunning, sessionState]);

  const start = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

    setRemainingTime(selectedDuration);
    setPhaseIndex(0);
    setPhaseRemaining(PHASES[0].duration);
    setDisplayPhase("Inhale");
    setTextVisible(true);
    setSessionState("active");
  };

  const resume = () => {
    setSessionState("active");
    setTextVisible(true);
  };

  const pause = () => {
    setSessionState("paused");
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
  };

  const reset = () => {
    setSessionState("idle");
    setPhaseIndex(0);
    setPhaseRemaining(PHASES[0].duration);
    setDisplayPhase("Inhale");
    setTextVisible(true);
    setRemainingTime(selectedDuration);

    if (countdownRef.current) clearInterval(countdownRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
  };

  const chooseDuration = (t: number) => {
    if (sessionState === "active" || sessionState === "paused") return;
    setSelectedDuration(t);
    setRemainingTime(t);
    setSessionState("idle");
  };

  const handleCheckInSuccess = () => {
    router.push("/checkin");
  };

  const showDurationSelector =
    sessionState === "idle" || sessionState === "complete";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(232,239,230,0.94),rgba(245,241,235,0.97)_36%,rgba(237,244,234,1)_100%)] text-[#33413a]">
      <PageWalletBar />
      <MusicFloatingToggle track="home" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 md:px-10 md:py-7 lg:px-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[8%] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#e8efe4]/75 blur-3xl" />
          <div className="absolute left-[10%] top-[58%] h-[260px] w-[260px] rounded-full bg-[#f5efe4]/58 blur-3xl" />
          <div className="absolute right-[12%] top-[24%] h-[280px] w-[280px] rounded-full bg-[#eef5eb]/78 blur-3xl" />
          <div className="absolute bottom-[-44px] left-1/2 h-[190px] w-[74%] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex rounded-full border border-[#d8e0d6] bg-white/58 px-4 py-2 text-sm text-[#6c7a71] shadow-[0_8px_22px_rgba(104,122,104,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/76 hover:shadow-[0_14px_28px_rgba(104,122,104,0.12)]"
          >
            ← Back
          </Link>
        </div>

        <div className="relative z-10 mt-8 text-center md:mt-10">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#808d84] md:text-xs">
            Breathing Practice
          </p>

          <h1 className="mt-4 text-[38px] font-semibold tracking-[0.018em] text-[#414d46] md:text-[58px]">
            腹式呼吸
          </h1>

          <p className="mt-3 text-[13px] font-normal tracking-[0.42em] text-[#88958c] md:text-[14px]">
            4 · 2 · 6
          </p>

          <p className="mt-4 text-sm text-[#8e9992]">
            {sessionState === "active" || sessionState === "paused"
              ? `remaining ${formatTime(remainingTime)}`
              : sessionState === "complete"
              ? "session completed"
              : `${selectedDuration / 60} min session`}
          </p>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-1 md:py-2">
          <div className="relative flex h-[318px] w-[318px] items-center justify-center md:h-[376px] md:w-[376px]">
            <div
              className={`absolute rounded-full border border-white/26 bg-[#f3f6f0]/22 blur-[3px] ${outerRingClass}`}
              style={outerWaveStyle}
            />

            <div
              className={`absolute rounded-full border border-white/34 bg-[#eef4ea]/28 ${innerRingClass}`}
              style={innerWaveStyle}
            />

            <div
              className={`relative flex items-center justify-center rounded-full border border-white/60 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.88),rgba(242,246,239,0.97)_46%,rgba(231,239,227,0.95)_70%,rgba(220,231,217,0.94)_100%)] shadow-[0_28px_80px_rgba(97,122,101,0.14),0_10px_26px_rgba(97,122,101,0.06),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-md ${mainOrbClass}`}
              style={circleStyle}
            >
              {sessionState === "idle" && (
                <div className="px-6 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#808d84]">
                    settle in
                  </p>

                  <div className="mt-5 space-y-3">
                    <p className="text-[30px] font-medium tracking-[0.025em] text-[#4c5952] md:text-[34px]">
                      准备好时
                    </p>

                    <p className="text-[30px] font-normal tracking-[0.025em] text-[#9aa59e] opacity-0 animate-[fadeInSoft_1.6s_ease-out_0.45s_forwards] md:text-[34px]">
                      轻轻开始
                    </p>
                  </div>
                </div>
              )}

              {sessionState === "active" && (
                <div className="px-6 text-center">
                  <p
                    className={`text-[11px] uppercase tracking-[0.3em] text-[#808d84] transition-all duration-[700ms] ${
                      textVisible
                        ? "translate-y-0 opacity-100 blur-0"
                        : "translate-y-[3px] opacity-0 blur-[2px]"
                    }`}
                  >
                    {displayPhase}
                  </p>

                  <p
                    className={`mt-4 text-[40px] font-semibold tracking-[0.028em] text-[#49554f] transition-all duration-[900ms] md:text-[50px] ${
                      textVisible
                        ? "translate-y-0 opacity-100 blur-0"
                        : "translate-y-[7px] opacity-0 blur-[5px]"
                    }`}
                  >
                    {phaseText}
                  </p>
                </div>
              )}

              {sessionState === "paused" && (
                <div className="px-6 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#808d84]">
                    paused
                  </p>

                  <div className="mt-4 space-y-3">
                    <p className="text-[36px] font-semibold tracking-[0.028em] text-[#49554f] md:text-[44px]">
                      {phaseText}
                    </p>

                    <p className="text-[15px] text-[#8d9790] md:text-[17px]">
                      先停一下，再继续
                    </p>
                  </div>
                </div>
              )}

              {sessionState === "complete" && (
                <div className="px-6 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#808d84] opacity-75">
                    complete
                  </p>

                  <div className="mt-5 space-y-3">
                    <p className="text-[28px] font-medium tracking-[0.025em] text-[#4c5952] md:text-[32px]">
                      做得很好
                    </p>

                    <p className="text-[15px] font-normal text-[#8d9790] md:text-[18px]">
                      给自己一点安静
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {showDurationSelector && (
          <div className="relative z-10 -mt-1 flex justify-center gap-3">
            {[60, 180, 300].map((t) => {
              const isSelected = selectedDuration === t;

              return (
                <button
                  key={t}
                  onClick={() => chooseDuration(t)}
                  className={`rounded-full px-5 py-2.5 text-sm tracking-[0.02em] transition-all duration-500 ${
                    isSelected
                      ? "bg-[#dbe8d8] text-[#314038] shadow-[0_14px_28px_rgba(97,122,101,0.14),inset_0_1px_0_rgba(255,255,255,0.35)]"
                      : "bg-white/62 text-[#6f7c74] shadow-[0_8px_18px_rgba(120,120,110,0.07)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/82 hover:shadow-[0_14px_24px_rgba(120,120,110,0.10)]"
                  }`}
                >
                  {t / 60} min
                </button>
              );
            })}
          </div>
        )}

        {sessionState === "complete" && (
          <div className="relative z-10 mt-4 flex flex-col items-center gap-3">
            <div className="max-w-[340px] text-center">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#a1aa9f]">
                {dailyWhisper.label}
              </p>
              <p className="mt-2 text-[18px] leading-8 text-[#6f786f] md:text-[20px]">
                {dailyWhisper.text}
              </p>
            </div>

            {hasCheckedInToday ? (
              <button
                onClick={() => router.push("/checkin")}
                className="rounded-full border border-white/30 bg-[#eef3eb] px-6 py-2.5 text-sm tracking-[0.03em] text-[#33413a] shadow-[0_10px_22px_rgba(97,122,101,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#e8efe5] hover:shadow-[0_16px_30px_rgba(97,122,101,0.12)]"
              >
                查看打卡记录
              </button>
            ) : (
              <CheckInAction onSuccess={handleCheckInSuccess} />
            )}
          </div>
        )}

        <div className="relative z-10 mt-5 flex justify-center gap-3 pb-3">
          {sessionState === "idle" && (
            <button
              onClick={start}
              className="rounded-full border border-white/30 bg-[#d9e7d6] px-7 py-3 text-sm tracking-[0.03em] text-[#2f3d36] shadow-[0_16px_32px_rgba(97,122,101,0.14),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d4e4d1] hover:shadow-[0_20px_38px_rgba(97,122,101,0.18)] active:scale-[0.988]"
            >
              开始训练
            </button>
          )}

          {sessionState === "active" && (
            <button
              onClick={pause}
              className="rounded-full border border-white/26 bg-[#eef3eb] px-7 py-3 text-sm tracking-[0.03em] text-[#33413a] shadow-[0_10px_22px_rgba(97,122,101,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#e8efe5] hover:shadow-[0_16px_30px_rgba(97,122,101,0.12)] active:scale-[0.988]"
            >
              暂停
            </button>
          )}

          {sessionState === "paused" && (
            <button
              onClick={resume}
              className="rounded-full border border-white/30 bg-[#d9e7d6] px-7 py-3 text-sm tracking-[0.03em] text-[#2f3d36] shadow-[0_16px_32px_rgba(97,122,101,0.14),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d4e4d1] hover:shadow-[0_20px_38px_rgba(97,122,101,0.18)] active:scale-[0.988]"
            >
              继续
            </button>
          )}

          {sessionState === "complete" && (
            <button
              onClick={start}
              className="rounded-full border border-white/30 bg-[#d9e7d6] px-7 py-3 text-sm tracking-[0.03em] text-[#2f3d36] shadow-[0_16px_32px_rgba(97,122,101,0.14),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d4e4d1] hover:shadow-[0_20px_38px_rgba(97,122,101,0.18)] active:scale-[0.988]"
            >
              再来一次
            </button>
          )}

          {sessionState === "paused" && (
            <button
              onClick={reset}
              className="rounded-full border border-white/34 bg-white/68 px-7 py-3 text-sm tracking-[0.03em] text-[#6d7a72] shadow-[0_10px_22px_rgba(120,120,110,0.07),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-white/86 hover:shadow-[0_16px_28px_rgba(120,120,110,0.10)] active:scale-[0.988]"
            >
              重置
            </button>
          )}

        </div>

        <style jsx global>{`
          @keyframes fadeInSoft {
            0% {
              opacity: 0;
              transform: translateY(10px);
              filter: blur(6px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }
        `}</style>
      </section>
    </main>
  );
}