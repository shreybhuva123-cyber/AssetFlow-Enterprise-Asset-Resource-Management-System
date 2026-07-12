'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetTable, type AssetRow } from '@/features/assets/components/asset-table';
import { AssetStatus, ASSET_STATUS_LABELS, AssetCondition, ASSET_CONDITION_LABELS } from '@/constants/status';
import { useDebounce } from '@/hooks/use-debounce';

interface PaginationMeta {
  page:       number;
  pageSize:   number;
  total:      number;
  totalPages: number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export function AssetListClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [assets,     setAssets]     = useState<AssetRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [showFilters,setShowFilters]= useState(false);

  // Filter state
  const [search,     setSearch]     = useState(searchParams.get('search') ?? '');
  const [status,     setStatus]     = useState(searchParams.get('status') ?? '');
  const [condition,  setCondition]  = useState(searchParams.get('condition') ?? '');
  const [page,       setPage]       = useState(parseInt(searchParams.get('page') ?? '1', 10));

  const debouncedSearch = useDebounce(search, 350);
  const abortRef        = useRef<AbortController | null>(null);

  const fetchAssets = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status)          params.set('status',    status);
      if (condition)       params.set('condition', condition);
      params.set('page',  String(page));
      params.set('limit', '20');

      const res  = await fetch(`/api/assets?${params.toString()}`, { signal: abortRef.current.signal });
      if (!res.ok) return;
      const json = await res.json() as { data: AssetRow[]; pagination: PaginationMeta };
      setAssets(json.data);
      setPagination(json.pagination);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, condition, page]);

  useEffect(() => { void fetchAssets(); }, [fetchAssets]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search)    params.set('search', search);
    if (status)    params.set('status', status);
    if (condition) params.set('condition', condition);
    if (page > 1)  params.set('page', String(page));
    router.replace(`/assets?${params.toString()}`, { scroll: false });
  }, [search, status, condition, page, router]);

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCondition('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || status || condition);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag, serial number, location…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 bg-background/50"
              id="asset-search-input"
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch('')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            className="gap-1.5 h-9 shrink-0"
            onClick={() => setShowFilters((v) => !v)}
            id="toggle-filters-btn"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {[status, condition].filter(Boolean).length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearFilters} id="clear-filters-btn">
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(v) => { setStatus(v === '_all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs bg-background" id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All statuses</SelectItem>
                  {Object.values(AssetStatus).map((s) => (
                    <SelectItem key={s} value={s}>{ASSET_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">Condition</label>
              <Select value={condition} onValueChange={(v) => { setCondition(v === '_all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs bg-background" id="condition-filter">
                  <SelectValue placeholder="All conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All conditions</SelectItem>
                  {Object.values(AssetCondition).map((c) => (
                    <SelectItem key={c} value={c}>{ASSET_CONDITION_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {pagination && !loading && (
        <p className="text-xs text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total.toLocaleString()} assets
        </p>
      )}

      {/* Table */}
      <AssetTable data={assets} onRefresh={fetchAssets} isLoading={loading} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPreviousPage}
              id="prev-page-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
              const p = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
              return (
                <Button
                  key={p}
                  variant={p === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setPage(p)}
                  id={`page-${p}-btn`}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline" size="sm" className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              id="next-page-btn"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
