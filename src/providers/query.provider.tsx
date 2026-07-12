'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appConfig } from '@/config/app.config';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: appConfig.cache.defaultStaleTimeMs,
        gcTime: appConfig.cache.defaultGcTimeMs,
        retry: (failureCount, error) => {
          if (
            error instanceof Error &&
            'statusCode' in error &&
            typeof (error as { statusCode?: number }).statusCode === 'number'
          ) {
            const status = (error as { statusCode: number }).statusCode;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
