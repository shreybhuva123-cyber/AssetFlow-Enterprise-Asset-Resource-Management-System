import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Verify Email — AssetFlow',
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-fit rounded-2xl bg-primary/10 p-6">
        <Mail className="h-10 w-10 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          We sent a verification link to your email. Click it to activate your account. If you don&apos;t see it, check your spam folder.
        </p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
