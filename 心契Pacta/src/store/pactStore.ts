import { create } from "zustand";
import type { Habit } from "@/data/habitsData";

export interface Pact {
  id: string;
  habit: Habit;
  stakeAmount: number;
  frequency: "daily" | "weekdays" | "custom";
  startDate: string;
  endDate: string;
  checkins: string[]; // ISO date strings
  status: "active" | "completed" | "failed";
  createdAt: string;
}

interface PactStore {
  pacts: Pact[];
  addPact: (pact: Omit<Pact, "id" | "checkins" | "status" | "createdAt">) => void;
  checkin: (pactId: string, date: string) => void;
  removePact: (pactId: string) => void;
}

export const usePactStore = create<PactStore>((set) => ({
  pacts: [],
  addPact: (pact) =>
    set((state) => ({
      pacts: [
        ...state.pacts,
        {
          ...pact,
          id: crypto.randomUUID(),
          checkins: [],
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  checkin: (pactId, date) =>
    set((state) => ({
      pacts: state.pacts.map((p) =>
        p.id === pactId
          ? {
              ...p,
              checkins: p.checkins.includes(date)
                ? p.checkins.filter((d) => d !== date)
                : [...p.checkins, date],
            }
          : p
      ),
    })),
  removePact: (pactId) =>
    set((state) => ({
      pacts: state.pacts.filter((p) => p.id !== pactId),
    })),
}));
