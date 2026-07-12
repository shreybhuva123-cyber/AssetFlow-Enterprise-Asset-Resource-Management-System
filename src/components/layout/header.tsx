'use client';

import { Bell, Menu, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSidebarStore } from '@/store/sidebar.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { cn } from '@/lib/utils/cn';
import { AppBreadcrumbs } from './breadcrumbs';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className={cn(
        'h-8 w-8 rounded-md flex items-center justify-center',
        'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function NotificationBell() {
  const { unreadCount } = useNotificationsStore();

  return (
    <button
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      className={cn(
        'relative h-8 w-8 rounded-md flex items-center justify-center',
        'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <Bell className="h-4 w-4" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function AppHeader() {
  const { toggleMobileOpen } = useSidebarStore();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 shrink-0">
      <button
        onClick={toggleMobileOpen}
        aria-label="Toggle navigation"
        className={cn(
          'lg:hidden h-8 w-8 rounded-md flex items-center justify-center',
          'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      <AppBreadcrumbs />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
