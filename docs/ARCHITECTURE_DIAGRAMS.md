# Architecture Diagrams

The following diagrams illustrate the core workflows and structural components of AssetFlow.

## 1. System Architecture

```mermaid
graph TD
    Client[Web Browser / PWA] -->|HTTPS| NextJS[Next.js App Router]
    
    subgraph "Vercel (Compute)"
        NextJS -->|React Server Components| UI[UI Components]
        NextJS -->|API Routes| AuthMiddleware[Auth & RBAC Middleware]
        AuthMiddleware --> Services[Business Logic Services]
        Services --> Repos[Prisma Repositories]
        Services -->|Dependency Injection| AI[AI / OCR Providers]
    \end
    
    subgraph "Supabase (Data Layer)"
        Repos -->|TCP/PgBouncer| PostgreSQL[(PostgreSQL DB)]
        AuthMiddleware -->|JWT Verification| SupaAuth[Supabase Auth]
        PostgreSQL --> RLS[Row Level Security]
    \end
```

## 2. Database Entity Relationship (ER)

```mermaid
erDiagram
    Organization ||--o{ Profile : employs
    Organization ||--o{ Department : contains
    Organization ||--o{ Asset : owns
    
    Department ||--o{ Profile : has_members
    Profile ||--o{ AssetAllocation : receives
    Profile ||--o{ AssetTransfer : initiates
    
    Asset }o--|| AssetCategory : categorized_by
    Asset ||--o{ AssetAllocation : is_allocated
    Asset ||--o{ AssetTimeline : tracks_history
    Asset ||--o{ MaintenanceRequest : requires
```

## 3. Asset Transfer & Approval Workflow

```mermaid
sequenceDiagram
    participant E1 as Employee A
    participant Sys as System
    participant M as Manager
    participant E2 as Employee B
    
    E1->>Sys: Request Transfer to Employee B
    Sys->>Sys: Validate Asset Availability
    Sys->>M: Notify Pending Approval
    M->>Sys: Review & Approve Transfer
    Sys->>Sys: End Allocation for Employee A
    Sys->>Sys: Create Allocation for Employee B
    Sys->>Sys: Update Asset Holder
    Sys->>Sys: Log to Asset Timeline
    Sys->>E2: Notify New Asset Assigned
```

## 4. Maintenance Lifecycle

```mermaid
stateDiagram-v2
    [*] --> OPEN: User creates request
    OPEN --> IN_PROGRESS: Technician assigned
    IN_PROGRESS --> WAITING_FOR_PARTS: Blocked
    WAITING_FOR_PARTS --> IN_PROGRESS: Parts arrived
    IN_PROGRESS --> RESOLVED: Fix applied
    RESOLVED --> CLOSED: User confirms fix
    CLOSED --> [*]
```
