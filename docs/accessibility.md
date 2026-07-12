# Accessibility Guidelines

AssetFlow targets **WCAG 2.1 AA** compliance throughout.

## Core Principles

### Keyboard Navigation
- All interactive elements must be reachable and operable via keyboard
- Tab order must follow visual reading order
- Custom interactive components use Radix UI primitives which implement WAI-ARIA patterns by default
- Focus rings are visible on all focusable elements — the `.focus-ring` utility class is available for custom elements

### Screen Reader Support
- Decorative icons use `aria-hidden="true"` — all icons in the codebase already have this
- Interactive icons without visible text labels use `aria-label`
- Form inputs are associated with their labels via `htmlFor` / `id` pairs
- Error messages use `role="alert"` and are associated via `aria-describedby`
- Loading states use `role="status"` and `aria-live="polite"`
- Tables include proper `<thead>`, `<th scope="col">`, and `<caption>` or `aria-label`

### Color Contrast
- Text contrast ratio ≥ 4.5:1 for normal text (WCAG AA)
- Text contrast ratio ≥ 3:1 for large text (≥18px bold or ≥24px)
- Interactive element boundaries must have ≥ 3:1 contrast against adjacent colors
- Never use color alone to convey information — status chips include text labels alongside color

### Focus Management
- Modals trap focus using Radix Dialog (built-in)
- On modal close, focus returns to the trigger element (Radix default behavior)
- Dynamic content changes use `aria-live` regions

### Motion
- All Framer Motion animation wrappers check `usePrefersReducedMotion()` and render a static `<div>` when the user has requested reduced motion
- CSS animations in `globals.css` respect `prefers-reduced-motion: reduce`
- No animations should autoplay for more than 5 seconds or loop indefinitely without user control (exception: the `Pulse` component is used only for loading indicators)

## Component-Specific Notes

### Button
- `loading` state adds `aria-busy` semantics via the spinner
- `disabled` prop uses the native HTML `disabled` attribute (not just visual opacity)
- Use `asChild` with `<Link>` for navigation — renders as `<a>` with correct semantics

### Input / Textarea
- `error` prop sets `aria-invalid="true"` and links the error message via `aria-describedby`
- `required` on `Label` adds a visual asterisk but the underlying `<input required>` should also be set via form validation

### DataTable
- Column headers are `<th>` elements with sort buttons inside
- Selected row count is announced via `aria-live`
- Empty state includes `role="status"`

### Dialog / Sheet
- Always provide a `DialogTitle` — it becomes the accessible name
- `DialogDescription` is optional but recommended for complex dialogs
- Do not `hideClose` without providing an alternative close mechanism

### EmptyState / Error Pages
- Include descriptive headings that convey the state
- Action buttons have clear, unambiguous labels

## Testing Checklist

Before shipping any page or component:

- [ ] Navigate entire page using only Tab / Shift+Tab / Enter / Space / Arrow keys
- [ ] Test with a screen reader (NVDA on Windows, VoiceOver on Mac/iOS)
- [ ] Verify all form fields have visible labels
- [ ] Verify error messages are announced
- [ ] Verify focus returns to trigger after modal close
- [ ] Check color contrast of all text and interactive elements
- [ ] Enable `prefers-reduced-motion` and verify no animations play
- [ ] Resize to 320px viewport width and verify no content is clipped or lost
