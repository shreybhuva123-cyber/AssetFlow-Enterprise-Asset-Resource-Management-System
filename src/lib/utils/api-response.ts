import { NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '@/types/api';

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data, timestamp: new Date().toISOString() },
    { status },
  );
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201);
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status = 200,
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export function errorResponse(
  message: string,
  code: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { message, code, details },
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export function notFoundResponse(resource: string): NextResponse {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404);
}

export function unauthorizedResponse(message = 'Authentication required'): NextResponse {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}

export function forbiddenResponse(message = 'Insufficient permissions'): NextResponse {
  return errorResponse(message, 'FORBIDDEN', 403);
}

export function badRequestResponse(message: string, details?: unknown): NextResponse {
  return errorResponse(message, 'BAD_REQUEST', 400, details);
}

export function internalErrorResponse(message = 'An unexpected error occurred'): NextResponse {
  return errorResponse(message, 'INTERNAL_ERROR', 500);
}
