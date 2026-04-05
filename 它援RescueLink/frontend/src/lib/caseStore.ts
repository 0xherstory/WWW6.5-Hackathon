/**
 * In-memory case store with localStorage persistence.
 * TODO: Replace with Supabase or other backend.
 *
 * This module is the single source of truth for published cases.
 * The homepage reads from here; the publish flow writes to here.
 */

import type { CaseItem } from '@/data/mockData';
import { mockCases } from '@/data/mockData';

const STORAGE_KEY = 'rescuelink_published_cases';

let _publishedCases: CaseItem[] = [];
let _initialized = false;

function init() {
  if (_initialized) return;
  _initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      _publishedCases = JSON.parse(raw) as CaseItem[];
    }
  } catch {
    _publishedCases = [];
  }
}

/** All cases: user-published (newest first) + seed mock data */
export function getAllCases(): CaseItem[] {
  init();
  return [..._publishedCases, ...mockCases];
}

/** Get a single case by id */
export function getCaseById(id: string): CaseItem | undefined {
  init();
  return _publishedCases.find((c) => c.id === id) || mockCases.find((c) => c.id === id);
}

/** Add a newly published case (prepend so it shows first) */
export function addCase(c: CaseItem): void {
  init();
  _publishedCases = [c, ..._publishedCases];
  persist();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_publishedCases));
  } catch {
    console.warn('[caseStore] localStorage write failed');
  }
}

/** Next sequential case number */
export function nextCaseNumber(): number {
  init();
  const existing = _publishedCases.length;
  return 246 + existing; // mock cases use 241-245
}
