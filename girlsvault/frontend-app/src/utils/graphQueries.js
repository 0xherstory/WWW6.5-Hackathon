// The Graph GraphQL 查询工具
// VITE_GRAPH_URL 未配置时自动降级到直接 RPC 读取

const GRAPH_URL = import.meta.env.VITE_GRAPH_URL || "";

export const isGraphAvailable = () => Boolean(GRAPH_URL);

async function graphQuery(query, variables = {}) {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error("Graph query failed");
  const { data, errors } = await res.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}

// ── 我的参与记录 ──────────────────────────────────────────

const MY_ACTIVITY_QUERY = `
  query MyActivity($address: String!) {
    donations(
      where: { donor: $address }
      orderBy: timestamp
      orderDirection: desc
      first: 50
    ) {
      id
      project { id name address }
      amount
      tag
      timestamp
      txHash
    }
    proofSubmissions(
      where: { validator: $address }
      orderBy: timestamp
      orderDirection: desc
      first: 50
    ) {
      id
      project { id name address }
      milestoneId
      proofUri
      timestamp
      txHash
    }
  }
`;

export async function fetchMyActivityFromGraph(userAddress) {
  if (!GRAPH_URL) throw new Error("Graph URL not configured");

  const data = await graphQuery(MY_ACTIVITY_QUERY, { address: userAddress.toLowerCase() });
  const activities = [];

  for (const d of data.donations || []) {
    activities.push({
      type: "donate",
      project: d.project.name,
      projectAddr: d.project.address,
      amount: (BigInt(d.amount) / BigInt(1e14)).toString() / 1e4 + "",
      tag: d.tag,
      timestamp: Number(d.timestamp),
      txHash: d.txHash,
    });
  }

  for (const p of data.proofSubmissions || []) {
    activities.push({
      type: "proof",
      project: p.project.name,
      projectAddr: p.project.address,
      milestoneId: p.milestoneId,
      proofUri: p.proofUri || "",
      timestamp: Number(p.timestamp),
      txHash: p.txHash,
    });
  }

  activities.sort((a, b) => b.timestamp - a.timestamp);
  return activities;
}

// ── 项目挑战记录 ──────────────────────────────────────────

const PROJECT_CHALLENGES_QUERY = `
  query ProjectChallenges($projectId: String!) {
    challenges(where: { project: $projectId }, orderBy: challengedAt, orderDirection: desc) {
      id
      milestoneId
      challenger
      evidenceCID
      challengedAt
      forVotes
      againstVotes
      resolved
      upheld
      votes(orderBy: timestamp, orderDirection: asc) {
        voter
        support
        weight
        timestamp
      }
    }
  }
`;

export async function fetchProjectChallengesFromGraph(projectAddress) {
  if (!GRAPH_URL) throw new Error("Graph URL not configured");
  const data = await graphQuery(PROJECT_CHALLENGES_QUERY, { projectId: projectAddress.toLowerCase() });
  return (data.challenges || []).map(c => ({
    milestoneId: c.milestoneId,
    challenger: c.challenger,
    evidenceCID: c.evidenceCID,
    challengedAt: Number(c.challengedAt),
    forVotes: Number(c.forVotes),
    againstVotes: Number(c.againstVotes),
    resolved: c.resolved,
    upheld: c.upheld,
    votes: (c.votes || []).map(v => ({
      voter: v.voter,
      support: v.support,
      weight: Number(v.weight),
      timestamp: Number(v.timestamp),
    })),
  }));
}

// ── 验证人质押记录 ────────────────────────────────────────

const PROJECT_STAKES_QUERY = `
  query ProjectStakes($projectId: String!) {
    validatorStakes(where: { project: $projectId }) {
      validator
      amount
      slashed
      timestamp
    }
  }
`;

export async function fetchProjectStakesFromGraph(projectAddress) {
  if (!GRAPH_URL) throw new Error("Graph URL not configured");
  const data = await graphQuery(PROJECT_STAKES_QUERY, { projectId: projectAddress.toLowerCase() });
  return (data.validatorStakes || []).map(s => ({
    validator: s.validator,
    amount: s.amount,
    slashed: s.slashed,
    timestamp: Number(s.timestamp),
  }));
}

