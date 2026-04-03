const SIGNAL_VIEW_COUNTS_KEY = "seamphore-signal-view-counts-v1";

function readStore() {
  if (typeof window === "undefined") {
    return {} as Record<string, number>;
  }

  const raw = window.localStorage.getItem(SIGNAL_VIEW_COUNTS_KEY);

  if (!raw) {
    return {} as Record<string, number>;
  }

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
}

function writeStore(next: Record<string, number>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SIGNAL_VIEW_COUNTS_KEY, JSON.stringify(next));
}

export function loadSignalViewCounts() {
  return readStore();
}

export function incrementSignalViewCount(signalId: string) {
  const store = readStore();
  const nextCount = (store[signalId] ?? 0) + 1;

  writeStore({
    ...store,
    [signalId]: nextCount,
  });

  return nextCount;
}
