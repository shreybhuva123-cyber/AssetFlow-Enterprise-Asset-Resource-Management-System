import { createLogger } from '@/lib/logger/index';
import { ExternalServiceError, normalizeError } from '@/types/errors';
import type { ApiResponse, PaginatedResponse, ApiRequestOptions } from '@/types/api';

const logger = createLogger('ApiClient');

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_BASE_URL = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL ?? '';

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, DEFAULT_BASE_URL || 'http://localhost:3000');
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.pathname + url.search;
}

async function request<T>(
  method: string,
  path: string,
  options: ApiRequestOptions & { body?: unknown } = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT_MS, headers = {}, params, body } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const url = buildUrl(path, params as Record<string, string | number | boolean | undefined>);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : (undefined as BodyInit | undefined),
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);

    if (!response.ok) {
      logger.warn(`HTTP ${response.status} from ${method} ${url}`);
      throw new ExternalServiceError(url, `HTTP ${response.status}`, {
        status: response.status,
        url,
        body: data,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof ExternalServiceError) throw error;
    const normalized = normalizeError(error);
    logger.error(`Request failed: ${method} ${url}`, { error: normalized.message });
    throw normalized;
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('GET', path, options);
  },

  post<T>(path: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('POST', path, { ...options, body: body as ApiRequestOptions['body'] });
  },

  put<T>(path: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('PUT', path, { ...options, body: body as ApiRequestOptions['body'] });
  },

  patch<T>(path: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('PATCH', path, { ...options, body: body as ApiRequestOptions['body'] });
  },

  delete<T = void>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('DELETE', path, options);
  },

  getPaginated<T>(path: string, options?: ApiRequestOptions): Promise<PaginatedResponse<T>> {
    return request<PaginatedResponse<T>>('GET', path, options);
  },
};
