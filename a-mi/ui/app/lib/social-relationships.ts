"use client";

import { getAddress } from "ethers";

const RELATIONSHIP_STORAGE_KEY = "ami-social-following";

type FollowingRecord = {
  address: string;
  followedAt: number;
};

type FollowingByWallet = Record<string, FollowingRecord[]>;

export type SocialRelationshipEntry = {
  address: string;
  followedAt: number;
  isMutual: boolean;
};

export type SocialRelationshipSnapshot = {
  following: SocialRelationshipEntry[];
  followers: SocialRelationshipEntry[];
  mutuals: SocialRelationshipEntry[];
};

export function getRelationshipSnapshot(walletAddress: string): SocialRelationshipSnapshot {
  if (typeof window === "undefined" || !walletAddress) {
    return emptySnapshot();
  }

  const normalizedWallet = normalizeAddress(walletAddress);
  const allFollowing = readAllFollowing();
  const mine = normalizeRecords(allFollowing[normalizedWallet] ?? []);

  const followers = Object.entries(allFollowing)
    .filter(([ownerAddress]) => ownerAddress !== normalizedWallet)
    .flatMap(([ownerAddress, records]) => {
      const matched = normalizeRecords(records).find(
        (record) => record.address === normalizedWallet,
      );

      if (!matched) {
        return [];
      }

      return [
        {
          address: ownerAddress,
          followedAt: matched.followedAt,
        },
      ];
    });

  const followingAddresses = new Set(mine.map((item) => item.address));
  const followerAddresses = new Set(followers.map((item) => item.address));

  const following = mine
    .map((item) => ({
      ...item,
      isMutual: followerAddresses.has(item.address),
    }))
    .sort((left, right) => right.followedAt - left.followedAt);

  const normalizedFollowers = followers
    .map((item) => ({
      ...item,
      isMutual: followingAddresses.has(item.address),
    }))
    .sort((left, right) => right.followedAt - left.followedAt);

  const mutuals = following
    .filter((item) => item.isMutual)
    .map((item) => ({
      address: item.address,
      followedAt: Math.max(
        item.followedAt,
        normalizedFollowers.find((follower) => follower.address === item.address)?.followedAt ??
          item.followedAt,
      ),
      isMutual: true,
    }))
    .sort((left, right) => right.followedAt - left.followedAt);

  return {
    following,
    followers: normalizedFollowers,
    mutuals,
  };
}

export function followUser(walletAddress: string, targetAddress: string) {
  const normalizedWallet = normalizeAddress(walletAddress);
  const normalizedTarget = normalizeAddress(targetAddress);

  if (normalizedWallet === normalizedTarget) {
    throw new Error("不能关注自己");
  }

  const allFollowing = readAllFollowing();
  const mine = normalizeRecords(allFollowing[normalizedWallet] ?? []);

  if (mine.some((item) => item.address === normalizedTarget)) {
    throw new Error("你已经关注了这个地址");
  }

  allFollowing[normalizedWallet] = [
    ...mine,
    {
      address: normalizedTarget,
      followedAt: Date.now(),
    },
  ];

  persistAllFollowing(allFollowing);
  return getRelationshipSnapshot(normalizedWallet);
}

export function unfollowUser(walletAddress: string, targetAddress: string) {
  const normalizedWallet = normalizeAddress(walletAddress);
  const normalizedTarget = normalizeAddress(targetAddress);
  const allFollowing = readAllFollowing();
  const mine = normalizeRecords(allFollowing[normalizedWallet] ?? []);

  allFollowing[normalizedWallet] = mine.filter((item) => item.address !== normalizedTarget);
  persistAllFollowing(allFollowing);

  return getRelationshipSnapshot(normalizedWallet);
}

export function followBackUser(walletAddress: string, targetAddress: string) {
  return followUser(walletAddress, targetAddress);
}

export function validateRelationshipAddress(address: string) {
  return normalizeAddress(address);
}

function readAllFollowing() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedValue = window.localStorage.getItem(RELATIONSHIP_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsed = JSON.parse(storedValue) as FollowingByWallet;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistAllFollowing(value: FollowingByWallet) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RELATIONSHIP_STORAGE_KEY, JSON.stringify(value));
}

function normalizeRecords(records: FollowingRecord[]) {
  return records
    .map((item) => {
      try {
        return {
          address: normalizeAddress(item.address),
          followedAt:
            typeof item.followedAt === "number" && Number.isFinite(item.followedAt)
              ? item.followedAt
              : 0,
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is FollowingRecord => Boolean(item));
}

function normalizeAddress(address: string) {
  const trimmed = address.trim();

  if (!trimmed) {
    throw new Error("请先输入钱包地址");
  }

  return getAddress(trimmed);
}

function emptySnapshot(): SocialRelationshipSnapshot {
  return {
    following: [],
    followers: [],
    mutuals: [],
  };
}
