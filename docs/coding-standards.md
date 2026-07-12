# Coding Standards — AssetFlow

## TypeScript

- **Strict mode** always. No `any`. No `@ts-ignore` without a documented reason.
- Infer types from Zod schemas: `type Foo = z.infer<typeof fooSchema>`
- Prefer `interface` for object shapes that may be extended; `type` for unions and mapped types.
- Always annotate function return types for exported functions.
- Use `unknown` when the type is truly unknown; narrow it before use.

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `asset-manager.ts` |
| React Components | PascalCase | `AssetCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAssets.ts` |
| Stores | camelCase with `Store` suffix | `auth.store.ts` |
| Types/Interfaces | PascalCase | `AssetFilters` |
| Enums | PascalCase, SCREAMING_SNAKE values | `AssetStatus.ACTIVE` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Functions | camelCase | `formatCurrency` |
| CSS classes | Follow Tailwind conventions | |

## Exports

- **Named exports everywhere** except Next.js page components and layouts.
- Barrel `index.ts` files for each major folder. Import from the barrel, not deep paths.
- Never use `export default` except in `app/` route files.

## Components

- Server components by default in `app/`. Add `'use client'` only when needed.
- Client components live in `src/components/` or within feature folders.
- Props interfaces named `{ComponentName}Props` in the same file.
- No business logic in components. Data fetching belongs in hooks/server components.
- Avoid passing callback props more than 2 levels deep — use context or Zustand.

## Imports

Order (enforced by ESLint):
1. React
2. Next.js
3. Third-party libraries
4. Internal `@/` aliases (config, lib, store, types, constants)
5. Feature-relative imports
6. Relative `./` imports

## Error Handling

- Throw typed `AppError` subclasses, never plain `Error` in application code.
- API routes must use `handleApiError` to convert errors to structured responses.
- Services must use `executeWithErrorHandling` to normalise unknown errors.
- Never swallow errors silently. Log at `WARN` or `ERROR` minimum.

## Logging

- No `console.log`, `console.warn`, `console.error` in application code.
- Use `createLogger('Context')` — always provide a meaningful context name.
- Log at the correct level: DEBUG for noise, INFO for state changes, WARN for recoverable issues, ERROR for failures.
- Never log sensitive data (passwords, tokens, PII).

## Comments

Write comments only when the **why** is non-obvious. Never explain what the code does — well-named identifiers do that. One short line maximum.

## Validation

- All external input (API request bodies, URL params, form submissions) must be validated with Zod before use.
- Validators live in `src/validators/` — never inline `z.object({...})` inside a component or handler.
- Parse with `.safeParse()` in API routes to control error responses.

## Database

- Never hard DELETE. Use `deletedAt` timestamps (soft delete).
- Never expose Prisma models directly in API responses. Map to typed response DTOs.
- Always use `getPrismaSkipTake()` for pagination — never raw offset arithmetic.
- Transactions for operations that modify multiple tables.

## Testing (when added)

- Unit tests for utilities and validators.
- Integration tests for API routes against a real test database — no mocking the DB.
- Component tests with React Testing Library — test behaviour, not implementation.