// ── 项目通知事件 ───────────────────────────────────────────

const PROJECT_EVENTS_QUERY = `
  query ProjectEvents($projectIds: [ID!]!) {
    projectEvents(
      where: { project_in: $projectIds }
      orderBy: blockNumber
      orderDirection: desc
      first: 200
    ) {
      id
      project { id name }
      eventType
      milestoneId
      upheld
      timestamp
      blockNumber
      txHash
    }
  }
`;

function buildNotifFromGraphEvent(e) {
  const base = {
    id: e.id,
    type: e.eventType,
    projectName: e.project.name,
    projectAddr: e.project.id,
    blockNumber: Number(e.blockNumber),
    txHash: e.txHash,
    timestamp: Number(e.timestamp),
  };
  const mid = e.milestoneId + 1; // 0-indexed → 显示从1开始
  switch (e.eventType) {
    case "MilestoneVerified":
      return { ...base, icon: "✅", msg: `里程碑 #${mid} 通过验证，进入 3 天争议窗口`, level: "success" };
    case "MilestoneChallenged":
      return { ...base, icon: "⚠️", msg: `里程碑 #${mid} 遭到举报，社区投票已开始`, level: "warn" };
    case "ChallengeResolved":
      return e.upheld
        ? { ...base, icon: "🚨", msg: `举报成立，你的捐款已自动退回钱包`, level: "error" }
        : { ...base, icon: "☑️", msg: `举报不成立，里程碑资金将正常释放`, level: "success" };
    case "FundsReleased":
      return { ...base, icon: "💸", msg: `里程碑 #${mid} 资金已释放到受益方`, level: "info" };
    case "EmergencyVoted":
      return { ...base, icon: "🗳️", msg: `有捐款人发起了紧急退款投票，超过 50% 将自动退款`, level: "warn" };
    case "EmergencyRefundApproved":
      return { ...base, icon: "🆘", msg: `紧急退款已批准，可前往领取退款`, level: "error" };
    default:
      return null;
  }
}

/**
 * 从 The Graph 查询通知事件
 * @param {Object} projectMap  { addr: name }（地址需小写）
 * @param {number} lastSeenBlock  已读区块号
 * @param {Set<string>} readIds
 * @returns {Promise<{all: Notif[], unread: Notif[], currentBlock: number}>}
 */
export async function fetchNotificationsFromGraph(projectMap, lastSeenBlock, readIds = new Set()) {
  const projectIds = Object.keys(projectMap).map(a => a.toLowerCase());
  if (!projectIds.length) return { all: [], unread: [], currentBlock: 0 };

  const data = await graphQuery(PROJECT_EVENTS_QUERY, { projectIds });
  const raw = (data.projectEvents || [])
    .map(buildNotifFromGraphEvent)
    .filter(Boolean);

  // EmergencyVoted 每个项目只保留最新一条
  const seen = new Set();
  const all = raw.filter(n => {
    if (n.type !== "EmergencyVoted") return true;
    const key = `EmergencyVoted-${n.projectAddr}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const maxBlock = all.length > 0 ? Math.max(...all.map(n => n.blockNumber)) : 0;
  const unread = all.filter(n => n.blockNumber > lastSeenBlock && !readIds.has(n.id));

  return { all, unread, currentBlock: maxBlock };
}

// ── 全局统计 ──────────────────────────────────────────────

const GLOBAL_STATS_QUERY = `
  query GlobalStats {
    projects(first: 1000) {
      totalDonated
      totalReleased
      emergencyApproved
    }
  }
`;

export async function fetchGlobalStatsFromGraph() {
  if (!GRAPH_URL) throw new Error("Graph URL not configured");
  const data = await graphQuery(GLOBAL_STATS_QUERY);
  const projects = data.projects || [];
  const totalRaised = projects.reduce((sum, p) => sum + Number(BigInt(p.totalDonated) / BigInt(1e14)) / 1e4, 0);
  const projectCount = projects.length;
  const refundedCount = projects.filter(p => p.emergencyApproved).length;
  return { projectCount, totalRaised: totalRaised.toFixed(2), refundedCount };
}
