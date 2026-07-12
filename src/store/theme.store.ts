'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeMode, AccentColor } from '@/config/theme.config';
import { themeConfig } from '@/config/theme.config';
import type { TableDensity } from '@/config/table.config';

interface ThemeState {
  mode: ThemeMode;
  accentColor: AccentColor;
  borderRadius: string;
  density: TableDensity;

  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setBorderRadius: (radius: string) => void;
  setDensity: (density: TableDensity) => void;
  resetToDefaults: () => void;
}

const defaults = {
  mode: themeConfig.defaultMode as ThemeMode,
  accentColor: themeConfig.defaultAccentColor as AccentColor,
  borderRadius: themeConfig.defaultBorderRadius,
  density: 'default' as TableDensity,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...defaults,

      setMode: (mode) => set({ mode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      setDensity: (density) => set({ density }),
      resetToDefaults: () => set(defaults),
    }),
    {
      name: 'assetflow-theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
