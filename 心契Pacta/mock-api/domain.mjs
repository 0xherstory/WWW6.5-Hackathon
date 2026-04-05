export const DEMO_WALLET = "0xde1a000000000000000000000000000000000001";

const microHabitSuggestions = {
  mental: "给学习动作绑定一个固定触发点，比如坐下后先读 2 页",
  physical: "把动作门槛降到换鞋、站起或拉伸 30 秒就算完成启动",
  diet: "先把喝水、备水果这类最容易完成的动作放进日常节奏",
  happiness: "给自己保留一句感谢、一次微笑或一次简短问候的空间",
  business: "每天先完成一个最小业务动作，例如跟进 1 条线索",
  productivity: "先做 1 分钟清单整理，再进入真正的深度任务",
  unknown: "继续把动作拆小，确保今天也能轻松完成一次",
};

export function daysAgoIso(daysAgo, hour = 8) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export function makeHash(seed) {
  return `0x${String(seed).padStart(64, "0").slice(-64)}`;
}

export function getSeedPacts() {
  return [
    {
      id: "1",
      wallet: DEMO_WALLET,
      habitName: "喝水",
      category: "diet",
      frequencyLabel: "每天",
      frequencyCode: "0",
      durationDays: 21,
      stakeAmountWei: "100000000000000000",
      startAt: daysAgoIso(6),
      lastCheckinAt: daysAgoIso(0),
      completed: false,
      rewardClaimed: false,
      latestEncouragement: null,
      checkins: [
        { checkedAt: daysAgoIso(6), txHash: makeHash(1001), source: "seed", encouragement: null },
        { checkedAt: daysAgoIso(3), txHash: makeHash(1002), source: "seed", encouragement: null },
        { checkedAt: daysAgoIso(1), txHash: makeHash(1003), source: "seed", encouragement: null },
        { checkedAt: daysAgoIso(0), txHash: makeHash(1004), source: "seed", encouragement: null },
      ],
    },
    {
      id: "2",
      wallet: DEMO_WALLET,
      habitName: "阅读",
      category: "mental",
      frequencyLabel: "工作日",
      frequencyCode: "1",
      durationDays: 14,
      stakeAmountWei: "500000000000000000",
      startAt: daysAgoIso(9),
      lastCheckinAt: daysAgoIso(2),
      completed: false,
      rewardClaimed: false,
      latestEncouragement: null,
      checkins: [
        { checkedAt: daysAgoIso(8), txHash: makeHash(2001), source: "seed", encouragement: null },
        { checkedAt: daysAgoIso(7), txHash: makeHash(2002), source: "seed", encouragement: null },
        { checkedAt: daysAgoIso(5), txHash: makeHash(2003), source: "seed", encouragement: null },
        { checkedAt: daysAgoIso(2), txHash: makeHash(2004), source: "seed", encouragement: null },
      ],
    },
  ];
}

export function dayKey(iso) {
  return iso.slice(0, 10);
}

export function dedupeCheckins(checkins) {
  const map = new Map();

  [...checkins]
    .sort((a, b) => a.checkedAt.localeCompare(b.checkedAt))
    .forEach((entry) => {
      const key = dayKey(entry.checkedAt);
      const current = map.get(key);
      if (!current || (!current.encouragement && entry.encouragement)) {
        map.set(key, entry);
      }
    });

  return [...map.values()].sort((a, b) => a.checkedAt.localeCompare(b.checkedAt));
}

function diffDays(a, b) {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.round(ms / 86400000);
}

