'use client';

import * as React from 'react';
import { type FieldValues, type FieldPath, useController, type UseControllerProps } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';
import { toCents, fromCents } from '@/lib/utils/currency';

interface CurrencyInputProps {
  label?: string;
  hint?: string;
  error?: string;
  currency?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  id?: string;
  value?: number;
  onChange?: (cents: number) => void;
  onBlur?: () => void;
}

export function CurrencyInput({
  label,
  hint,
  error,
  currency = 'USD',
  className,
  disabled,
  required,
  placeholder = '0.00',
  id,
  value,
  onChange,
  onBlur,
}: CurrencyInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const displayValue = value !== undefined ? (fromCents(value)).toFixed(2) : '';
  const [localValue, setLocalValue] = React.useState(displayValue);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value !== undefined ? (fromCents(value)).toFixed(2) : '');
    }
  }, [value, isFocused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setLocalValue(raw);
  }

  function handleBlur() {
    setIsFocused(false);
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed)) {
      const cents = toCents(parsed);
      onChange?.(cents);
      setLocalValue(parsed.toFixed(2));
    } else if (localValue === '') {
      onChange?.(0);
      setLocalValue('');
    }
    onBlur?.();
  }

  function handleFocus() {
    setIsFocused(true);
    if (localValue === '0.00') setLocalValue('');
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'flex h-9 w-full rounded-md border bg-transparent pl-8 pr-3 py-2 text-sm shadow-sm ring-offset-background',
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

interface CurrencyFieldProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string;
  hint?: string;
  currency?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function CurrencyField<T extends FieldValues>({
  name,
  control,
  label,
  hint,
  currency,
  className,
  disabled,
  required,
  placeholder,
}: CurrencyFieldProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <CurrencyInput
      label={label}
      hint={hint}
      error={fieldState.error?.message}
      currency={currency}
      className={className}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      value={field.value as number}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
