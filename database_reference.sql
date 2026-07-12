-- ============================================================
-- AssetFlow — Database Reference (Documentation Only)
-- ============================================================
-- This file is NOT executed. It documents the intended database
-- structure, indexes, RLS policies, and Supabase configuration.
-- Schema is managed via Prisma migrations.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMERATIONS
-- ============================================================

-- CREATE TYPE user_role AS ENUM (
--   'SUPER_ADMIN', 'ORG_ADMIN', 'ASSET_MANAGER', 'TECHNICIAN', 'VIEWER'
-- );

-- CREATE TYPE org_plan AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CREATE TYPE audit_action AS ENUM (
--   'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'VIEW', 'EXPORT', 'IMPORT',
--   'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_RESET', 'PERMISSION_CHANGE',
--   'ROLE_CHANGE', 'APPROVE', 'REJECT', 'ASSIGN', 'UNASSIGN'
-- );

-- CREATE TYPE audit_resource AS ENUM (
--   'USER', 'ORGANIZATION', 'ASSET', 'MAINTENANCE_ORDER', 'PROCUREMENT_REQUEST',
--   'DEPRECIATION_ENTRY', 'LOCATION', 'DOCUMENT', 'REPORT', 'SETTINGS'
-- );

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

-- CREATE TABLE organizations (
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name        VARCHAR(255) NOT NULL,
--   slug        VARCHAR(100) UNIQUE NOT NULL,
--   logo_url    VARCHAR(512),
--   plan        org_plan NOT NULL DEFAULT 'FREE',
--   is_active   BOOLEAN NOT NULL DEFAULT true,
--   settings    JSONB NOT NULL DEFAULT '{}',
--   metadata    JSONB NOT NULL DEFAULT '{}',
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
--   deleted_at  TIMESTAMPTZ
-- );

-- CREATE INDEX idx_organizations_slug     ON organizations(slug);
-- CREATE INDEX idx_organizations_is_active ON organizations(is_active);
-- CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);

-- ============================================================
-- PROFILES (mirrors Supabase auth.users)
-- ============================================================

