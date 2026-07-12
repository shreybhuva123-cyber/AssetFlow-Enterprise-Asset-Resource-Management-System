# System Architecture Report

AssetFlow is built using a modern, serverless-first architecture optimized for developer velocity and enterprise scalability.

## Core Technologies
- **Next.js 15 (App Router)**: The meta-framework handling SSR, Server Actions, and API routing.
- **Supabase**: Managed PostgreSQL database providing real-time subscriptions, Auth, and Row Level Security.
- **Prisma ORM**: Type-safe database access layer.
- **Tailwind CSS & shadcn/ui**: Component-driven design system.
- **Zustand**: Lightweight global state management.

## Architectural Patterns

### 1. N-Tier Separation of Concerns
The backend logic is strictly separated into logical layers to prevent "fat controllers":
- **Routes (`src/app/api/*`)**: Handles HTTP requests, session extraction, and response formatting.
- **Services (`src/lib/services/*`)**: The core business logic. Validates constraints, coordinates multiple data models, and handles external API calls (e.g., AI, OCR).
- **Repositories (`src/lib/repositories/*`)**: Encapsulates Prisma queries. Handles complex `SELECT` shapes and transactions.
- **Validators (`src/validators/*`)**: Zod schemas used for both frontend form validation and backend payload verification.

### 2. Dependency Inversion for AI & Services
AssetFlow relies on third-party intelligence (OCR, LLMs). To prevent vendor lock-in, these are abstracted:
- `AIProvider` interface allows swapping between OpenAI, Anthropic, or Gemini.
- `OCRProvider` interface allows swapping between Azure Form Recognizer or AWS Textract.

### 3. Event Sourcing (Timeline)
To satisfy rigorous audit requirements, every significant mutation (creation, transfer, maintenance, allocation) triggers a write to the `AssetTimeline` table, providing an immutable historical ledger of an asset's lifecycle.

### 4. Client-Server Data Flow
- Initial data is fetched securely on the server via React Server Components.
- Highly interactive client components (`"use client"`) use `fetch` alongside optimistic state updates for instant perceived performance.