export function currentStreak(checkins) {
  const days = dedupeCheckins(checkins).map((entry) => dayKey(entry.checkedAt));
  if (!days.length) return 0;

  let streak = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    if (diffDays(days[index], days[index - 1]) === 1) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

export function buildSummary(record) {
  const checkinCount = dedupeCheckins(record.checkins).length;
  const streak = currentStreak(record.checkins);
  const completionRate = record.durationDays > 0 ? Math.min(1, checkinCount / record.durationDays) : 0;
  const remainingDays = Math.max(record.durationDays - checkinCount, 0);
  const nextMicroHabit = microHabitSuggestions[record.category] ?? microHabitSuggestions.unknown;

  if (checkinCount === 0) {
    return {
      checkinCount,
      currentStreak: streak,
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
    currentStreak: streak,
    completionRate,
    nextMicroHabit,
    summary: `你已经坚持了 ${checkinCount} 天，当前连续 ${streak} 天，${rhythm}。${milestone} 接下来建议在「${nextMicroHabit}」上继续建立微习惯。`,
  };
}

export function buildEncouragement(record) {
  const { checkinCount, currentStreak: streak } = buildSummary(record);

  if (streak >= 7) {
    return `连续 ${streak} 天完成 ${record.habitName}，你已经把承诺写进日常了。`;
  }

  if (streak >= 3) {
    return `${record.habitName} 已连续 ${streak} 天兑现，保持这个节奏，改变正在累积。`;
  }

  if (checkinCount <= 1) {
    return `第一笔 ${record.habitName} 记录已经落下，今天就是微习惯生长的起点。`;
  }

  return `又完成一次 ${record.habitName}，继续把「${microHabitSuggestions[record.category] ?? microHabitSuggestions.unknown}」留在明天。`;
}

export function buildPactView(record) {
  const normalizedCheckins = dedupeCheckins(record.checkins);
  const summaryData = buildSummary({ ...record, checkins: normalizedCheckins });

  return {
    id: record.id,
    wallet: record.wallet,
    habitName: record.habitName,
    category: record.category,
    frequencyLabel: record.frequencyLabel,
    frequencyCode: record.frequencyCode,
    durationDays: record.durationDays,
    stakeAmountWei: record.stakeAmountWei,
    startAt: record.startAt,
    lastCheckinAt: record.lastCheckinAt,
    completed: record.completed,
    rewardClaimed: Boolean(record.rewardClaimed),
    checkinCount: summaryData.checkinCount,
    currentStreak: summaryData.currentStreak,
    completionRate: summaryData.completionRate,
    nextMicroHabit: summaryData.nextMicroHabit,
    summary: summaryData.summary,
    latestEncouragement: record.latestEncouragement ?? null,
  };
}

export function buildOverview(wallet, pacts) {
  const views = pacts.map(buildPactView);
  const totalPacts = views.length;
  const activePacts = views.filter((item) => !item.completed).length;
  const totalCheckins = views.reduce((sum, item) => sum + item.checkinCount, 0);
  const bestStreak = views.reduce((max, item) => Math.max(max, item.currentStreak), 0);
  const currentActiveStreak = views
    .filter((item) => !item.completed)
    .reduce((max, item) => Math.max(max, item.currentStreak), 0);
  const totalDuration = views.reduce((sum, item) => sum + item.durationDays, 0);
  const completionRate = totalDuration > 0 ? Math.min(1, totalCheckins / totalDuration) : 0;
  const totalStakedWei = views.reduce((sum, item) => sum + BigInt(item.stakeAmountWei), 0n).toString();
  const categoryMap = new Map();

  views.forEach((item) => {
    categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1);
  });

  const recommendations = [];
  if (bestStreak < 3) {
    recommendations.push("先把最容易完成的动作固定在每天同一时间，让启动成本更低。");
  }
  if (completionRate < 0.5) {
    recommendations.push("建议优先把目标拆得更小，确保今天也能轻松完成一次。");
  }
  if (views.some((item) => item.category === "mental")) {
    recommendations.push("学习类习惯可以绑定到固定触发点，例如坐下后先读 2 页。");
  }
  if (views.some((item) => item.category === "diet")) {
    recommendations.push("饮食类习惯优先从喝水、备水果这类低门槛动作开始最稳。");
  }
  if (!recommendations.length) {
    recommendations.push("你已经形成不错节奏，可以继续增加一个新的微习惯作为下一阶段目标。");
  }

  return {
    wallet,
    totalPacts,
    activePacts,
    totalCheckins,
    bestStreak,
    currentActiveStreak,
    totalStakedWei,
    completionRate,
    categories: [...categoryMap.entries()].map(([category, count]) => ({ category, count })),
    recommendations: recommendations.slice(0, 4),
  };
}

export function sumStakeAmountWei(pacts) {
  return pacts.reduce((sum, pact) => sum + BigInt(pact.stakeAmountWei), 0n).toString();
}

export function createDashboardResponse(wallet, allPacts, walletPacts) {
  return {
    wallet,
    rewardPoolWei: sumStakeAmountWei(allPacts),
    pacts: walletPacts.map(buildPactView).sort((a, b) => Number(b.id) - Number(a.id)),
    overview: buildOverview(wallet, walletPacts),
  };
}
