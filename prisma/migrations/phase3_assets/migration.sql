-- Phase 3: Enterprise Asset Management Schema
-- Creates core asset tables with full lifecycle support

-- Enums
CREATE TYPE "AssetStatus" AS ENUM (
  'AVAILABLE', 'ALLOCATED', 'RESERVED',
  'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'
);

CREATE TYPE "AssetCondition" AS ENUM (
  'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST', 'DISPOSED'
);

CREATE TYPE "TimelineEventType" AS ENUM (
  'CREATED', 'UPDATED', 'STATUS_CHANGED', 'CONDITION_CHANGED',
  'ALLOCATED', 'RETURNED', 'MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED',
  'AUDIT_COMPLETED', 'LOCATION_CHANGED', 'CATEGORY_CHANGED',
  'IMAGE_UPLOADED', 'IMAGE_DELETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED',
  'QR_GENERATED', 'BARCODE_GENERATED',
  'RETIRED', 'DISPOSED', 'LOST', 'FOUND', 'TRANSFERRED'
);

-- Core asset table
CREATE TABLE "assets" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id"           UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "asset_tag"        VARCHAR(50) NOT NULL,
  "name"             VARCHAR(255) NOT NULL,
  "serial_number"    VARCHAR(100),
  "category_id"      UUID REFERENCES "asset_categories"("id") ON DELETE SET NULL,
  "department_id"    UUID REFERENCES "departments"("id") ON DELETE SET NULL,
  "assigned_to_id"   UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "current_location" VARCHAR(255),
  "manufacturer"     VARCHAR(150),
  "model"            VARCHAR(150),
  "purchase_date"    TIMESTAMPTZ,
  "warranty_expiry"  TIMESTAMPTZ,
  "acquisition_cost" DECIMAL(12, 2),
  "condition"        "AssetCondition" NOT NULL DEFAULT 'GOOD',
  "status"           "AssetStatus"    NOT NULL DEFAULT 'AVAILABLE',
  "description"      TEXT,
  "notes"            TEXT,
  "is_bookable"      BOOLEAN NOT NULL DEFAULT false,
  "is_shared"        BOOLEAN NOT NULL DEFAULT false,
  "custom_fields"    JSONB NOT NULL DEFAULT '{}',
  "metadata"         JSONB NOT NULL DEFAULT '{}',
  "created_by_id"    UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "updated_by_id"    UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at"       TIMESTAMPTZ,
  CONSTRAINT "assets_asset_tag_org_id_unique" UNIQUE ("asset_tag", "org_id")
);

-- Indexes
CREATE INDEX "assets_org_id_idx"        ON "assets"("org_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "assets_status_idx"         ON "assets"("status");
CREATE INDEX "assets_condition_idx"      ON "assets"("condition");
CREATE INDEX "assets_category_id_idx"    ON "assets"("category_id");
CREATE INDEX "assets_department_id_idx"  ON "assets"("department_id");
CREATE INDEX "assets_assigned_to_id_idx" ON "assets"("assigned_to_id");
CREATE INDEX "assets_search_idx"         ON "assets" USING gin(
  to_tsvector('english', "name" || ' ' || coalesce("serial_number", '') || ' ' || coalesce("manufacturer", '') || ' ' || coalesce("model", ''))
);

-- Asset images
CREATE TABLE "asset_images" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"       UUID NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "org_id"         UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "storage_path"   TEXT NOT NULL,
  "public_url"     TEXT NOT NULL,
  "file_name"      VARCHAR(255) NOT NULL,
  "file_size"      INTEGER NOT NULL,
  "mime_type"      VARCHAR(100) NOT NULL,
  "is_primary"     BOOLEAN NOT NULL DEFAULT false,
  "sort_order"     INTEGER NOT NULL DEFAULT 0,
  "uploaded_by_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "asset_images_asset_id_idx" ON "asset_images"("asset_id");

-- Asset documents
CREATE TABLE "asset_documents" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"        UUID NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "org_id"          UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "storage_path"    TEXT NOT NULL,
  "public_url"      TEXT NOT NULL,
  "file_name"       VARCHAR(255) NOT NULL,
  "file_size"       INTEGER NOT NULL,
  "mime_type"       VARCHAR(100) NOT NULL,
  "document_type"   VARCHAR(50) NOT NULL DEFAULT 'OTHER',
  "description"     TEXT,
  "uploaded_by_id"  UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "asset_documents_asset_id_idx" ON "asset_documents"("asset_id");

-- Asset timeline (audit log - append only)
CREATE TABLE "asset_timeline" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"    UUID NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "org_id"      UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "event_type"  "TimelineEventType" NOT NULL,
  "title"       VARCHAR(500) NOT NULL,
  "description" TEXT,
  "actor_id"    UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "metadata"    JSONB NOT NULL DEFAULT '{}',
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "asset_timeline_asset_id_idx" ON "asset_timeline"("asset_id");
CREATE INDEX "asset_timeline_org_id_idx"   ON "asset_timeline"("org_id");

-- Asset activity (field-level change tracking)
CREATE TABLE "asset_activities" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"   UUID NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "org_id"     UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "actor_id"   UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "action"     VARCHAR(100) NOT NULL,
  "field"      VARCHAR(100),
  "old_value"  JSONB,
  "new_value"  JSONB,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "metadata"   JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "asset_activities_asset_id_idx" ON "asset_activities"("asset_id");

-- QR codes
CREATE TABLE "asset_qr_codes" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"     UUID NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "org_id"       UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "qr_data"      TEXT NOT NULL,
  "qr_data_url"  TEXT NOT NULL,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "asset_qr_codes_asset_id_idx" ON "asset_qr_codes"("asset_id");

-- Barcodes
CREATE TABLE "asset_barcodes" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"      UUID NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "org_id"        UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "barcode_data"  VARCHAR(255) NOT NULL,
  "barcode_type"  VARCHAR(50) NOT NULL DEFAULT 'CODE128',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "asset_barcodes_asset_id_idx" ON "asset_barcodes"("asset_id");

-- Updated_at trigger for assets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "assets_updated_at"
  BEFORE UPDATE ON "assets"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
