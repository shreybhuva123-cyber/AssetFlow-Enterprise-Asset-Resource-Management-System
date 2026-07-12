import { type NextRequest } from 'next/server';
import { type ZodSchema, ZodError } from 'zod';
import { badRequestResponse } from '@/lib/utils/api-response';

export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { data: null, error: badRequestResponse('Invalid JSON body') };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const formatted = result.error.flatten();
    return {
      data: null,
      error: badRequestResponse('Validation failed', formatted.fieldErrors),
    };
  }

  return { data: result.data, error: null };
}

export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>,
): { data: T; error: null } | { data: null; error: Response } {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    const formatted = result.error.flatten();
    return {
      data: null,
      error: badRequestResponse('Invalid query parameters', formatted.fieldErrors),
    };
  }

  return { data: result.data, error: null };
}
