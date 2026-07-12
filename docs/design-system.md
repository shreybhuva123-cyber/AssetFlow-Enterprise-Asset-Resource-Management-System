# AssetFlow Design System

## Overview

AssetFlow uses a structured token-based design system built on top of shadcn/ui, Radix UI primitives, Tailwind CSS, and Framer Motion. All visual decisions reference design tokens rather than hardcoded values.

## Token Architecture

Tokens live in `src/styles/tokens/` and are organized by category:

| File | Purpose |
|------|---------|
| `colors.ts` | Semantic color aliases mapping to HSL CSS custom properties |
| `spacing.ts` | 8-point grid system with semantic layout aliases |
| `typography.ts` | Font families, sizes, weights, and complete text styles |
| `radius.ts` | Border radius scale referencing `--radius` CSS variable |
| `shadow.ts` | Subtle shadow scale and per-component shadow classes |
| `motion.ts` | Duration, easing, and Framer Motion variant presets |
| `z-index.ts` | Z-index scale from 0 (base) to 700 (command palette) |
| `breakpoints.ts` | Breakpoint pixel values and media query strings |
| `opacity.ts` | Numeric opacity scale with semantic aliases |
| `sizes.ts` | Component dimension classes for consistent sizing |

## Color System

Colors use HSL CSS custom properties defined in `src/styles/globals.css`. Both light and dark themes are defined. Semantic tokens are mapped in `src/styles/tokens/colors.ts`.

### Palette Roles

- **background / foreground** — page background and primary text
- **card** — surface above background
- **muted** — subtle backgrounds (skeleton, badge fills)
- **accent** — interactive hover states
- **primary** — brand actions (buttons, links, active states)
- **destructive** — danger/error/delete
- **success / warning / info** — semantic status colors (custom additions)
- **border / input** — form element borders
- **ring** — focus ring color

## Spacing

Based on a strict 8-point grid. All spacing values are multiples of 4px. Never use arbitrary spacing not in the scale.

```
4px  → space-1
8px  → space-2
12px → space-3
16px → space-4
24px → space-6
32px → space-8
48px → space-12
64px → space-16
```

## Typography Scale

| Style | Size | Weight | Use |
|-------|------|--------|-----|
| display-2xl | 72px | 700 | Hero |
| display-lg | 48px | 700 | Page hero |
| heading-xl | 30px | 600 | Section title |
| heading-lg | 24px | 600 | Page title |
| heading-md | 20px | 600 | Card title |
| body-lg | 18px | 400 | Lead text |
| body-md | 16px | 400 | Body |
| body-sm | 14px | 400 | Labels, form fields |
| body-xs | 12px | 400 | Captions, hints |
| code | 13px | 400 | Monospace |

## Dark Mode

Dark mode is handled by `next-themes` with `attribute="class"`. The `dark` class on `<html>` activates the dark theme CSS custom properties. Never use explicit colors like `bg-white` — always use semantic tokens (`bg-background`, `text-foreground`, etc.).

## Icon System

All icons are imported from `src/lib/icons.ts` — never import directly from `lucide-react` in feature code. The registry is organized by domain category to make icons discoverable and replaceable.

```ts
import { Icons } from '@/lib/icons';
// Icons.Assets.QrCode, Icons.Maintenance.Wrench, etc.
```
