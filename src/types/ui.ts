import type { ElementType } from 'react';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'ghost'
  | 'outline'
  | 'link';
export type ColorScheme =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Placement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ComponentStatus = 'active' | 'inactive' | 'pending' | 'error';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ElementType;
  isCurrent?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: ElementType;
  badge?: string | number;
  isActive?: boolean;
  isExternal?: boolean;
  requiredPermission?: string;
  children?: NavItem[];
}

export interface NavigationGroup {
  title: string;
  items: NavItem[];
}

export interface TableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T & string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: 'left' | 'right';
  hidden?: boolean;
}

export interface EmptyStateConfig {
  title: string;
  description?: string;
  icon?: ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalConfig {
  id: string;
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
  options?: Array<{ label: string; value: string }>;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ElementType;
  color?: ColorScheme;
}
