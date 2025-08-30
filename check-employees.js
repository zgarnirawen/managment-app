import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5
    });
    
    console.log('Existing employees:');
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email}) - ID: ${emp.id}`);
    });
    
    if (employees.length === 0) {
      console.log('No employees found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
