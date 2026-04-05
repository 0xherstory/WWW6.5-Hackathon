import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReferenceModuleKey } from "@/data/microHabitReference";

export type AddedMicroHabit = {
  id: string;
  module: ReferenceModuleKey;
  methodNo: number;
  title: string;
  quote: string;
  sourceTag: "参考微习惯" | "自定义挑战";
  frequency: "daily" | "weekly";
  reminderTime: string;
  checkins: string[];
  createdAt: string;
};

type MicroHabitStore = {
  added: AddedMicroHabit[];
  addHabit: (habit: Omit<AddedMicroHabit, "createdAt" | "sourceTag" | "frequency" | "reminderTime" | "checkins">) => void;
  addCustomHabit: (habit: {
    title: string;
    module: ReferenceModuleKey;
    quote?: string;
    frequency: "daily" | "weekly";
    reminderTime: string;
  }) => void;
  removeHabit: (id: string) => void;
  removeMany: (ids: string[]) => void;
  hasHabit: (id: string) => boolean;
  checkinToday: (id: string) => { ok: boolean; message: string };
  updateHabit: (id: string, patch: Partial<Pick<AddedMicroHabit, "title" | "quote" | "frequency" | "reminderTime">>) => void;
};

function normalizeAdded(items: Partial<AddedMicroHabit>[] | undefined): AddedMicroHabit[] {
  if (!items?.length) return [];
  return items.map((item) => ({
    id: item.id ?? crypto.randomUUID(),
    module: (item.module as ReferenceModuleKey) ?? "behavior",
    methodNo: item.methodNo ?? 0,
    title: item.title ?? "未命名微习惯",
    quote: item.quote ?? "",
    sourceTag: item.sourceTag === "自定义挑战" ? "自定义挑战" : "参考微习惯",
    frequency: item.frequency ?? "daily",
    reminderTime: item.reminderTime ?? "21:00",
    checkins: Array.isArray(item.checkins) ? item.checkins : [],
    createdAt: item.createdAt ?? new Date().toISOString(),
  }));
}

export const useMicroHabitStore = create<MicroHabitStore>()(
  persist(
    (set, get) => ({
      added: [],
      addHabit: (habit) =>
        set((state) => {
          if (state.added.some((item) => item.id === habit.id)) return state;
          return {
            added: [
              ...state.added,
              {
                ...habit,
                sourceTag: "参考微习惯",
                frequency: "daily",
                reminderTime: "21:00",
                checkins: [],
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),
      addCustomHabit: (habit) =>
        set((state) => {
          const moduleCount = state.added.filter((item) => item.module === habit.module).length;
          return {
            added: [
              ...state.added,
              {
                id: `custom-${crypto.randomUUID()}`,
                module: habit.module,
                methodNo: moduleCount + 1,
                title: habit.title.trim(),
                quote: habit.quote?.trim() || "我的自定义挑战",
                sourceTag: "自定义挑战",
                frequency: habit.frequency,
                reminderTime: habit.reminderTime,
                checkins: [],
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),
      removeHabit: (id) =>
        set((state) => ({
          added: state.added.filter((item) => item.id !== id),
        })),
      removeMany: (ids) =>
        set((state) => {
          const setIds = new Set(ids);
          return { added: state.added.filter((item) => !setIds.has(item.id)) };
        }),
      hasHabit: (id) => get().added.some((item) => item.id === id),
      checkinToday: (id) => {
        const today = new Date().toISOString().slice(0, 10);
        const item = get().added.find((h) => h.id === id);
        if (!item) return { ok: false, message: "未找到该微习惯" };
        if (item.checkins.includes(today)) return { ok: false, message: "今天已打卡" };
        set((state) => ({
          added: state.added.map((h) => (h.id === id ? { ...h, checkins: [...h.checkins, today] } : h)),
        }));
        return { ok: true, message: "打卡成功" };
      },
      updateHabit: (id, patch) =>
        set((state) => ({
          added: state.added.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
    }),
    {
      name: "pacta-micro-habit-ref-v1",
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as { added?: Partial<AddedMicroHabit>[] } | undefined;
        return {
          added: normalizeAdded(state?.added),
        };
      },
      partialize: (state) => ({ added: state.added }),
    },
  ),
);

