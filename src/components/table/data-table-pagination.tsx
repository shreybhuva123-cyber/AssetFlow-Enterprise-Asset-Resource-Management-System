'use client';

import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows: number;
  page: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTablePagination<TData>({
  table,
  totalRows,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const totalPages = Math.ceil(totalRows / pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  const handlePage = (p: number) => {
    if (onPageChange) onPageChange(p);
    else table.setPageIndex(p - 1);
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap text-sm text-muted-foreground">
      <p className="shrink-0">
        {totalRows === 0 ? 'No results' : `${from}–${to} of ${totalRows}`}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs shrink-0">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => { onPageSizeChange?.(Number(v)); table.setPageSize(Number(v)); }}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => handlePage(1)} disabled={!canPrev} aria-label="First page">
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => handlePage(page - 1)} disabled={!canPrev} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="px-2 text-xs font-medium tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon-sm" onClick={() => handlePage(page + 1)} disabled={!canNext} aria-label="Next page">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => handlePage(totalPages)} disabled={!canNext} aria-label="Last page">
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
