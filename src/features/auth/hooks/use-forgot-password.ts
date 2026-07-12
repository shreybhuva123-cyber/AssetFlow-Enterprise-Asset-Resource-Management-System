'use client';

import { useMutation } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import type { ForgotPasswordInput } from '@/validators/auth';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (input: ForgotPasswordInput) => {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Request failed');
      return json.data;
    },
    onSuccess: () => {
      notify.success('If that email is registered, a reset link has been sent.');
    },
    onError: (err: Error) => {
      notify.error(err.message);
    },
  });
}
