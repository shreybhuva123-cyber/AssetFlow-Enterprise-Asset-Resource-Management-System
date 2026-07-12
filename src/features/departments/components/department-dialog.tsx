'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DepartmentForm } from './department-form';
import { useCreateDepartment, useUpdateDepartment } from '@/features/departments/hooks/use-departments';
import type { CreateDepartmentInput } from '@/validators/department';

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parentId: string | null;
  headId: string | null;
  isActive: boolean;
}

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  editTarget?: Department | null;
  parentOptions: { id: string; name: string }[];
  headOptions: { id: string; displayName: string }[];
}

export function DepartmentDialog({ open, onClose, editTarget, parentOptions, headOptions }: DepartmentDialogProps) {
  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();

  const isEditing = !!editTarget;
  const isPending = createMut.isPending || updateMut.isPending;

  function handleSubmit(data: CreateDepartmentInput) {
    if (isEditing && editTarget) {
      updateMut.mutate({ id: editTarget.id, ...data }, { onSuccess: onClose });
    } else {
      createMut.mutate(data, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit department' : 'New department'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update department details.' : 'Create a new department in your organization.'}
          </DialogDescription>
        </DialogHeader>
        <DepartmentForm
          defaultValues={
            editTarget
              ? {
                  name: editTarget.name,
                  code: editTarget.code ?? undefined,
                  description: editTarget.description ?? undefined,
                  parentId: editTarget.parentId ?? undefined,
                  headId: editTarget.headId ?? undefined,
                  isActive: editTarget.isActive,
                }
              : undefined
          }
          parentOptions={parentOptions}
          headOptions={headOptions}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
