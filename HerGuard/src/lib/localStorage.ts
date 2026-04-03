const SOS_HISTORY_KEY = "herguard_sos_history";

export interface SOSHistoryRecord {
  latitude: number;
  longitude: number;
  timestamp: number;
  txHash?: string;
  status: "success" | "offline" | "pending";
}

export function loadSOSHistory(): SOSHistoryRecord[] {
  try {
    const raw = localStorage.getItem(SOS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSOSHistory(record: SOSHistoryRecord) {
  const history = loadSOSHistory();
  history.unshift(record);
  localStorage.setItem(SOS_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}
