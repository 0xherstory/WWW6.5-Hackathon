import type { Habit, HabitCategory } from "@/data/habitsData";
import type { FrequencyKey } from "@/lib/pacta";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type ApiPact = {
  id: string;
  wallet: string;
  habitName: string;
  category: HabitCategory | "unknown";
  frequencyLabel: string;
  frequencyCode: string;
  durationDays: number;
  stakeAmountWei: string;
  startAt: string;
  lastCheckinAt: string | null;
  completed: boolean;
  rewardClaimed: boolean;
  checkinCount: number;
  currentStreak: number;
  completionRate: number;
  nextMicroHabit: string;
  summary: string;
  latestEncouragement: string | null;
};

export type ApiOverview = {
  wallet: string;
  totalPacts: number;
  activePacts: number;
  totalCheckins: number;
  bestStreak: number;
  currentActiveStreak: number;
  totalStakedWei: string;
  completionRate: number;
  categories: Array<{
    category: string;
    count: number;
  }>;
  recommendations: string[];
};

export type ApiDashboardResponse = {
  wallet: string;
  rewardPoolWei: string;
  pacts: ApiPact[];
  overview: ApiOverview;
};

export type CreateMockPactInput = {
  wallet: string;
  habit: Habit;
  frequency: FrequencyKey;
  frequencyLabel: string;
  frequencyCode: string;
  durationDays: number;
  stakeAmountWei: string;
  startAt: string;
};

export type SyncMockPactInput = {
  id: string;
  wallet: string;
  habitName: string;
  category: HabitCategory | "unknown";
  frequencyLabel: string;
  frequencyCode: string;
  durationDays: number;
  stakeAmountWei: string;
  startAt: string;
  lastCheckinAt: string | null;
  completed: boolean;
};

export type CheckinResponse = {
  pact: ApiPact;
  encouragement: string;
  summary: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? `请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getUserDashboard(wallet: string) {
  return request<ApiDashboardResponse>(`/users/${wallet.toLowerCase()}/dashboard`);
}

export function syncPactsToMockApi(wallet: string, pacts: SyncMockPactInput[]) {
  return request<ApiDashboardResponse>("/pacts/sync", {
    method: "POST",
    body: JSON.stringify({
      wallet: wallet.toLowerCase(),
      pacts,
    }),
  });
}

export function createMockPact(input: CreateMockPactInput) {
  return request<ApiPact>("/pacts", {
    method: "POST",
    body: JSON.stringify({
      wallet: input.wallet.toLowerCase(),
      habitName: input.habit.name,
      category: input.habit.category,
      frequencyLabel: input.frequencyLabel,
      frequencyCode: input.frequencyCode,
      durationDays: input.durationDays,
      stakeAmountWei: input.stakeAmountWei,
      startAt: input.startAt,
    }),
  });
}

export function recordMockCheckin(wallet: string, pactId: string, txHash?: `0x${string}`) {
  return request<CheckinResponse>("/checkins", {
    method: "POST",
    body: JSON.stringify({
      wallet: wallet.toLowerCase(),
      pactId,
      txHash,
    }),
  });
}

export function claimMockReward(wallet: string, pactId: string) {
  return request<ApiPact>(`/pacts/${pactId}/claim`, {
    method: "POST",
    body: JSON.stringify({
      wallet: wallet.toLowerCase(),
    }),
  });
}

export function resetMockDemoData() {
  return request<{ ok: true }>("/demo/reset", {
    method: "POST",
  });
}
