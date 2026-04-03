"use client";

import { useCallback, useState } from "react";
import "./memory-maze.css";
import { STORY_COMPLETE, STORY_INTRO, type MemoryFragment } from "@/components/game/mazeData";
import MazeCanvas from "@/components/game/MazeCanvas";
import FragmentModal from "@/components/game/FragmentModal";
import CollectionPanel from "@/components/game/CollectionPanel";
import GameHUD from "@/components/game/GameHUD";
import FloatingPetals from "@/components/game/FloatingPetals";
import MazeIntroBackdrop from "@/components/game/MazeIntroBackdrop";

type GameState = "intro" | "playing" | "complete";

type Props = {
  onClose: () => void;
};

export default function MemoryMazeGame({ onClose }: Props) {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [collectedFragments, setCollectedFragments] = useState<MemoryFragment[]>([]);
  const [activeFragment, setActiveFragment] = useState<MemoryFragment | null>(null);
  const [showCollection, setShowCollection] = useState(false);

  const collectedIds = new Set(collectedFragments.map((f) => f.id));

  const handleFragmentCollect = useCallback((fragment: MemoryFragment) => {
    setCollectedFragments((prev) => {
      if (prev.find((f) => f.id === fragment.id)) return prev;
      const next = [...prev, fragment];
      if (next.length >= STORY_INTRO.totalFragments) {
        setTimeout(() => setGameState("complete"), 2000);
      }
      return next;
    });
    setActiveFragment(fragment);
  }, []);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleBack = () => {
    setGameState("intro");
    setCollectedFragments([]);
    setActiveFragment(null);
  };

  if (gameState === "intro") {
    return (
      <div className="memory-maze-root relative min-h-screen overflow-hidden bg-background">
        <FloatingPetals variant="introRich" />

        <button
          type="button"
          onClick={onClose}
          className="font-en absolute left-4 top-4 z-30 rounded-full border border-[hsl(35_25%_88%)] bg-[hsl(40_50%_98%/0.95)] px-4 py-2 text-xs text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-foreground"
        >
          ← 返回永恒花园
        </button>

        <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-16 sm:py-10">
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <MazeIntroBackdrop />
            <div className="memory-maze-intro-bg absolute inset-0" />
            <div className="memory-maze-intro-pattern absolute inset-0" />
            <div className="intro-bg-blob intro-bg-blob-tl" />
            <div className="intro-bg-blob intro-bg-blob-br" />
            <div className="intro-bg-blob intro-bg-blob-mid" />
            <div className="intro-rings">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div
            className="intro-content-card intro-content-card--rich relative z-20 mx-auto w-full max-w-xl px-7 py-9 sm:px-10 sm:py-11"
            style={{ animation: "fade-up 0.75s ease both 0.15s" }}
          >
            <div
              className="pointer-events-none absolute -left-1 -right-1 top-0 h-px opacity-90"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--accent-gold) / 0.55), hsl(var(--primary) / 0.35), transparent)",
              }}
            />
            <div className="mb-4 text-center text-5xl drop-shadow-sm">🌸</div>

            <h1 className="font-title text-3xl font-bold tracking-wide text-foreground md:text-4xl">{STORY_INTRO.title}</h1>
            <p className="font-en mt-2 text-sm italic text-muted-foreground">{STORY_INTRO.titleEn}</p>
            <p className="font-en mt-3 text-xs tracking-[0.35em] text-muted-foreground">{STORY_INTRO.subtitle}</p>

            <div
              className="mx-auto my-6 h-px w-24"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
            />

            <p className="mb-9 text-sm leading-[1.9] text-muted-foreground">{STORY_INTRO.description}</p>

            <div className="intro-stat-row mb-9 flex items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="font-title text-3xl font-semibold text-foreground md:text-4xl">{STORY_INTRO.totalFragments}</div>
                <div className="mt-1 text-xs text-muted-foreground">记忆碎片</div>
              </div>
              <div className="intro-stat-divider h-10 w-px shrink-0" />
              <div className="text-center">
                <div className="font-title text-3xl font-semibold text-foreground md:text-4xl">1</div>
                <div className="mt-1 text-xs text-muted-foreground">迷宫关卡</div>
              </div>
              <div className="intro-stat-divider h-10 w-px shrink-0" />
              <div className="text-center">
                <div className="font-title text-3xl font-semibold text-foreground md:text-4xl">∞</div>
                <div className="mt-1 text-xs text-muted-foreground">永恒记忆</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleStart}
                className="group relative overflow-hidden rounded-full px-12 py-3.5 text-sm font-medium tracking-[0.2em] text-primary-foreground transition-all hover:scale-[1.03] hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
                  boxShadow: "0 10px 36px rgba(142, 171, 142, 0.38)",
                }}
              >
                <span className="relative z-10">开始探索</span>
                <div
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary-dark)), hsl(var(--primary)))" }}
                />
              </button>

              <p className="font-en mt-5 text-center text-xs italic text-muted-foreground/60">
                &quot;Every memory is a flower in the eternal garden&quot;
              </p>

              <div className="mt-6 text-muted-foreground/35" style={{ animation: "gentle-float 2.2s ease-in-out infinite" }}>
                <span className="text-xs tracking-widest">▽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "complete") {
    return (
      <div className="memory-maze-root complete-screen-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
        <FloatingPetals variant="intro" />
        <div className="complete-rings" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>

        <div
          className="complete-content-card relative z-10 w-full max-w-lg px-8 py-10 text-center"
          style={{ animation: "fade-up 1s ease both" }}
        >
          <div className="mb-6 text-6xl" style={{ animation: "gentle-float 3s ease-in-out infinite" }}>
            🌺
          </div>
          <h2 className="font-title mb-2 text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]">
            {STORY_COMPLETE.title}
          </h2>
          <p className="font-en mb-4 text-sm italic text-muted-foreground">{STORY_COMPLETE.titleEn}</p>
          <div
            className="mx-auto mb-5 h-px w-20"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--accent-gold)), transparent)" }}
          />
          <p className="mb-8 text-sm leading-[1.85] text-muted-foreground">{STORY_COMPLETE.body}</p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowCollection(true)}
              className="rounded-full border border-primary px-6 py-2.5 text-sm font-medium tracking-wide text-primary-dark transition-all hover:scale-[1.02] hover:bg-primary/10"
            >
              {STORY_COMPLETE.btnCollection}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium tracking-wide text-primary-foreground shadow-sm transition-all hover:scale-[1.02]"
            >
              {STORY_COMPLETE.btnAgain}
            </button>
          </div>

          <p className="font-en mt-8 text-xs italic text-muted-foreground/70">{STORY_COMPLETE.quoteEn}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-xs tracking-wide text-muted-foreground underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
          >
            返回永恒花园
          </button>
        </div>

        {showCollection && (
          <CollectionPanel collectedFragments={collectedFragments} onClose={() => setShowCollection(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="memory-maze-root mm-play-bg relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <MazeCanvas onFragmentCollect={handleFragmentCollect} collectedIds={collectedIds} isPaused={!!activeFragment || showCollection} />
      </div>

      <GameHUD
        collectedFragments={collectedFragments}
        totalFragments={STORY_INTRO.totalFragments}
        onShowCollection={() => setShowCollection(true)}
        onBack={handleBack}
        onExitGarden={onClose}
        mainTitle={STORY_INTRO.title}
        mainTitleEn={STORY_INTRO.titleEn}
      />

      {activeFragment && <FragmentModal fragment={activeFragment} onClose={() => setActiveFragment(null)} />}

      {showCollection && (
        <CollectionPanel collectedFragments={collectedFragments} onClose={() => setShowCollection(false)} />
      )}
    </div>
  );
}
