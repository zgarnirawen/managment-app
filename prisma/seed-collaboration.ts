import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCollaborationFeatures() {
  console.log('🤝 Seeding collaboration features...');

  // Get existing employees
  const employees = await prisma.employee.findMany();
  
  if (employees.length === 0) {
    console.log('❌ No employees found. Please run the main seed first.');
    return;
  }

  // Get existing tasks and projects
  const tasks = await prisma.task.findMany();
  const projects = await prisma.project.findMany();

  // Add some sample comments to tasks
  if (tasks.length > 0) {
    const task = tasks[0];
    
    await prisma.comment.create({
      data: {
        content: 'This looks good! I think we should also consider adding two-factor authentication for better security. @John Doe what do you think?',
        taskId: task.id,
        authorId: employees[0].id,
        mentions: {
          connect: employees.slice(0, 1).map(emp => ({ id: emp.id }))
        }
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Great suggestion! I\'ll start working on the 2FA implementation right away. Should be ready for review by Friday.',
        taskId: task.id,
        authorId: employees[1]?.id || employees[0].id,
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Perfect! Let me know when it\'s ready and I\'ll help with testing. Also, don\'t forget to add unit tests.',
        taskId: task.id,
        authorId: employees[0].id,
      }
    });

    // Add attachments to the task
    await prisma.task.update({
      where: { id: task.id },
      data: {
        attachments: [
          'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          'https://res.cloudinary.com/demo/raw/upload/sample.pdf'
        ]
      }
    });

    console.log('✅ Added comments and attachments to task:', task.title);
  }

  // Add some sample comments to projects
  if (projects.length > 0) {
    const project = projects[0];
    
    await prisma.comment.create({
      data: {
        content: 'Project kickoff meeting scheduled for next Monday. @Jane Smith please prepare the requirements document.',
        projectId: project.id,
        authorId: employees[0].id,
        mentions: {
          connect: employees.slice(1, 2).map(emp => ({ id: emp.id }))
        }
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Will do! I\'ll have the requirements ready by Sunday evening. Should I include the technical architecture as well?',
        projectId: project.id,
        authorId: employees[1]?.id || employees[0].id,
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Yes, please include the technical architecture. Also, let\'s discuss the database design during the meeting.',
        projectId: project.id,
        authorId: employees[2]?.id || employees[0].id,
      }
    });

    // Add attachments to the project
    await prisma.project.update({
      where: { id: project.id },
      data: {
        attachments: [
          'https://res.cloudinary.com/demo/image/upload/v1234567890/architecture-diagram.png',
          'https://res.cloudinary.com/demo/raw/upload/v1234567890/project-requirements.pdf',
          'https://res.cloudinary.com/demo/raw/upload/v1234567890/wireframes.figma'
        ]
      }
    });

    console.log('✅ Added comments and attachments to project:', project.name);
  }

  // Create some notifications for mentions
  await prisma.notification.createMany({
    data: [
      {
        message: 'You were mentioned in a comment on task "Implement user authentication"',
        type: 'TASK_ASSIGNED',
        employeeId: employees[0].id,
        read: false,
      },
      {
        message: 'A new comment was added to project "Employee Management System"',
        type: 'TASK_COMPLETED',
        employeeId: employees[1]?.id || employees[0].id,
        read: false,
      },
      {
        message: 'A new file was uploaded to task "Implement user authentication"',
        type: 'DEADLINE_REMINDER',
        employeeId: employees[2]?.id || employees[0].id,
        read: false,
      }
    ]
  });

  console.log('✅ Created collaboration notifications');
  console.log('🎉 Collaboration features seeding completed!');
}

seedCollaborationFeatures()
  .catch((e) => {
    console.error('❌ Error seeding collaboration features:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
