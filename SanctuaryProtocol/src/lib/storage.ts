import { STORAGE_KEYS } from "@/config/constants";

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage set error:", error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export const storage = {
  getGuestMode: () => getStorageItem(STORAGE_KEYS.GUEST_MODE, false),
  setGuestMode: (value: boolean) => setStorageItem(STORAGE_KEYS.GUEST_MODE, value),
  
  getDraftJournal: <T>() => getStorageItem<T | null>(STORAGE_KEYS.DRAFT_JOURNAL, null),
  setDraftJournal: <T>(value: T) => setStorageItem(STORAGE_KEYS.DRAFT_JOURNAL, value),
  clearDraftJournal: () => removeStorageItem(STORAGE_KEYS.DRAFT_JOURNAL),
  
  getCardSelection: <T>() => getStorageItem<T | null>(STORAGE_KEYS.CARD_SELECTION, null),
  setCardSelection: <T>(value: T) => setStorageItem(STORAGE_KEYS.CARD_SELECTION, value),
  clearCardSelection: () => removeStorageItem(STORAGE_KEYS.CARD_SELECTION),
};
