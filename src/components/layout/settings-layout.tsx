import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface SettingsNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
}

interface SettingsLayoutProps {
  title: string;
  description?: string;
  navItems: SettingsNavItem[];
  activeHref: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsLayout({
  title,
  description,
  navItems,
  activeHref,
  children,
  className,
}: SettingsLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="flex flex-col gap-1" aria-label="Settings navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-6">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsRow({ label, description, children, className }: SettingsRowProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
