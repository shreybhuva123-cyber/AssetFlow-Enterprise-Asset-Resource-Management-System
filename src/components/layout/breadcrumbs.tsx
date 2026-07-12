'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function formatSegment(segment: string): string {
  if (/^[0-9a-f-]{36}$/i.test(segment)) return 'Detail';
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function AppBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    return { label: formatSegment(segment), href };
  });

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={cn(
                    'text-muted-foreground hover:text-foreground transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
                  )}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
