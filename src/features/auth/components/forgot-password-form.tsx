'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/validators/auth';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import { TextField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          If an account with that email exists, we&apos;ve sent a password reset link. Check your inbox.
        </p>
        <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((data) => mutate(data))} noValidate className="space-y-4">
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        required
        hint="We'll send a reset link to this address"
      />

      <Button type="submit" className="w-full" loading={isPending}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
