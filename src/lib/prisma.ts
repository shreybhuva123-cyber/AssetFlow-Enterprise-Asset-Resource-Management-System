import { PrismaClient } from '@prisma/client';
import { createLogger } from './logger/index';

const logger = createLogger('Prisma');

declare global {
  // Prevents multiple Prisma Client instances in development hot-reload
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function buildPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });

  if (process.env.NODE_ENV === 'development') {
    (
      client as PrismaClient & {
        $on: (
          event: string,
          cb: (e: { duration: number; query: string }) => void
        ) => void;
      }
    ).$on('query', (e) => {
      if (e.duration > 200) {
        logger.warn(`Slow query (${e.duration}ms)`, { query: e.query.slice(0, 200) });
      }
    });
  }

  return client;
}

// Singleton pattern — critical for Next.js serverless (prevents connection pool exhaustion)
export const prisma: PrismaClient =
  globalThis.__prismaClient ?? buildPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma;
}
