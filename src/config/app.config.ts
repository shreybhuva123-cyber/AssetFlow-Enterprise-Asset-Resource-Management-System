import { z } from 'zod';

const appEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('AssetFlow'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.1.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

function parseAppEnv() {
  const result = appEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    throw new Error(`App configuration error: ${result.error.message}`);
  }

  return result.data;
}

const env = parseAppEnv();

export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION,
  url: env.NEXT_PUBLIC_APP_URL,
  env: env.NODE_ENV,

  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  meta: {
    title: env.NEXT_PUBLIC_APP_NAME,
    description: 'Enterprise Asset & Resource Management System',
    keywords: ['asset management', 'maintenance', 'procurement', 'depreciation'] as string[],
    authors: [{ name: 'AssetFlow Team' }] as { name: string }[],
    themeColor: '#0f172a',
  },

  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100] as const,
    maxPageSize: 100,
  },

  upload: {
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxFilesPerUpload: 5,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ] as const,
  },

  cache: {
    defaultStaleTimeMs: 5 * 60 * 1000,        // 5 minutes
    shortStaleTimeMs: 30 * 1000,               // 30 seconds
    longStaleTimeMs: 30 * 60 * 1000,           // 30 minutes
    defaultGcTimeMs: 10 * 60 * 1000,           // 10 minutes
  },

  realtime: {
    reconnectIntervalMs: 5_000,
    maxReconnectAttempts: 10,
  },

  audit: {
    batchSize: 50,
    flushIntervalMs: 1_000,
  },

  search: {
    debounceMs: 300,
    minQueryLength: 2,
    maxSuggestions: 10,
  },

  toast: {
    defaultDurationMs: 4_000,
    errorDurationMs: 6_000,
    position: 'bottom-right' as const,
  },
} as const;

export type AppConfig = typeof appConfig;
