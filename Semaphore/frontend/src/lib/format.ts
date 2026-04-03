export function truncateAddress(address: string, start = 6, end = 4) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatWalletLabel(address: string, fallback = "已连接钱包") {
  return truncateAddress(address) || fallback;
}

function toDate(timestamp: number) {
  return new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
}

export function formatDateLabel(timestamp: number) {
  return toDate(timestamp).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTimeLabel(timestamp: number) {
  return toDate(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTimeLabel(timestamp: number) {
  const delta = Date.now() - toDate(timestamp).getTime();

  if (delta < 60_000) {
    return "刚刚";
  }

  if (delta < 3_600_000) {
    return `${Math.floor(delta / 60_000)} 分钟前`;
  }

  if (delta < 86_400_000) {
    return `${Math.floor(delta / 3_600_000)} 小时前`;
  }

  return `${Math.floor(delta / 86_400_000)} 天前`;
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function generateCid(prefix = "Qm") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = prefix;

  for (let index = 0; index < 44; index += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return output;
}

export function formatCountdown(ms: number) {
  if (ms <= 0) {
    return "已过期";
  }

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
