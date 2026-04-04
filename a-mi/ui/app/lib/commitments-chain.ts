"use client";

import {
  createCommitment as createCommitmentOnChain,
  getCommitmentsByOwnerDetailed,
  getContractErrorMessage,
  getMyCommitmentsDetailed as getMyCommitmentsDetailedFromContract,
} from "@/lib/contract/amiCommitment";
import type { Commitment } from "@/lib/contract/types";
import { getConnectedWalletAddress, readStoredWalletAddress } from "./wallet";

export const COMMITMENTS_CACHE_KEY = "ami-commitments-cache";
export const COMMITMENTS_UPDATED_EVENT = "ami:commitments-updated";

export type CommitmentInput = {
  title: string;
  duration: string;
  reminder: string;
};

export async function createCommitment(input: CommitmentInput) {
  const normalizedTitle = input.title.trim();
  const normalizedReminder = input.reminder.trim();
  const durationDays = parseDurationDays(input.duration);

  if (!normalizedTitle) {
    throw new Error("请先填写约定标题");
  }

  if (!durationDays) {
    throw new Error("预计周期请输入大于 0 的天数，例如 7 或 30");
  }

  if (!normalizedReminder) {
    throw new Error("请先写下给自己的提醒");
  }

  const result = await createCommitmentOnChain(
    normalizedTitle,
    durationDays,
    normalizedReminder,
  );

  const commitments = await refreshMyCommitments();

  return {
    ...result,
    commitments,
  };
}

export async function refreshMyCommitments() {
  const walletAddress = (await getConnectedWalletAddress()) || readStoredWalletAddress();

  if (!walletAddress) {
    persistCommitments([]);
    return [];
  }

  const commitments = await getCommitmentsByOwnerDetailed(walletAddress);
  persistCommitments(commitments);
  return commitments;
}

export async function getMyCommitmentsDetailed() {
  try {
    const commitments = await getMyCommitmentsDetailedFromContract();
    persistCommitments(commitments);
    return commitments;
  } catch {
    return refreshMyCommitments();
  }
}

export function readCommitments(): Commitment[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.sessionStorage.getItem(COMMITMENTS_CACHE_KEY);

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value) as Commitment[];

    return Array.isArray(parsed)
      ? [...parsed].sort((left, right) => right.createdAt - left.createdAt)
      : [];
  } catch {
    return [];
  }
}

export function readLatestCommitment() {
  return readCommitments()[0] ?? null;
}

export function localizeCommitmentStatus(active: boolean) {
  return active ? "进行中" : "已结束";
}

export function formatCommitmentTime(value: number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCommitmentDate(value: number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export function formatDurationDays(durationDays: number) {
  return `${durationDays} 天`;
}

export function parseDurationDays(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  const match = normalized.match(/\d+/);

  if (!match) {
    return 0;
  }

  const durationDays = Number.parseInt(match[0], 10);

  return Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 0;
}

export function getCommitmentErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return getContractErrorMessage(error);
}

function persistCommitments(commitments: Commitment[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(COMMITMENTS_CACHE_KEY, JSON.stringify(commitments));
  window.dispatchEvent(new CustomEvent(COMMITMENTS_UPDATED_EVENT));
}
