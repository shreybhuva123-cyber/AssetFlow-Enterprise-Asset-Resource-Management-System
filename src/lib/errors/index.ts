export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  StorageError,
  RateLimitError,
  ExternalServiceError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  normalizeError,
  serializeError,
} from '@/types/errors';

import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ErrorCode,
} from '@/types/errors';

export function createValidationError(field: string, message: string): ValidationError {
  return new ValidationError(`Validation failed for '${field}': ${message}`, {
    field,
    message,
  });
}

export function createNotFoundError(resource: string, id?: string): NotFoundError {
  return new NotFoundError(resource, id);
}

export function createDuplicateError(resource: string, field: string): ConflictError {
  return new ConflictError(
    `A ${resource} with this ${field} already exists`,
    { resource, field }
  );
}

export function createUnauthorizedError(message = 'Authentication required'): AppError {
  return new AppError(message, ErrorCode.UNAUTHORIZED, 401);
}

export function createForbiddenError(message = 'Insufficient permissions'): AppError {
  return new AppError(message, ErrorCode.FORBIDDEN, 403);
}

export function createInternalError(message = 'Internal server error', details?: unknown): AppError {
  return new AppError(message, ErrorCode.INTERNAL_ERROR, 500, details);
}
