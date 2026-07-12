'use client';

import Link from 'next/link';
import { ShieldOff, Lock, ServerCrash, WifiOff, SearchX, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ErrorStateProps {
  className?: string;
}

function ErrorLayout({
  icon: Icon,
  iconClass,
  code,
  title,
  description,
  children,
  className,
}: {
  icon: React.ElementType;
  iconClass: string;
  code?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 py-24 text-center', className)}>
      <div className={cn('rounded-2xl bg-muted p-6', iconClass)}>
        <Icon className="h-12 w-12" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        {code && (
          <p className="text-6xl font-bold tracking-tight text-muted-foreground/30">{code}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  );
}

export function NotFoundError({ className }: ErrorStateProps) {
  return (
    <ErrorLayout
      icon={SearchX}
      iconClass="text-muted-foreground"
      code="404"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      className={className}
    >
      <Button asChild variant="outline">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </ErrorLayout>
  );
}

export function UnauthorizedError({ className }: ErrorStateProps) {
  return (
    <ErrorLayout
      icon={Lock}
      iconClass="text-warning"
      code="401"
      title="Authentication Required"
      description="You need to sign in to access this page."
      className={className}
    >
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    </ErrorLayout>
  );
}

export function ForbiddenError({ className }: ErrorStateProps) {
  return (
    <ErrorLayout
      icon={ShieldOff}
      iconClass="text-destructive"
      code="403"
      title="Access Denied"
      description="You don't have permission to view this page. Contact your administrator if you believe this is an error."
      className={className}
    >
      <Button asChild variant="outline">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </ErrorLayout>
  );
}

interface ServerErrorProps extends ErrorStateProps {
  onRetry?: () => void;
}

export function ServerError({ className, onRetry }: ServerErrorProps) {
  return (
    <ErrorLayout
      icon={ServerCrash}
      iconClass="text-destructive"
      code="500"
      title="Something Went Wrong"
      description="An unexpected error occurred on our end. We've been notified and are looking into it."
      className={className}
    >
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
      <Button asChild variant="outline">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </ErrorLayout>
  );
}

interface OfflineErrorProps extends ErrorStateProps {
  onRetry?: () => void;
}

export function OfflineError({ className, onRetry }: OfflineErrorProps) {
  return (
    <ErrorLayout
      icon={WifiOff}
      iconClass="text-muted-foreground"
      title="You're Offline"
      description="Check your internet connection and try again."
      className={className}
    >
      {onRetry && (
        <Button onClick={onRetry}>
          Retry
        </Button>
      )}
    </ErrorLayout>
  );
}

interface EmptyResourceProps extends ErrorStateProps {
  resourceName: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyResource({ className, resourceName, onAction, actionLabel }: EmptyResourceProps) {
  return (
    <ErrorLayout
      icon={FileX}
      iconClass="text-muted-foreground"
      title={`No ${resourceName} Found`}
      description={`There are no ${resourceName.toLowerCase()} to display yet.`}
      className={className}
    >
      {onAction && actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </ErrorLayout>
  );
}

interface NetworkErrorProps extends ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function NetworkError({ className, message, onRetry }: NetworkErrorProps) {
  return (
    <ErrorLayout
      icon={WifiOff}
      iconClass="text-destructive"
      title="Connection Error"
      description={message ?? 'Failed to connect to the server. Please check your connection and try again.'}
      className={className}
    >
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </ErrorLayout>
  );
}
