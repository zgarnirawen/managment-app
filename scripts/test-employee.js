const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestEmployee() {
  console.log('🔍 Checking roles...');
  const roles = await prisma.role.findMany();
  console.log('Available roles:', roles.map(r => ({ id: r.id, name: r.name })));
  
  const adminRole = roles.find(r => r.name === 'Admin');
  if (!adminRole) {
    console.error('No Admin role found!');
    return;
  }
  
  console.log('✅ Creating test employee with admin role...');
  const employee = await prisma.employee.create({
    data: {
      name: 'Test Admin',
      email: 'admin@test.com',
      roleId: adminRole.id,
      clerkUserId: 'test-clerk-admin'
    },
    include: { role: true }
  });
  
  console.log('✅ Employee created:', { 
    id: employee.id, 
    name: employee.name, 
    role: employee.role.name 
  });
  
  await prisma.$disconnect();
}

createTestEmployee().catch(e => console.error(e));
