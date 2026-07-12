'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, UserCog, Pencil } from 'lucide-react';
import { DataTable } from '@/components/table/data-table';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { USER_ROLE_LABELS, UserRole } from '@/types/auth';
import { formatRelative } from '@/lib/utils/date';

interface Employee {
  id: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  jobTitle: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  department: { id: string; name: string } | null;
}

const roleVariant: Record<UserRole, 'default' | 'success' | 'info' | 'secondary' | 'warning'> = {
  [UserRole.ADMIN]: 'default',
  [UserRole.ASSET_MANAGER]: 'info',
  [UserRole.DEPARTMENT_HEAD]: 'warning',
  [UserRole.EMPLOYEE]: 'secondary',
};

interface EmployeeTableProps {
  data: Employee[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onView: (employee: Employee) => void;
  onChangeRole: (employee: Employee) => void;
  canManage: boolean;
}

export function EmployeeTable({
  data,
  isLoading,
  total,
  page,
  onPageChange,
  onView,
  onChangeRole,
  canManage,
}: EmployeeTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      id: 'name',
      header: 'Employee',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => onView(e)}
          >
            <UserAvatar
              src={e.avatarUrl ?? undefined}
              firstName={e.firstName}
              lastName={e.lastName}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium leading-none">{e.displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{e.email}</p>
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: 'jobTitle',
      header: 'Title',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{(getValue() as string | null) ?? '—'}</span>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.department?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const role = getValue() as UserRole;
        return (
          <Badge variant={roleVariant[role]} className="text-xs">
            {USER_ROLE_LABELS[role]}
          </Badge>
        );
      },
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
    {
      accessorKey: 'lastSeenAt',
      header: 'Last seen',
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        return <span className="text-xs text-muted-foreground">{v ? formatRelative(new Date(v)) : 'Never'}</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(e)}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  View profile
                </DropdownMenuItem>
                {canManage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onChangeRole(e)}>
                      <UserCog className="mr-2 h-4 w-4" aria-hidden="true" />
                      Change role
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      totalRows={total}
      page={page}
      pageSize={25}
      onPageChange={onPageChange}
    />
  );
}
