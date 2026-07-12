# UI/UX Guidelines

## Design Principles

1. **Clarity over cleverness** — Every UI element should have an obvious purpose. When in doubt, add a label.
2. **Consistency over customization** — Use existing components before building new ones. Extend rather than replace.
3. **Progressive disclosure** — Show the most important information first. Hide complexity behind expandable sections, tabs, or drill-downs.
4. **Feedback for every action** — Loading, success, and error states are required for all async operations.
5. **Destructive actions require confirmation** — Use `DeleteDialog` or `ConfirmDialog` for any irreversible operation.

## Interaction Patterns

### Loading States
- **Page-level loads:** Use `SkeletonForm`, `SkeletonTable`, or `SkeletonCard` — never blank pages
- **Button actions:** Use `loading` prop on `Button` — the button becomes disabled and shows a spinner
- **Section refreshes:** Use `InlineLoader` or `SectionLoader`
- **Full app init / auth check:** Use `FullPageLoader`
- **Never block the entire UI** for background syncs

### Toast Notifications

Always use `notify` from `@/lib/toast`:

```ts
notify.success('Asset created');
notify.error('Failed to save — please try again');
notify.promise(saveAsset(), {
  loading: 'Saving...',
  success: 'Asset saved',
  error: 'Failed to save',
});
```

Do NOT call `toast()` directly from Sonner.

### Form Submission
1. Validate with Zod schema before submit
2. Set button to `loading` state
3. Call API
4. On success: show `notify.success`, navigate or close modal
5. On error: show `notify.error` with actionable message, keep form open

### Confirmation Flows
- Delete: always confirm with `DeleteDialog` — never delete on first click
- Approve/reject: use `ApproveDialog` or `ConfirmDialog(variant="warning")`
- Bulk actions: confirm with count — "Delete 5 assets?"

### Empty States
- Show `EmptyState` or `EmptyResource` — never a blank white space
- Include a CTA if the user can take an action (e.g., "Create your first asset")
- Differentiate "no data yet" from "no results for search"

### Error States
- Network/API errors: show `NetworkError` with retry button
- 403: show `ForbiddenError` — do not show partial data
- 404: show `NotFoundError` with dashboard link
- Validation errors: show inline below the field (not in a toast)

## Visual Hierarchy

### Page Structure
```
PageHeader (title + actions)
  └─ Tabs (if multiple views)
     └─ DataTable / Form / Cards
```

### Card Content
- `CardHeader`: title + optional description
- `CardContent`: the main content
- `CardFooter`: actions (secondary/tertiary only — primary goes in PageHeader)

### Spacing Rhythm
- Between page sections: `gap-6` or `space-y-6`
- Inside a card: `p-6` (CardContent default)
- Between form fields: `space-y-4`
- Between label and input: `space-y-1.5` (Label default)

## Status Colors

Always use the status chip components — never manually apply status colors to Badge:

```tsx
// Good
<AssetStatusChip status={asset.status} />

// Bad — bypasses the centralized config
<Badge variant="success">Active</Badge>
```

## Tables

- Default density: `comfortable` (48px rows)
- Show a maximum of 10 columns at base viewport — hide others via column visibility
- Always include a `Name` / primary identifier column as the first column
- The primary column should link to the detail view
- Empty table state: `EmptyResource` inside `DataTable`
- Loading state: `SkeletonTable` until data arrives

## Modals

- Use `Dialog size="sm"` for confirmations
- Use `Dialog size="md"` for single-record create/edit forms
- Use `Dialog size="lg"` for forms with many fields or tabs
- Use `Sheet side="right"` for detail panes that stay alongside the list
- Avoid modals within modals — use a multi-step dialog or a separate page instead

## Color Usage

- **Primary (blue):** CTAs, active navigation, links
- **Success (green):** Completed, active, approved states
- **Warning (amber):** In-progress, pending, attention needed
- **Destructive (red):** Delete, reject, error
- **Info (blue-muted):** Informational, scheduled, neutral progress
- **Muted:** Disabled states, draft, archived
- **Secondary:** Secondary actions, badges with no strong semantic meaning
