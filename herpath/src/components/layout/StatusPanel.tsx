"use client";

import type { Leader } from "@/types/flashback";
import { useDomainState } from "@/hooks/useDomainState";
import { RBG_MILESTONES } from "@/data/rbg-milestones";
import { HILLARY_MILESTONES } from "@/data/hillary-milestones";

interface StatusPanelProps {
  leader: Leader;
  attr1Name: string;
  attr1Value: number;
  attr1Icon: string;
  attr1Color: string;
  attr2Name: string;
  attr2Value: number;
  attr2Icon: string;
  attr2Color: string;
  maxValue?: number;
  sbts: Array<{ id: string; name: string; icon: string; color: string; owned: boolean }>;
  milestoneStatus: "locked" | "unlocked";
}

export default function StatusPanel({
  leader,
  attr1Name,
  attr1Value,
  attr1Icon,
  attr1Color,
  attr2Name,
  attr2Value,
  attr2Icon,
  attr2Color,
  maxValue = 15,
  sbts,
  milestoneStatus,
}: StatusPanelProps) {
  const { state } = useDomainState(leader);
  const milestones = leader === "rbg" ? RBG_MILESTONES : HILLARY_MILESTONES;

  // Get SBT badges by branch
  const getSBTsByBranch = () => {
    const result: { [key: string]: { icon: string; name: string }[] } = {};
    milestones.branches.forEach((branch) => {
      result[branch.branchName] = branch.levels
        .filter((level) => state.sbtsMinted.includes(level.sbtId))
        .map((level) => ({ icon: level.sbtIcon, name: level.sbtName }));
    });
    return result;
  };

  const sbtsByBranch = getSBTsByBranch();
  const totalSBTs = state.sbtsMinted.length;
  return (
    <>
      {/* ── Attributes ── */}
      <div className="flex flex-col gap-4">
        <p className="text-[6px] tracking-widest text-game-muted text-center">
          ── 属性 ──
        </p>

        {/* Attr 1 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[7px] tracking-widest" style={{ color: attr1Color }}>
              {attr1Icon} {attr1Name}
            </span>
            <span className="text-[7px]" style={{ color: `${attr1Color}99` }}>
              {attr1Value}/{maxValue}
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: maxValue }).map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 border border-current transition-all"
                style={{
                  borderColor: attr1Color,
                  backgroundColor: i < attr1Value ? attr1Color : "transparent",
                  boxShadow:
                    i < attr1Value ? `0 0 4px ${attr1Color}66` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Attr 2 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[7px] tracking-widest" style={{ color: attr2Color }}>
              {attr2Icon} {attr2Name}
            </span>
            <span className="text-[7px]" style={{ color: `${attr2Color}99` }}>
              {attr2Value}/{maxValue}
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: maxValue }).map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 border border-current transition-all"
                style={{
                  borderColor: attr2Color,
                  backgroundColor: i < attr2Value ? attr2Color : "transparent",
                  boxShadow:
                    i < attr2Value ? `0 0 4px ${attr2Color}66` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── SBT Badges ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[6px] tracking-widest text-game-muted">
            ── SBT 勋章 ──
          </p>
          <p className="text-[7px] font-bold text-game-text">
            {totalSBTs}/10
          </p>
        </div>

        {totalSBTs === 0 ? (
          <p className="text-[6px] text-game-muted text-center py-2">
            继续累积属性来获取勋章
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(sbtsByBranch).map(([branchName, badges]) => (
              <div key={branchName}>
                <p className="text-[6px] text-game-muted mb-1">
                  {branchName} ({badges.length}/5)
                </p>
                <div className="flex flex-wrap gap-1">
                  {badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center w-7 h-7 border"
                      style={{
                        borderColor: "#50FA7B",
                        backgroundColor: "#50FA7B15",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title={badge.name}
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Milestone Status ── */}
      <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "#2a2a4a" }}>
        <p className="text-[6px] tracking-widest text-game-muted text-center">
          ── 里程碑 ──
        </p>
        <div
          className="px-2 py-2 text-center text-[6px] border-2"
          style={{
            borderColor: milestoneStatus === "unlocked" ? "#FFD700" : "#4a4a6a",
            backgroundColor: "#0d0d1e",
            color: milestoneStatus === "unlocked" ? "#FFD700" : "#7070a0",
          }}
        >
          {milestoneStatus === "unlocked"
            ? "✦ 已解锁"
            : "双分支各≥1枚 SBT"}
        </div>
      </div>
    </>
  );
}
