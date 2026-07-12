'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema, type ResetPasswordInput } from '@/validators/auth';
import { TextField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/toast';

export default function ResetPasswordPage() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Failed');
      return json.data;
    },
    onSuccess: () => {
      notify.success('Password updated. Please sign in with your new password.');
      router.push('/login');
    },
    onError: (err: Error) => notify.error(err.message),
  });

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={form.handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
        <TextField
          control={form.control}
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          required
        />
        <TextField
          control={form.control}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          required
        />
        <Button type="submit" className="w-full" loading={isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
