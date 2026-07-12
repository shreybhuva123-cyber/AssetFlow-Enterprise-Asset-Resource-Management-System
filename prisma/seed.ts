import { PrismaClient, UserRole, OrgPlan, AuditAction, AuditResource } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

const SEED = {
  orgs: {
    acme: '10000000-0000-0000-0000-000000000001',
    techcorp: '10000000-0000-0000-0000-000000000002',
  },
  profiles: {
    admin: '20000000-0000-0000-0000-000000000001',
    assetManager: '20000000-0000-0000-0000-000000000002',
    deptHead: '20000000-0000-0000-0000-000000000003',
    employee1: '20000000-0000-0000-0000-000000000004',
    employee2: '20000000-0000-0000-0000-000000000005',
  },
  authUserIds: {
    admin: '00000000-0000-0000-0000-000000000001',
    assetManager: '00000000-0000-0000-0000-000000000002',
    deptHead: '00000000-0000-0000-0000-000000000003',
    employee1: '00000000-0000-0000-0000-000000000004',
    employee2: '00000000-0000-0000-0000-000000000005',
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
      id: SEED.profiles.admin,
      userId: SEED.authUserIds.admin,
      orgId: SEED.orgs.acme,
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'System Administrator',
      role: UserRole.ADMIN,
    },
    {
      id: SEED.profiles.assetManager,
      userId: SEED.authUserIds.assetManager,
      orgId: SEED.orgs.acme,
      firstName: 'Sarah',
      lastName: 'Chen',
      displayName: 'Sarah Chen',
      role: UserRole.ASSET_MANAGER,
    },
    {
      id: SEED.profiles.deptHead,
      userId: SEED.authUserIds.deptHead,
      orgId: SEED.orgs.acme,
      firstName: 'Marcus',
      lastName: 'Johnson',
      displayName: 'Marcus Johnson',
      role: UserRole.DEPARTMENT_HEAD,
    },
    {
      id: SEED.profiles.employee1,
      userId: SEED.authUserIds.employee1,
      orgId: SEED.orgs.acme,
      firstName: 'Priya',
      lastName: 'Patel',
      displayName: 'Priya Patel',
      role: UserRole.EMPLOYEE,
    },
    {
      id: SEED.profiles.employee2,
      userId: SEED.authUserIds.employee2,
      orgId: SEED.orgs.acme,
      firstName: 'Alex',
      lastName: 'Rivera',
      displayName: 'Alex Rivera',
      role: UserRole.EMPLOYEE,
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
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.admin,        role: UserRole.ADMIN },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.assetManager, role: UserRole.ASSET_MANAGER },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.deptHead,     role: UserRole.DEPARTMENT_HEAD },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.employee1,    role: UserRole.EMPLOYEE },
    { orgId: SEED.orgs.acme, profileId: SEED.profiles.employee2,    role: UserRole.EMPLOYEE },
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
    { name: 'admin',            displayName: 'Administrator',    description: 'Full platform access',             isSystem: true },
    { name: 'asset_manager',   displayName: 'Asset Manager',     description: 'Manage assets and maintenance',    isSystem: true },
    { name: 'department_head', displayName: 'Department Head',   description: 'Manage department resources',      isSystem: true },
    { name: 'employee',        displayName: 'Employee',          description: 'View and request own resources',   isSystem: true },
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
      userId: SEED.profiles.admin,
      action: AuditAction.LOGIN,
      resource: AuditResource.USER,
      resourceId: SEED.profiles.admin,
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
