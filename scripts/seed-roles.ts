import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🌱 Seeding roles...');

  // Create basic roles
  const roles = [
    { name: 'Admin' },
    { name: 'Manager' },
    { name: 'Employee' },
    { name: 'Intern' }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role
    });
  }

  console.log('✅ Roles seeded successfully');
}

seedRoles()
  .catch((e) => {
    console.error('❌ Error seeding roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
