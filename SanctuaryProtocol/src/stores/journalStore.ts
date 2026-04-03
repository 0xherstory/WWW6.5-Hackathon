import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JournalState {
  content: string;
  wordCard: string | null;
  isEncrypted: boolean;
  setContent: (content: string) => void;
  setWordCard: (word: string | null) => void;
  setEncrypted: (isEncrypted: boolean) => void;
  clearJournal: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      content: "",
      wordCard: null,
      isEncrypted: false,
      setContent: (content) => set({ content }),
      setWordCard: (wordCard) => set({ wordCard }),
      setEncrypted: (isEncrypted) => set({ isEncrypted }),
      clearJournal: () => set({ content: "", wordCard: null, isEncrypted: false }),
    }),
    {
      name: "journal-storage",
    }
  )
);
