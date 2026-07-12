'use client';

import { create } from 'zustand';

interface LoadingState {
  globalLoading: boolean;
  loadingKeys: Set<string>;

  setGlobalLoading: (loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAll: () => void;
}

export const useLoadingStore = create<LoadingState>()((set, get) => ({
  globalLoading: false,
  loadingKeys: new Set(),

  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  startLoading: (key) =>
    set((state) => {
      const next = new Set(state.loadingKeys);
      next.add(key);
      return { loadingKeys: next };
    }),

  stopLoading: (key) =>
    set((state) => {
      const next = new Set(state.loadingKeys);
      next.delete(key);
      return { loadingKeys: next };
    }),

  isLoading: (key) => get().loadingKeys.has(key),

  isAnyLoading: () => get().globalLoading || get().loadingKeys.size > 0,

  clearAll: () => set({ globalLoading: false, loadingKeys: new Set() }),
}));
