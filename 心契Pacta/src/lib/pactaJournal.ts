import type { HabitCategory } from "@/data/habitsData";
import { habits } from "@/data/habitsData";
import type { OnChainPact } from "@/hooks/usePactaChain";
import { UINT_TO_FREQUENCY_LABEL } from "@/lib/pacta";

type JournalRecordSource = "chain-sync" | "checkin";

export type BackendPactSyncPayload = {
  wallet: string;
  pactId: string;
  habitName: string;
  category: HabitCategory | "unknown";
  frequencyLabel: string;
  durationDays: number;
  startAt: string;
  lastCheckinAt: string | null;
};

export type BackendCheckinPayload = {
  wallet: string;
  pactId: string;
  checkedAt: string;
  txHash?: `0x${string}`;
};

export type JournalCheckinRecord = {
  dayKey: string;
  occurredAt: string;
  txHash?: `0x${string}`;
  encouragement: string | null;
  source: JournalRecordSource;
};

export type JournalPactRecord = BackendPactSyncPayload & {
  latestEncouragement: string | null;
  updatedAt: string;
  checkins: JournalCheckinRecord[];
};

export type PactJournalSnapshot = {
  pactId: string;
  habitName: string;
  category: HabitCategory | "unknown";
  frequencyLabel: string;
  durationDays: number;
  checkinCount: number;
  currentStreak: number;
  completionRate: number;
  nextMicroHabit: string;
  summary: string;
  latestEncouragement: string | null;
  lastCheckinAt: string | null;
};

type JournalStore = {
  pacts: Record<string, JournalPactRecord>;
};

const STORAGE_KEY = "pacta-journal-backend-v1";

const microHabitSuggestions: Record<HabitCategory | "unknown", string> = {
  mental: "给学习动作绑定一个固定触发点，比如坐下后先读 2 页",
  physical: "把动作门槛降到换鞋、站起或拉伸 30 秒就算完成启动",
  diet: "先把喝水、备水果这类最容易完成的动作放进日常节奏",
  happiness: "给自己保留一句感谢、一次微笑或一次简短问候的空间",
  business: "每天先完成一个最小业务动作，例如跟进 1 条线索",
  productivity: "先做 1 分钟清单整理，再进入真正的深度任务",
  unknown: "继续把动作拆小，确保今天也能轻松完成一次",
};

function getEmptyStore(): JournalStore {
  return { pacts: {} };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStore(): JournalStore {
  if (!canUseStorage()) return getEmptyStore();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyStore();
    const parsed = JSON.parse(raw) as JournalStore;
    if (!parsed?.pacts || typeof parsed.pacts !== "object") return getEmptyStore();
    return parsed;
  } catch {
    return getEmptyStore();
  }
}

function writeStore(store: JournalStore) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function makeKey(wallet: string, pactId: string) {
  return `${wallet.toLowerCase()}:${pactId}`;
}

function toIsoFromSeconds(sec: bigint) {
  if (sec <= 0n) return null;
  return new Date(Number(sec) * 1000).toISOString();
}

function toDayKey(isoString: string) {
  return isoString.slice(0, 10);
}

function getCategoryByHabitName(habitName: string): HabitCategory | "unknown" {
  return habits.find((habit) => habit.name === habitName)?.category ?? "unknown";
}

