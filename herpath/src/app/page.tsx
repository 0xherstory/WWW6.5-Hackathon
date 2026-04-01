"use client";

import { useState, useEffect } from "react";
import QuizScreen from "@/components/quiz/QuizScreen";
import QuizResult from "@/components/quiz/QuizResult";
import TieBreak from "@/components/quiz/TieBreak";
import PixelDialog from "@/components/ui/PixelDialog";
import AudioToggle from "@/components/ui/AudioToggle";
import DomainScreen from "@/components/domain/DomainScreen";
import { useGameAudio } from "@/hooks/useGameAudio";
import { calcScores, getWinners } from "@/data/questions";
import type { GameState, Domain } from "@/types/game";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [domain, setDomain] = useState<Domain | null>(null);
  const [tiedCandidates, setTiedCandidates] = useState<Domain[]>([]);
  const { muted, setMuted, setScene } = useGameAudio();

  useEffect(() => {
    if (gameState === "intro" || gameState === "quiz") {
      setScene("intro");
    } else if ((gameState === "result" || gameState === "domain") && domain) {
      setScene(domain);
    }
  }, [gameState, domain, setScene]);

  function handleQuizComplete(answers: Record<number, string>) {
    const scores = calcScores(answers);
    const winners = getWinners(scores);
    if (winners.length === 1) {
      setDomain(winners[0]);
      setGameState("result");
    } else {
      setTiedCandidates(winners);
      setGameState("tiebreak");
    }
  }

  function handleTieBreakChoose(chosen: Domain) {
    setDomain(chosen);
    setGameState("result");
  }

  function handleEnterDomain() {
    setGameState("domain");
  }

  function handleMilestoneEnter() {
    // M3 placeholder
    alert("里程碑事件即将开启（模块三开发中）");
  }

  function handleRestart() {
    setDomain(null);
    setTiedCandidates([]);
    setGameState("intro");
  }

  function handleStart() {
    setScene("intro");
    setGameState("quiz");
  }

  return (
    <>
      <AudioToggle muted={muted} onToggle={() => setMuted((m) => !m)} />

      {gameState === "quiz" && (
        <QuizScreen onComplete={handleQuizComplete} />
      )}

      {gameState === "tiebreak" && (
        <TieBreak candidates={tiedCandidates} onChoose={handleTieBreakChoose} />
      )}

      {gameState === "result" && domain && (
        <div>
          <QuizResult domain={domain} onEnter={handleEnterDomain} />
          <div className="flex justify-center pb-8">
            <button
              onClick={handleRestart}
              className="text-game-muted text-[7px] underline underline-offset-4 hover:text-game-text transition-colors"
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      {gameState === "domain" && domain && (
        <DomainScreen domain={domain} onMilestoneEnter={handleMilestoneEnter} />
      )}

      {gameState === "intro" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
          <div className="text-center">
            <h1 className="text-[18px] text-white leading-relaxed tracking-widest mb-2">
              HerPath
            </h1>
            <p className="text-game-muted text-[8px] tracking-widest">
              她的轨迹
            </p>
          </div>

          <PixelDialog className="w-full max-w-md text-center">
            <p className="text-[7px] text-game-muted mb-4 tracking-widest">
              ── 序 ──
            </p>
            <p className="text-game-text text-[9px] leading-loose mb-6">
              在每个时代，
              <br />
              都有女性用她们的方式
              <br />
              撬动了世界。
              <br />
              <br />
              <span className="text-game-muted text-[8px]">
                你会走哪条路？
              </span>
            </p>

            <button
              onClick={handleStart}
              className="pixel-btn w-full py-3 text-[9px]"
              style={{
                borderColor: "#a0a0ff",
                backgroundColor: "#12122a",
                color: "#a0a0ff",
              }}
            >
              ▶ 开始游戏
            </button>
          </PixelDialog>

          <p className="text-game-muted text-[6px] tracking-widest">
            © HerPath · WWW6.5 Hackathon
          </p>
        </div>
      )}
    </>
  );
}
