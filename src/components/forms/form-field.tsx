'use client';

import * as React from 'react';
import { Controller, type FieldPath, type FieldValues, type Control, type RegisterOptions } from 'react-hook-form';
import { cn } from '@/lib/utils/cn';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Field Wrapper ──────────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, required, error, hint, htmlFor, className, children }: FieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

// ── RHF-connected TextField ────────────────────────────────────────────────────

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
  rules?: RegisterOptions<T>;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function TextField<T extends FieldValues>({
  control, name, label, placeholder, type = 'text',
  autoComplete, required, hint, disabled, rules, leftElement, rightElement, className,
}: TextFieldProps<T>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FieldWrapper label={label} required={required} error={fieldState.error?.message} hint={hint} htmlFor={id} className={className}>
          <Input
            {...field}
            id={id}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={disabled}
            error={!!fieldState.error}
            leftElement={leftElement}
            rightElement={rightElement}
            value={field.value ?? ''}
          />
        </FieldWrapper>
      )}
    />
  );
}

// ── RHF-connected TextareaField ────────────────────────────────────────────────

interface TextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
  rows?: number;
  rules?: RegisterOptions<T>;
  className?: string;
}

export function TextareaField<T extends FieldValues>({
  control, name, label, placeholder, required, hint, disabled, rows = 3, rules, className,
}: TextareaFieldProps<T>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FieldWrapper label={label} required={required} error={fieldState.error?.message} hint={hint} htmlFor={id} className={className}>
          <Textarea
            {...field}
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            error={!!fieldState.error}
            rows={rows}
            value={field.value ?? ''}
          />
        </FieldWrapper>
      )}
    />
  );
}

// ── RHF-connected SelectField ──────────────────────────────────────────────────

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
  rules?: RegisterOptions<T>;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
}

export function SelectField<T extends FieldValues>({
  control, name, label, placeholder = 'Select…', required, hint, disabled, rules, options, className,
}: SelectFieldProps<T>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FieldWrapper label={label} required={required} error={fieldState.error?.message} hint={hint} htmlFor={id} className={className}>
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={id} error={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      )}
    />
  );
}
