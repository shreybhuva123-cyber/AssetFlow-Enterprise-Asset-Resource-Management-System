'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TableDensity } from '@/config/table.config';

interface UserPreferences {
  currency: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timezone: string;
  tableDensity: TableDensity;
  sidebarCompact: boolean;
  showWelcomeBanner: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  language: string;
  pageSize: number;
}

interface PreferencesState extends UserPreferences {
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: UserPreferences = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  tableDensity: 'default',
  sidebarCompact: false,
  showWelcomeBanner: true,
  emailNotifications: true,
  desktopNotifications: false,
  language: 'en',
  pageSize: 25,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setPreference: (key, value) => set({ [key]: value }),
      setPreferences: (preferences) => set(preferences),
      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'assetflow-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
