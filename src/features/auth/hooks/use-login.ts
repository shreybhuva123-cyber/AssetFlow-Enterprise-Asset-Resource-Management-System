'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { notify } from '@/lib/toast';
import type { LoginInput } from '@/validators/auth';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Login failed');
      return json.data;
    },
    onSuccess: (data) => {
      if (data.profile) {
        setAuth(data.user, data.profile);
      }
      router.push('/dashboard');
    },
    onError: (err: Error) => {
      notify.error(err.message);
    },
  });
}
