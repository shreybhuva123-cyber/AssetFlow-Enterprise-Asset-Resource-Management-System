import { PrismaClient, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Seed...');

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Odoo Hackathon Enterprise',
      domain: 'odoo-hackathon.local',
      industry: 'Technology',
      size: '500-1000'
    }
  });

  // Create 12 Departments
  const deptNames = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Legal', 'Operations', 'Customer Support', 'IT', 'Executive'];
  const departments = [];
  for (const name of deptNames) {
    const d = await prisma.department.create({
      data: { orgId: org.id, name, code: name.substring(0, 3).toUpperCase() }
    });
    departments.push(d);
  }

  // Create Admin User
  const admin = await prisma.profile.create({
    data: {
      id: uuidv4(),
      orgId: org.id,
      email: 'admin@odoo.local',
      firstName: 'System',
      lastName: 'Admin',
      displayName: 'System Admin',
      role: 'SUPER_ADMIN',
      departmentId: departments[10].id // IT
    }
  });

  // Generate 250 Employees (Batched for speed)
  console.log('Generating Employees...');
  const employeesData = [];
  for (let i = 1; i <= 250; i++) {
    employeesData.push({
      id: uuidv4(),
      orgId: org.id,
      email: `employee${i}@odoo.local`,
      firstName: `Employee`,
      lastName: `${i}`,
      displayName: `Employee ${i}`,
      role: 'EMPLOYEE' as UserRole,
      departmentId: departments[Math.floor(Math.random() * departments.length)].id,
    });
  }
  await prisma.profile.createMany({ data: employeesData, skipDuplicates: true });
  const allEmployees = await prisma.profile.findMany({ where: { orgId: org.id } });

  // Generate Asset Categories
  const catLaptops = await prisma.assetCategory.create({ data: { orgId: org.id, name: 'Laptops', code: 'LAP', icon: 'Laptop' } });
  const catMonitors = await prisma.assetCategory.create({ data: { orgId: org.id, name: 'Monitors', code: 'MON', icon: 'Monitor' } });
  const catPeripherals = await prisma.assetCategory.create({ data: { orgId: org.id, name: 'Peripherals', code: 'PER', icon: 'Keyboard' } });
  
  // Generate 1500 Assets
  console.log('Generating Assets...');
  const assetsData = [];
  for (let i = 1; i <= 1500; i++) {
    const isLaptop = i % 3 === 0;
    const isMonitor = i % 3 === 1;
    assetsData.push({
      id: uuidv4(),
      orgId: org.id,
      categoryId: isLaptop ? catLaptops.id : (isMonitor ? catMonitors.id : catPeripherals.id),
      assetTag: `AF-${isLaptop ? 'L' : (isMonitor ? 'M' : 'P')}-${i.toString().padStart(4, '0')}`,
      name: isLaptop ? `MacBook Pro M${(i % 3) + 1}` : (isMonitor ? 'Dell 27" 4K' : 'Magic Keyboard'),
      status: 'AVAILABLE' as any,
      condition: 'GOOD' as any,
      purchaseCost: isLaptop ? 2000 : (isMonitor ? 400 : 100),
      purchaseDate: new Date(),
    });
  }
  
  // Batch insert in chunks to avoid payload limits
  const chunkSize = 300;
  for (let i = 0; i < assetsData.length; i += chunkSize) {
    const chunk = assetsData.slice(i, i + chunkSize);
    await prisma.asset.createMany({ data: chunk, skipDuplicates: true });
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
