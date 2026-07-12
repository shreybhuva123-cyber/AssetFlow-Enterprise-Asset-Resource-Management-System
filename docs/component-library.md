# Component Library

## Component Categories

### UI Primitives (`src/components/ui/`)

Low-level, unstyled-to-styled building blocks. Import via `@/components/ui`.

| Component | Description |
|-----------|-------------|
| `Button` | Primary action. Variants: default, destructive, outline, secondary, ghost, link, success. Props: `loading`, `leftIcon`, `rightIcon`, `asChild` |
| `Input` | Text input with `leftElement`/`rightElement` slots and `error` state |
| `Textarea` | Multi-line text with `error` state |
| `Label` | Accessible form label with `required` asterisk |
| `Badge` | Status badge. Variants: default, secondary, destructive, outline, success, warning, info, muted. Prop: `dot` |
| `Avatar` / `UserAvatar` | User avatar with image fallback initials |
| `Card` | Surface container with Header, Title, Description, Content, Footer |
| `Dialog` | Modal with size prop (sm/md/lg/xl/full), animated overlay |
| `Sheet` | Slide-in panel with `side` prop (left/right/top/bottom) |
| `Select` | Accessible dropdown with error state |
| `Tabs` / `TabsUnderline*` | Pill and underline tab variants |
| `Accordion` | Collapsible sections |
| `Popover` | Floating content anchored to trigger |
| `DropdownMenu` | Context/action menus with keyboard navigation |
| `Tooltip` / `WithTooltip` | Hover labels with delay |
| `Progress` | Progress bar with size and color variants |
| `Switch` | Toggle input |
| `Checkbox` | Checkbox with indeterminate state |
| `ScrollArea` | Custom scrollbar styling |
| `Separator` | Horizontal/vertical divider |
| `Alert` / `InlineAlert` | Feedback messages with icon variants |
| `Skeleton` | Loading placeholders (Text, Card, Table, Form) |

### Form Components (`src/components/forms/`)

RHF-integrated form fields using `Controller`. All accept `name`, `control`, `label`, `hint`, `error`.

| Component | Description |
|-----------|-------------|
| `TextField<T>` | Controlled text input |
| `TextareaField<T>` | Controlled textarea |
| `SelectField<T>` | Controlled select dropdown |
| `CurrencyField<T>` | Currency input storing integer cents, displaying formatted decimals |
| `DateField<T>` | Native date picker with ISO string output |
| `SearchInput` | Search box with clear button and debounce-ready |
| `FormActions` | Submit/cancel button row with `align` and `isSubmitting` props |

### Table Components (`src/components/table/`)

Built on `@tanstack/react-table` v8.

| Component | Description |
|-----------|-------------|
| `DataTable<TData>` | Full-featured table with sorting, filtering, column visibility, row selection, pagination |
| `DataTableToolbar` | Search + column toggle |
| `DataTablePagination` | Page controls with size selector |

### Dashboard Widgets (`src/components/dashboard/`)

| Component | Description |
|-----------|-------------|
| `KpiCard` | Metric card with value, trend, icon, and loading skeleton |
| `StatGrid` | Responsive grid wrapper for KpiCards |
| `ActivityFeed` | Time-ordered activity list with avatars and relative time |
| `ChartCard` | Chart container with title, header actions, loading skeleton, and chart style constants |
| `QuickActions` | Grid of clickable action tiles (links or buttons) |

### Feedback Components (`src/components/feedback/`)

| Component | Description |
|-----------|-------------|
| `AssetStatusChip` | Asset status badge with correct semantic color |
| `MaintenanceStatusChip` | Maintenance order status badge |
| `ProcurementStatusChip` | Purchase order status badge |
| `WorkOrderStatusChip` | Work order status badge |
| `ConfirmDialog` | Confirmation modal with variant (danger/warning/info/success) |
| `DeleteDialog` | Pre-configured delete confirmation |
| `ApproveDialog` | Pre-configured approval confirmation |
| `LoadingSpinner` | Animated spinner (sm/md/lg/xl) |
| `FullPageLoader` | Fullscreen loading overlay with backdrop blur |
| `InlineLoader` | Centered spinner with label |
| `SectionLoader` | Min-height section loading state |
| `NotFoundError` | 404 error page |
| `UnauthorizedError` | 401 error page |
| `ForbiddenError` | 403 error page |
| `ServerError` | 500 error page with retry |
| `OfflineError` | No-connection state |
| `NetworkError` | API connection failure |
| `EmptyResource` | No-data state with optional action |

### Animation Components (`src/components/animations/`)

Thin Framer Motion wrappers that respect `prefers-reduced-motion`.

| Component | Props | Description |
|-----------|-------|-------------|
| `FadeIn` | `delay`, `duration` | Opacity fade |
| `FadeInUp` | `delay` | Fade with upward slide |
| `StaggerContainer` | `staggerDelay` | Container for staggered children |
| `StaggerItem` | — | Stagger-aware child |
| `SlideIn` | `direction`, `delay`, `duration` | Directional slide |
| `PageTransition` | — | Route change animation |
| `ScaleIn` | `delay`, `duration`, `from` | Scale + fade |
| `Pulse` | — | Infinite scale pulse |

### Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `AppSidebar` | Animated collapsible nav with role-based filtering |
| `AppHeader` | Top bar with breadcrumbs, theme toggle, notifications |
| `AppBreadcrumbs` | Auto-generated breadcrumbs from URL |
| `PageHeader` | Standard page title + description + actions header |
| `PageHeaderSkeleton` | Loading state for PageHeader |
| `SettingsLayout` | Two-column layout with nav sidebar |
| `SettingsSection` | Card-wrapped settings group |
| `SettingsRow` | Label + control settings row |

## Usage Rules

1. Import from barrel: `import { Button } from '@/components/ui'`
2. Never bypass the barrel to import individual files unless there is a server/client boundary issue
3. Status chips must always come from `@/components/feedback` — never construct ad-hoc Badge variants for status
4. Never call `toast()` directly — use `notify` from `@/lib/toast`
5. `FullPageLoader` is for auth/init screens only — use `SectionLoader` or `InlineLoader` within pages
