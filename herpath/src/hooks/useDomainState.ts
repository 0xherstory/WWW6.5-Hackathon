"use client";

import { useState, useCallback } from "react";
import type { DomainAttribute } from "@/types/domain";
import type { MilestoneLevel } from "@/types/milestone";
import { RBG_MILESTONES } from "@/data/rbg-milestones";
import { HILLARY_MILESTONES } from "@/data/hillary-milestones";
import type { Leader } from "@/types/flashback";

const STORAGE_KEY_RBG = "herpath_rbg_domain";
const STORAGE_KEY_HILLARY = "herpath_hillary_domain";
const MILESTONE_THRESHOLDS = [3, 6, 9, 12, 15];

interface StoredState {
  attributes: Record<DomainAttribute, number>;
  drawnCardIds: string[];
  sbtsMinted: string[];
  milestonesUnlocked: number;
}

function makeDefault(): StoredState {
  return {
    attributes: {
      legality: 0,
      impact: 0,
      resilience: 0,
      equality: 0,
    },
    drawnCardIds: [],
    sbtsMinted: [],
    milestonesUnlocked: 0,
  };
}

function getStorageKey(leader: Leader): string {
  return leader === "rbg" ? STORAGE_KEY_RBG : STORAGE_KEY_HILLARY;
}

function getMilestones(leader: Leader) {
  return leader === "rbg" ? RBG_MILESTONES : HILLARY_MILESTONES;
}

function loadState(leader: Leader): StoredState {
  if (typeof window === "undefined") return makeDefault();
  try {
    const raw = localStorage.getItem(getStorageKey(leader));
    return raw ? JSON.parse(raw) : makeDefault();
  } catch {
    return makeDefault();
  }
}

function saveState(state: StoredState, leader: Leader) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(leader), JSON.stringify(state));
}

// Get milestone by attribute and threshold
function getMilestoneAtThreshold(
  attr: DomainAttribute,
  threshold: number,
  leader: Leader
): MilestoneLevel | null {
  const milestones = getMilestones(leader);
  const branch = milestones.branches.find((b) => b.attribute === attr);
  if (!branch) return null;
  const level = branch.levels.find((l) => l.threshold === threshold);
  return level || null;
}

export function useDomainState(leader: Leader) {
  const [state, setState] = useState<StoredState>(() => loadState(leader));

  // Check for milestone thresholds hit (returns milestone data if triggered)
  const checkMilestoneThreshold = useCallback(
    (attr: DomainAttribute, newValue: number): MilestoneLevel | null => {
      // Find the highest threshold not yet minted
      for (const threshold of MILESTONE_THRESHOLDS) {
        if (newValue >= threshold) {
          const milestone = getMilestoneAtThreshold(attr, threshold, leader);
          if (milestone && !state.sbtsMinted.includes(milestone.sbtId)) {
            return milestone;
          }
        }
      }
      return null;
    },
    [state.sbtsMinted, leader]
  );

  // Add attribute value
  const addAttribute = useCallback(
    (attr: DomainAttribute, value: number): MilestoneLevel | null => {
      const newState = { ...state };
      const newValue = (newState.attributes[attr] ?? 0) + value;

      // Check for milestone BEFORE resetting
      let triggeredMilestone: MilestoneLevel | null = null;
      if (newValue > 0) {
        triggeredMilestone = checkMilestoneThreshold(attr, newValue);
      }

      // Reset to 0 if exceeded 15, otherwise set to new value
      newState.attributes[attr] = newValue > 15 ? 0 : newValue;

      setState(newState);
      saveState(newState, leader);

      return triggeredMilestone;
    },
    [state, checkMilestoneThreshold, leader]
  );

  // Mint an SBT
  const mintSBT = useCallback(
    (sbtId: string) => {
      const newState = { ...state };
      if (!newState.sbtsMinted.includes(sbtId)) {
        newState.sbtsMinted.push(sbtId);
        newState.milestonesUnlocked = newState.sbtsMinted.length;

        setState(newState);
        saveState(newState, leader);
      }
    },
    [state, leader]
  );

  // Record drawn card
  const recordDrawn = useCallback(
    (cardId: string) => {
      const newState = { ...state };
      newState.drawnCardIds.push(cardId);

      setState(newState);
      saveState(newState, leader);
    },
    [state, leader]
  );

  // Check if can unlock NFT purchase (all 4 SBTs minted)
  const canUnlockNFT = state.sbtsMinted.length >= 4;

  return {
    state,
    addAttribute,
    mintSBT,
    recordDrawn,
    canUnlockNFT,
    reset: () => {
      const fresh = makeDefault();
      setState(fresh);
      saveState(fresh, leader);
    },
  };
}
