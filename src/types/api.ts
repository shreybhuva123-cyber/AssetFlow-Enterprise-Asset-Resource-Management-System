export type ID = string;
export type Timestamp = Date;
export type MoneyAmount = number; // stored in cents

export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface SerializedError {
  code: string;
  message: string;
  details?: unknown;
  statusCode: number;
  severity?: string;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: SerializedError | null;
  success: boolean;
  message?: string;
  meta?: PaginationMeta;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  error: SerializedError | null;
  success: boolean;
  message?: string;
  meta: PaginationMeta;
  requestId?: string;
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: PaginationMeta
): ApiResponse<T> {
  return { data, error: null, success: true, message, meta };
}

export function createErrorResponse(
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown
): ApiResponse<never> {
  return {
    data: null,
    error: { code, message, statusCode, details, timestamp: new Date().toISOString() },
    success: false,
    message,
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    data: items,
    error: null,
    success: true,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
