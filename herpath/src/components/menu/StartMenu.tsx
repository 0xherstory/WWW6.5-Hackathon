"use client";

import { useState } from "react";
import { useGameSave } from "@/hooks/useGameSave";
import PixelCharacter from "@/components/home/PixelCharacter";

interface StartMenuProps {
  onNewGame: () => void;
  onContinue: (leader: "rbg" | "hillary" | null, pageState: "start" | "home" | "flashback" | "domain" | "nft-shop") => void;
  onExit: () => void;
}

export default function StartMenu({
  onNewGame,
  onContinue,
  onExit,
}: StartMenuProps) {
  const { getMostRecentSave } = useGameSave();
  const mostRecentSave = getMostRecentSave();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  function handleNewGame() {
    onNewGame();
  }

  function handleContinue() {
    if (mostRecentSave) {
      onContinue(mostRecentSave.leader, mostRecentSave.pageState);
    }
  }

  function handleExit() {
    setShowExitConfirm(true);
  }

  function handleConfirmExit() {
    // Close the window or app
    if (typeof window !== "undefined") {
      window.close();
    }
    onExit();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-12">
      {/* ── Title & Character ── */}
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-[20px] text-white tracking-widest mb-2 animate-fadeIn">
            HerPath
          </h1>
          <p className="text-game-muted text-[7px] tracking-widest">
            她的轨迹 · 你的选择
          </p>
        </div>

        {/* Pixel Character */}
        <div className="animate-pulse">
          <PixelCharacter progress={0.5} />
        </div>
      </div>

      {/* ── Menu Buttons ── */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {/* New Game Button */}
        <button
          onClick={handleNewGame}
          className="pixel-btn w-full py-6 text-[12px] tracking-widest hover:shadow-lg transition-all"
          style={{
            borderColor: "#50FA7B",
            backgroundColor: "#12122a",
            color: "#50FA7B",
            boxShadow: "0 0 24px rgba(80, 250, 123, 0.3), 4px 6px 0 rgba(0,0,0,0.8)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 32px rgba(80, 250, 123, 0.5), 6px 8px 0 rgba(0,0,0,0.9)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 24px rgba(80, 250, 123, 0.3), 4px 6px 0 rgba(0,0,0,0.8)";
          }}
        >
          ▶ 新游戏
        </button>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!mostRecentSave}
          className="pixel-btn w-full py-5 text-[11px] tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{
            borderColor: mostRecentSave ? "#FFD700" : "#4a4a6a",
            backgroundColor: "#12122a",
            color: mostRecentSave ? "#FFD700" : "#7070a0",
            boxShadow: mostRecentSave
              ? "0 0 20px rgba(255, 215, 0, 0.2), 4px 6px 0 rgba(0,0,0,0.8)"
              : "2px 4px 0 rgba(0,0,0,0.6)",
          }}
          onMouseEnter={(e) => {
            if (mostRecentSave) {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 28px rgba(255, 215, 0, 0.3), 6px 8px 0 rgba(0,0,0,0.9)";
            }
          }}
          onMouseLeave={(e) => {
            if (mostRecentSave) {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 20px rgba(255, 215, 0, 0.2), 4px 6px 0 rgba(0,0,0,0.8)";
            }
          }}
        >
          ◆ 继续冒险
          {mostRecentSave && (
            <span className="text-[7px] text-game-muted block mt-1">
              {mostRecentSave.leaderName} ·{" "}
              {new Date(mostRecentSave.timestamp).toLocaleDateString("zh-CN")}
            </span>
          )}
        </button>

        {/* Exit Button */}
        <button
          onClick={handleExit}
          className="pixel-btn w-full py-4 text-[10px] tracking-widest hover:opacity-75 transition-opacity"
          style={{
            borderColor: "#8a4a4a",
            backgroundColor: "#12122a",
            color: "#a07070",
            boxShadow: "2px 4px 0 rgba(0,0,0,0.6)",
          }}
        >
          ✕ 退出游戏
        </button>
      </div>

      {/* ── Exit Confirmation Modal ── */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="border-2 px-6 py-6 flex flex-col gap-4"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#0d0d1e",
              boxShadow: "0 0 30px rgba(75, 74, 138, 0.5), 3px 6px 0 rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] text-game-text text-center">
              确定要退出游戏吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 pixel-btn py-2 text-[8px]"
                style={{
                  borderColor: "#50FA7B",
                  backgroundColor: "#50FA7B0d",
                  color: "#50FA7B",
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 pixel-btn py-2 text-[8px]"
                style={{
                  borderColor: "#a07070",
                  backgroundColor: "#a070700d",
                  color: "#a07070",
                }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <p className="text-game-muted text-[6px] tracking-widest fixed bottom-4">
        © HerPath · WWW6.5 Hackathon
      </p>
    </div>
  );
}
