'use client';

import { Toaster } from 'sonner';
import { appConfig } from '@/config/app.config';

export function ToastProvider() {
  return (
    <Toaster
      position={appConfig.toast.position}
      duration={appConfig.toast.defaultDurationMs}
      richColors
      closeButton
      expand={false}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast: 'font-sans text-sm',
          title: 'font-medium',
          description: 'text-muted-foreground',
        },
      }}
    />
  );
}
