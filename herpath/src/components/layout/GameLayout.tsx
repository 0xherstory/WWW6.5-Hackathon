"use client";

import { ReactNode } from "react";
import type { Leader } from "@/types/flashback";

interface GameLayoutProps {
  leader: Leader;
  children: ReactNode; // 中央卡片区
  rightPanel: ReactNode; // 右侧状态面板
  topBar?: ReactNode; // 可选顶部 (如进度条)
}

const LEADER_COLOR: Record<Leader, string> = {
  rbg: "#FFD700",
  hillary: "#FF6B9D",
};

export default function GameLayout({
  leader,
  children,
  rightPanel,
  topBar,
}: GameLayoutProps) {
  const color = LEADER_COLOR[leader];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `radial-gradient(ellipse at top, ${color}08 0%, #0a0a18 60%)`,
      }}
    >
      {/* ── Top Bar (optional) ── */}
      {topBar && (
        <div
          className="border-b-2 px-4 py-3"
          style={{ borderColor: `${color}33`, backgroundColor: "#0d0d1e" }}
        >
          {topBar}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {children}
        </div>

        {/* Right: Status Panel */}
        <div
          className="w-56 border-l-2 p-4 flex flex-col gap-6 overflow-y-auto"
          style={{
            borderColor: `${color}22`,
            backgroundColor: "#0b0b1a",
          }}
        >
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
