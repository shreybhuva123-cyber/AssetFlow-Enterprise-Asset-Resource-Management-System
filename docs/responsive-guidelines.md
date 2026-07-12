# Responsive Design Guidelines

## Breakpoints

| Name | Min Width | Tailwind Prefix | Typical Device |
|------|-----------|-----------------|----------------|
| xs   | 0px       | (default)       | Mobile portrait |
| sm   | 640px     | `sm:`           | Mobile landscape / small tablet |
| md   | 768px     | `md:`           | Tablet |
| lg   | 1024px    | `lg:`           | Laptop |
| xl   | 1280px    | `xl:`           | Desktop |
| 2xl  | 1536px    | `2xl:`          | Wide desktop |

## Layout Principles

### Mobile-First
All Tailwind classes are written mobile-first. The base class applies to all sizes, responsive prefixes override for larger screens:

```tsx
// Good: mobile-first
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

// Bad: desktop-first override
<div className="grid grid-cols-4 sm:grid-cols-2 xs:grid-cols-1">
```

### Sidebar Behavior
- **Mobile (< lg):** Sidebar is hidden by default, slides in as overlay. Toggle via mobile menu button in header.
- **Desktop (≥ lg):** Sidebar is always visible. Collapses to icon-only mode (64px) when `isExpanded = false`.

### Page Content Width
- Sidebar width: 256px expanded, 64px collapsed
- Main content fills remaining viewport width
- Content max-width: unconstrained (full column), but individual sections may apply `max-w-*` for readability

### Grid Columns

| Breakpoint | 2-col | 3-col | 4-col |
|------------|-------|-------|-------|
| Mobile     | 1     | 1     | 2     |
| sm (640px) | 2     | 2     | 2     |
| md (768px) | 2     | 3     | 2     |
| lg (1024px)| 2     | 3     | 4     |

The `StatGrid` and `QuickActions` components implement these breakpoints automatically.

## Responsive Patterns

### Page Header
On mobile: title and actions stack vertically. On `sm+`: title left, actions right (flex row).

### Tables
- Mobile: horizontal scroll (`overflow-x-auto` wrapper)
- Consider hiding lower-priority columns below `md` using column visibility
- Never truncate key identifier columns (name, code, ID)

### Dialogs
- `size="sm"` dialogs are full-width on mobile (`max-w-sm` applies only at `sm+`)
- `size="full"` dialogs use `inset-4` on mobile to leave a visible edge
- Sheet (`side="bottom"`) is the mobile-friendly alternative to dialogs for complex forms

### Forms
- Single-column layout on mobile
- Two-column grid (`grid-cols-2`) at `md+` for wider forms
- Settings rows stack vertically on mobile, side-by-side at `sm+`

### Navigation
- Bottom navigation bar not yet implemented — use the mobile sidebar overlay for navigation
- Breadcrumbs truncate on mobile — only last 2 segments shown below `sm`

## Touch Targets

Minimum touch target size: **44×44px** (Apple HIG / WCAG 2.5.5).

- Buttons: `h-9` (36px) minimum — add padding around if needed
- Icon-only buttons: use `size="icon"` which sets `h-9 w-9`
- List items in mobile views: ensure vertical padding provides ≥ 44px height
- Sidebar nav items: `py-2` + `h-9` icon = ~44px total

## Typography Scaling

Text does not need to scale with breakpoints in most cases — the type scale is designed for readability at all sizes. Exception: display headings on marketing/auth pages may use responsive text sizing:

```tsx
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
```

## Testing

Test at these viewports:
- 375px (iPhone SE)
- 390px (iPhone 14)
- 768px (iPad)
- 1024px (iPad landscape / small laptop)
- 1440px (desktop)
- 1920px (wide desktop)
