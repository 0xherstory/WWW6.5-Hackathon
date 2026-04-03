import { useState, useCallback, useEffect } from "react";

export interface OfflineSOSRecord {
  latitude: number;
  longitude: number;
  timestamp: number;
  attemptCount: number;
}

const STORAGE_KEY = "herguard_offline_sos";

function loadOffline(): OfflineSOSRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOffline(records: OfflineSOSRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useOfflineBuffer() {
  const [pendingRecords, setPendingRecords] = useState<OfflineSOSRecord[]>(loadOffline);

  useEffect(() => {
    setPendingRecords(loadOffline());
  }, []);

  const addRecord = useCallback((lat: number, lng: number) => {
    const record: OfflineSOSRecord = {
      latitude: Math.round(lat * 1_000_000),
      longitude: Math.round(lng * 1_000_000),
      timestamp: Math.floor(Date.now() / 1000),
      attemptCount: 1,
    };
    const records = [...loadOffline(), record];
    saveOffline(records);
    setPendingRecords(records);
    return record;
  }, []);

  const removeRecord = useCallback((index: number) => {
    const records = loadOffline();
    records.splice(index, 1);
    saveOffline(records);
    setPendingRecords([...records]);
  }, []);

  const clearAll = useCallback(() => {
    saveOffline([]);
    setPendingRecords([]);
  }, []);

  const incrementAttempt = useCallback((index: number) => {
    const records = loadOffline();
    if (records[index]) {
      records[index].attemptCount += 1;
      saveOffline(records);
      setPendingRecords([...records]);
    }
  }, []);

  return { pendingRecords, addRecord, removeRecord, clearAll, incrementAttempt };
}
