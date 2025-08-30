import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Departments
  const engineering = await prisma.department.create({
    data: {
      name: 'Engineering',
    },
  });

  const hr = await prisma.department.create({
    data: {
      name: 'HR',
    },
  });

  console.log('✅ Created departments');

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
    },
  });

  const employeeRole = await prisma.role.create({
    data: {
      name: 'Employee',
    },
  });

  console.log('✅ Created roles');

  // Create Employees
  const john = await prisma.employee.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Admin',
      departmentId: engineering.id,
    },
  });

  const jane = await prisma.employee.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Employee',
      departmentId: engineering.id,
    },
  });

  const alice = await prisma.employee.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      role: 'Admin',
      departmentId: hr.id,
    },
  });

  const bob = await prisma.employee.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob.wilson@company.com',
      role: 'Employee',
      departmentId: engineering.id,
    },
  });

  const sarah = await prisma.employee.create({
    data: {
      name: 'Sarah Davis',
      email: 'sarah.davis@company.com',
      role: 'Employee',
      departmentId: hr.id,
    },
  });

  console.log('✅ Created employees');

  // Create Projects
  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Building a new mobile application for customers',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      status: 'ACTIVE',
      employees: {
        connect: [{ id: john.id }, { id: jane.id }, { id: bob.id }],
      },
    },
  });

  const hrSystem = await prisma.project.create({
    data: {
      name: 'HR Management System',
      description: 'Internal HR system for employee management',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-08-31'),
      status: 'PLANNED',
      employees: {
        connect: [{ id: alice.id }, { id: sarah.id }],
      },
    },
  });

  console.log('✅ Created projects');

  // Create Tasks
  await prisma.task.create({
    data: {
      title: 'Design user interface',
      description: 'Create wireframes and mockups for the mobile app',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2025-09-15'),
      employeeId: jane.id,
      projectId: mobileApp.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Set up development environment',
      description: 'Configure development tools and CI/CD pipeline',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: new Date('2025-08-30'),
      employeeId: bob.id,
      projectId: mobileApp.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'API documentation',
      description: 'Document all API endpoints for the mobile app',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2025-09-30'),
      employeeId: john.id,
      projectId: mobileApp.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Employee onboarding process',
      description: 'Design new employee onboarding workflow',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2025-09-10'),
      employeeId: sarah.id,
      projectId: hrSystem.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Performance review template',
      description: 'Create standardized performance review forms',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date('2025-10-15'),
      employeeId: alice.id,
      projectId: hrSystem.id,
    },
  });

  console.log('✅ Created tasks');

  // Create Leave Requests
  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-09-15'),
      endDate: new Date('2025-09-20'),
      reason: 'Vacation with family',
      status: 'PENDING',
      employeeId: jane.id,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-08-20'),
      endDate: new Date('2025-08-22'),
      reason: 'Medical appointment',
      status: 'APPROVED',
      employeeId: bob.id,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-05'),
      reason: 'Personal leave',
      status: 'REJECTED',
      employeeId: sarah.id,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-12-23'),
      endDate: new Date('2025-12-31'),
      reason: 'Christmas holiday',
      status: 'PENDING',
      employeeId: alice.id,
    },
  });

  console.log('✅ Created leave requests');

  // Create sample Time Entries
  console.log('⏰ Creating time entries...');
  
  // Today's work session for John
  const today = new Date();
  const workStart = new Date(today);
  workStart.setHours(9, 0, 0, 0); // 9:00 AM
  
  const workEnd = new Date(today);
  workEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  await prisma.timeEntry.create({
    data: {
      employeeId: john.id,
      type: 'CLOCK_IN',
      startTime: workStart,
      endTime: workEnd,
      duration: 8 * 3600, // 8 hours in seconds
      location: '40.7128,-74.0060', // NYC coordinates
      isOnline: true,
      approved: true,
      notes: 'Full day work session',
    },
  });

  // Break session for John
  const breakStart = new Date(today);
  breakStart.setHours(12, 0, 0, 0); // 12:00 PM
  
  const breakEnd = new Date(today);
  breakEnd.setHours(13, 0, 0, 0); // 1:00 PM
  
  await prisma.timeEntry.create({
    data: {
      employeeId: john.id,
      type: 'BREAK_START',
      startTime: breakStart,
      endTime: breakEnd,
      duration: 3600, // 1 hour in seconds
      location: '40.7128,-74.0060',
      isOnline: true,
      approved: true,
      notes: 'Lunch break',
    },
  });

  // Yesterday's work session for Jane
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayWorkStart = new Date(yesterday);
  yesterdayWorkStart.setHours(8, 30, 0, 0); // 8:30 AM
  
  const yesterdayWorkEnd = new Date(yesterday);
  yesterdayWorkEnd.setHours(16, 30, 0, 0); // 4:30 PM
  
  await prisma.timeEntry.create({
    data: {
      employeeId: jane.id,
      type: 'CLOCK_IN',
      startTime: yesterdayWorkStart,
      endTime: yesterdayWorkEnd,
      duration: 8 * 3600, // 8 hours in seconds
      location: '40.7614,-73.9776', // Central Park coordinates
      isOnline: true,
      approved: false, // Pending approval
      notes: 'Early start for project deadline',
    },
  });

  console.log('✅ Created time entries');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log('  - 2 departments');
  console.log('  - 2 roles');
  console.log('  - 5 employees');
  console.log('  - 2 projects');
  console.log('  - 5 tasks');
  console.log('  - 4 leave requests');
  console.log('  - 10 time entries');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
