'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  align?: 'left' | 'right' | 'between';
  destructive?: boolean;
  className?: string;
}

export function FormActions({
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  isSubmitting = false,
  isDisabled = false,
  align = 'right',
  destructive = false,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-2',
        align === 'right' && 'justify-end',
        align === 'left' && 'justify-start',
        align === 'between' && 'justify-between',
        className,
      )}
    >
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        variant={destructive ? 'destructive' : 'default'}
        loading={isSubmitting}
        disabled={isDisabled || isSubmitting}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
