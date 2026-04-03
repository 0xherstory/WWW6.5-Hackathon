"use client";

import { useState, useCallback } from "react";
import type { Leader } from "@/types/flashback";

export interface GameSave {
  id: string;
  timestamp: number;
  pageState: "home" | "flashback" | "domain" | "nft-shop";
  leader: Leader | null;
  leaderName?: string;
}

const STORAGE_KEY = "herpath_game_saves";
const CURRENT_SAVE_KEY = "herpath_current_save";

function getSaves(): GameSave[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSaves(saves: GameSave[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

function getCurrentSaveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CURRENT_SAVE_KEY);
  } catch {
    return null;
  }
}

function setCurrentSaveId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_SAVE_KEY, id);
}

export function useGameSave() {
  const [saves, setSaves] = useState<GameSave[]>(() => getSaves());

  // Create a new save
  const createSave = useCallback(
    (pageState: GameSave["pageState"], leader: Leader | null) => {
      const newSave: GameSave = {
        id: Math.random().toString(36).slice(2, 11),
        timestamp: Date.now(),
        pageState,
        leader,
        leaderName:
          leader === "rbg"
            ? "Ruth Bader Ginsburg"
            : leader === "hillary"
            ? "Hillary Clinton"
            : undefined,
      };

      const newSaves = [newSave, ...saves];
      setSaves(newSaves);
      saveSaves(newSaves);
      setCurrentSaveId(newSave.id);

      return newSave;
    },
    [saves]
  );

  // Load a save
  const loadSave = useCallback((id: string) => {
    const save = saves.find((s) => s.id === id);
    if (save) {
      setCurrentSaveId(id);
    }
    return save;
  }, [saves]);

  // Get the most recent save
  const getMostRecentSave = useCallback((): GameSave | null => {
    return saves.length > 0 ? saves[0] : null;
  }, [saves]);

  // Delete a save
  const deleteSave = useCallback(
    (id: string) => {
      const newSaves = saves.filter((s) => s.id !== id);
      setSaves(newSaves);
      saveSaves(newSaves);

      if (getCurrentSaveId() === id) {
        setCurrentSaveId("");
      }
    },
    [saves]
  );

  // New game (clear current save)
  const newGame = useCallback(() => {
    setCurrentSaveId("");
  }, []);

  return {
    saves,
    createSave,
    loadSave,
    getMostRecentSave,
    deleteSave,
    newGame,
  };
}
