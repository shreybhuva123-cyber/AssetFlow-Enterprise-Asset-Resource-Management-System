'use client';

import { toast as sonnerToast } from 'sonner';
import { appConfig } from '@/config/app.config';

// Wrap Sonner — never call toast() directly in application code

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export const notify = {
  success(message: string, options?: ToastOptions): void {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? appConfig.toast.defaultDurationMs,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    });
  },

  error(message: string, options?: ToastOptions): void {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? appConfig.toast.errorDurationMs,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    });
  },

  warning(message: string, options?: ToastOptions): void {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? appConfig.toast.defaultDurationMs,
    });
  },

  info(message: string, options?: ToastOptions): void {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? appConfig.toast.defaultDurationMs,
    });
  },

  loading(message: string, options?: Pick<ToastOptions, 'description'>): string | number {
    return sonnerToast.loading(message, {
      description: options?.description,
    });
  },

  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
  ): void {
    void sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  dismiss(id?: string | number): void {
    sonnerToast.dismiss(id);
  },
} as const;
