export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  // Resource
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  // Storage
  STORAGE_ERROR = 'STORAGE_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  // External
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  // Generic
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SerializedErrorShape {
  code: ErrorCode | string;
  message: string;
  statusCode: number;
  details?: unknown;
  severity?: ErrorSeverity;
  timestamp?: string;
}

export class AppError extends Error {
  readonly code: ErrorCode | string;
  readonly statusCode: number;
  readonly details?: unknown;
  readonly severity: ErrorSeverity;
  readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
    statusCode = 500,
    details?: unknown,
    severity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.severity = severity;
    this.isOperational = true;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  serialize(): SerializedErrorShape {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      severity: this.severity,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, 422, details, ErrorSeverity.LOW);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, ErrorCode.UNAUTHORIZED, 401, undefined, ErrorSeverity.MEDIUM);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, ErrorCode.FORBIDDEN, 403, undefined, ErrorSeverity.MEDIUM);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, 404, undefined, ErrorSeverity.LOW);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.CONFLICT, 409, details, ErrorSeverity.LOW);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.DATABASE_ERROR, 500, details, ErrorSeverity.HIGH);
  }
}

export class StorageError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.STORAGE_ERROR,
    details?: unknown
  ) {
    super(message, code, 500, details, ErrorSeverity.MEDIUM);
  }
}

export class RateLimitError extends AppError {
  readonly retryAfter: number;
  constructor(retryAfterSeconds = 60) {
    super(
      'Rate limit exceeded. Please try again later.',
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429
    );
    this.retryAfter = retryAfterSeconds;
  }
}

export class ExternalServiceError extends AppError {
  readonly service: string;
  constructor(service: string, message: string, details?: unknown) {
    super(message, ErrorCode.EXTERNAL_SERVICE_ERROR, 502, details, ErrorSeverity.HIGH);
    this.service = service;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, 500);
  }
  return new AppError('An unexpected error occurred', ErrorCode.UNKNOWN_ERROR, 500);
}

export function serializeError(error: unknown): SerializedErrorShape {
  return normalizeError(error).serialize();
}
