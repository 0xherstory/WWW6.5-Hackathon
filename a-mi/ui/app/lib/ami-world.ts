"use client";

import { useEffect, useState } from "react";

export const COMMITMENT_STORAGE_KEY = "girls-hour-commitment-draft";
export const STUDY_CHECKIN_STORAGE_KEY = "ami-study-checkin";
export const GARDEN_CHECKIN_STORAGE_KEY = "ami-garden-checkin";

type CommitmentDraft = {
  title?: string;
  description?: string;
  duration?: string;
  buddy?: string;
  status?: string;
  createdAt?: string;
};

type StudyCheckIn = {
  goal: string;
  focusTime: string;
  note: string;
  createdAt: string;
};

type GardenCheckIn = {
  activityName: string;
  moodToday: string;
  note: string;
  createdAt: string;
};

export type TownSnapshot = {
  hasCommitment: boolean;
  commitmentTitle: string;
  commitmentStatus: string;
  studyGoal: string;
  studyFocusTime: string;
  gardenMoment: string;
  gardenMood: string;
  totalOnline: number;
  profileStreak: number;
  todayFocus: string;
};

export function useTownSnapshot() {
  const [snapshot, setSnapshot] = useState<TownSnapshot>(defaultSnapshot);

  useEffect(() => {
    const refresh = () => setSnapshot(getTownSnapshot());

    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return snapshot;
}

export function getTownSnapshot(): TownSnapshot {
  if (typeof window === "undefined") {
    return defaultSnapshot;
  }

  const commitment = readStorage<CommitmentDraft>(COMMITMENT_STORAGE_KEY);
  const study = readStorage<StudyCheckIn>(STUDY_CHECKIN_STORAGE_KEY);
  const garden = readStorage<GardenCheckIn>(GARDEN_CHECKIN_STORAGE_KEY);

  const hasCommitment = Boolean(commitment);
  const checkedInToday = localizeCommitmentStatus(commitment?.status) === "今日已打卡";
  const totalOnline = 126 + (study ? 3 : 0) + (garden ? 2 : 0) + (hasCommitment ? 4 : 0);

  return {
    hasCommitment,
    commitmentTitle: commitment?.title?.trim() || "第一份温柔约定",
    commitmentStatus: localizeCommitmentStatus(commitment?.status),
    studyGoal: study?.goal?.trim() || "金库基础阅读",
    studyFocusTime: localizeFocusTime(study?.focusTime),
    gardenMoment: garden?.activityName?.trim() || "逛了种子交换角",
    gardenMood: localizeGardenMood(garden?.moodToday),
    totalOnline,
    profileStreak: checkedInToday ? 10 : 9,
    todayFocus: study ? localizeFocusTime(study.focusTime) : "2 小时 10 分",
  };
}

function localizeFocusTime(value?: string) {
  if (!value) {
    return "45 分钟";
  }

  const normalized = value.toLowerCase();

  if (normalized === "25 min") return "25 分钟";
  if (normalized === "45 min") return "45 分钟";
  if (normalized === "1 hour") return "1 小时";
  if (normalized === "2 hours") return "2 小时";

  return value;
}

function localizeGardenMood(value?: string) {
  if (!value) return "平静";

  const map: Record<string, string> = {
    calm: "平静",
    curious: "好奇",
    playful: "有点想玩",
    "tired but here": "有点累，但还是来了",
    "softly happy": "轻轻开心",
  };

  return map[value.toLowerCase()] ?? value;
}

function localizeCommitmentStatus(value?: string) {
  if (!value) return "房间待布置";

  const map: Record<string, string> = {
    active: "进行中",
    "checked in today": "今日已打卡",
    "preparing room": "房间待布置",
    "room waiting": "房间待布置",
  };

  return map[value.toLowerCase()] ?? value;
}

function readStorage<T>(key: string) {
  try {
    const value = window.sessionStorage.getItem(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const defaultSnapshot: TownSnapshot = {
  hasCommitment: false,
  commitmentTitle: "第一份温柔约定",
  commitmentStatus: "房间待布置",
  studyGoal: "金库基础阅读",
  studyFocusTime: "45 分钟",
  gardenMoment: "逛了种子交换角",
  gardenMood: "平静",
  totalOnline: 128,
  profileStreak: 9,
  todayFocus: "2 小时 10 分",
};
