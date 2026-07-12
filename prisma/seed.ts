import { PrismaClient, UserRole, OrgPlan, AuditAction, AuditResource } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

const SEED = {
  orgs: {
    acme: '10000000-0000-0000-0000-000000000001',
    techcorp: '10000000-0000-0000-0000-000000000002',
  },
  profiles: {
    superAdmin: '20000000-0000-0000-0000-000000000001',
    orgAdmin: '20000000-0000-0000-0000-000000000002',
    assetManager: '20000000-0000-0000-0000-000000000003',
    technician: '20000000-0000-0000-0000-000000000004',
    viewer: '20000000-0000-0000-0000-000000000005',
  },
  // Note: userId values must match real Supabase auth.users entries in production.
  // These are placeholder UUIDs for local/demo seeding only.
  authUserIds: {
    superAdmin: '00000000-0000-0000-0000-000000000001',
    orgAdmin: '00000000-0000-0000-0000-000000000002',
    assetManager: '00000000-0000-0000-0000-000000000003',
    technician: '00000000-0000-0000-0000-000000000004',
    viewer: '00000000-0000-0000-0000-000000000005',
  },
};

async function seedOrganizations() {
  console.log('  → Organizations');
  await prisma.organization.upsert({
    where: { id: SEED.orgs.acme },
    update: {},
    create: {
      id: SEED.orgs.acme,
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: OrgPlan.ENTERPRISE,
      isActive: true,
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        fiscalYearStart: 1,
        dateFormat: 'MM/DD/YYYY',
      },
    },
  });

  await prisma.organization.upsert({
    where: { id: SEED.orgs.techcorp },
    update: {},
    create: {
      id: SEED.orgs.techcorp,
      name: 'TechCorp Inc.',
      slug: 'techcorp',
      plan: OrgPlan.PROFESSIONAL,
      isActive: true,
      settings: {
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        fiscalYearStart: 4,
        dateFormat: 'MM/DD/YYYY',
      },
    },
  });
}

async function seedProfiles() {
  console.log('  → Profiles');
  const profiles = [
    {
      id: SEED.profiles.superAdmin,
      userId: SEED.authUserIds.superAdmin,
      orgId: null,
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'System Administrator',
      role: UserRole.SUPER_ADMIN,
    },
    {
      id: SEED.profiles.orgAdmin,
      userId: SEED.authUserIds.orgAdmin,
      orgId: SEED.orgs.acme,
      firstName: 'Sarah',
      lastName: 'Chen',
      displayName: 'Sarah Chen',
      role: UserRole.ORG_ADMIN,
    },
    {
      id: SEED.profiles.assetManager,
      userId: SEED.authUserIds.assetManager,
      orgId: SEED.orgs.acme,
      firstName: 'Marcus',
      lastName: 'Johnson',
      displayName: 'Marcus Johnson',
      role: UserRole.ASSET_MANAGER,
    },
    {
      id: SEED.profiles.technician,
      userId: SEED.authUserIds.technician,
      orgId: SEED.orgs.acme,
      firstName: 'Priya',
      lastName: 'Patel',
      displayName: 'Priya Patel',
      role: UserRole.TECHNICIAN,
    },
    {
      id: SEED.profiles.viewer,
      userId: SEED.authUserIds.viewer,
      orgId: SEED.orgs.acme,
      firstName: 'Alex',
      lastName: 'Rivera',
      displayName: 'Alex Rivera',
      role: UserRole.VIEWER,
    },
  ];

  for (const profile of profiles) {
    await prisma.profile.upsert({
      where: { id: profile.id },
      update: {},
      create: { ...profile, timezone: 'UTC', locale: 'en' },
    });
  }
}

async function seedOrgMembers() {
  console.log('  → Org members');
  const members = [
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.orgAdmin, role: UserRole.ORG_ADMIN },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.assetManager, role: UserRole.ASSET_MANAGER },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.technician, role: UserRole.TECHNICIAN },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.viewer, role: UserRole.VIEWER },
  ];

  for (const member of members) {
    await prisma.orgMember.upsert({
      where: { orgId_profileId: { orgId: member.orgId, profileId: member.profileId } },
      update: {},
      create: { ...member, isActive: true },
    });
  }
}

async function seedSystemRoles() {
  console.log('  → System roles');
  const roles = [
    { name: 'super_admin', displayName: 'Super Administrator', description: 'Full platform access', isSystem: true },
    { name: 'org_admin', displayName: 'Organization Administrator', description: 'Full access within org', isSystem: true },
    { name: 'asset_manager', displayName: 'Asset Manager', description: 'Manage assets and maintenance', isSystem: true },
    { name: 'technician', displayName: 'Technician', description: 'Execute maintenance tasks', isSystem: true },
    { name: 'viewer', displayName: 'Viewer', description: 'Read-only access', isSystem: true },
  ];

  for (const role of roles) {
    const existing = await prisma.role.findFirst({ where: { name: role.name, orgId: null } });
    if (!existing) {
      await prisma.role.create({ data: { ...role, orgId: null } });
    }
  }
}

async function seedAuditLog() {
  console.log('  → Audit log sample');
  const entries = [
    {
      orgId: SEED.orgs.acme,
      userId: SEED.profiles.orgAdmin,
      action: AuditAction.LOGIN,
      resource: AuditResource.USER,
      resourceId: SEED.profiles.orgAdmin,
      metadata: { method: 'email', ip: '192.168.1.1' },
    },
    {
      orgId: SEED.orgs.acme,
      userId: SEED.profiles.assetManager,
      action: AuditAction.LOGIN,
      resource: AuditResource.USER,
      resourceId: SEED.profiles.assetManager,
      metadata: { method: 'email' },
    },
  ];

  await prisma.auditLog.createMany({ data: entries, skipDuplicates: true });
}

async function main() {
  console.log('\n🌱 AssetFlow database seed starting...\n');
  try {
    await seedOrganizations();
    await seedProfiles();
    await seedOrgMembers();
    await seedSystemRoles();
    await seedAuditLog();
    console.log('\n✅ Seed completed successfully.\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
