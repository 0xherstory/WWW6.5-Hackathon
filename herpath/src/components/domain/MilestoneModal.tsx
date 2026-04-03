"use client";

import type { Domain } from "@/types/game";
import { DOMAIN_META } from "@/data/questions";

interface MilestoneModalProps {
  domain: Domain;
  onContinue: () => void;
}

const COLOR_MAP: Record<Domain, string> = {
  art: "#FF6B9D",
  science: "#00D4FF",
  law: "#FFD700",
};

export default function MilestoneModal({ domain, onContinue }: MilestoneModalProps) {
  const meta = DOMAIN_META[domain];
  const color = COLOR_MAP[domain];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md flex flex-col gap-6 p-6 border-2 animate-pixelIn text-center"
        style={{
          borderColor: color,
          backgroundColor: "#0d0d1e",
          boxShadow: `0 0 60px ${color}55, 4px 4px 0 rgba(0,0,0,0.8)`,
        }}
      >
        <div
          className="text-5xl"
          style={{ filter: `drop-shadow(0 0 20px ${color})` }}
        >
          {meta.icon}
        </div>

        <div>
          <p className="text-[7px] tracking-widest mb-3" style={{ color: `${color}88` }}>
            ── 里程碑解锁 ──
          </p>
          <h3 className="text-[12px] mb-2" style={{ color }}>
            领袖的足迹，等你追寻
          </h3>
        </div>

        <p
          className="text-[8px] leading-loose text-game-text border-t border-b py-4"
          style={{ borderColor: `${color}33` }}
        >
          你已证明自己具备领袖的核心品质。{"\n\n"}
          现在，她的命运之门向你敞开。{"\n"}
          里程碑卡即将出现——{"\n"}
          <span style={{ color: `${color}cc` }}>
            你的每一个抉择，都将与她的历史相遇。
          </span>
        </p>

        <button
          onClick={onContinue}
          className="pixel-btn py-3 text-[9px] w-full"
          style={{ borderColor: color, backgroundColor: "#12122a", color }}
        >
          ✦ 追寻她的足迹
        </button>
      </div>
    </div>
  );
}
