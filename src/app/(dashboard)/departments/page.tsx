'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { SearchInput } from '@/components/forms/search-input';
import { InlineLoader } from '@/components/feedback/loading-spinner';
import { EmptyResource } from '@/components/feedback/error-states';
import { DeleteDialog } from '@/components/feedback/confirm-dialog';
import { DepartmentDialog } from '@/features/departments/components/department-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDepartments,
  useDeleteDepartment,
  useAllDepartments,
} from '@/features/departments/hooks/use-departments';
import { useAuthStore } from '@/store/auth.store';
import { useDebounce } from '@/hooks/use-debounce';
import { canManageDepartments } from '@/lib/auth/rbac';

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parentId: string | null;
  headId: string | null;
  isActive: boolean;
  parent: { id: string; name: string } | null;
  head: { id: string; displayName: string } | null;
  _count: { members: number };
}

export default function DepartmentsPage() {
  const profile = useAuthStore((s) => s.profile);
  const canManage = !!profile && canManageDepartments(profile);

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Department | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const params: Record<string, string> = { page: String(page) };
  if (debouncedSearch) params.search = debouncedSearch;

  const { data, isLoading } = useDepartments(params);
  const { data: allDepts } = useAllDepartments();
  const { mutate: deleteDept, isPending: isDeleting } = useDeleteDepartment();

  const departments: Department[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  const parentOptions = (allDepts?.items ?? []).map((d: { id: string; name: string }) => ({ id: d.id, name: d.name }));

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.name}</p>
          {row.original.code && <p className="text-xs text-muted-foreground">{row.original.code}</p>}
        </div>
      ),
    },
    {
      id: 'parent',
      header: 'Parent',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.parent?.name ?? '—'}</span>,
    },
    {
      id: 'head',
      header: 'Head',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.head?.displayName ?? '—'}</span>,
    },
    {
      id: 'members',
      header: 'Members',
      cell: ({ row }) => <span className="text-sm">{row.original._count.members}</span>,
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
          cell: ({ row }: { row: { original: Department } }) => (
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
        } as ColumnDef<Department>]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage your organization's department structure."
        actions={
          canManage && (
            <Button leftIcon={Plus} onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
              New department
            </Button>
          )
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search departments…"
        className="w-72"
      />

      {isLoading ? (
        <InlineLoader label="Loading departments…" />
      ) : departments.length === 0 ? (
        <EmptyResource
          resourceName="Departments"
          onAction={canManage ? () => { setEditTarget(null); setDialogOpen(true); } : undefined}
          actionLabel="Create department"
        />
      ) : (
        <DataTable
          columns={columns}
          data={departments}
          total={total}
          page={page}
          onPageChange={setPage}
        />
      )}

      <DepartmentDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        editTarget={editTarget}
        parentOptions={parentOptions}
        headOptions={[]}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        itemName={deleteTarget?.name ?? ''}
        onConfirm={() => {
          if (deleteTarget) deleteDept(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
