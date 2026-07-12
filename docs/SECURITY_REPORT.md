# Security & Compliance Report

AssetFlow handles sensitive enterprise data. Security has been implemented following the Principle of Least Privilege and Zero Trust Architecture.

## 1. Data Isolation (Multi-Tenancy)
- **Row Level Security (RLS)**: Powered by Supabase PostgreSQL. Every query is scoped to the `org_id` attached to the authenticated user's JWT. It is cryptographically impossible for a user in Organization A to read data from Organization B.
- **Foreign Key Constraints**: Strict `ON DELETE CASCADE` and `SET NULL` policies prevent orphaned data and accidental exposure.

## 2. Authentication & Authorization
- **Supabase Auth**: Secure, HTTP-only, SameSite=Lax cookies handle session state. No JWTs are stored in `localStorage`.
- **Role-Based Access Control (RBAC)**: A bitwise-style permission matrix separates `SUPER_ADMIN`, `ORG_ADMIN`, `DEPT_HEAD`, and `EMPLOYEE`.
- **Server-Side Validation**: The `requireServerAuth()` middleware intercepts all protected API routes, verifying both authentication status and specific required permissions before executing business logic.

## 3. Vulnerability Mitigation
- **SQL Injection**: Handled natively by Prisma ORM's parameterized query engine.
- **Cross-Site Scripting (XSS)**: React handles string escaping automatically. Markdown rendering (for AI responses) uses sanitized HTML parsing.
- **Cross-Site Request Forgery (CSRF)**: Next.js Server Actions and standard CORS policies secure mutation endpoints.

## 4. API Integrity
- **Input Validation**: `zod` schemas strictly type-check all incoming payload structures on both the client (form validation) and the server (API endpoint validation).
- **Rate Limiting**: (Planned for Edge layer) to prevent brute-force and DDoS attacks on the `/api/ai/assistant` endpoint.

## 5. AI Data Privacy
- The AI context gathering mechanism (`aiAssistantService`) ensures that the LLM only receives data scoped to the exact `orgId` and RBAC level of the requesting user. No organizational data is permanently stored in the LLM provider's memory.
