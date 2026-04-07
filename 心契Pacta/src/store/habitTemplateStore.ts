import { create } from "zustand";
import { persist } from "zustand/middleware";
import { habits, type Habit, type HabitCategory } from "@/data/habitsData";

type HabitPatch = Partial<Pick<Habit, "name" | "description" | "emoji" | "defaultStake" | "type">>;

type HabitTemplateStore = {
  customHabits: Habit[];
  edits: Record<string, HabitPatch>;
  addCustomHabit: (habit: Omit<Habit, "id">) => void;
  updateHabitTemplate: (habitId: string, patch: HabitPatch) => void;
  removeCustomHabit: (habitId: string) => void;
  getHabitsForCategory: (category: HabitCategory) => Habit[];
};

const allowedCategories = new Set<HabitCategory>([
  "mental",
  "physical",
  "diet",
  "happiness",
  "business",
  "productivity",
]);

const normalizeHabit = (item: Partial<Habit>, fallbackCategory: HabitCategory = "mental"): Habit => ({
  id: item.id ?? `custom-${crypto.randomUUID()}`,
  name: item.name?.trim() || "未命名挑战",
  description: item.description?.trim() || "自定义挑战",
  emoji: item.emoji?.trim() || "📝",
  category: allowedCategories.has(item.category as HabitCategory) ? (item.category as HabitCategory) : fallbackCategory,
  type: item.type === "time" ? "time" : "quantity",
  defaultStake: Number.isFinite(item.defaultStake) ? Math.max(0.01, Number(item.defaultStake)) : 0.1,
});

export const useHabitTemplateStore = create<HabitTemplateStore>()(
  persist(
    (set, get) => ({
      customHabits: [],
      edits: {},
      addCustomHabit: (habit) =>
        set((state) => ({
          customHabits: [
            ...state.customHabits,
            normalizeHabit({
              ...habit,
              id: `custom-${crypto.randomUUID()}`,
            }, habit.category),
          ],
        })),
      updateHabitTemplate: (habitId, patch) =>
        set((state) => {
          const cleanPatch: HabitPatch = {};
          if (patch.name !== undefined) cleanPatch.name = patch.name.trim();
          if (patch.description !== undefined) cleanPatch.description = patch.description.trim();
          if (patch.emoji !== undefined) cleanPatch.emoji = patch.emoji.trim();
          if (patch.type !== undefined) cleanPatch.type = patch.type;
          if (patch.defaultStake !== undefined) cleanPatch.defaultStake = Math.max(0.01, Number(patch.defaultStake) || 0.1);

          const isCustom = state.customHabits.some((h) => h.id === habitId);
          if (isCustom) {
            return {
              customHabits: state.customHabits.map((h) => (h.id === habitId ? { ...h, ...cleanPatch } : h)),
            };
          }
          return {
            edits: {
              ...state.edits,
              [habitId]: {
                ...(state.edits[habitId] ?? {}),
                ...cleanPatch,
              },
            },
          };
        }),
      removeCustomHabit: (habitId) =>
        set((state) => ({
          customHabits: state.customHabits.filter((h) => h.id !== habitId),
          edits: Object.fromEntries(Object.entries(state.edits).filter(([id]) => id !== habitId)),
        })),
      getHabitsForCategory: (category) => {
        const { customHabits, edits } = get();
        const base = habits
          .filter((h) => h.category === category)
          .map((h) => ({ ...h, ...(edits[h.id] ?? {}) }));
        const custom = customHabits
          .filter((h) => h.category === category)
          .map((h) => ({ ...h, ...(edits[h.id] ?? {}) }));
        return [...base, ...custom];
      },
    }),
    {
      name: "pacta-habit-template-v1",
      version: 1,
      partialize: (state) => ({ customHabits: state.customHabits, edits: state.edits }),
    },
  ),
);

