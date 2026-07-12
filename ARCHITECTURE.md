# System Architecture

## Overview
AssetFlow is built on a clean architecture paradigm adapted for Next.js App Router. It strictly separates concerns into Routes, Services, Repositories, and Data Models.

## Layer Breakdown

1. **Routes (`src/app/api/*`)**: Handles HTTP parsing, session validation (Auth), and formatting responses. Routes should NOT contain business logic.
2. **Services (`src/lib/services/*`)**: Orchestrates business logic, validations, and integrates multiple repositories or external providers (AI, OCR).
3. **Repositories (`src/lib/repositories/*`)**: The data access layer. Encapsulates Prisma queries and handles transaction boundaries for complex multi-table operations.
4. **Validation (`src/validators/*`)**: Zod schemas shared between frontend forms and backend API routes.
5. **Database (`prisma/schema.prisma`)**: Single source of truth for the data model. Supabase handles RLS at the Postgres level.

## AI & OCR Abstractions
AssetFlow uses dependency inversion for third-party intelligence providers.
- `src/lib/ai/provider.ts`: Interface for LLM interactions.
- `src/lib/ocr/provider.ts`: Interface for document processing.

## Deployment
Vercel handles Next.js SSR and Edge functions. Supabase provides managed PostgreSQL with Row Level Security (RLS) guaranteeing data isolation per Organization (`orgId`).
