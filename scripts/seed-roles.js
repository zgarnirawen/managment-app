const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🌱 Seeding roles...');
  const roles = ['Admin', 'Manager', 'Employee', 'Intern'];
  
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });
    console.log('✅ Created role:', roleName);
  }
  
  console.log('✅ All roles seeded successfully');
  await prisma.$disconnect();
}

seedRoles().catch(e => console.error(e));
