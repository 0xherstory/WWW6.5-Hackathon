import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { getAddress, zeroAddress } from "viem";
import { pactaAbi } from "@/abi/pactaAbi";
import { PACTA_ADDRESS } from "@/lib/pacta";

export type OnChainPact = {
  id: bigint;
  user: `0x${string}`;
  habitName: string;
  dailyStakeWei: bigint;
  totalStakeWei: bigint;
  frequency: bigint;
  startTime: bigint;
  lastCheckin: bigint;
  durationDays: bigint;
  checkinCount: bigint;
  streak: bigint;
  completed: boolean;
  claimed: boolean;
};

function parsePactRow(result: unknown): Omit<OnChainPact, "id"> | null {
  if (!result || typeof result !== "object") return null;
  const r = result as Record<string, unknown>;
  const user = r.user as `0x${string}` | undefined;
  if (!user || user === zeroAddress) return null;
  return {
    user,
    habitName: String(r.habitName ?? ""),
    dailyStakeWei: BigInt(r.dailyStakeWei?.toString() ?? 0),
    totalStakeWei: BigInt(r.totalStakeWei?.toString() ?? 0),
    frequency: BigInt(r.frequency?.toString() ?? 0),
    startTime: BigInt(r.startTime?.toString() ?? 0),
    lastCheckin: BigInt(r.lastCheckin?.toString() ?? 0),
    durationDays: BigInt(r.durationDays?.toString() ?? 0),
    checkinCount: BigInt(r.checkinCount?.toString() ?? 0),
    streak: BigInt(r.streak?.toString() ?? 0),
    completed: Boolean(r.completed),
    claimed: Boolean(r.claimed),
  };
}

export function usePactaChainReads(enabled = true) {
  const { address } = useAccount();

  const { data: counter, isFetched: counterFetched } = useReadContract({
    address: PACTA_ADDRESS,
    abi: pactaAbi,
    functionName: "pactCounter",
    query: { enabled },
  });

  const { data: rewardPoolWei } = useReadContract({
    address: PACTA_ADDRESS,
    abi: pactaAbi,
    functionName: "getRewardPool",
    query: { enabled },
  });

  const count = counter !== undefined ? Number(counter) : 0;

  const contracts0 = useMemo(
    () =>
      count > 0
        ? Array.from({ length: count }, (_, i) => ({
            address: PACTA_ADDRESS,
            abi: pactaAbi,
            functionName: "getPact" as const,
            args: [BigInt(i)] as const,
          }))
        : [],
    [count],
  );

  const {
    data: batch0,
    isFetched: fetched0,
    isFetching: loading0,
  } = useReadContracts({
    contracts: contracts0,
    query: { enabled: enabled && counterFetched && count > 0 },
  });

  const firstRowHasUser0 = useMemo(() => {
    if (!fetched0 || !batch0?.length) return false;
    const first = batch0[0];
    if (!first || first.status !== "success" || !first.result) return false;
    return Boolean(parsePactRow(first.result));
  }, [batch0, fetched0]);

  // 兼容两类合约实现：
  // - 0-based: pact ids 为 0..counter-1，getPact(0) 有效
  // - 1-based: pact ids 为 1..counter，getPact(0) 为空
  // 旧逻辑用“是否存在任意有效项”判断会在 1-based 下漏掉最新一条（id=counter）。
  const useOneBased = count > 0 && fetched0 && !firstRowHasUser0;

  const contracts1 = useMemo(
    () =>
      useOneBased
        ? Array.from({ length: count }, (_, i) => ({
            address: PACTA_ADDRESS,
            abi: pactaAbi,
            functionName: "getPact" as const,
            args: [BigInt(i + 1)] as const,
          }))
        : [],
    [count, useOneBased],
  );

  const { data: batch1, isFetching: loading1 } = useReadContracts({
    contracts: contracts1,
    query: { enabled: enabled && useOneBased },
  });

  const effectiveBatch = useOneBased ? batch1 : batch0;
  const idOffset = useOneBased ? 1 : 0;

  const allPacts: OnChainPact[] = useMemo(() => {
    const out: OnChainPact[] = [];
    if (!effectiveBatch) return out;
    effectiveBatch.forEach((row, i) => {
      if (row.status !== "success" || !row.result) return;
      const base = parsePactRow(row.result);
      if (!base) return;
      out.push({ ...base, id: BigInt(i + idOffset) });
    });
    return out;
  }, [effectiveBatch, idOffset]);

  const myPacts = useMemo(() => {
    if (!address) return [];
    try {
      const me = getAddress(address);
      return allPacts.filter((p) => getAddress(p.user) === me);
    } catch {
      return [];
    }
  }, [allPacts, address]);

  const isLoading =
    (enabled && !counterFetched) ||
    (count > 0 && (!fetched0 || loading0)) ||
    (useOneBased && loading1);

  return {
    pactCounter: counter,
    rewardPoolWei: rewardPoolWei as bigint | undefined,
    allPacts,
    myPacts,
    isLoading,
  };
}
