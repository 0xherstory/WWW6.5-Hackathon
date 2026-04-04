import { ethers } from "ethers";
import { PROJECT_ABI } from "./contracts";
import { isGraphAvailable, fetchNotificationsFromGraph } from "./graphQueries";

// localStorage: 按区块号记录整体已读位置（全部已读用）
const lsBlockKey = (acc) => `gv_notif_block_${acc.toLowerCase()}`;
// localStorage: 单条已读的 id 集合
const lsReadKey  = (acc) => `gv_notif_read_${acc.toLowerCase()}`;

export function getLastSeenBlock(account) {
  return Number(localStorage.getItem(lsBlockKey(account)) || 0);
}

export function markAllRead(account, currentBlock) {
  localStorage.setItem(lsBlockKey(account), String(currentBlock));
}

export function getReadIds(account) {
  try { return new Set(JSON.parse(localStorage.getItem(lsReadKey(account)) || "[]")); }
  catch { return new Set(); }
}

export function markOneRead(account, id) {
  const ids = getReadIds(account);
  ids.add(id);
  localStorage.setItem(lsReadKey(account), JSON.stringify([...ids]));
}

export function markAllReadById(account, ids, currentBlock) {
  localStorage.setItem(lsReadKey(account), JSON.stringify(ids));
  localStorage.setItem(lsBlockKey(account), String(currentBlock));
}

// 要监听的事件及对应的通知文案
function buildNotif(eventName, log, projectName, blockTimestamps) {
  const ts = blockTimestamps[log.blockNumber] || 0;
  const base = {
    id: `${log.transactionHash}-${log.logIndex}`,
    type: eventName,
    projectName,
    blockNumber: log.blockNumber,
    txHash: log.transactionHash,
    timestamp: ts,
  };
  switch (eventName) {
    case "MilestoneVerified":
      return { ...base, icon: "✅", msg: `里程碑 #${Number(log.args[0]) + 1} 通过验证，进入 3 天争议窗口`, level: "success" };
    case "MilestoneChallenged":
      return { ...base, icon: "⚠️", msg: `里程碑 #${Number(log.args[0]) + 1} 遭到举报，社区投票已开始`, level: "warn" };
    case "ChallengeResolved":
      return log.args[1]
        ? { ...base, icon: "🚨", msg: `举报成立，你的捐款已自动退回钱包`, level: "error" }
        : { ...base, icon: "☑️", msg: `举报不成立，里程碑资金将正常释放`, level: "success" };
    case "FundsReleased":
      return { ...base, icon: "💸", msg: `里程碑 #${Number(log.args[0]) + 1} 资金已释放到受益方`, level: "info" };
    case "EmergencyVoted":
      return { ...base, icon: "🗳️", msg: `有捐款人发起了紧急退款投票，超过 50% 将自动退款`, level: "warn" };
    case "EmergencyRefundApproved":
      return { ...base, icon: "🆘", msg: `紧急退款已批准，可前往领取退款`, level: "error" };
    default:
      return null;
  }
}

const EVENT_NAMES = [
  "MilestoneVerified",
  "MilestoneChallenged",
  "ChallengeResolved",
  "FundsReleased",
  "EmergencyVoted",
  "EmergencyRefundApproved",
];

/**
 * 扫描用户参与项目的事件，返回通知列表
 * 优先走 The Graph（无 RPC 限制），不可用时降级为 queryFilter
 * @param {ethers.Provider} provider
 * @param {Object} projectMap  { addr: projectName }
 * @param {number} lastSeenBlock  上次已读区块号（0 = 首次，扫最近 maxInitRange 块）
 * @param {Set<string>} readIds  已单独标记已读的通知 id 集合
 * @returns {Promise<{all: Notif[], unread: Notif[], currentBlock: number}>}
 */
export async function fetchNotifications(provider, projectMap, lastSeenBlock, readIds = new Set(), maxInitRange = 50000) {
  const addrs = Object.keys(projectMap);
  if (!addrs.length) return { all: [], unread: [], currentBlock: 0 };

  // ── 优先走 The Graph ───────────────────────────────────
  if (isGraphAvailable()) {
    try {
      return await fetchNotificationsFromGraph(projectMap, lastSeenBlock, readIds);
    } catch (e) {
      console.warn("Graph query failed, falling back to RPC:", e);
    }
  }

  const currentBlock = await provider.getBlockNumber();
  const scanFrom = lastSeenBlock > 0
    ? lastSeenBlock + 1
    : Math.max(0, currentBlock - maxInitRange);

  const allLogs = [];

  await Promise.all(addrs.map(async (addr) => {
    const contract = new ethers.Contract(addr, PROJECT_ABI, provider);
    await Promise.all(EVENT_NAMES.map(async (ev) => {
      try {
        const logs = await contract.queryFilter(ev, scanFrom);
        logs.forEach(log => allLogs.push({ log, addr, ev }));
      } catch {}
    }));
  }));

  if (!allLogs.length) return { all: [], unread: [], currentBlock };

  // 批量获取区块时间戳
  const uniqueBlocks = [...new Set(allLogs.map(l => l.log.blockNumber))];
  const blockTimestamps = {};
  await Promise.all(uniqueBlocks.map(async (bn) => {
    try {
      const block = await provider.getBlock(bn);
      blockTimestamps[bn] = block?.timestamp || 0;
    } catch {}
  }));

  const raw = allLogs
    .map(({ log, addr, ev }) => buildNotif(ev, log, projectMap[addr], blockTimestamps))
    .filter(Boolean)
    .sort((a, b) => b.blockNumber - a.blockNumber);

  // EmergencyVoted 每次投票都触发，同一项目只保留最新一条避免刷屏
  const seen = new Set();
  const all = raw.filter(n => {
    if (n.type !== "EmergencyVoted") return true;
    const key = `EmergencyVoted-${n.projectName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 未读 = 区块号比上次整体已读新 且 没有被单独标记已读
  const unread = all.filter(n => n.blockNumber > lastSeenBlock && !readIds.has(n.id));

  return { all, unread, currentBlock };
}

export function formatNotifTime(timestamp) {
  if (!timestamp) return "";
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}
