# Prisma — AssetFlow

## Setup

```bash
# Install dependencies (already in package.json)
npm install

# Copy env and fill in your Supabase connection strings
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Seed with demo data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Connection Strings

Two connection strings are required from Supabase Dashboard → Settings → Database:

| Variable | Port | Used for |
|---|---|---|
| `DATABASE_URL` | 5432 | Direct — Prisma migrations |
| `DATABASE_URL_POOL` | 6543 | Pooled — Prisma queries in serverless |

Add `?pgbouncer=true&connection_limit=1` to the pooled URL.

## Schema Conventions

- All IDs are `UUID` with `gen_random_uuid()` defaults
- All timestamps use `@db.Timestamptz` (timezone-aware)
- Soft deletes via `deletedAt` — never hard DELETE in production
- Column names snake_case in DB, camelCase in Prisma via `@map`
- All tables mapped via `@@map` for consistent DB naming
- Audit log is append-only — no `updatedAt`, never soft-delete

## Migration Workflow

```bash
# Create a migration (after schema change)
npx prisma migrate dev --name describe_your_change

# Apply pending migrations (CI/production)
npx prisma migrate deploy

# Reset database (destructive — dev only)
npx prisma migrate reset
```

## Singleton Pattern

The Prisma client uses `globalThis` to prevent connection pool exhaustion during Next.js hot reload:

```ts
export const prisma: PrismaClient =
  globalThis.__prismaClient ?? buildPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma;
}
```

Always import `prisma` from `@/lib/prisma` — never instantiate `new PrismaClient()` in application code.
