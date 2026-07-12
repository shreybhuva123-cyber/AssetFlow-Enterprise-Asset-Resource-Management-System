'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextField } from '@/components/forms/form-field';
import { updateEmployeeSchema, type UpdateEmployeeInput } from '@/validators/employee';
import { useUpdateEmployee } from '@/features/employees/hooks/use-employees';
import { USER_ROLE_LABELS, UserRole } from '@/types/auth';
import { formatDate } from '@/lib/utils/date';

const roleVariant: Record<UserRole, 'default' | 'success' | 'info' | 'secondary' | 'warning'> = {
  [UserRole.ADMIN]: 'default',
  [UserRole.ASSET_MANAGER]: 'info',
  [UserRole.DEPARTMENT_HEAD]: 'warning',
  [UserRole.EMPLOYEE]: 'secondary',
};

interface Employee {
  id: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  jobTitle: string | null;
  phone: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  department: { id: string; name: string } | null;
}

interface EmployeeDrawerProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
}

export function EmployeeDrawer({ employee, open, onClose, canEdit }: EmployeeDrawerProps) {
  const { mutate, isPending } = useUpdateEmployee();
  const [isEditing, setIsEditing] = React.useState(false);

  const form = useForm<UpdateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema),
  });

  React.useEffect(() => {
    if (employee) {
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone ?? undefined,
        jobTitle: employee.jobTitle ?? undefined,
      });
    }
    setIsEditing(false);
  }, [employee, form]);

  if (!employee) return null;

  function handleSubmit(data: UpdateEmployeeInput) {
    mutate(
      { id: employee!.id, ...data },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4 mb-2">
            <UserAvatar
              src={employee.avatarUrl ?? undefined}
              firstName={employee.firstName}
              lastName={employee.lastName}
              size="lg"
            />
            <div>
              <SheetTitle>{employee.displayName}</SheetTitle>
              <SheetDescription>{employee.email}</SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={roleVariant[employee.role]}>{USER_ROLE_LABELS[employee.role]}</Badge>
            <Badge variant={employee.isActive ? 'success' : 'muted'} dot>
              {employee.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {isEditing ? (
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField control={form.control} name="firstName" label="First name" required />
              <TextField control={form.control} name="lastName" label="Last name" required />
            </div>
            <TextField control={form.control} name="jobTitle" label="Job title" />
            <TextField control={form.control} name="phone" label="Phone" type="tel" />

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                Save changes
              </Button>
            </SheetFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <dl className="space-y-3">
              {[
                { label: 'Department', value: employee.department?.name ?? '—' },
                { label: 'Job title', value: employee.jobTitle ?? '—' },
                { label: 'Phone', value: employee.phone ?? '—' },
                { label: 'Last seen', value: employee.lastSeenAt ? formatDate(new Date(employee.lastSeenAt)) : 'Never' },
                { label: 'Member since', value: formatDate(new Date(employee.createdAt)) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>

            {canEdit && (
              <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                Edit profile
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
