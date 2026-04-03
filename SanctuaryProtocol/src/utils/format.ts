export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(num: number): string {
  return num.toLocaleString("zh-CN");
}
