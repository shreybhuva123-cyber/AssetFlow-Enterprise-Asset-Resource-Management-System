import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create Account — AssetFlow',
  description: 'Create your AssetFlow employee account',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All accounts start as Employee — Admins can change your role after you join.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
