import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiResponse } from '@/types/api';
import { ValidationError, isAppError, normalizeError } from './index';

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      'Request validation failed',
      error.flatten()
    );
    return NextResponse.json(
      {
        data: null,
        error: validationError.serialize(),
        success: false,
        message: validationError.message,
      },
      { status: 422 }
    );
  }

  const appError = normalizeError(error);
  return NextResponse.json(
    {
      data: null,
      error: appError.serialize(),
      success: false,
      message: appError.message,
    },
    { status: appError.statusCode }
  );
}

export function extractErrorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export function formatErrorForUser(error: unknown): string {
  const appError = normalizeError(error);

  switch (appError.statusCode) {
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return appError.message;
    case 409:
      return appError.message;
    case 422:
      return 'Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      if (appError.statusCode >= 500) {
        return 'Something went wrong on our end. Please try again later.';
      }
      return appError.message;
  }
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
    return true;
  }
  return false;
}

export function shouldRetryRequest(error: unknown): boolean {
  const appError = normalizeError(error);
  // Only retry server errors and network errors, never auth or validation errors
  return appError.statusCode >= 500 || isNetworkError(error);
}
