import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SelectedCard } from "@/types/card";

interface CardState {
  spreadType: string | null;
  selectedCards: SelectedCard[];
  setSpreadType: (type: string) => void;
  selectCard: (card: SelectedCard) => void;
  revealCard: (position: number) => void;
  clearSelection: () => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      spreadType: null,
      selectedCards: [],
      setSpreadType: (type) => set({ spreadType: type }),
      selectCard: (card) =>
        set((state) => ({
          selectedCards: [...state.selectedCards, card],
        })),
      revealCard: (position) =>
        set((state) => ({
          selectedCards: state.selectedCards.map((c) =>
            c.position === position ? { ...c, isRevealed: true } : c
          ),
        })),
      clearSelection: () => set({ spreadType: null, selectedCards: [] }),
    }),
    {
      name: "card-storage",
    }
  )
);
