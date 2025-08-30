import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check employees count
    const employeeCount = await prisma.employee.count();
    console.log(`👥 Total employees in database: ${employeeCount}`);
    
    if (employeeCount > 0) {
      // Show first 3 employees
      const employees = await prisma.employee.findMany({
        take: 3,
        include: {
          department: true,
          role: true,
        },
      });
      
      console.log('\n📋 Sample employees:');
      employees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.name} (${emp.email}) - ${emp.department?.name || 'No dept'} - ${emp.role?.name || 'No role'}`);
      });
    } else {
      console.log('⚠️ No employees found in database');
    }
    
    // Check departments and roles
    const deptCount = await prisma.department.count();
    const roleCount = await prisma.role.count();
    console.log(`\n🏢 Departments: ${deptCount}`);
    console.log(`👔 Roles: ${roleCount}`);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
