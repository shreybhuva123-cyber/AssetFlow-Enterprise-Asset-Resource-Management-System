'use client';

import * as React from 'react';
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

interface DatePickerProps {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  label,
  hint,
  error,
  placeholder = 'Pick a date',
  className,
  disabled,
  required,
  id,
  value,
  onChange,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, 'yyyy-MM-dd') : '',
  );

  React.useEffect(() => {
    setInputValue(value ? format(value, 'yyyy-MM-dd') : '');
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      if (minDate && parsed < minDate) return;
      if (maxDate && parsed > maxDate) return;
      onChange?.(parsed);
    }
  }

  function handleClear() {
    setInputValue('');
    onChange?.(null);
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <CalendarIcon
          className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
          max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-destructive focus:ring-destructive' : 'border-input',
          )}
        />
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}

interface DateFieldProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateField<T extends FieldValues>({
  name,
  control,
  label,
  hint,
  placeholder,
  className,
  disabled,
  required,
  minDate,
  maxDate,
}: DateFieldProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <DatePicker
      label={label}
      hint={hint}
      error={fieldState.error?.message}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      value={field.value ? new Date(field.value as string) : null}
      onChange={(date) => field.onChange(date?.toISOString() ?? null)}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}
