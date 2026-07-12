'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/forms/search-input';
import { InlineLoader } from '@/components/feedback/loading-spinner';
import { EmptyResource } from '@/components/feedback/error-states';
import { EmployeeTable } from '@/features/employees/components/employee-table';
import { EmployeeDrawer } from '@/features/employees/components/employee-drawer';
import { RoleDialog } from '@/features/employees/components/role-dialog';
import { useEmployees } from '@/features/employees/hooks/use-employees';
import { useAuthStore } from '@/store/auth.store';
import { useDebounce } from '@/hooks/use-debounce';
import { isAdmin, isAtLeastRole } from '@/lib/auth/rbac';
import { UserRole } from '@/types/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USER_ROLE_LABELS } from '@/types/auth';

export default function EmployeesPage() {
  const profile = useAuthStore((s) => s.profile);

  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [page, setPage] = React.useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const [drawerEmployee, setDrawerEmployee] = React.useState<Parameters<typeof EmployeeDrawer>[0]['employee']>(null);
  const [roleEmployee, setRoleEmployee] = React.useState<Parameters<typeof RoleDialog>[0]['employee']>(null);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (debouncedSearch) params.search = debouncedSearch;
  if (roleFilter) params.role = roleFilter;
  if (statusFilter) params.isActive = statusFilter;

  const { data, isLoading } = useEmployees(params);

  const employees = data?.items ?? [];
  const total = data?.total ?? 0;

  const canManage = !!profile && isAdmin(profile);
  const canView = !!profile && isAtLeastRole(profile, UserRole.ASSET_MANAGER);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Manage employees, roles, and department assignments."
        actions={
          canManage && (
            <Button leftIcon={Plus} disabled>
              Invite employee
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, title…"
          className="sm:w-72"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
              <SelectItem key={role} value={role}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <InlineLoader label="Loading employees…" />
      ) : employees.length === 0 ? (
        <EmptyResource resourceName="Employees" />
      ) : (
        <EmployeeTable
          data={employees as Parameters<typeof EmployeeTable>[0]['data']}
          total={total}
          page={page}
          onPageChange={setPage}
          onView={(e) => setDrawerEmployee(e as Parameters<typeof EmployeeDrawer>[0]['employee'])}
          onChangeRole={(e) => setRoleEmployee(e as Parameters<typeof RoleDialog>[0]['employee'])}
          canManage={canManage}
        />
      )}

      <EmployeeDrawer
        employee={drawerEmployee}
        open={!!drawerEmployee}
        onClose={() => setDrawerEmployee(null)}
        canEdit={canManage || (!!profile && profile.id === drawerEmployee?.id)}
      />

      <RoleDialog
        employee={roleEmployee}
        open={!!roleEmployee}
        onClose={() => setRoleEmployee(null)}
      />
    </div>
  );
}
