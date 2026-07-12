# API Documentation

AssetFlow's backend exposes RESTful endpoints secured by Supabase Auth and strict RBAC policies.

## Standard Response Format
All API responses wrap their payload in a standard structure:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-07-12T12:00:00Z"
}
```
Errors return:
```json
{
  "success": false,
  "error": "Message",
  "code": "ERROR_CODE",
  "timestamp": "2026-07-12T12:00:00Z"
}
```

## Endpoints

### 1. `GET /api/search`
Global fuzzy search across the organization.
- **Query Params**: `q` (string, min 2 chars)
- **Response**: `{ assets: [], employees: [], departments: [] }`
- **Auth**: Requires `EMPLOYEE` minimum.

### 2. `POST /api/ai/assistant`
Streams a response from the AI assistant.
- **Body**: `{ message: string, history: [] }`
- **Response**: Server-Sent Events (SSE) stream of text.
- **Auth**: Requires `EMPLOYEE` minimum.

### 3. `GET /api/assets`
Lists assets with filtering and cursor pagination.
- **Query Params**: `page`, `limit`, `status`, `categoryId`, `search`
- **Response**: Paginated `Asset` array.
- **Auth**: Requires `ASSETS_READ` permission.

### 4. `POST /api/assets`
Creates a new asset.
- **Body**: `CreateAssetInput` (name, assetTag, categoryId, etc.)
- **Response**: `Asset` object.
- **Auth**: Requires `ASSETS_CREATE` permission.

### 5. `POST /api/transfers`
Requests an asset transfer.
- **Body**: `{ assetId, toEmployeeId, reason }`
- **Response**: `AssetTransfer` object in `REQUESTED` state.
- **Auth**: Requires `TRANSFERS_CREATE` permission.

### 6. `POST /api/transfers/[id]/approve`
Approves or rejects a transfer.
- **Body**: `{ decision: "APPROVED" | "REJECTED", comments?: string }`
- **Response**: Updated `AssetTransfer`.
- **Auth**: Requires `TRANSFERS_APPROVE` permission.

### 7. `GET /api/dashboard/executive`
Fetches aggregated KPIs for the executive dashboard.
- **Response**: Stats on health, utilization, and maintenance load.
- **Auth**: Requires `REPORTS_VIEW` permission.
