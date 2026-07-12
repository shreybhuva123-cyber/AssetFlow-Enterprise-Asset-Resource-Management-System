'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Settings2, Download,
  Trash2, RefreshCw, Eye, Edit, QrCode, CheckSquare, Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AssetStatusBadge } from './asset-status-badge';
import { AssetConditionBadge } from './asset-condition-badge';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { AssetStatus, ASSET_STATUS_LABELS } from '@/constants/status';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import Image from 'next/image';

export type AssetRow = {
  id:              string;
  assetTag:        string;
  name:            string;
  serialNumber?:   string | null;
  status:          AssetStatus;
  condition:       string;
  currentLocation?: string | null;
  acquisitionCost?: string | null;
  createdAt:       string;
  updatedAt:       string;
  category?:       { name: string; icon?: string | null; color?: string | null } | null;
  department?:     { name: string } | null;
  assignedTo?:     { displayName: string; avatarUrl?: string | null } | null;
  images:          { publicUrl: string }[];
};

interface AssetTableProps {
  data:        AssetRow[];
  onRefresh?:  () => void;
  isLoading?:  boolean;
}

export function AssetTable({ data, onRefresh, isLoading }: AssetTableProps) {
  const router = useRouter();
  const [sorting, setSorting]         = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection]         = useState<RowSelectionState>({});
  const [bulkLoading, setBulkLoading] = useState(false);

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]).map((k) => data[parseInt(k)]?.id).filter(Boolean),
    [rowSelection, data],
  );

  const columns = useMemo<ColumnDef<AssetRow>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          id="select-all-checkbox"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          id={`select-row-${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      size: 48,
    },
    {
      accessorKey: 'assetTag',
      header: 'Asset Tag',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-muted/50 overflow-hidden border border-border/40">
            {row.original.images[0] ? (
              <Image
                src={row.original.images[0].publicUrl}
                alt={row.original.name}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 text-xs font-mono">
                {row.original.assetTag.slice(-2)}
              </div>
            )}
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-primary">{row.original.assetTag}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{row.original.serialNumber ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Asset Name',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="font-medium text-sm truncate">{row.original.name}</p>
          {row.original.category && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {row.original.category.icon} {row.original.category.name}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <AssetStatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => (
        <AssetConditionBadge
          condition={row.original.condition as Parameters<typeof AssetConditionBadge>[0]['condition']}
          size="sm"
        />
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.department?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'currentLocation',
      header: 'Location',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.currentLocation ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const u = row.original.assignedTo;
        if (!u) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary overflow-hidden">
              {u.avatarUrl ? (
                <Image src={u.avatarUrl} alt={u.displayName} width={24} height={24} className="h-full w-full object-cover" />
              ) : (
                u.displayName[0]
              )}
            </div>
            <span className="text-sm truncate max-w-[100px]">{u.displayName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" id={`asset-actions-${row.original.id}`}>
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.ASSETS.DETAIL(row.original.id))}>
              <Eye className="h-3.5 w-3.5 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.ASSETS.EDIT(row.original.id))}>
              <Edit className="h-3.5 w-3.5 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`${DASHBOARD_ROUTES.ASSETS.DETAIL(row.original.id)}?tab=qr`)}>
              <QrCode className="h-3.5 w-3.5 mr-2" /> View QR
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      size: 48,
    },
  ], [router]);

  const table = useReactTable({
    data,
    columns,
    state:    { sorting, columnVisibility, rowSelection },
    onSortingChange:          setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange:     setRowSelection,
    getCoreRowModel:    getCoreRowModel(),
    getSortedRowModel:  getSortedRowModel(),
    enableRowSelection: true,
  });

  const handleBulkStatusChange = useCallback(async (status: AssetStatus) => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/assets/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ operation: 'status', ids: selectedIds, status }),
      });
      const json = await res.json() as { data?: { updated: number }; error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Bulk update failed'); return; }
      notify.success(`Updated ${json.data!.updated} asset(s) to ${ASSET_STATUS_LABELS[status]}`);
      setRowSelection({});
      onRefresh?.();
    } finally {
      setBulkLoading(false);
    }
  }, [selectedIds, onRefresh]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} asset(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/assets/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ operation: 'delete', ids: selectedIds }),
      });
      const json = await res.json() as { data?: { deleted: number }; error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Bulk delete failed'); return; }
      notify.success(`Deleted ${json.data!.deleted} asset(s)`);
      setRowSelection({});
      onRefresh?.();
    } finally {
      setBulkLoading(false);
    }
  }, [selectedIds, onRefresh]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5"
            >
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" disabled={bulkLoading} id="bulk-status-btn">
                    <RefreshCw className={cn('h-3 w-3', bulkLoading && 'animate-spin')} />
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select new status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.values(AssetStatus).map((s) => (
                    <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>
                      {ASSET_STATUS_LABELS[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive"
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                id="bulk-delete-btn"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 ml-auto">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" id="column-visibility-btn">
                <Settings2 className="h-3.5 w-3.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={onRefresh} id="refresh-assets-btn">
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground transition-colors',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-muted-foreground/50">
                              {header.column.getIsSorted() === 'asc'  ? <ChevronUp className="h-3 w-3" />    :
                               header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" />  :
                               <ChevronsUpDown className="h-3 w-3" />}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Square className="h-12 w-12 opacity-20" />
                      <div>
                        <p className="font-medium">No assets found</p>
                        <p className="text-sm mt-0.5">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'border-b border-border/30 transition-colors cursor-pointer',
                      row.getIsSelected() ? 'bg-primary/5' : 'hover:bg-muted/30',
                    )}
                    onClick={() => router.push(DASHBOARD_ROUTES.ASSETS.DETAIL(row.original.id))}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
