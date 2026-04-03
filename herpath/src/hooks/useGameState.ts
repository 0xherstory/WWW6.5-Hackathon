"use client";

import { useState, useCallback, useEffect } from "react";
import type { Domain, GameProgress, AttributeState, SBTId, Attribute } from "@/types/game";
import { isMilestoneUnlocked } from "@/data/cards";

const STORAGE_KEY = "herpath_progress";

const DEFAULT_ATTRS: AttributeState = {
  creativity: 0,
  resilience: 0,
  curiosity: 0,
  rigor: 0,
  justice: 0,
  courage: 0,
};

function loadProgress(domain: Domain): GameProgress {
  if (typeof window === "undefined") return makeDefault(domain);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefault(domain);
    const parsed = JSON.parse(raw) as GameProgress;
    if (parsed.domain !== domain) return makeDefault(domain);
    return parsed;
  } catch {
    return makeDefault(domain);
  }
}

function makeDefault(domain: Domain): GameProgress {
  return {
    domain,
    attributes: { ...DEFAULT_ATTRS },
    mintedSBTs: [],
    drawnCardIds: [],
    milestoneUnlocked: false,
  };
}

function saveProgress(progress: GameProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useGameState(domain: Domain) {
  const [progress, setProgress] = useState<GameProgress>(() =>
    makeDefault(domain)
  );

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress(domain));
  }, [domain]);

  const applyAttribute = useCallback(
    (attribute: Attribute, value: number): SBTId | null => {
      let triggeredSBT: SBTId | null = null;

      setProgress((prev) => {
        const newAttrs = { ...prev.attributes };
        newAttrs[attribute] = (newAttrs[attribute] ?? 0) + value;

        // SBT attribute → id mapping
        const attrToSBT: Partial<Record<Attribute, SBTId>> = {
          creativity: "spark",
          resilience: "brush",
          curiosity: "explorer",
          rigor: "experiment",
          justice: "scale",
          courage: "warrior",
        };
        const sbtId = attrToSBT[attribute];
        const canMint =
          sbtId &&
          newAttrs[attribute] >= 3 &&
          !prev.mintedSBTs.includes(sbtId);

        if (canMint && sbtId) triggeredSBT = sbtId;

        const next: GameProgress = {
          ...prev,
          attributes: newAttrs,
        };
        saveProgress(next);
        return next;
      });

      return triggeredSBT;
    },
    []
  );

  const mintSBT = useCallback((sbtId: SBTId, attribute: Attribute) => {
    setProgress((prev) => {
      const newAttrs = { ...prev.attributes };
      newAttrs[attribute] = Math.max(0, (newAttrs[attribute] ?? 0) - 3);
      const newMinted = [...prev.mintedSBTs, sbtId];
      const milestone = isMilestoneUnlocked(prev.domain, newMinted);
      const next: GameProgress = {
        ...prev,
        attributes: newAttrs,
        mintedSBTs: newMinted,
        milestoneUnlocked: milestone,
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const recordDrawn = useCallback((cardId: string) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        drawnCardIds: [...prev.drawnCardIds, cardId],
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback((domain: Domain) => {
    const fresh = makeDefault(domain);
    saveProgress(fresh);
    setProgress(fresh);
  }, []);

  return { progress, applyAttribute, mintSBT, recordDrawn, resetProgress };
}
