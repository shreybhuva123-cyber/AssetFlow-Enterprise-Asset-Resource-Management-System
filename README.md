# AssetFlow — Enterprise Asset & Resource Management

> Production-grade asset management built for engineering teams who demand clarity, control, and compliance.

Inspired by Linear, Notion, and Stripe Dashboard. Built with Next.js 15, Supabase, and Prisma.

---

## Architecture

```
UI (React) → Page (Next.js App Router) → Feature (Domain) → Hook (TanStack Query)
  → Service (Business Rules) → Repository (Data Access) → Prisma → Supabase PostgreSQL
```

See [docs/architecture.md](docs/architecture.md) for the full breakdown.

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 15 (App Router + RSC) |
| Language | TypeScript 5 (strict) |
| Database | Supabase PostgreSQL (Auth + RLS + Realtime + Storage) |
| ORM | Prisma 5 |
| UI | shadcn/ui + Radix UI + Tailwind CSS 3 |
| State | Zustand 5 (client) + TanStack Query 5 (server) |
| Validation | Zod 3 |
| Animations | Framer Motion 11 |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase credentials from your project dashboard

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database
npm run db:push

# 5. Seed with demo data (optional)
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only) |
| `SUPABASE_JWT_SECRET` | Yes | JWT secret for token verification |
| `DATABASE_URL` | Yes | Direct PostgreSQL connection (migrations) |
| `DATABASE_URL_POOL` | Yes | Pooled connection (queries, serverless) |
| `NEXT_PUBLIC_APP_URL` | No | App base URL (default: `http://localhost:3000`) |

See [.env.example](.env.example) for the full list with explanations.

## Project Structure

```
src/
├── app/          Next.js routes (auth + dashboard)
├── components/   Shared UI components
├── features/     Domain feature modules
├── config/       Application configuration
├── constants/    Immutable values
├── lib/          Infrastructure (prisma, utils, errors, logger)
├── providers/    React context providers
├── store/        Zustand state stores
├── types/        Global TypeScript types
├── validators/   Zod schemas
└── middleware.ts Route protection
```

See [docs/folder-structure.md](docs/folder-structure.md) for the complete guide.

## Features (Planned)

- **Asset Registry** — Track assets with full lifecycle management
- **Maintenance Management** — Preventive & corrective work orders
- **Procurement** — Purchase request workflow with approvals
- **Depreciation** — Straight-line, declining-balance, units-of-production
- **Location Management** — Hierarchical location tree
- **Reports & Analytics** — Configurable dashboards and exports
- **Audit Log** — Immutable trail of all changes
- **RBAC** — 5 roles: Super Admin, Org Admin, Asset Manager, Technician, Viewer

## User Roles

| Role | Access |
|---|---|
| Super Admin | Full platform access |
| Org Admin | Full access within their organization |
| Asset Manager | Assets, maintenance, procurement, depreciation |
| Technician | View assets, execute maintenance work orders |
| Viewer | Read-only access to all modules |

## Scripts

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # tsc --noEmit
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema (dev)
npm run db:migrate    # Run migrations (prod)
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio
```

## Documentation

- [Architecture](docs/architecture.md)
- [Coding Standards](docs/coding-standards.md)
- [Folder Structure](docs/folder-structure.md)
- [Security](docs/security.md)
- [Database Reference](database_reference.sql)
- [Prisma Guide](prisma/README.md)

---

Built for the Odoo Hackathon. Production-quality foundations, zero compromises.
