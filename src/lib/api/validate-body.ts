import { type NextRequest } from 'next/server';
import type { z, ZodError, ZodTypeAny } from 'zod';
import { badRequestResponse } from '@/lib/utils/api-response';

export async function validateBody<S extends ZodTypeAny>(
  req: NextRequest,
  schema: S,
): Promise<{ data: z.output<S>; error: null } | { data: null; error: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { data: null, error: badRequestResponse('Invalid JSON body') };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const formatted = (result.error as ZodError).flatten();
    return {
      data: null,
      error: badRequestResponse('Validation failed', formatted.fieldErrors),
    };
  }

  return { data: result.data, error: null };
}

export function validateQuery<S extends ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: S,
): { data: z.output<S>; error: null } | { data: null; error: Response } {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    const formatted = (result.error as ZodError).flatten();
    return {
      data: null,
      error: badRequestResponse('Invalid query parameters', formatted.fieldErrors),
    };
  }

  return { data: result.data, error: null };
}
