import { stripHtml } from "../lib/format";
import { ComposeInput, OwnedSignalRecord } from "../types/domain";

const PRIVATE_SIGNALS_KEY = "seamphore-private-signals-v1";

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

function readStore() {
  if (typeof window === "undefined") {
    return {} as Record<string, OwnedSignalRecord[]>;
  }

  const raw = window.localStorage.getItem(PRIVATE_SIGNALS_KEY);

  if (!raw) {
    return {} as Record<string, OwnedSignalRecord[]>;
  }

  try {
    return JSON.parse(raw) as Record<string, OwnedSignalRecord[]>;
  } catch {
    return {} as Record<string, OwnedSignalRecord[]>;
  }
}

function writeStore(next: Record<string, OwnedSignalRecord[]>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRIVATE_SIGNALS_KEY, JSON.stringify(next));
}

export function loadPrivateSignals(address: string | null) {
  if (!address) {
    return [] as OwnedSignalRecord[];
  }

  const store = readStore();
  return store[normalizeAddress(address)] ?? [];
}

export function savePrivateSignal(address: string, input: ComposeInput) {
  const store = readStore();
  const key = normalizeAddress(address);
  const ts = Math.floor(Date.now() / 1000);
  const nextSignal: OwnedSignalRecord = {
    blockNumber: 0,
    content: stripHtml(input.contentHtml) || input.hook,
    id: -Date.now(),
    linked: 0,
    replies: 0,
    resonances: 0,
    storage: "local",
    title: input.hook.slice(0, 18) || "仅自己可见",
    ts,
    visibility: "private",
  };

  store[key] = [nextSignal, ...(store[key] ?? [])].sort((left, right) => right.ts - left.ts);
  writeStore(store);

  return nextSignal;
}

export function removePrivateSignal(address: string, signalId: number) {
  const store = readStore();
  const key = normalizeAddress(address);

  store[key] = (store[key] ?? []).filter((signal) => signal.id !== signalId);
  writeStore(store);
}
