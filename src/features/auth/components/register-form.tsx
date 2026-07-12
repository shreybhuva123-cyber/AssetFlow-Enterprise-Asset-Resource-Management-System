'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/validators/auth';
import { useRegister } from '@/features/auth/hooks/use-register';
import { TextField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/alert';

export function RegisterForm() {
  const { mutate, isPending } = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', firstName: '', lastName: '' },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutate(data))} noValidate className="space-y-4">
      <InlineAlert
        variant="info"
        message="New accounts are created as Employee. An Admin can promote you after joining."
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          control={form.control}
          name="firstName"
          label="First name"
          autoComplete="given-name"
          placeholder="Jane"
          required
        />
        <TextField
          control={form.control}
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          placeholder="Smith"
          required
        />
      </div>

      <TextField
        control={form.control}
        name="email"
        label="Work email"
        type="email"
        autoComplete="email"
        placeholder="jane@company.com"
        required
      />

      <TextField
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Create a strong password"
        required
        hint="Min 8 characters, uppercase, lowercase, number, special char"
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
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