-- CREATE TABLE profiles (
--   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   org_id       UUID REFERENCES organizations(id) ON DELETE SET NULL,
--   first_name   VARCHAR(100) NOT NULL,
--   last_name    VARCHAR(100) NOT NULL,
--   display_name VARCHAR(200) NOT NULL,
--   avatar_url   VARCHAR(512),
--   phone        VARCHAR(50),
--   timezone     VARCHAR(50) NOT NULL DEFAULT 'UTC',
--   locale       VARCHAR(10) NOT NULL DEFAULT 'en',
--   role         user_role NOT NULL DEFAULT 'VIEWER',
--   is_active    BOOLEAN NOT NULL DEFAULT true,
--   preferences  JSONB NOT NULL DEFAULT '{}',
--   last_seen_at TIMESTAMPTZ,
--   created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE INDEX idx_profiles_user_id   ON profiles(user_id);
-- CREATE INDEX idx_profiles_org_id    ON profiles(org_id);
-- CREATE INDEX idx_profiles_role      ON profiles(role);
-- CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- ============================================================
-- ORG MEMBERS
-- ============================================================

-- CREATE TABLE org_members (
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
--   profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   role        user_role NOT NULL DEFAULT 'VIEWER',
--   is_active   BOOLEAN NOT NULL DEFAULT true,
--   invited_by  UUID,
--   joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
--   UNIQUE(org_id, profile_id)
-- );

-- CREATE INDEX idx_org_members_org_id     ON org_members(org_id);
-- CREATE INDEX idx_org_members_profile_id ON org_members(profile_id);
-- CREATE INDEX idx_org_members_role       ON org_members(role);

-- ============================================================
-- ROLES & PERMISSIONS
-- ============================================================

-- CREATE TABLE roles (
--   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   org_id       UUID REFERENCES organizations(id) ON DELETE CASCADE,
--   name         VARCHAR(100) NOT NULL,
--   display_name VARCHAR(200) NOT NULL,
--   description  TEXT,
--   is_system    BOOLEAN NOT NULL DEFAULT false,
--   is_active    BOOLEAN NOT NULL DEFAULT true,
--   metadata     JSONB NOT NULL DEFAULT '{}',
--   created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
--   UNIQUE(org_id, name)
-- );

-- CREATE TABLE permissions (
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   code        VARCHAR(100) UNIQUE NOT NULL,
--   name        VARCHAR(200) NOT NULL,
--   description TEXT,
--   module      VARCHAR(50) NOT NULL,
--   is_system   BOOLEAN NOT NULL DEFAULT true,
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE TABLE role_permissions (
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
--   permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
--   granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
--   granted_by    UUID,
--   UNIQUE(role_id, permission_id)
-- );

-- ============================================================
-- AUDIT LOG (append-only)
-- ============================================================

-- CREATE TABLE audit_logs (
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   org_id      UUID REFERENCES organizations(id) ON DELETE SET NULL,
--   user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
--   action      audit_action NOT NULL,
--   resource    audit_resource NOT NULL,
--   resource_id UUID,
--   old_values  JSONB,
--   new_values  JSONB,
--   metadata    JSONB,
--   ip_address  VARCHAR(45),
--   user_agent  VARCHAR(512),
--   request_id  UUID,
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
--   -- No updated_at: this table is append-only
-- );

-- CREATE INDEX idx_audit_logs_org_created    ON audit_logs(org_id, created_at DESC);
-- CREATE INDEX idx_audit_logs_user_id        ON audit_logs(user_id);
-- CREATE INDEX idx_audit_logs_resource       ON audit_logs(resource, resource_id);
-- CREATE INDEX idx_audit_logs_action         ON audit_logs(action);
-- CREATE INDEX idx_audit_logs_created_at     ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE org_members     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roles           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs      ENABLE ROW LEVEL SECURITY;

-- -- Users can only see their own profile
-- CREATE POLICY "profiles_self_read"
--   ON profiles FOR SELECT
--   USING (user_id = auth.uid());

-- -- Users can update their own profile
-- CREATE POLICY "profiles_self_update"
--   ON profiles FOR UPDATE
--   USING (user_id = auth.uid());

-- -- Org admins can see members of their org
-- CREATE POLICY "org_members_org_read"
--   ON org_members FOR SELECT
--   USING (
--     org_id IN (
--       SELECT org_id FROM org_members
--       WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
--       AND is_active = true
--     )
--   );

-- -- Org members can read their organization
-- CREATE POLICY "organizations_member_read"
--   ON organizations FOR SELECT
--   USING (
--     id IN (
--       SELECT org_id FROM org_members
--       WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
--       AND is_active = true
--     )
--   );

-- -- Audit logs are append-only: no UPDATE, no DELETE
-- CREATE POLICY "audit_logs_org_read"
--   ON audit_logs FOR SELECT
--   USING (
--     org_id IN (
--       SELECT org_id FROM org_members
--       WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
--       AND is_active = true
--     )
--   );

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES
--   ('asset-images',     'asset-images',     false, 10485760,
--    ARRAY['image/jpeg','image/png','image/webp','image/gif']),
--   ('asset-documents',  'asset-documents',  false, 26214400,
--    ARRAY['application/pdf','application/msword',
--          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--          'application/vnd.ms-excel',
--          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--          'text/csv']),
--   ('avatars',          'avatars',          false, 2097152,
--    ARRAY['image/jpeg','image/png','image/webp']),
--   ('exports',          'exports',          false, 104857600,
--    ARRAY['text/csv','application/pdf',
--          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================

-- CREATE OR REPLACE FUNCTION update_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_organizations_updated_at
--   BEFORE UPDATE ON organizations
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CREATE TRIGGER trg_profiles_updated_at
--   BEFORE UPDATE ON profiles
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CREATE TRIGGER trg_org_members_updated_at
--   BEFORE UPDATE ON org_members
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
