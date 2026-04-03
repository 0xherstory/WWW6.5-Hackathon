"use client";

import { useState } from "react";
import { useGameSave } from "@/hooks/useGameSave";
import type { Leader } from "@/types/flashback";
import PixelCharacter from "./PixelCharacter";

interface HomePageProps {
  onStartGame: () => void;
  leader: Leader | null;
  onBackToMenu: () => void;
}

export default function HomePage({
  onStartGame,
  leader,
  onBackToMenu,
}: HomePageProps) {
  const { createSave } = useGameSave();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  function handleSaveGame() {
    // Save current game state (home page with current leader)
    createSave("home", leader);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  }

  function handleExit() {
    setShowExitConfirm(true);
  }

  function handleConfirmExit() {
    onBackToMenu();
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

        {/* Pixel Character with growth animation */}
        <div className="animate-pulse">
          <PixelCharacter progress={0.3} />
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {/* Continue/Next Button */}
        <button
          onClick={onStartGame}
          className="pixel-btn w-full py-6 text-[12px] tracking-widest"
          style={{
            borderColor: "#a0a0ff",
            backgroundColor: "#12122a",
            color: "#a0a0ff",
            boxShadow: "0 0 24px rgba(160, 160, 255, 0.3), 4px 6px 0 rgba(0,0,0,0.8)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 32px rgba(160, 160, 255, 0.5), 6px 8px 0 rgba(0,0,0,0.9)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 24px rgba(160, 160, 255, 0.3), 4px 6px 0 rgba(0,0,0,0.8)";
          }}
        >
          ▶ 继续冒险
        </button>

        {/* Save Game Button */}
        <button
          onClick={handleSaveGame}
          className="pixel-btn w-full py-4 text-[10px] tracking-widest hover:opacity-85 transition-opacity"
          style={{
            borderColor: "#50FA7B",
            backgroundColor: "#12122a",
            color: "#50FA7B",
            boxShadow: "2px 4px 0 rgba(0,0,0,0.6)",
          }}
        >
          💾 保存游戏
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

      {/* ── Save Success Toast ── */}
      {showSaveSuccess && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 border-2 animate-pulse"
          style={{
            borderColor: "#50FA7B",
            backgroundColor: "#50FA7B0d",
            color: "#50FA7B",
          }}
        >
          <p className="text-[8px] tracking-widest">✓ 游戏已保存</p>
        </div>
      )}

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
              确定要退出游戏返回主菜单吗？
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
                确认
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
