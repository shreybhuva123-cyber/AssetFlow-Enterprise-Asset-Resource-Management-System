'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShoppingCart,
  TrendingDown,
  MapPin,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowRightLeft,
  CalendarDays,
  ClipboardCheck,
  LineChart,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useSidebarStore } from '@/store/sidebar.store';
import { useAuthStore } from '@/store/auth.store';
import { userHasPermission } from '@/lib/utils/permissions';
import { Permission } from '@/constants/permissions';
import type { UserRole } from '@/types/auth';

const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, permission: null },
  { path: '/assets',      label: 'Assets',      icon: Package,         permission: Permission.ASSETS_READ },
  { path: '/allocations', label: 'Allocations', icon: Users,           permission: Permission.ASSETS_READ },
  { path: '/transfers',   label: 'Transfers',   icon: ArrowRightLeft,  permission: Permission.ASSETS_READ },
  { path: '/bookings',    label: 'Bookings',    icon: CalendarDays,    permission: Permission.ASSETS_READ },
  { path: '/approvals',   label: 'Approvals',   icon: ClipboardCheck,  permission: Permission.ASSETS_READ },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench,          permission: Permission.MAINTENANCE_READ },
  { path: '/procurement', label: 'Procurement', icon: ShoppingCart,    permission: Permission.PROCUREMENT_READ },
  { path: '/depreciation',label: 'Depreciation',icon: TrendingDown,    permission: Permission.DEPRECIATION_READ },
  { path: '/locations',   label: 'Locations',   icon: MapPin,          permission: Permission.LOCATIONS_READ },
  { path: '/reports',     label: 'Reports',     icon: BarChart3,       permission: Permission.REPORTS_VIEW },
  { path: '/analytics',   label: 'Analytics',   icon: LineChart,       permission: Permission.REPORTS_VIEW },
  { path: '/audit',       label: 'Audit Cycles',icon: Shield,          permission: Permission.AUDIT_READ },
  { path: '/activity-logs',label:'Activity Logs',icon: Activity,       permission: Permission.AUDIT_READ },
  { path: '/settings',    label: 'Settings',    icon: Settings,        permission: Permission.SETTINGS_READ },
] as const;

function NavItem({
  item,
  isExpanded,
  isActive,
}: {
  item: typeof NAV_ITEMS[number];
  isExpanded: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      aria-label={isExpanded ? undefined : item.label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon className="shrink-0 h-4 w-4" aria-hidden="true" />
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, toggleExpanded, setMobileOpen } = useSidebarStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    if (!profile?.role) return false;
    return userHasPermission(profile.role as UserRole, item.permission as Permission);
  });

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <motion.aside
        animate={{ width: isExpanded ? 256 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'relative hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border z-20 shrink-0',
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-sidebar-primary-foreground">AF</span>
                </div>
                <span className="font-semibold text-sidebar-foreground text-sm whitespace-nowrap">
                  AssetFlow
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(
              'ml-auto rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            )}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-1">
          {visibleItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isExpanded={isExpanded}
              isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
            />
          ))}
        </nav>

        {profile && (
          <div className="border-t border-sidebar-border p-3">
            <div className={cn('flex items-center gap-3 px-2 py-1.5 rounded-lg', isExpanded && 'min-w-0')}>
              <div className="w-7 h-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-sidebar-primary">
                  {(profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')}
                </span>
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden min-w-0"
                  >
                    <p className="text-xs font-medium text-sidebar-foreground truncate whitespace-nowrap">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50 truncate whitespace-nowrap">
                      {profile.role}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
