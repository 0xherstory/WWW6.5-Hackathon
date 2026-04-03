import React from "react";
import { create } from "zustand";

interface UIState {
  isLoading: boolean;
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  setLoading: (isLoading: boolean) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  isModalOpen: false,
  modalContent: null,
  toast: null,
  setLoading: (isLoading) => set({ isLoading }),
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
