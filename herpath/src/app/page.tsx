"use client";

import { useState } from "react";
import StartMenu from "@/components/menu/StartMenu";
import HomePage from "@/components/home/HomePage";
import FlashbackScreen from "@/components/flashback/FlashbackScreen";
import DomainGameScreen from "@/components/domain/DomainGameScreen";
import NFTShop from "@/components/nft/NFTShop";
import AudioToggle from "@/components/ui/AudioToggle";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useGameSave } from "@/hooks/useGameSave";
import type { Leader } from "@/types/flashback";

type PageState = "start" | "home" | "flashback" | "domain" | "nft-shop";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("start");
  const [leader, setLeader] = useState<Leader | null>(null);
  const { muted, setMuted, setScene } = useGameAudio();
  const { newGame: clearSave } = useGameSave();

  function handleNewGame() {
    clearSave();
    setLeader(null);
    setScene("intro");
    setPageState("flashback");
  }

  function handleContinueGame(
    savedLeader: Leader | null,
    savedPageState: PageState
  ) {
    setLeader(savedLeader);
    if (savedPageState === "home" && savedLeader) {
      setPageState("home");
    } else if (savedPageState === "domain" && savedLeader) {
      setPageState("domain");
    } else if (savedPageState === "nft-shop" && savedLeader) {
      setPageState("nft-shop");
    } else {
      setPageState("flashback");
    }
  }

  function handleExitGame() {
    // Reset and go back to start menu
    setPageState("start");
    setLeader(null);
  }

  function handleStartFlashback() {
    setScene("intro");
    setPageState("flashback");
  }

  function handleFlashbackComplete(selectedLeader: Leader) {
    setLeader(selectedLeader);
    setScene("law"); // Domain game background music
    setPageState("domain");
  }

  function handleContinueFromHome() {
    setScene("law"); // Domain game background music
    setPageState("domain");
  }

  function handleGoToNFTShop() {
    setPageState("nft-shop");
  }

  function handleBackHome() {
    setPageState("home");
  }

  function handleBackToDomain() {
    setPageState("domain");
  }

  function handleBackToMenu() {
    setPageState("start");
    setLeader(null);
  }

  return (
    <>
      <AudioToggle muted={muted} onToggle={() => setMuted((m) => !m)} />

      {pageState === "start" && (
        <StartMenu
          onNewGame={handleNewGame}
          onContinue={handleContinueGame}
          onExit={handleExitGame}
        />
      )}

      {pageState === "home" && leader && (
        <HomePage
          onStartGame={handleContinueFromHome}
          leader={leader}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {pageState === "flashback" && (
        <FlashbackScreen onComplete={handleFlashbackComplete} />
      )}

      {pageState === "domain" && leader && (
        <DomainGameScreen
          leader={leader}
          onGoToNFTShop={handleGoToNFTShop}
          onBackHome={handleBackHome}
        />
      )}

      {pageState === "nft-shop" && leader && (
        <NFTShop
          leader={leader}
          onBack={handleBackToDomain}
        />
      )}
    </>
  );
}
