# Security — AssetFlow

## Authentication

- **Supabase Auth** issues short-lived JWTs (1 hour) with refresh tokens (7 days).
- Tokens are stored in **HttpOnly cookies** managed by `@supabase/ssr`, not `localStorage`.
- `updateSession()` in Next.js middleware refreshes tokens transparently on every request.
- Server components call `requireServerAuth()` — this validates the JWT server-side, never trusting client-supplied data.
- Passwords must meet complexity requirements defined in `authConfig.password` (min 8 chars, upper, lower, number, special).

## Authorization (RBAC)

Three independent enforcement layers prevent privilege escalation:

1. **Route middleware** (`src/middleware.ts`) — redirects unauthenticated users before any route handler runs.
2. **API route guards** — each handler validates the session and checks the required permission via `userHasPermission()`.
3. **Supabase RLS** — PostgreSQL Row Level Security enforces org-scoped data isolation at the database level, independent of application code.

If any layer fails, the others still protect the system.

## SQL Injection

Prisma ORM uses parameterised queries exclusively — raw SQL strings are never interpolated. Direct Supabase queries use the PostgREST API which is also parameterised. The only raw SQL in this codebase is in `database_reference.sql` (documentation only, never executed at runtime).

## XSS

- React escapes all content by default. `dangerouslySetInnerHTML` is never used.
- `next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `X-XSS-Protection: 1; mode=block`.
- The `highlightMatches()` utility returns an HTML string — it is only used in controlled contexts with sanitisation. Any extension must use `DOMPurify` or similar.

## CSRF

- Next.js App Router API routes require a valid Supabase JWT cookie — absent on cross-origin requests without `credentials: 'include'`.
- Mutation API routes (`POST`, `PUT`, `PATCH`, `DELETE`) require `Content-Type: application/json`.
- `SameSite=Lax` cookie policy blocks CSRF from third-party sites.

## Secrets Management

- All secrets are environment variables — never hardcoded.
- `.env.local` is in `.gitignore` and must never be committed.
- The `SUPABASE_SERVICE_ROLE_KEY` is server-side only — it must never appear in client bundles. Verified by `NEXT_PUBLIC_` prefix convention (service role key has no prefix).
- `validateSupabaseConfig()` throws at startup if required env vars are missing, preventing silent misconfigurations.

## Storage

- All storage buckets are **private** — no public access by default.
- File access requires a signed URL with a short expiry (1 hour max).
- File uploads validate MIME type and file size server-side before upload.
- File names are sanitised with `sanitizeFilename()` to prevent path traversal.

## Rate Limiting

`authConfig.rateLimit` defines limits for login attempts (5 per 15 min) and password resets (3 per hour). Enforcement is implemented at the API route layer using IP-based counters.

## HTTP Security Headers

Set in `next.config.ts` for all responses:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-XSS-Protection` | `1; mode=block` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | (production only — tightened per environment) |

## Security Checklist

- [x] Auth tokens in HttpOnly cookies, not localStorage
- [x] JWT validated server-side on every protected request
- [x] RLS enabled on all user-data tables
- [x] Parameterised queries only (Prisma + PostgREST)
- [x] No `dangerouslySetInnerHTML`
- [x] Security headers on all responses
- [x] Secrets excluded from client bundles
- [x] File uploads validated for MIME type and size
- [x] Soft deletes — no hard DELETEs in production
- [x] Audit log — immutable trail of all state changes
- [x] Rate limiting on auth endpoints
- [x] SameSite=Lax cookie policy