function dedupeCheckins(checkins: JournalCheckinRecord[]) {
  const byDay = new Map<string, JournalCheckinRecord>();

  [...checkins]
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .forEach((entry) => {
      const current = byDay.get(entry.dayKey);
      if (!current) {
        byDay.set(entry.dayKey, entry);
        return;
      }

      if (!current.encouragement && entry.encouragement) {
        byDay.set(entry.dayKey, entry);
      }
    });

  return [...byDay.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

function differenceInDays(dayA: string, dayB: string) {
  const ms = new Date(dayA).getTime() - new Date(dayB).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function getCurrentStreak(dayKeys: string[]) {
  if (dayKeys.length === 0) return 0;

  let streak = 1;
  for (let index = dayKeys.length - 1; index > 0; index -= 1) {
    if (differenceInDays(dayKeys[index], dayKeys[index - 1]) === 1) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

function buildSummary(record: JournalPactRecord) {
  const uniqueDays = dedupeCheckins(record.checkins).map((item) => item.dayKey);
  const checkinCount = uniqueDays.length;
  const currentStreak = getCurrentStreak(uniqueDays);
  const completionRate = record.durationDays > 0 ? Math.min(1, checkinCount / record.durationDays) : 0;
  const remainingDays = Math.max(record.durationDays - checkinCount, 0);
  const nextMicroHabit = microHabitSuggestions[record.category];

  if (checkinCount === 0) {
    return {
      checkinCount,
      currentStreak,
      completionRate,
      nextMicroHabit,
      summary: `挑战刚开始，先把「${nextMicroHabit}」变成今天最容易完成的第一步。`,
    };
  }

  const rhythm =
    completionRate >= 0.75
      ? "节奏很稳"
      : completionRate >= 0.4
        ? "已经建立起基础节奏"
        : "正在为稳定节奏打底";

  const milestone =
    remainingDays > 0
      ? `距离阶段目标还差 ${remainingDays} 天。`
      : "已经完成当前阶段目标。";

  return {
    checkinCount,
    currentStreak,
    completionRate,
    nextMicroHabit,
    summary: `你已经坚持了 ${checkinCount} 天，当前连续 ${currentStreak} 天，${rhythm}。${milestone} 接下来建议在「${nextMicroHabit}」上继续建立微习惯。`,
  };
}

function buildEncouragement(record: JournalPactRecord) {
  const { checkinCount, currentStreak } = buildSummary(record);

  if (currentStreak >= 7) {
    return `连续 ${currentStreak} 天完成 ${record.habitName}，你已经把承诺写进日常了。`;
  }

  if (currentStreak >= 3) {
    return `${record.habitName} 已连续 ${currentStreak} 天兑现，保持这个节奏，改变正在累积。`;
  }

  if (checkinCount <= 1) {
    return `第一笔 ${record.habitName} 记录已经落下，今天就是微习惯生长的起点。`;
  }

  return `又完成一次 ${record.habitName}，继续把「${microHabitSuggestions[record.category]}」留在明天。`;
}

function toSyncPayload(wallet: string, pact: OnChainPact): BackendPactSyncPayload {
  return {
    wallet: wallet.toLowerCase(),
    pactId: pact.id.toString(),
    habitName: pact.habitName,
    category: getCategoryByHabitName(pact.habitName),
    frequencyLabel: UINT_TO_FREQUENCY_LABEL[pact.frequency.toString()] ?? `码值 ${pact.frequency.toString()}`,
    durationDays: Number(pact.durationDays),
    startAt: toIsoFromSeconds(pact.startTime) ?? new Date().toISOString(),
    lastCheckinAt: toIsoFromSeconds(pact.lastCheckin),
  };
}

export function syncPactsToJournal(wallet: string | undefined, pacts: OnChainPact[]) {
  if (!wallet || !canUseStorage()) return;

  const store = readStore();
  const now = new Date().toISOString();

  pacts.forEach((pact) => {
    const payload = toSyncPayload(wallet, pact);
    const key = makeKey(payload.wallet, payload.pactId);
    const existing = store.pacts[key];
    const importedChainCheckin =
      payload.lastCheckinAt && !existing?.checkins.some((item) => item.dayKey === toDayKey(payload.lastCheckinAt))
        ? [
            {
              dayKey: toDayKey(payload.lastCheckinAt),
              occurredAt: payload.lastCheckinAt,
              source: "chain-sync" as const,
              encouragement: existing?.latestEncouragement ?? null,
            },
          ]
        : [];

    store.pacts[key] = {
      ...payload,
      checkins: dedupeCheckins([...(existing?.checkins ?? []), ...importedChainCheckin]),
      latestEncouragement: existing?.latestEncouragement ?? null,
      updatedAt: now,
    };
  });

  writeStore(store);
}

export function getPactJournalMap(wallet: string | undefined, pacts: OnChainPact[]): Record<string, PactJournalSnapshot> {
  if (!wallet) return {};

  syncPactsToJournal(wallet, pacts);

  const store = readStore();
  const loweredWallet = wallet.toLowerCase();

  return pacts.reduce<Record<string, PactJournalSnapshot>>((acc, pact) => {
    const key = makeKey(loweredWallet, pact.id.toString());
    const record = store.pacts[key];
    if (!record) return acc;

    const summary = buildSummary(record);
    acc[pact.id.toString()] = {
      pactId: record.pactId,
      habitName: record.habitName,
      category: record.category,
      frequencyLabel: record.frequencyLabel,
      durationDays: record.durationDays,
      checkinCount: summary.checkinCount,
      currentStreak: summary.currentStreak,
      completionRate: summary.completionRate,
      nextMicroHabit: summary.nextMicroHabit,
      summary: summary.summary,
      latestEncouragement: record.latestEncouragement,
      lastCheckinAt: record.lastCheckinAt,
    };

    return acc;
  }, {});
}

export function recordCheckinToJournal(
  wallet: string | undefined,
  pact: OnChainPact,
  txHash?: `0x${string}`,
) {
  if (!wallet) return null;

  syncPactsToJournal(wallet, [pact]);

  const store = readStore();
  const payload = toSyncPayload(wallet, pact);
  const key = makeKey(payload.wallet, payload.pactId);
  const existing = store.pacts[key];
  if (!existing) return null;

  const checkedAt = new Date().toISOString();
  const dayKey = toDayKey(checkedAt);

  const pendingRecord: JournalPactRecord = {
    ...existing,
    lastCheckinAt: checkedAt,
    updatedAt: checkedAt,
    checkins: dedupeCheckins([
      ...existing.checkins.filter((item) => item.dayKey !== dayKey),
      {
        dayKey,
        occurredAt: checkedAt,
        txHash,
        source: "checkin",
        encouragement: null,
      },
    ]),
  };

  const encouragement = buildEncouragement(pendingRecord);
  const nextRecord: JournalPactRecord = {
    ...pendingRecord,
    latestEncouragement: encouragement,
    checkins: pendingRecord.checkins.map((item) =>
      item.dayKey === dayKey
        ? {
            ...item,
            encouragement,
          }
        : item,
    ),
  };

  store.pacts[key] = nextRecord;
  writeStore(store);

  const snapshot = getPactJournalMap(wallet, [pact])[pact.id.toString()];

  return {
    payload: {
      wallet: payload.wallet,
      pactId: payload.pactId,
      checkedAt,
      txHash,
    } satisfies BackendCheckinPayload,
    encouragement,
    summary: snapshot?.summary ?? buildSummary(nextRecord).summary,
  };
}
