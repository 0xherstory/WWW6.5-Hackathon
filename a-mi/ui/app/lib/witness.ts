"use client";

import {
  getWitnessCountByCommitment,
  getWitnessRecord,
  getWitnessRecordIdsByOwner,
  getWitnessRecordIdsByWitness,
  getWitnessesByCommitment,
  type NormalizedWitnessRecord,
} from "@/lib/contract/amiCommitmentV2";
import { getCommitment as getCommitmentFromV1 } from "@/lib/contract/amiCommitment";
import type {
  CommitmentWithProgress,
  WitnessRecord,
} from "@/lib/contract/types";
import { formatAddress } from "./wallet";

export async function decorateCommitmentsWithWitnessData(
  commitments: CommitmentWithProgress[],
): Promise<CommitmentWithProgress[]> {
  return Promise.all(
    commitments.map(async (commitment) => {
      try {
        const [addresses, witnessCount] = await Promise.all([
          getWitnessesByCommitment(commitment.id),
          getWitnessCountByCommitment(commitment.id),
        ]);

        return {
          ...commitment,
          witnesses: addresses.map((address) => ({ address })),
          witnessCount,
        };
      } catch {
        return {
          ...commitment,
          witnesses: [],
          witnessCount: 0,
        };
      }
    }),
  );
}

export async function getWitnessRecords(
  walletAddress: string,
  commitments: CommitmentWithProgress[],
): Promise<WitnessRecord[]> {
  if (!walletAddress) {
    return [];
  }

  try {
    const [receivedIds, givenIds] = await Promise.all([
      getWitnessRecordIdsByOwner(walletAddress),
      getWitnessRecordIdsByWitness(walletAddress),
    ]);

    const titleByCommitmentId = new Map(
      commitments.map((commitment) => [commitment.id, commitment.title] as const),
    );

    const [receivedRecords, givenRecords] = await Promise.all([
      Promise.all(receivedIds.map((id) => getWitnessRecordSafe(id))),
      Promise.all(givenIds.map((id) => getWitnessRecordSafe(id))),
    ]);

    const records = await Promise.all([
      ...receivedRecords
        .filter((record): record is NormalizedWitnessRecord => Boolean(record))
        .map(async (record) => ({
          id: `received-${record.id}`,
          type: "received" as const,
          witnessAddress: record.witness,
          commitmentTitle: await resolveCommitmentTitle(record.commitmentId, titleByCommitmentId),
          createdAt: record.createdAt,
        })),
      ...givenRecords
        .filter((record): record is NormalizedWitnessRecord => Boolean(record))
        .map(async (record) => ({
          id: `given-${record.id}`,
          type: "given" as const,
          targetUserAddress: record.commitmentOwner,
          commitmentTitle: await resolveCommitmentTitle(record.commitmentId, titleByCommitmentId),
          createdAt: record.createdAt,
        })),
    ]);

    return records.sort((left, right) => right.createdAt - left.createdAt);
  } catch {
    return [];
  }
}

export function getWitnessDisplayName(person: {
  address?: string;
  name?: string;
}) {
  if (person.name?.trim()) {
    return person.name.trim();
  }

  if (person.address?.trim()) {
    return formatAddress(person.address.trim());
  }

  return "一位朋友";
}

export function formatAddressForWitness(address: string) {
  return formatAddress(address);
}

export function formatRelativeTime(timestamp: number, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "刚刚";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  }

  return `${Math.floor(diff / day)}天前`;
}

async function getWitnessRecordSafe(id: number) {
  try {
    return await getWitnessRecord(id);
  } catch {
    return null;
  }
}

async function resolveCommitmentTitle(
  commitmentId: number,
  titleByCommitmentId: Map<number, string>,
) {
  try {
    const commitment = await getCommitmentFromV1(commitmentId);
    return commitment.title;
  } catch {
    return titleByCommitmentId.get(commitmentId) ?? `Commitment #${commitmentId}`;
  }
}
