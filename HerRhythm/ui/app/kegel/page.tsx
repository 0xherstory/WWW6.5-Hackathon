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

type Phase = "Engage" | "Hold" | "Release";
type SessionState = "idle" | "active" | "paused" | "complete";
type Posture = "standing" | "sitting" | "lying";

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
  { name: "Engage" as Phase, duration: 4 },
  { name: "Hold" as Phase, duration: 3 },
  { name: "Release" as Phase, duration: 5 },
];

const POSTURES: Record<
  Posture,
  {
    label: string;
    title: string;
    short: string;
    intro: string;
    quote: string;
    details: string[];
  }
> = {
  standing: {
    label: "站姿",
    title: "站姿练习",
    short: "把觉察带回日常站立状态",
    intro: "适合白天碎片时间。身体不需要很紧，只要轻轻站稳。",
    quote: "站着练习，不是更难，而是把温柔的控制带回日常。",
    details: [
      "双脚与髋同宽，膝盖微微放松，不要把腿绷得太直。",
      "肩膀轻轻下沉，下巴放松，呼吸保持自然。",
      "想象会阴处像一枚小小电梯，向内收拢后，轻轻上提一层。",
      "不要夹臀、夹腿或屏住呼吸，发力应该是细小而集中的。",
    ],
  },
  sitting: {
    label: "坐姿",
    title: "坐姿练习",
    short: "更容易找到真正的发力位置",
    intro: "适合初学者。坐着更容易安静下来，感受盆底肌的细微动作。",
    quote: "先找到感觉，比做很多次更重要。",
    details: [
      "坐在椅子前半段，让坐骨有支撑感，腰背自然延展。",
      "双腿自然放松，不要用膝盖内夹来代替盆底发力。",
      "想象阴道口、尿道口、肛门周围像花瓣一样轻轻收拢。",
      "收紧以后，再有一点点向上提的感觉，而不是向下用力。",
    ],
  },
  lying: {
    label: "卧姿",
    title: "卧姿练习",
    short: "最适合温柔起步与放松练习",
    intro: "适合刚开始练习、身体疲惫，或想更慢地感受身体的时候。",
    quote: "躺下来不是偷懒，是给身体一个更安全的开始。",
    details: [
      "仰卧，膝盖弯曲，双脚踩地，让腹部和下巴都保持放松。",
      "呼气时轻轻收紧，再有一点点向上提的感觉。",
      "放松阶段不要突然松掉，而是慢慢回落，像花瓣缓缓打开。",
      "如果感觉自己在顶腹、夹臀或耻骨太用力，说明位置有点偏了。",
    ],
  },
};

const PHASE_COPY: Record<
  Phase,
  {
    cn: string;
    en: string;
    imagery: string;
  }
> = {
  Engage: {
    cn: "收紧",
    en: "engage",
    imagery: "像把中心轻轻向内收拢，再温柔上提",
  },
  Hold: {
    cn: "保持",
    en: "hold",
    imagery: "不用更用力，只是稳稳托住这一点力量",
  },
  Release: {
    cn: "放松",
    en: "release",
    imagery: "慢慢松开，像花瓣回到柔软的位置",
  },
};

const ENCOURAGEMENTS = [
  "一点点找到感觉，就已经很好。",
  "不是做得越猛越有效，而是越精细越接近身体。",
  "慢慢来，让身体学会被温柔地唤醒。",
];

