'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Pencil, Trash2, Tag } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { SearchInput } from '@/components/forms/search-input';
import { InlineLoader } from '@/components/feedback/loading-spinner';
import { EmptyResource } from '@/components/feedback/error-states';
import { DeleteDialog } from '@/components/feedback/confirm-dialog';
import { CategoryDialog } from '@/features/categories/components/category-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCategories, useDeleteCategory } from '@/features/categories/hooks/use-categories';
import { useAuthStore } from '@/store/auth.store';
import { useDebounce } from '@/hooks/use-debounce';
import { canManageCategories } from '@/lib/auth/rbac';
import type { DynamicField } from '@/types/asset-category';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  dynamicFields: DynamicField[];
  isActive: boolean;
  sortOrder: number;
}

export default function CategoriesPage() {
  const profile = useAuthStore((s) => s.profile);
  const canManage = !!profile && canManageCategories(profile);

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const params: Record<string, string> = { page: String(page) };
  if (debouncedSearch) params.search = debouncedSearch;

  const { data, isLoading } = useCategories(params);
  const { mutate: deleteCat, isPending: isDeleting } = useDeleteCategory();

  const categories: Category[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: c.color ?? '#6366f1' + '20' }}
            >
              <Tag className="h-4 w-4" style={{ color: c.color ?? '#6366f1' }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
            </div>
          </div>
        );
      },
    },
    {
      id: 'dynamicFields',
      header: 'Custom fields',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.dynamicFields.length === 0 ? '—' : `${row.original.dynamicFields.length} field${row.original.dynamicFields.length === 1 ? '' : 's'}`}
        </span>
      ),
    },
    {
      accessorKey: 'sortOrder',
      header: 'Sort',
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as number}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? 'success' : 'muted'} dot>
          {getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    ...(canManage
      ? [{
          id: 'actions',
          header: '',
          cell: ({ row }: { row: { original: Category } }) => (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Actions">
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditTarget(row.original); setDialogOpen(true); }}>
                    <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteTarget(row.original)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        } as ColumnDef<Category>]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Categories"
        description="Define categories and custom fields for your asset inventory."
        actions={
          canManage && (
            <Button leftIcon={Plus} onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
              New category
            </Button>
          )
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search categories…"
        className="w-72"
      />

      {isLoading ? (
        <InlineLoader label="Loading categories…" />
      ) : categories.length === 0 ? (
        <EmptyResource
          resourceName="Asset Categories"
          onAction={canManage ? () => { setEditTarget(null); setDialogOpen(true); } : undefined}
          actionLabel="Create category"
        />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          totalRows={total}
          page={page}
          pageSize={20}
          onPageChange={setPage}
        />
      )}

      <CategoryDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        editTarget={editTarget}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        itemName={deleteTarget?.name ?? ''}
        onConfirm={() => {
          if (deleteTarget) deleteCat(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
