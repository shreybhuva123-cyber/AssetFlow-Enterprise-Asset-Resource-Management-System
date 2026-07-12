import type { PaginationMeta } from '@/types/api';
import type { PageInfo, OffsetPaginationParams, PaginatedResult } from '@/types/pagination';
import { appConfig } from '@/config/app.config';

export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): OffsetPaginationParams {
  const get = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(key) ?? undefined;
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const rawPage = parseInt(get('page') ?? '1', 10);
  const rawPageSize = parseInt(get('pageSize') ?? String(appConfig.pagination.defaultPageSize), 10);
  const sortBy = get('sortBy');
  const sortOrder = get('sortOrder');

  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, appConfig.pagination.maxPageSize)
      : appConfig.pagination.defaultPageSize,
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder: sortOrder === 'desc' ? 'desc' as const : 'asc' as const }),
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  pageOrParams: number | OffsetPaginationParams,
  pageSize?: number,
): PaginatedResult<T> {
  const page = typeof pageOrParams === 'number' ? pageOrParams : pageOrParams.page;
  const size = typeof pageOrParams === 'number' ? (pageSize ?? 25) : pageOrParams.pageSize;
  const totalPages = Math.ceil(total / size);

  return {
    data,
    pagination: {
      page,
      pageSize: size,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function buildPaginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildPageInfo(page: number, pageSize: number, total: number): PageInfo {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    startIndex: total === 0 ? 0 : (page - 1) * pageSize + 1,
    endIndex: total === 0 ? 0 : Math.min(page * pageSize, total),
  };
}

export function getPrismaSkipTake(page: number, pageSize: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
