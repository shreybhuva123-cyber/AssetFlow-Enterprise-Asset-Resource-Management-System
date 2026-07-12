'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USER_ROLE_LABELS, UserRole } from '@/types/auth';
import { useChangeEmployeeRole } from '@/features/employees/hooks/use-employees';

interface Employee {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
}

interface RoleDialogProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

// Admin can assign any role except ADMIN (escalation guard on API side too)
const ASSIGNABLE_ROLES = [UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD, UserRole.EMPLOYEE];

export function RoleDialog({ employee, open, onClose }: RoleDialogProps) {
  const { mutate, isPending } = useChangeEmployeeRole();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | ''>('');

  React.useEffect(() => {
    if (employee) setSelectedRole(employee.role === UserRole.ADMIN ? UserRole.EMPLOYEE : employee.role);
  }, [employee]);

  if (!employee) return null;

  function handleConfirm() {
    if (!selectedRole || !employee) return;
    mutate(
      { id: employee.id, role: selectedRole as UserRole },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <UserAvatar
              src={employee.avatarUrl ?? undefined}
              firstName={employee.firstName}
              lastName={employee.lastName}
              size="sm"
            />
            <div>
              <DialogTitle>Change role</DialogTitle>
              <DialogDescription>{employee.displayName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <label className="text-sm font-medium mb-1.5 block">New role</label>
          <Select
            value={selectedRole}
            onValueChange={(v) => setSelectedRole(v as UserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {USER_ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            The ADMIN role cannot be assigned through this UI.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isPending}
            disabled={!selectedRole || selectedRole === employee.role}
          >
            Update role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
