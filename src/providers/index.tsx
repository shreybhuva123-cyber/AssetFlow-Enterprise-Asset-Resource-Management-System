'use client';

import { QueryProvider } from './query.provider';
import { ThemeProvider } from './theme.provider';
import { ToastProvider } from './toast.provider';
import { AuthProvider } from './auth.provider';
import { RealtimeProvider } from './realtime.provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RealtimeProvider>
            {children}
            <ToastProvider />
          </RealtimeProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
