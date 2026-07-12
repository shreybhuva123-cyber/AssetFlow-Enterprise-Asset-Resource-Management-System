# Architecture — AssetFlow

## Overview

AssetFlow uses a **7-layer clean architecture** where each layer has a single responsibility. Dependencies flow inward: UI layers never access the database directly.

```
UI (React Components)
  └── Page (Next.js App Router)
       └── Feature (Domain Logic)
            └── Hook (TanStack Query)
                 └── Service (Business Rules)
                      └── Repository (Data Access)
                           └── Prisma / Supabase
```

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC-first, streaming, server actions |
| Language | TypeScript (strict) | Type safety at all boundaries |
| Database | Supabase PostgreSQL | RLS, Auth, Realtime, Storage in one |
| ORM | Prisma 5 | Type-safe queries, migration control |
| State | Zustand 5 | Minimal, per-domain stores |
| Server State | TanStack Query 5 | Cache, retry, invalidation |
| Validation | Zod 3 | Runtime type validation + inference |
| UI | shadcn/ui + Radix | Accessible, unstyled primitives |
| Styling | Tailwind CSS 3 | Utility-first, design tokens |
| Animations | Framer Motion 11 | Production-quality motion |

## Data Flow

```
User Action
  → React Component (UI only)
  → Zustand (client state mutation)
  → TanStack Query mutation
  → API Route Handler (Next.js)
  → handleApiError (error normalisation)
  → Service.executeWithErrorHandling
  → Repository.create/update/findPaginated
  → Prisma (type-safe SQL)
  → Supabase PostgreSQL (RLS enforced)
```

## Why Supabase + Prisma Together

Supabase and Prisma are complementary, not redundant:

- **Supabase** provides: Auth (JWT+RLS), Storage (S3-compatible), Realtime (WebSocket), hosted PostgreSQL
- **Prisma** provides: type-safe query builder, migration history, compile-time errors, schema-as-code

Using Prisma for application queries gives us typed models, relation loading, and version-controlled migrations. Using Supabase directly is reserved for auth, storage, and realtime subscriptions.

## Authentication Flow

```
1. Client: supabase.auth.signInWithPassword()
2. Supabase: issues JWT (access + refresh tokens)
3. Browser: tokens stored in cookies via @supabase/ssr
4. Next.js Middleware: updateSession() refreshes tokens on every request
5. Server Components: requireServerAuth() verifies session
6. Supabase PostgreSQL: RLS policies enforce data isolation per org
```

Two-layer protection:
- **Route level**: Next.js middleware redirects unauthenticated users
- **Data level**: Supabase RLS prevents unauthorized data access even if a route is reached

## RBAC Model

Five roles with a strict hierarchy:

```
SUPER_ADMIN > ORG_ADMIN > ASSET_MANAGER > TECHNICIAN > VIEWER
```

Permissions are checked at three points:
1. **Route config** — `routesConfig.protected` defines required roles per path
2. **Sidebar** — nav items hidden if user lacks the view permission
3. **API routes** — `requirePermission()` guard on every handler
4. **Supabase RLS** — enforced at the database level independent of application code

## Realtime Architecture

Supabase Realtime delivers PostgreSQL change events over WebSocket. Subscriptions are org-scoped — each session subscribes to `org:{orgId}` channels. The `RealtimeProvider` establishes channels after auth hydration and tears them down on unmount.

## State Management Strategy

| State Type | Solution | Rationale |
|---|---|---|
| Server data | TanStack Query | Cache, staleness, invalidation |
| Auth session | Zustand (sessionStorage) | Persists tab session, clears on close |
| UI preferences | Zustand (localStorage) | Persists across sessions |
| Forms | React Hook Form + Zod | Uncontrolled, performant |
| Ephemeral UI | useState | Local to component |
