'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/toast';
import type { RegisterInput } from '@/validators/auth';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? json.message ?? 'Registration failed');
      return json.data;
    },
    onSuccess: () => {
      notify.success('Account created! Check your email to verify your address.');
      router.push('/login?registered=true');
    },
    onError: (err: Error) => {
      notify.error(err.message);
    },
  });
}
