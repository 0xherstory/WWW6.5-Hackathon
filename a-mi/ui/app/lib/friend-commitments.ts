"use client";

import { getCommitmentsWithProgress } from "./commitment-checkins";
import { getCommitmentsByOwnerDetailed } from "@/lib/contract/amiCommitment";

export async function getRecentFriendCommitments(friendAddress: string) {
  const commitments = await getCommitmentsByOwnerDetailed(friendAddress);
  const commitmentsWithProgress = await getCommitmentsWithProgress(commitments);

  return [...commitmentsWithProgress].sort((left, right) => {
    if (left.createdAt !== right.createdAt) {
      return right.createdAt - left.createdAt;
    }

    return right.id - left.id;
  });
}
