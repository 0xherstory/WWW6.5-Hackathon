import { createClient } from "@supabase/supabase-js";
import {
  buildEncouragement,
  buildPactView,
  createDashboardResponse,
  dayKey,
  dedupeCheckins,
} from "./domain.mjs";

const PACTS_TABLE = "pact_journal_pacts";
const CHECKINS_TABLE = "pact_journal_checkins";
const RESET_RPC = "reset_pacta_demo_data";

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function mapCheckinRow(row) {
  return {
    checkedAt: row.checked_at,
    txHash: row.tx_hash,
    source: row.source,
    encouragement: row.encouragement,
  };
}

function mapPactRow(row, checkins = []) {
  return {
    id: String(row.id),
    wallet: row.wallet,
    habitName: row.habit_name,
    category: row.category,
    frequencyLabel: row.frequency_label,
    frequencyCode: String(row.frequency_code),
    durationDays: Number(row.duration_days),
    stakeAmountWei: String(row.stake_amount_wei),
    startAt: row.start_at,
    lastCheckinAt: row.last_checkin_at,
    completed: Boolean(row.completed),
    rewardClaimed: Boolean(row.reward_claimed),
    latestEncouragement: row.latest_encouragement,
    checkins,
  };
}

export function createSupabaseStorage(config) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error("缺少 Supabase 连接配置，请填写 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  async function fetchWalletPacts(wallet) {
    const { data: pactRows, error: pactError } = await supabase
      .from(PACTS_TABLE)
      .select("*")
      .eq("wallet", wallet.toLowerCase())
      .order("id", { ascending: false });

    if (pactError) throw pactError;

    const pactIds = (pactRows ?? []).map((row) => row.id);
    let groupedCheckins = new Map();

    if (pactIds.length > 0) {
      const { data: checkinRows, error: checkinError } = await supabase
        .from(CHECKINS_TABLE)
        .select("*")
        .in("pact_id", pactIds)
        .order("checked_at", { ascending: true });

      if (checkinError) throw checkinError;

      groupedCheckins = (checkinRows ?? []).reduce((map, row) => {
        const key = String(row.pact_id);
        const current = map.get(key) ?? [];
        current.push(mapCheckinRow(row));
        map.set(key, current);
        return map;
      }, new Map());
    }

    return (pactRows ?? []).map((row) =>
      mapPactRow(row, dedupeCheckins(groupedCheckins.get(String(row.id)) ?? [])),
    );
  }

  async function fetchRewardPoolPacts() {
    const { data, error } = await supabase.from(PACTS_TABLE).select("stake_amount_wei");
    if (error) throw error;
    return (data ?? []).map((row) => ({ stakeAmountWei: String(row.stake_amount_wei) }));
  }

  async function fetchPact(wallet, pactId) {
    const pacts = await fetchWalletPacts(wallet);
    return pacts.find((item) => item.id === pactId) ?? null;
  }

  async function upsertCheckinRow({ pactId, wallet, checkedAt, txHash, encouragement, source }) {
    const payload = {
      pact_id: Number(pactId),
      wallet: wallet.toLowerCase(),
      checkin_day: dayKey(checkedAt),
      checked_at: checkedAt,
      tx_hash: txHash,
      source,
      encouragement,
    };

    const { error } = await supabase
      .from(CHECKINS_TABLE)
      .upsert(payload, { onConflict: "pact_id,checkin_day" });

    if (error) throw error;
  }

  return {
    provider: "supabase",
    async getDashboard(wallet) {
      const [allPacts, walletPacts] = await Promise.all([
        fetchRewardPoolPacts(),
        fetchWalletPacts(wallet),
      ]);

      return createDashboardResponse(wallet, allPacts, walletPacts);
    },
    async createPact(input) {
      const { data, error } = await supabase
        .from(PACTS_TABLE)
        .insert({
          wallet: input.wallet.toLowerCase(),
          habit_name: input.habitName,
          category: input.category ?? "unknown",
          frequency_label: input.frequencyLabel ?? "每天",
          frequency_code: input.frequencyCode ?? "0",
          duration_days: Number(input.durationDays ?? 7),
          stake_amount_wei: String(input.stakeAmountWei ?? "0"),
          start_at: input.startAt ?? new Date().toISOString(),
          completed: false,
          reward_claimed: false,
        })
        .select("*")
        .single();

      if (error) throw error;

      return mapPactRow(data, []);
    },
    async syncPacts(wallet, pacts) {
      if (pacts.length > 0) {
        const { error } = await supabase.from(PACTS_TABLE).upsert(
          pacts.map((item) => ({
            id: Number(item.id),
            wallet: wallet.toLowerCase(),
            habit_name: item.habitName,
            category: item.category ?? "unknown",
            frequency_label: item.frequencyLabel ?? "每天",
            frequency_code: String(item.frequencyCode ?? "0"),
            duration_days: Number(item.durationDays ?? 0),
            stake_amount_wei: String(item.stakeAmountWei ?? "0"),
            start_at: item.startAt ?? new Date().toISOString(),
            last_checkin_at: item.lastCheckinAt ?? null,
            completed: Boolean(item.completed),
          })),
          { onConflict: "id" },
        );

        if (error) throw error;

        for (const item of pacts) {
          if (!item.lastCheckinAt) continue;

          await upsertCheckinRow({
            pactId: item.id,
            wallet,
            checkedAt: item.lastCheckinAt,
            txHash: null,
            encouragement: null,
            source: "chain-sync",
          });
        }
      }

      return this.getDashboard(wallet);
    },
    async recordCheckin(wallet, pactId, txHash, checkedAt = new Date().toISOString()) {
      const pact = await fetchPact(wallet, pactId);

      if (!pact) {
        throw createHttpError("未找到挑战记录", 404);
      }

      const nextPact = {
        ...pact,
        lastCheckinAt: checkedAt,
        checkins: dedupeCheckins([
          ...pact.checkins.filter((item) => dayKey(item.checkedAt) !== dayKey(checkedAt)),
          {
            checkedAt,
            txHash,
            source: "checkin",
            encouragement: null,
          },
        ]),
      };
      const encouragement = buildEncouragement(nextPact);

      await upsertCheckinRow({
        pactId,
        wallet,
        checkedAt,
        txHash,
        encouragement,
        source: "checkin",
      });

      const { error: pactError } = await supabase
        .from(PACTS_TABLE)
        .update({
          last_checkin_at: checkedAt,
          latest_encouragement: encouragement,
        })
        .eq("id", Number(pactId))
        .eq("wallet", wallet.toLowerCase());

      if (pactError) throw pactError;

      const updatedPact = await fetchPact(wallet, pactId);
      const pactView = buildPactView(updatedPact ?? nextPact);

      return {
        pact: pactView,
        encouragement,
      };
    },
    async claimReward(wallet, pactId) {
      const pact = await fetchPact(wallet, pactId);

      if (!pact) {
        throw createHttpError("未找到挑战记录", 404);
      }

      if (pact.rewardClaimed) {
        throw createHttpError("奖励已领取，请勿重复操作", 409);
      }

      const { error } = await supabase
        .from(PACTS_TABLE)
        .update({
          reward_claimed: true,
        })
        .eq("id", Number(pactId))
        .eq("wallet", wallet.toLowerCase());

      if (error) throw error;

      const updatedPact = await fetchPact(wallet, pactId);
      return buildPactView(updatedPact ?? { ...pact, rewardClaimed: true });
    },
    async resetDemoData() {
      const { error } = await supabase.rpc(RESET_RPC);
      if (error) throw error;
      return { ok: true };
    },
  };
}
