'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { themeConfig } from '@/config/theme.config';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={themeConfig.defaultMode}
      enableSystem
      disableTransitionOnChange
      storageKey="assetflow-theme-mode"
    >
      {children}
    </NextThemesProvider>
  );
}
