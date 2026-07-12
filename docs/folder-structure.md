# Folder Structure — AssetFlow

```
assetflow/
├── src/
│   ├── app/                        Next.js App Router
���   │   ├── layout.tsx              Root layout (providers, fonts, metadata)
│   │   ├── (auth)/                 Auth route group (redirect if logged in)
│   │   │   ├── layout.tsx          Split-panel auth layout
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/            Protected route group
│   │   │   ├── layout.tsx          requireServerAuth + sidebar + header
│   │   │   ├── page.tsx            Dashboard home
│   │   │   ├── assets/
│   │   │   ├── maintenance/
│   ��   │   ├── procurement/
│   │   │   ├── depreciation/
│   │   │   ├── locations/
│   │   │   ├── reports/
│   │   │   ├── audit/
│   │   │   └── settings/
│   │   └── api/                    API route handlers
│   │       ├── assets/
│   │       ├── maintenance/
│   │       ├── profile/
│   │       └── audit/
│   │
│   ├── components/                 Shared UI (no business logic)
│   │   ├── layout/                 App shell components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── common/                 Generic reusable components
│   │   │   ├── empty-state.tsx
│   │   │   └── error-boundary.tsx
│   │   └── ui/                     shadcn/ui primitives (auto-generated)
│   │
│   ├── features/                   Domain feature modules
│   │   ├── assets/
│   │   │   ├── types/index.ts      Domain types
│   │   │   ├── constants/index.ts  Feature constants
│   │   │   ├── validators/         Zod schemas specific to assets
│   │   │   ├── hooks/              TanStack Query hooks
│   │   │   ├── services/           Business logic
│   │   │   ├── repositories/       Data access
│   │   │   └── components/         Feature-specific UI
│   │   ├── maintenance/
│   │   ├── procurement/
│   │   ├── depreciation/
│   │   ├── locations/
│   │   ├── reports/
│   │   └── audit/
│   │
│   ├── config/                     Application configuration
│   │   ├── app.config.ts           App-wide settings
│   │   ├── auth.config.ts          Auth settings
│   │   ├── routes.config.ts        Route definitions + access control
���   │   ├── permissions.config.ts   Role permission matrix
│   │   ├── storage.config.ts       Storage bucket config
│   │   ├── theme.config.ts         Design token config
│   │   └── table.config.ts         Table defaults
│   │
│   ├── constants/                  Global immutable values
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   ├── routes.ts
│   │   ├── status.ts
│   │   ├── messages.ts
│   │   ├── pagination.ts
│   │   ├── theme.ts
│   │   ├── storage.ts
│   │   └── features.ts
│   │
│   ├── lib/                        Infrastructure / framework code
│   │   ├── prisma.ts               Prisma singleton
│   │   ├── api-client.ts           HTTP client with timeout
│   │   ├── utils/                  Pure utility functions
│   │   ├── errors/                 Typed error classes + factory
│   │   ├── logger/                 Structured logging
│   │   ├── repositories/           Abstract base repository
│   │   └── services/               Abstract base service
│   │
│   ├── providers/                  React context providers
│   │   ├── index.tsx               AppProviders composition
│   │   ├── query.provider.tsx
│   │   ├── theme.provider.tsx
│   │   ├── toast.provider.tsx
│   │   ├── auth.provider.tsx
│   │   └── realtime.provider.tsx
│   │
│   ├── store/                      Zustand state stores
│   │   ├── index.ts
│   │   ├── auth.store.ts
│   │   ├── theme.store.ts
│   │   ├── sidebar.store.ts
│   │   ├── notifications.store.ts
│   │   ├���─ preferences.store.ts
│   │   └── loading.store.ts
│   │
│   ├── types/                      Global TypeScript types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── errors.ts
│   │   ├── ui.ts
│   │   └── pagination.ts
│   │
│   ├── validators/                 Zod validation schemas
│   │   ├── index.ts
│   │   ├── common.ts
��   │   ├── auth.ts
│   │   └── organization.ts
���   │
│   ├── middleware.ts                Next.js route protection
│   └── styles/
│       └── globals.css             CSS custom properties + Tailwind
│
├── supabase/                       Supabase client layer
│   ├── client.ts                   Browser client (singleton)
│   ├── server.ts                   Server client + service role
│   ├── middleware.ts               Session refresh
│   ├── auth.ts                     Server-side auth helpers
│   ├── storage.ts                  File upload/download
│   ├── realtime.ts                 WebSocket subscriptions
│   ├── helpers.ts                  Postgrest error handling
│   ├── config.ts                   Config validation
│   └── types.ts                    Database type definitions
│
├── prisma/
│   ├── schema.prisma               Database schema
│   ├── seed.ts                     Development seed data
│   └── README.md                   Migration guide
│
├── docs/
│   ├── architecture.md
│   ���── coding-standards.md
│   ├─��� folder-structure.md         (this file)
│   └── security.md
│
├── database_reference.sql          Documentation-only SQL
├── .env.example                    Environment variable template
└── README.md                       Project overview
```

## Rules

- **Features own their domain.** A feature folder contains types, constants, validators, hooks, services, repositories, and components specific to that domain.
- **Shared code lives in `lib/`, `components/`, or `constants/`.** If two features need the same utility, it belongs in the shared layer.
- **No circular imports.** Features may import from `lib/`, `config/`, `constants/`, `types/`. Features must NOT import from each other.
- **`app/` is for routing only.** No business logic in route handlers beyond validation and calling the service layer.
- **Barrel imports.** Import from `@/lib/utils`, not `@/lib/utils/currency`. This decouples consumers from internal structure.
