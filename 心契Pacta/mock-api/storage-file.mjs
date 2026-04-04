import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEncouragement,
  buildPactView,
  createDashboardResponse,
  dayKey,
  dedupeCheckins,
  getSeedPacts,
  makeHash,
} from "./domain.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function ensureStorage() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function seedState() {
  return {
    nextPactId: 3,
    pacts: getSeedPacts(),
  };
}

function normalizeState(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  return {
    nextPactId: typeof base.nextPactId === "number" ? base.nextPactId : 1,
    pacts: Array.isArray(base.pacts) ? base.pacts : [],
  };
}

function readState() {
  ensureStorage();
  if (!existsSync(DATA_FILE)) {
    const state = seedState();
    writeState(state);
    return state;
  }

  try {
    return normalizeState(JSON.parse(readFileSync(DATA_FILE, "utf8")));
  } catch {
    const state = seedState();
    writeState(state);
    return state;
  }
}

function writeState(state) {
  ensureStorage();
  writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

function findWalletPacts(state, wallet) {
  return state.pacts.filter((item) => item.wallet.toLowerCase() === wallet.toLowerCase());
}

function upsertPact(state, payload) {
  const index = state.pacts.findIndex((item) => item.wallet === payload.wallet && item.id === payload.id);
  if (index >= 0) {
    const existing = state.pacts[index];
    const merged = {
      ...existing,
      ...payload,
      checkins: dedupeCheckins([
        ...(existing.checkins ?? []),
        ...((payload.lastCheckinAt &&
          !existing.checkins?.some((item) => dayKey(item.checkedAt) === dayKey(payload.lastCheckinAt)))
          ? [
              {
                checkedAt: payload.lastCheckinAt,
                txHash: null,
                source: "chain-sync",
                encouragement: existing.latestEncouragement ?? null,
              },
            ]
          : []),
      ]),
    };
    state.pacts[index] = merged;
    return merged;
  }

  const next = {
    ...payload,
    rewardClaimed: false,
    checkins: payload.lastCheckinAt
      ? [{ checkedAt: payload.lastCheckinAt, txHash: null, source: "chain-sync", encouragement: null }]
      : [],
    latestEncouragement: null,
  };
  state.pacts.push(next);
  return next;
}

export function createFileStorage() {
  return {
    provider: "file",
    async getDashboard(wallet) {
      const state = readState();
      return createDashboardResponse(wallet, state.pacts, findWalletPacts(state, wallet));
    },
    async createPact(input) {
      const state = readState();
      const record = {
        id: String(state.nextPactId),
        wallet: input.wallet.toLowerCase(),
        habitName: input.habitName,
        category: input.category ?? "unknown",
        frequencyLabel: input.frequencyLabel ?? "每天",
        frequencyCode: input.frequencyCode ?? "0",
        durationDays: Number(input.durationDays ?? 7),
        stakeAmountWei: String(input.stakeAmountWei ?? "0"),
        startAt: input.startAt ?? new Date().toISOString(),
        lastCheckinAt: null,
        completed: false,
        rewardClaimed: false,
        latestEncouragement: null,
        checkins: [],
      };

      state.nextPactId += 1;
      state.pacts.push(record);
      writeState(state);
      return buildPactView(record);
    },
    async syncPacts(wallet, pacts) {
      const state = readState();
      pacts.forEach((item) => {
        upsertPact(state, {
          id: String(item.id),
          wallet,
          habitName: item.habitName,
          category: item.category ?? "unknown",
          frequencyLabel: item.frequencyLabel ?? "每天",
          frequencyCode: String(item.frequencyCode ?? "0"),
          durationDays: Number(item.durationDays ?? 0),
          stakeAmountWei: String(item.stakeAmountWei ?? "0"),
          startAt: item.startAt ?? new Date().toISOString(),
          lastCheckinAt: item.lastCheckinAt ?? null,
          completed: Boolean(item.completed),
        });
      });
      writeState(state);
      return createDashboardResponse(wallet, state.pacts, findWalletPacts(state, wallet));
    },
    async recordCheckin(wallet, pactId, txHash, checkedAt = new Date().toISOString()) {
      const state = readState();
      const pact = state.pacts.find((item) => item.wallet === wallet && item.id === pactId);

      if (!pact) {
        const error = new Error("未找到挑战记录");
        error.statusCode = 404;
        throw error;
      }

      pact.lastCheckinAt = checkedAt;
      pact.checkins = dedupeCheckins([
        ...pact.checkins.filter((item) => dayKey(item.checkedAt) !== dayKey(checkedAt)),
        {
          checkedAt,
          txHash: txHash ?? makeHash(`${pactId}${Date.now()}`),
          source: "checkin",
          encouragement: null,
        },
      ]);
      pact.latestEncouragement = buildEncouragement(pact);
      pact.checkins = pact.checkins.map((item) =>
        dayKey(item.checkedAt) === dayKey(checkedAt)
          ? {
              ...item,
              encouragement: pact.latestEncouragement,
            }
          : item,
      );

      writeState(state);
      return {
        pact: buildPactView(pact),
        encouragement: pact.latestEncouragement,
      };
    },
    async claimReward(wallet, pactId) {
      const state = readState();
      const pact = state.pacts.find((item) => item.wallet === wallet && item.id === pactId);

      if (!pact) {
        const error = new Error("未找到挑战记录");
        error.statusCode = 404;
        throw error;
      }

      if (pact.rewardClaimed) {
        const error = new Error("奖励已领取，请勿重复操作");
        error.statusCode = 409;
        throw error;
      }

      pact.rewardClaimed = true;
      writeState(state);
      return buildPactView(pact);
    },
    async resetDemoData() {
      writeState(seedState());
      return { ok: true };
    },
  };
}
