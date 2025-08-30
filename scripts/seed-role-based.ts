import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoleBasedData() {
  console.log('🌱 Starting role-based data seeding...');

  try {
    // First, create departments
    console.log('📁 Creating departments...');
    
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { name: 'Engineering' },
        update: {},
        create: {
          name: 'Engineering',
          description: 'Software development and technical infrastructure'
        }
      }),
      prisma.department.upsert({
        where: { name: 'Human Resources' },
        update: {},
        create: {
          name: 'Human Resources',
          description: 'Employee relations and organizational development'
        }
      }),
      prisma.department.upsert({
        where: { name: 'Marketing' },
        update: {},
        create: {
          name: 'Marketing',
          description: 'Brand management and customer acquisition'
        }
      }),
      prisma.department.upsert({
        where: { name: 'Operations' },
        update: {},
        create: {
          name: 'Operations',
          description: 'Business operations and process management'
        }
      })
    ]);

    console.log(`✅ Created ${departments.length} departments`);

    // Create test employees for each role
    console.log('👥 Creating role-based test employees...');

    // 1. Admin Employee
    const admin = await prisma.employee.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        name: 'Sarah Chen',
        email: 'admin@company.com',
        clerkUserId: 'admin_clerk_id_001',
        role: 'Admin',
        position: 'Chief Technology Officer',
        departmentId: departments[0].id, // Engineering
        phone: '+1-555-0101',
        address: '123 Executive Ave, Tech City, TC 12345',
        hireDate: new Date('2020-01-15'),
        emergencyContactName: 'Michael Chen',
        emergencyContactPhone: '+1-555-0102',
        emergencyContactRelationship: 'Spouse'
      }
    });

    // 2. Manager Employee  
    const manager = await prisma.employee.upsert({
      where: { email: 'manager@company.com' },
      update: {},
      create: {
        name: 'Marcus Rodriguez',
        email: 'manager@company.com',
        clerkUserId: 'manager_clerk_id_002', 
        role: 'Manager',
        position: 'Engineering Team Lead',
        departmentId: departments[0].id, // Engineering
        managerId: admin.id, // Reports to admin
        phone: '+1-555-0201',
        address: '456 Manager Blvd, Tech City, TC 12346',
        hireDate: new Date('2021-03-10'),
        emergencyContactName: 'Sofia Rodriguez',
        emergencyContactPhone: '+1-555-0202',
        emergencyContactRelationship: 'Spouse'
      }
    });

    // 3. Regular Employee
    const employee = await prisma.employee.upsert({
      where: { email: 'employee@company.com' },
      update: {},
      create: {
        name: 'Alex Thompson',
        email: 'employee@company.com',
        clerkUserId: 'employee_clerk_id_003',
        role: 'Employee', 
        position: 'Software Developer',
        departmentId: departments[0].id, // Engineering
        managerId: manager.id, // Reports to manager
        phone: '+1-555-0301',
        address: '789 Developer St, Tech City, TC 12347',
        hireDate: new Date('2022-06-20'),
        emergencyContactName: 'Jamie Thompson',
        emergencyContactPhone: '+1-555-0302',
        emergencyContactRelationship: 'Sibling'
      }
    });

    // 4. Intern Employee
    const intern = await prisma.employee.upsert({
      where: { email: 'intern@company.com' },
      update: {},
      create: {
        name: 'Jamie Kim',
        email: 'intern@company.com',
        clerkUserId: 'intern_clerk_id_004',
        role: 'Intern',
        position: 'Software Development Intern',
        departmentId: departments[0].id, // Engineering
        managerId: employee.id, // Reports to regular employee
        phone: '+1-555-0401',
        address: '321 Student Ave, Tech City, TC 12348',
        hireDate: new Date('2024-01-15'),
        emergencyContactName: 'Dr. Kim Lee',
        emergencyContactPhone: '+1-555-0402',
        emergencyContactRelationship: 'Parent'
      }
    });

    console.log('✅ Created test employees:');
    console.log(`   🔴 Admin: ${admin.name} (${admin.email})`);
    console.log(`   🟡 Manager: ${manager.name} (${manager.email})`);
    console.log(`   🟢 Employee: ${employee.name} (${employee.email})`);
    console.log(`   🔵 Intern: ${intern.name} (${intern.email})`);

    console.log('🎉 Role-based seeding completed successfully!');
    console.log('');
    console.log('📝 Test Accounts Created:');
    console.log('----------------------------------------');
    console.log('🔴 ADMIN ACCESS:');
    console.log('   Email: admin@company.com');
    console.log('   Role: Admin');
    console.log('   Access: Full system access, user management, audit logs');
    console.log('');
    console.log('🟡 MANAGER ACCESS:');
    console.log('   Email: manager@company.com');
    console.log('   Role: Manager');
    console.log('   Access: Team management, reports, sprint planning');
    console.log('');
    console.log('🟢 EMPLOYEE ACCESS:');
    console.log('   Email: employee@company.com');
    console.log('   Role: Employee');
    console.log('   Access: Tasks, projects, timesheets, collaboration');
    console.log('');
    console.log('🔵 INTERN ACCESS:');
    console.log('   Email: intern@company.com');
    console.log('   Role: Intern');
    console.log('   Access: Intern portal, basic tasks, learning resources');
    console.log('');
    console.log('🚀 You can now test role-based access control!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedRoleBasedData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
