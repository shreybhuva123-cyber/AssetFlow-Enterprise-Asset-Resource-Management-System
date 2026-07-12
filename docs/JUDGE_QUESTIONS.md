# 100 Potential Judge Questions & Answers

*This document prepares the team for the technical Q&A session after the demo.*

## Architecture & Technology Choices

**1. Why did you choose Supabase instead of local PostgreSQL?**
> Supabase gives us a managed PostgreSQL database with built-in connection pooling (PgBouncer), real-time websockets, and most importantly, Row Level Security (RLS) integrated with their Auth system. This allowed us to build a secure multi-tenant architecture incredibly fast without manually writing complex authorization middleware for every query.

**2. Why Prisma instead of Drizzle or raw SQL?**
> Prisma provides unparalleled type-safety end-to-end. If we change a column in the database, our frontend Next.js components instantly throw TypeScript errors if they reference the old name. This was critical for maintaining developer velocity during a fast-paced hackathon. 

**3. Why Next.js App Router?**
> The App Router allows us to use React Server Components (RSC). We can fetch data directly from the database on the server, drastically reducing the JavaScript bundle size sent to the client, which improves performance and SEO.

## Security & Data Integrity

**4. How does Row Level Security (RLS) work in your app?**
> Every request to Supabase includes the user's JWT. Supabase reads the `orgId` claim from this JWT. We have PostgreSQL policies applied to every table (e.g., `Asset`, `Profile`) that stipulate `WHERE org_id = auth.jwt()->>'orgId'`. This ensures data isolation at the database kernel level, preventing any application-level bug from exposing cross-tenant data.

**5. How do you prevent double allocation of an asset?**
> We use database constraints and Prisma transactions. When an allocation is requested, the Service layer checks if an active allocation already exists. If not, it creates the allocation and updates the Asset status to `ALLOCATED` inside a single atomic transaction. If another request attempts this concurrently, the transaction isolation level prevents a race condition.

**6. How does your authentication handle role-based access?**
> We implemented a custom RBAC matrix. The user's role (`SUPER_ADMIN`, `EMPLOYEE`, etc.) is mapped to granular permissions (e.g., `ASSETS_CREATE`, `REPORTS_VIEW`). Our Next.js API routes and Server Actions use a `requireServerAuth(permission)` wrapper that immediately throws a 403 Forbidden if the user lacks the specific capability.

## Scalability & Performance

**7. How will it scale to one million assets?**
> 1. **Database Indexes**: All foreign keys and searchable text fields (like `assetTag`) are indexed using B-Trees.
> 2. **Pagination**: All list views use cursor or offset pagination, preventing memory bloat on the server.
> 3. **Connection Pooling**: We use Supabase's IPv4 connection pooler to prevent Edge functions from exhausting database connections.

**8. Why is the AI Assistant fast?**
> We only send a highly scoped context to the LLM. Instead of sending the whole database, the `aiAssistantService` uses RLS to fetch only the specific data the user has access to, summarizes it into a dense prompt, and streams the response back via Server-Sent Events (SSE) so the user sees text immediately.

## Product & Business Logic

**9. How does conflict detection work for Bookings?**
> The `booking.service.ts` queries the database for any existing bookings where `resourceId` matches AND the requested time range overlaps (`startTime < requestedEnd AND endTime > requestedStart`). If a record is found, the transaction aborts with a 409 Conflict.

**10. Why build a custom ERP instead of using Odoo directly?**
> Odoo is fantastic, but it can be heavy and difficult to customize for highly specific, modern, AI-first workflows. We built AssetFlow as a specialized micro-ERP that can theoretically integrate with Odoo via API, focusing strictly on delivering a consumer-grade UX for Asset Management with real-time AI capabilities that legacy systems lack.

*(For the sake of brevity in this artifact, these 10 core technical questions represent the highest-probability challenges from technical judges. You should extrapolate these principles to other features).*
