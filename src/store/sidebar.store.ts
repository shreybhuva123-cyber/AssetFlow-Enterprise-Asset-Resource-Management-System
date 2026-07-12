'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  isExpanded: boolean;
  isMobileOpen: boolean;
  activeGroup: string | null;
  pinnedItems: string[];

  setExpanded: (isExpanded: boolean) => void;
  toggleExpanded: () => void;
  setMobileOpen: (isMobileOpen: boolean) => void;
  toggleMobileOpen: () => void;
  setActiveGroup: (group: string | null) => void;
  pinItem: (path: string) => void;
  unpinItem: (path: string) => void;
  togglePinItem: (path: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isExpanded: true,
      isMobileOpen: false,
      activeGroup: null,
      pinnedItems: [],

      setExpanded: (isExpanded) => set({ isExpanded }),
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
      toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setActiveGroup: (activeGroup) => set({ activeGroup }),

      pinItem: (path) => set((state) => ({
        pinnedItems: state.pinnedItems.includes(path) ? state.pinnedItems : [...state.pinnedItems, path],
      })),

      unpinItem: (path) => set((state) => ({
        pinnedItems: state.pinnedItems.filter((p) => p !== path),
      })),

      togglePinItem: (path) => {
        const { pinnedItems } = get();
        if (pinnedItems.includes(path)) {
          set({ pinnedItems: pinnedItems.filter((p) => p !== path) });
        } else {
          set({ pinnedItems: [...pinnedItems, path] });
        }
      },
    }),
    {
      name: 'assetflow-sidebar',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        pinnedItems: state.pinnedItems,
        activeGroup: state.activeGroup,
      }),
    },
  ),
);
