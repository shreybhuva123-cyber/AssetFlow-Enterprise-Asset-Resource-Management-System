import { PrismaClient, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Seed...');

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Odoo Hackathon Enterprise',
      slug: 'odoo-hackathon',
    },
  });

  // Create 12 Departments
  const deptNames = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
    'HR', 'Finance', 'Legal', 'Operations', 'Customer Support', 'IT', 'Executive',
  ];
  const departments = [];
  for (const name of deptNames) {
    const d = await prisma.department.create({
      data: { orgId: org.id, name, code: name.substring(0, 3).toUpperCase() },
    });
    departments.push(d);
  }

  // Create Admin User (userId must be a real Supabase auth.users UUID in production;
  // for seeding we use a deterministic UUID so the seed is idempotent)
  const adminUserId = '00000000-0000-0000-0000-000000000001';
  await prisma.profile.create({
    data: {
      userId: adminUserId,
      orgId: org.id,
      firstName: 'System',
      lastName: 'Admin',
      displayName: 'System Admin',
      role: UserRole.ADMIN,
      departmentId: departments[10].id, // IT
    },
  });

  // Generate 250 Employees (batched for speed)
  console.log('Generating Employees...');
  const employeesData = [];
  for (let i = 1; i <= 250; i++) {
    employeesData.push({
      userId: uuidv4(),
      orgId: org.id,
      firstName: 'Employee',
      lastName: `${i}`,
      displayName: `Employee ${i}`,
      role: UserRole.EMPLOYEE,
      departmentId: departments[Math.floor(Math.random() * departments.length)].id,
    });
  }
  await prisma.profile.createMany({ data: employeesData, skipDuplicates: true });

  // Generate Asset Categories (no `code` field on AssetCategory)
  const catLaptops = await prisma.assetCategory.create({
    data: { orgId: org.id, name: 'Laptops', icon: 'Laptop' },
  });
  const catMonitors = await prisma.assetCategory.create({
    data: { orgId: org.id, name: 'Monitors', icon: 'Monitor' },
  });
  const catPeripherals = await prisma.assetCategory.create({
    data: { orgId: org.id, name: 'Peripherals', icon: 'Keyboard' },
  });

  // Generate 1500 Assets
  console.log('Generating Assets...');
  const assetsData = [];
  for (let i = 1; i <= 1500; i++) {
    const isLaptop  = i % 3 === 0;
    const isMonitor = i % 3 === 1;
    assetsData.push({
      id: uuidv4(),
      orgId: org.id,
      categoryId: isLaptop ? catLaptops.id : isMonitor ? catMonitors.id : catPeripherals.id,
      assetTag: `AF-${isLaptop ? 'L' : isMonitor ? 'M' : 'P'}-${i.toString().padStart(4, '0')}`,
      name: isLaptop ? `MacBook Pro M${(i % 3) + 1}` : isMonitor ? 'Dell 27" 4K' : 'Magic Keyboard',
      status: 'AVAILABLE' as const,
      condition: 'GOOD' as const,
      acquisitionCost: isLaptop ? 2000 : isMonitor ? 400 : 100,
      purchaseDate: new Date(),
    });
  }

  // Batch insert in chunks to avoid payload limits
  const chunkSize = 300;
  for (let i = 0; i < assetsData.length; i += chunkSize) {
    await prisma.asset.createMany({ data: assetsData.slice(i, i + chunkSize), skipDuplicates: true });
  }

  console.log('✅ Enterprise Seed Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
