'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { createAssetCategorySchema, type CreateAssetCategoryInput } from '@/validators/asset-category';
import { TextField, TextareaField, SelectField } from '@/components/forms/form-field';
import { FormActions } from '@/components/forms/form-actions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { generateShortId } from '@/lib/utils/id';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'select', label: 'Select (options)' },
  { value: 'url', label: 'URL' },
];

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
];

interface CategoryFormProps {
  defaultValues?: Partial<CreateAssetCategoryInput>;
  onSubmit: (data: CreateAssetCategoryInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({ defaultValues, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const form = useForm<CreateAssetCategoryInput>({
    resolver: zodResolver(createAssetCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: '#6366f1',
      dynamicFields: [],
      isActive: true,
      sortOrder: 0,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dynamicFields',
  });

  const selectedColor = form.watch('color');

  function addField() {
    append({
      id: generateShortId(),
      name: '',
      label: '',
      type: 'text',
      required: false,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField control={form.control} name="name" label="Category name" required placeholder="e.g. Laptop" />
      <TextareaField control={form.control} name="description" label="Description" placeholder="Describe this category..." />

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="h-7 w-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color ? 'hsl(var(--foreground))' : 'transparent',
                transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
              }}
              onClick={() => form.setValue('color', color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <TextField control={form.control} name="icon" label="Icon name" placeholder="e.g. laptop (Lucide icon name)" hint="Use any Lucide icon name" />

      <Controller
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch id="cat-active" checked={field.value} onCheckedChange={field.onChange} />
            <Label htmlFor="cat-active">Active</Label>
          </div>
        )}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dynamic fields</p>
            <p className="text-xs text-muted-foreground">Extra fields attached to assets in this category</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addField} leftIcon={Plus}>
            Add field
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">Field {index + 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label="Remove field"
              >
                <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                control={form.control}
                name={`dynamicFields.${index}.label`}
                label="Display label"
                placeholder="e.g. Serial Number"
                required
              />
              <TextField
                control={form.control}
                name={`dynamicFields.${index}.name`}
                label="Field key"
                placeholder="e.g. serial_number"
                required
              />
            </div>
            <SelectField
              control={form.control}
              name={`dynamicFields.${index}.type`}
              label="Type"
              options={FIELD_TYPES}
            />
            <Controller
              control={form.control}
              name={`dynamicFields.${index}.required`}
              render={({ field: f }) => (
                <div className="flex items-center gap-2">
                  <Switch id={`field-req-${index}`} checked={f.value} onCheckedChange={f.onChange} />
                  <Label htmlFor={`field-req-${index}`} className="text-xs">Required</Label>
                </div>
              )}
            />
          </div>
        ))}
      </div>

      <FormActions onCancel={onCancel} isSubmitting={isLoading} align="right" />
    </form>
  );
}
