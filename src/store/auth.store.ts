'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserProfile } from '@/types/auth';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;
  setAuth: (user: User, profile: UserProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isHydrated: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),

      setAuth: (user, profile) => set({ user, profile, isLoading: false }),

      clearAuth: () => set({ user: null, profile: null, isLoading: false }),
    }),
    {
      name: 'assetflow-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
