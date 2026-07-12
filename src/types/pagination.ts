export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export interface OffsetPaginationParams {
  page: number;
  pageSize: number;
}

export interface CursorPaginationParams {
  cursor: string | null;
  limit: number;
  direction: 'forward' | 'backward';
}

export type SortDirection = 'asc' | 'desc';

export interface SortField<T = string> {
  field: T;
  direction: SortDirection;
}

export interface PaginatedResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  previousCursor: string | null;
  hasMore: boolean;
  total: number;
}

export function buildPageInfo(
  page: number,
  pageSize: number,
  total: number
): PageInfo {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = total === 0 ? 0 : Math.min(page * pageSize, total);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    startIndex,
    endIndex,
  };
}
