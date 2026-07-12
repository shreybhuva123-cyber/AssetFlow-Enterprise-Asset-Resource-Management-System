'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDepartmentSchema, type CreateDepartmentInput } from '@/validators/department';
import { TextField, TextareaField, SelectField } from '@/components/forms/form-field';
import { FormActions } from '@/components/forms/form-actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';

interface DepartmentFormProps {
  defaultValues?: Partial<CreateDepartmentInput>;
  parentOptions: { id: string; name: string }[];
  headOptions: { id: string; displayName: string }[];
  onSubmit: (data: CreateDepartmentInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DepartmentForm({
  defaultValues,
  parentOptions,
  headOptions,
  onSubmit,
  onCancel,
  isLoading,
}: DepartmentFormProps) {
  const form = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
      <TextField control={form.control} name="name" label="Department name" required placeholder="e.g. Engineering" />
      <TextField control={form.control} name="code" label="Code" placeholder="e.g. ENG" hint="Short identifier (optional)" />
      <TextareaField control={form.control} name="description" label="Description" placeholder="Describe this department..." />

      <SelectField
        control={form.control}
        name="parentId"
        label="Parent department"
        options={[
          { value: '', label: 'None (top-level)' },
          ...parentOptions.map((d) => ({ value: d.id, label: d.name })),
        ]}
      />

      <SelectField
        control={form.control}
        name="headId"
        label="Department head"
        options={[
          { value: '', label: 'Unassigned' },
          ...headOptions.map((e) => ({ value: e.id, label: e.displayName })),
        ]}
      />

      <Controller
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch
              id="dept-active"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor="dept-active">Active</Label>
          </div>
        )}
      />

      <FormActions
        onCancel={onCancel}
        isSubmitting={isLoading}
        align="right"
      />
    </form>
  );
}
