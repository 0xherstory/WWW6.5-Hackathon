"use client";

import {
  createCheckIn as createCheckInOnChain,
  getCheckInCount,
  getCheckInsByCommitmentDetailed,
} from "@/lib/contract/amiCommitment";
import type {
  CheckIn,
  Commitment,
  CommitmentStatus,
  CommitmentWithProgress,
} from "@/lib/contract/types";

export const COMMITMENT_CHECKINS_UPDATED_EVENT = "ami:commitment-checkins-updated";

export type CheckInMood = string;

export type CreateCheckInInput = {
  commitmentId: number;
  content: string;
  mood: string;
  proofURI: string;
};

export async function getCommitmentsWithProgress(commitments: Commitment[]) {
  const decorated = await Promise.all(
    commitments.map(async (commitment) => {
      const [checkedDays, checkIns] = await Promise.all([
        getCheckInCount(commitment.id),
        getCheckInsByCommitmentDetailed(commitment.id),
      ]);

      return decorateCommitmentWithProgress(commitment, checkedDays, checkIns);
    }),
  );

  return decorated.sort((left, right) => right.createdAt - left.createdAt);
}

export async function createCommitmentCheckIn(input: CreateCheckInInput) {
  const normalizedContent = input.content.trim();
  const normalizedMood = input.mood.trim();
  const normalizedProofURI = input.proofURI.trim();

  if (!normalizedContent) {
    throw new Error("请先填写今日打卡内容");
  }

  if (!normalizedMood) {
    throw new Error("请先选择今日心情");
  }

  const result = await createCheckInOnChain(
    input.commitmentId,
    normalizedContent,
    normalizedMood,
    normalizedProofURI,
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COMMITMENT_CHECKINS_UPDATED_EVENT));
  }

  return result;
}

export function localizeCommitmentProgressStatus(status: CommitmentStatus) {
  return status === "completed" ? "已完成" : "进行中";
}

export function hasCheckedInToday(checkIns: CheckIn[]) {
  return checkIns.some((item) => isSameDay(item.createdAt, Date.now()));
}

function decorateCommitmentWithProgress(
  commitment: Commitment,
  checkedDays: number,
  checkIns: CheckIn[],
): CommitmentWithProgress {
  const status: CommitmentStatus =
    checkedDays >= commitment.durationDays ? "completed" : "ongoing";

  return {
    ...commitment,
    checkedDays,
    progressText: `${checkedDays}/${commitment.durationDays}`,
    status,
    checkIns,
  };
}

function isSameDay(left: number, right: number) {
  const leftDate = new Date(left);
  const rightDate = new Date(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}
