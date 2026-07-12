<div align="center">
  <img src="./public/favicon.ico" alt="AssetFlow Logo" width="100"/>
  <h1>AssetFlow Enterprise</h1>
  <p><strong>A Modern, AI-Powered Enterprise Asset Resource Management System</strong></p>
  <p><i>Built for the Odoo Hackathon</i></p>
</div>

---

## 🚀 Overview

AssetFlow is a consumer-grade, enterprise-ready Asset Management SaaS platform. It eliminates the chaos of spreadsheets and disjointed IT software by unifying the entire lifecycle of an asset into a single, intelligent interface. From procurement and employee allocation to maintenance, audits, and retirement—AssetFlow handles it all with zero friction.

### 🌟 Why AssetFlow?
- **Intelligent**: Ask our built-in AI assistant plain-text questions about your inventory.
- **Secure by Default**: Absolute data isolation powered by Supabase Row Level Security (RLS) and Granular RBAC.
- **Mobile-Ready**: Native QR & Barcode scanning built into the web app for instant field audits.
- **Lightning Fast**: Built on Next.js 15 Server Components and Prisma, capable of sustaining O(1) rendering times regardless of dataset size.

---

## 📸 Screenshots

*(Replace with actual screenshots of your application)*
- `[Insert Executive Dashboard Screenshot]`
- `[Insert AI Assistant Screenshot]`
- `[Insert QR Scanner Screenshot]`
- `[Insert Booking Calendar Screenshot]`

---

## 🛠 Tech Stack

| Domain | Technology | Why We Chose It |
|--------|------------|-----------------|
| **Framework** | Next.js 15 (App Router) | Best-in-class performance via React Server Components (RSC) and built-in API routing. |
| **Database** | PostgreSQL (Supabase) | Managed Postgres with PgBouncer and kernel-level Row Level Security (RLS) for multi-tenancy. |
| **ORM** | Prisma | Unmatched end-to-end type safety. Database changes instantly flag frontend compilation errors. |
| **Styling** | Tailwind CSS + shadcn/ui | Radix UI primitives provide 100% accessible (WAI-ARIA) components with premium aesthetics. |
| **State** | Zustand + React Query | Optimistic UI updates and stale-while-revalidate caching for a snappy user experience. |

---

## ⚙️ Core Modules

1. **Asset Lifecycle Management**: Immutable timelines for every piece of hardware.
2. **Resource Booking Engine**: A conflict-detecting calendar for shared enterprise resources.
3. **Approval Workflows**: Multi-step departmental transfer approvals.
4. **Maintenance Desk**: Technician assignment, status tracking, and cost auditing.
5. **Smart Global Search**: Fuzzy matching across Assets, People, and Departments.
6. **Executive Dashboard**: Real-time KPIs and AI-generated predictive maintenance warnings.

---

## 📂 Project Structure

```
├── prisma/                 # Database schema and enterprise seed scripts
├── public/                 # Static assets and PWA manifest
├── src/
│   ├── app/                # Next.js App Router (Routes & Layouts)
│   ├── components/         # Global Shared UI Components
│   ├── features/           # Domain-driven feature modules (Assets, Maintenance, Bookings)
│   ├── lib/
│   │   ├── services/       # Core Business Logic & Orchestration
│   │   ├── repositories/   # Prisma Data Access Layer
│   │   ├── ai/             # AI Provider Abstraction
│   │   └── ocr/            # OCR Provider Abstraction
│   └── validators/         # Zod schemas (Shared between Client Forms and API Routes)
├── docs/                   # Architecture, Manuals, and Hackathon materials
└── package.json
```

---

## 🚀 Quick Start (Local Setup)

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-repo/assetflow.git
   cd assetflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgres://..."
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed Enterprise Data**
   *Note: This generates 1,500 assets, 12 departments, and 250 employees.*
   ```bash
   npm run db:seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`

---

## 🔮 Future Scope

- **Native Mobile Apps**: Migrate the current PWA shell to React Native / Expo for offline audit support.
- **Odoo ERP Integration**: Synchronize procurement costs directly into Odoo's financial ledgers via API.
- **Biometric Signatures**: Require FaceID/TouchID for high-value asset transfers.

---
<div align="center">
  <i>Built with ❤️ by Team AssetFlow</i>
</div>
