'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/validators/auth';
import { useLogin } from '@/features/auth/hooks/use-login';
import { TextField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const { mutate, isPending } = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

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
      />
      <TextField
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
      />

      <div className="flex items-center justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline font-medium">
          Create one
        </Link>
      </p>
    </form>
  );
}
