'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CategoryForm } from './category-form';
import { useCreateCategory, useUpdateCategory } from '@/features/categories/hooks/use-categories';
import type { CreateAssetCategoryInput } from '@/validators/asset-category';
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

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  editTarget?: Category | null;
}

export function CategoryDialog({ open, onClose, editTarget }: CategoryDialogProps) {
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();

  const isEditing = !!editTarget;
  const isPending = createMut.isPending || updateMut.isPending;

  function handleSubmit(data: CreateAssetCategoryInput) {
    if (isEditing && editTarget) {
      updateMut.mutate({ id: editTarget.id, ...data }, { onSuccess: onClose });
    } else {
      createMut.mutate(data, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit category' : 'New asset category'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update category details and dynamic fields.'
              : 'Create a new category. You can add dynamic fields to capture extra metadata for assets in this category.'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={
            editTarget
              ? {
                  name: editTarget.name,
                  description: editTarget.description ?? undefined,
                  icon: editTarget.icon ?? undefined,
                  color: editTarget.color ?? undefined,
                  dynamicFields: editTarget.dynamicFields,
                  isActive: editTarget.isActive,
                  sortOrder: editTarget.sortOrder,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
