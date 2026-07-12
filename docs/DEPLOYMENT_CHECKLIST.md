# Production Deployment Checklist

Follow this checklist to deploy AssetFlow to a production environment.

## 1. Database Setup (Supabase)
- [ ] Create a new Supabase Project.
- [ ] Retrieve `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Retrieve the direct database connection string (Transaction pooler) for Prisma.

## 2. Environment Variables
Ensure the following exist in your `.env.production`:
```env
DATABASE_URL="postgres://[db-user]:[db-password]@[db-host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://[db-user]:[db-password]@[db-host]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
# Optional AI / OCR Keys
OPENAI_API_KEY="sk-..."
AZURE_OCR_ENDPOINT="..."
```

## 3. Database Migration & Seeding
- [ ] Run `npx prisma generate` to build the client.
- [ ] Run `npx prisma db push` (or `migrate deploy`) to push the schema to Supabase.
- [ ] Run `npm run db:seed` to populate the Enterprise Demo Data.

## 4. Vercel Deployment
- [ ] Connect your GitHub repository to Vercel.
- [ ] Set the Framework Preset to `Next.js`.
- [ ] Paste all Environment Variables into the Vercel dashboard.
- [ ] Ensure the Build Command is `npm run build`.
- [ ] Click **Deploy**.

## 5. Post-Deployment Verification
- [ ] Navigate to the production URL.
- [ ] Log in using the seeded Admin credentials (`admin@odoo.local` / `password123`).
- [ ] Test the Global Search to verify database indexing.
- [ ] Verify the AI Assistant responds (if API keys are active).
- [ ] Test a file upload (if Supabase Storage buckets are configured).
