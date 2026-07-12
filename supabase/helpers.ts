import type {
  PostgrestError,
  PostgrestSingleResponse,
  PostgrestResponse,
} from '@supabase/supabase-js';
import { DatabaseError, NotFoundError } from '@/lib/errors/index';
import { createLogger } from '@/lib/logger/index';

const logger = createLogger('SupabaseHelpers');

export function handlePostgrestError(error: PostgrestError, context: string): never {
  logger.error(`Postgres error [${context}]`, error, {
    code: error.code,
    hint: error.hint,
    details: error.details,
  });
  throw new DatabaseError(`Database operation failed in '${context}': ${error.message}`, {
    code: error.code,
    hint: error.hint,
    details: error.details,
  });
}

export function unwrapSingle<T>(
  response: PostgrestSingleResponse<T>,
  resourceName: string
): T {
  if (response.error) handlePostgrestError(response.error, resourceName);
  if (response.data === null) throw new NotFoundError(resourceName);
  return response.data;
}

export function unwrapMany<T>(
  response: PostgrestResponse<T>,
  context: string
): T[] {
  if (response.error) handlePostgrestError(response.error, context);
  return response.data ?? [];
}

export function buildIlikeFilter(searchTerm: string, columns: string[]): string {
  const sanitized = searchTerm.replace(/[%_\\]/g, '\\$&').trim();
  if (!sanitized) return '';
  return columns.map((col) => `${col}.ilike.%${sanitized}%`).join(',');
}

export function toPaginationRange(
  page: number,
  pageSize: number
): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}