function PostureIcon({
  posture,
  selected,
}: {
  posture: Posture;
  selected: boolean;
}) {
  const stroke = selected ? "#6b726b" : "#90978f";

  if (posture === "standing") {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" fill="none">
        <circle cx="32" cy="10" r="4" stroke={stroke} strokeWidth="1.8" />
        <path
          d="M32 14v13M32 27l-8 10M32 27l8 10M32 27v16M32 43l-7 11M32 43l7 11M21 54h22"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (posture === "sitting") {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" fill="none">
        <circle cx="24" cy="10" r="4" stroke={stroke} strokeWidth="1.8" />
        <path
          d="M24 14v12M24 26l9 8M24 26l-6 9M33 34v10M33 44H21M33 44l7 10M21 44l-5 10M33 34h14M47 34v-8"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" fill="none">
      <circle cx="18" cy="28" r="3.6" stroke={stroke} strokeWidth="1.8" />
      <path
        d="M14.5 31.5l-7.5 8M22 31.5l8 7M10 43.5l-4 8M30 39.5l10 12"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 44c7 0 12-2 17-6 4-3 7-5 12-5 5 0 9 3 12 6 4 4 7 5 11 5h2"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function KegelPage() {
  const router = useRouter();
  const { address } = useAccount();
  useBackgroundAudio();
  const dailyWhisper = getDailyWhisper();

  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedPosture, setSelectedPosture] = useState<Posture>("sitting");

  const [displayPhase, setDisplayPhase] = useState<Phase>("Engage");
  const [textVisible, setTextVisible] = useState(true);

  const [remainingTime, setRemainingTime] = useState(180);
  const [phaseRemaining, setPhaseRemaining] = useState(PHASES[0].duration);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const switchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isRunning = sessionState === "active";
  const currentPhase = PHASES[phaseIndex];
  const posture = POSTURES[selectedPosture];
  const displayCopy = PHASE_COPY[displayPhase];

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

  const checkedInToday = sessionState === "complete" && hasCheckedInToday === true;

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
      return "h-[332px] w-[332px] md:h-[376px] md:w-[376px]";
    }
    return "h-[294px] w-[294px] md:h-[342px] md:w-[342px]";
  }, [sessionState]);

  const innerRingClass = useMemo(() => {
    if (sessionState === "idle") {
      return "h-[300px] w-[300px] md:h-[340px] md:w-[340px]";
    }
    return "h-[264px] w-[264px] md:h-[304px] md:w-[304px]";
  }, [sessionState]);

  const circleStyle = useMemo(() => {
    if (sessionState === "idle") {
      return {
        transform: "scale(1)",
        transition: "transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    if (sessionState === "paused") {
      const pausedScale = currentPhase.name === "Release" ? 0.96 : 1.08;
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

    if (currentPhase.name === "Engage") {
      return {
        transform: "scale(1.08)",
        transition: `transform ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (currentPhase.name === "Hold") {
      return {
        transform: "scale(1.08)",
        transition: `transform ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    return {
      transform: "scale(0.94)",
      transition: `transform ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [currentPhase, sessionState]);

  const outerWaveStyle = useMemo(() => {
    if (sessionState === "complete") {
      return {
        transform: "scale(1.08)",
        opacity: 0.08,
        transition: "all 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
      };
    }

    if (sessionState === "paused") {
      return {
        transform: "scale(1.12)",
        opacity: 0.12,
        transition: "all 0.4s ease",
      };
    }

    if (!isRunning) {
      return {
        transform: "scale(1)",
        opacity: 0.18,
        transition: "all 2s ease",
      };
    }

    if (currentPhase.name === "Engage") {
      return {
        transform: "scale(1.15)",
        opacity: 0.18,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (currentPhase.name === "Hold") {
      return {
        transform: "scale(1.15)",
        opacity: 0.14,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    return {
      transform: "scale(1.04)",
      opacity: 0.08,
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
        transform: "scale(1.08)",
        opacity: 0.09,
        transition: "all 0.4s ease",
      };
    }

    if (!isRunning) {
      return {
        transform: "scale(1)",
        opacity: 0.13,
        transition: "all 2s ease",
      };
    }

    if (currentPhase.name === "Engage") {
      return {
        transform: "scale(1.09)",
        opacity: 0.14,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (currentPhase.name === "Hold") {
      return {
        transform: "scale(1.09)",
        opacity: 0.1,
        transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    return {
      transform: "scale(1.02)",
      opacity: 0.06,
      transition: `all ${currentPhase.duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [currentPhase, isRunning, sessionState]);

  const start = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

    setRemainingTime(180);
    setPhaseIndex(0);
    setDisplayPhase("Engage");
    setPhaseRemaining(PHASES[0].duration);
    setTextVisible(true);
    setSessionState("active");
  };

  const pause = () => {
    setSessionState("paused");
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
  };

  const resume = () => {
    setSessionState("active");
    setTextVisible(true);
  };

  const reset = () => {
    setSessionState("idle");
    setPhaseIndex(0);
    setDisplayPhase("Engage");
    setPhaseRemaining(PHASES[0].duration);
    setTextVisible(true);
    setRemainingTime(180);

    if (countdownRef.current) clearInterval(countdownRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
  };

  const selectPosture = (postureKey: Posture) => {
    if (sessionState === "active" || sessionState === "paused") return;
    setSelectedPosture(postureKey);
  };

  const handleCheckInSuccess = () => {
    router.push("/checkin");
  };

  const REMINDERS = [
    "保持自然呼吸",
    "不要夹臀或夹腿",
    "发力应轻柔而集中",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(236,240,233,0.96),rgba(245,242,238,0.98)_40%,rgba(239,236,232,1)_100%)] text-[#576158]">
      <PageWalletBar />
      <MusicFloatingToggle track="home" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-8 py-5 md:px-12 md:py-6 lg:px-16 xl:px-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[6%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#e7ede3]/60 blur-3xl md:h-[420px] md:w-[420px]" />
          <div className="absolute left-[8%] top-[55%] h-[230px] w-[230px] rounded-full bg-[#efe8e1]/44 blur-3xl" />
          <div className="absolute right-[8%] top-[22%] h-[250px] w-[250px] rounded-full bg-[#e9eee7]/52 blur-3xl" />
          <div className="absolute bottom-[-36px] left-1/2 h-[160px] w-[72%] -translate-x-1/2 rounded-full bg-white/24 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex rounded-full border border-[#d9e1d7] bg-white/60 px-4 py-2 text-sm text-[#7b857c] shadow-[0_8px_22px_rgba(120,128,118,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_14px_28px_rgba(120,128,118,0.12)]"
          >
            ← Back
          </Link>
        </div>

        <div className="relative z-10 mt-7 text-center md:mt-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#98a096] md:text-xs">
            KEGEL EXERCISE
          </p>

          <h1 className="mt-2 text-[38px] font-semibold tracking-[0.018em] text-[#556057] md:text-[54px] lg:text-[60px]">
            凯格尔训练
          </h1>

          <p className="mt-3 text-[12px] font-normal tracking-[0.26em] text-[#98a196] md:text-[13px]">
            gentle support from within
          </p>

          <p className="mt-3 text-sm text-[#8f978e]">
            {sessionState === "active" || sessionState === "paused"
              ? `remaining ${formatTime(remainingTime)}`
              : sessionState === "complete"
              ? "session completed"
              : posture.short}
          </p>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-1 gap-y-8 xl:grid-cols-[1fr_1.15fr_1fr] xl:items-start xl:gap-x-24 2xl:gap-x-28">
          <aside className="order-3 xl:order-1">
            <div className="rounded-[28px] border border-white/34 bg-[#f6f3ef]/58 p-6 shadow-[0_16px_34px_rgba(126,135,125,0.08)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#a2a89f]">
                gentle note
              </p>

              <p className="mt-4 text-[18px] leading-[1.7] tracking-[0.01em] text-[#6f786f] md:text-[20px]">
                “{posture.quote}”
              </p>

              <div className="mt-4 space-y-2.5 text-[14px] leading-7 text-[#8d948c]">
                {ENCOURAGEMENTS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/34 bg-white/30 px-5 py-4 shadow-[0_10px_22px_rgba(126,135,125,0.05)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#a2a89f]">
                gentle reminder
              </p>

              <div className="mt-3 space-y-2.5 text-[13px] leading-6 text-[#8f968e]">
                {REMINDERS.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#b8beb6]" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[12px] leading-6 text-[#a0a79f]">
                “像忍住尿意或气体那样的轻提感”可以用来帮助识别发力位置，
                但不要在真正排尿时反复中断来练习。
              </p>
            </div>
          </aside>

          <div className="order-1 flex flex-col items-center xl:order-2">
            <div className="relative flex h-[390px] w-[390px] items-center justify-center md:h-[430px] md:w-[430px]">
              <div
                className={`absolute rounded-full border border-white/28 bg-[#edf2ea]/24 blur-[3px] ${outerRingClass}`}
                style={outerWaveStyle}
              />
              <div
                className={`absolute rounded-full border border-white/36 bg-[#eef2ec]/26 ${innerRingClass}`}
                style={innerWaveStyle}
              />

              <div
                className={`relative flex items-center justify-center rounded-full border border-white/62 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.92),rgba(244,239,235,0.98)_52%,rgba(232,228,224,0.96)_100%)] shadow-[0_30px_82px_rgba(122,132,122,0.12),0_10px_24px_rgba(122,132,122,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md ${mainOrbClass}`}
                style={circleStyle}
              >
                {sessionState === "idle" && (
                  <div className="px-6 text-center">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#808d84]">
                      settle in
                    </p>

                    <div className="mt-5 space-y-3">
                      <p className="text-[30px] font-medium tracking-[0.025em] text-[#4c5952] md:text-[34px]">
                        温柔找到核心
                      </p>

                      <p className="text-[30px] font-normal tracking-[0.025em] text-[#9aa59e] opacity-0 animate-[fadeInSoft_1.6s_ease-out_0.45s_forwards] md:text-[34px]">
                        轻一点，反而更准确
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
                      {displayCopy.en}
                    </p>

                    <p
                      className={`mt-4 text-[40px] font-semibold tracking-[0.028em] text-[#49554f] transition-all duration-[900ms] md:text-[50px] ${
                        textVisible
                          ? "translate-y-0 opacity-100 blur-0"
                          : "translate-y-[7px] opacity-0 blur-[5px]"
                      }`}
                    >
                      {displayCopy.cn}
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
                        {displayCopy.cn}
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
                        身体会慢慢记住这种支持感
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {sessionState === "complete" && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="max-w-[340px] text-center">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#a1aa9f]">
                    {dailyWhisper.label}
                  </p>
                  <p className="mt-2 text-[18px] leading-8 text-[#6f786f] md:text-[20px]">
                    {dailyWhisper.text}
                  </p>
                </div>

                {checkedInToday ? (
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

            <div className="mt-6 flex justify-center gap-3">
              {sessionState === "idle" && (
                <button
                  onClick={start}
                  className="rounded-full border border-white/30 bg-[#dde6da] px-7 py-3 text-sm tracking-[0.03em] text-[#566056] shadow-[0_16px_32px_rgba(122,132,122,0.13),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d7e1d5] hover:shadow-[0_20px_38px_rgba(122,132,122,0.18)] active:scale-[0.988]"
                >
                  开始训练
                </button>
              )}

              {sessionState === "active" && (
                <button
                  onClick={pause}
                  className="rounded-full border border-white/26 bg-[#eef2ed] px-7 py-3 text-sm tracking-[0.03em] text-[#5d665d] shadow-[0_10px_22px_rgba(122,132,122,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#e7ece7] hover:shadow-[0_16px_30px_rgba(122,132,122,0.12)] active:scale-[0.988]"
                >
                  暂停
                </button>
              )}

              {sessionState === "paused" && (
                <button
                  onClick={resume}
                  className="rounded-full border border-white/30 bg-[#dde6da] px-7 py-3 text-sm tracking-[0.03em] text-[#566056] shadow-[0_16px_32px_rgba(122,132,122,0.13),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d7e1d5] hover:shadow-[0_20px_38px_rgba(122,132,122,0.18)] active:scale-[0.988]"
                >
                  继续
                </button>
              )}

              {sessionState === "complete" && (
                <button
                  onClick={start}
                  className="rounded-full border border-white/30 bg-[#dde6da] px-7 py-3 text-sm tracking-[0.03em] text-[#566056] shadow-[0_16px_32px_rgba(122,132,122,0.13),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d7e1d5] hover:shadow-[0_20px_38px_rgba(122,132,122,0.18)] active:scale-[0.988]"
                >
                  再来一次
                </button>
              )}

              {sessionState === "paused" && (
                <button
                  onClick={reset}
                  className="rounded-full border border-white/34 bg-white/72 px-7 py-3 text-sm tracking-[0.03em] text-[#7a827a] shadow-[0_10px_22px_rgba(122,132,122,0.07),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-white/88 hover:shadow-[0_16px_28px_rgba(122,132,122,0.10)] active:scale-[0.988]"
               >
                  重置
                </button>
              )}


            </div>
          </div>

          <aside className="order-2 xl:order-3">
            <div className="rounded-[28px] border border-white/34 bg-[#f6f3ef]/58 p-6 shadow-[0_16px_34px_rgba(126,135,125,0.08)] backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#a2a89f]">
                posture guide
              </p>

              <h2 className="mt-4 text-[24px] font-medium tracking-[0.01em] text-[#6a736a]">
                {posture.title}
              </h2>

              <p className="mt-3 text-[15px] leading-7 text-[#8a9289]">
                {posture.intro}
              </p>

              <div className="mt-5 grid gap-4">
                {(["standing", "sitting", "lying"] as Posture[]).map((key) => {
                  const isSelected = selectedPosture === key;
                  const item = POSTURES[key];

                  return (
                    <button
                      key={key}
                      onClick={() => selectPosture(key)}
                      className={`group rounded-[22px] border px-4 py-4 text-left transition-all duration-500 ${
                        isSelected
                          ? "border-[#d6ded3] bg-[#edf2ea]/72 shadow-[0_12px_22px_rgba(126,135,125,0.10)]"
                          : "border-white/34 bg-white/34 hover:-translate-y-0.5 hover:bg-white/46 hover:shadow-[0_10px_18px_rgba(126,135,125,0.08)]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          <PostureIcon posture={key} selected={isSelected} />
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-[18px] font-medium tracking-[0.01em] ${
                              isSelected ? "text-[#5e675e]" : "text-[#6e766e]"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="mt-1 text-[14px] leading-7 text-[#8d948c]">
                            {item.short}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                {posture.details.map((tip) => (
                  <div
                    key={tip}
                    className="rounded-2xl bg-white/38 px-4 py-3 text-[14px] leading-7 text-[#7f877f]"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </aside>
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