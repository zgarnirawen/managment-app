const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetSystemToFreshState() {
  console.log('🔄 Starting system reset to fresh state...\n');

  try {
    console.log('📋 Step 1: Clearing all user-generated data...');
    
    // Clear time-related data
    console.log('   ⏰ Clearing time entries...');
    await prisma.timeEntry.deleteMany({});
    
    console.log('   📊 Clearing weekly summaries...');
    await prisma.weeklySummary.deleteMany({});
    
    // Clear communication data
    console.log('   💬 Clearing chat messages...');
    await prisma.chatMessage.deleteMany({});
    await prisma.chatChannelMessage.deleteMany({});
    await prisma.directMessage.deleteMany({});
    await prisma.chatMessageReaction.deleteMany({});
    
    console.log('   📱 Clearing chat channels and memberships...');
    await prisma.chatChannelMember.deleteMany({});
    await prisma.chatChannel.deleteMany({});
    
    // Clear notifications
    console.log('   🔔 Clearing notifications...');
    await prisma.notification.deleteMany({});
    
    // Clear project and task data
    console.log('   📝 Clearing tasks and comments...');
    await prisma.comment.deleteMany({});
    await prisma.task.deleteMany({});
    
    console.log('   📁 Clearing projects...');
    await prisma.project.deleteMany({});
    await prisma.sprint.deleteMany({});
    
    // Clear meeting data
    console.log('   🎥 Clearing meetings...');
    await prisma.meeting.deleteMany({});
    
    // Clear leave requests
    console.log('   🏖️ Clearing leave requests...');
    await prisma.leaveRequest.deleteMany({});
    
    // Clear resources and files
    console.log('   📎 Clearing resources...');
    await prisma.resource.deleteMany({});
    
    // Clear calendar sync settings
    console.log('   📅 Clearing calendar settings...');
    await prisma.calendarSyncSettings.deleteMany({});
    
    // Clear audit logs and history
    console.log('   📋 Clearing audit logs...');
    await prisma.auditLog.deleteMany({});
    await prisma.roleHistory.deleteMany({});
    
    // Clear team data
    console.log('   👥 Clearing team data...');
    await prisma.teamMember.deleteMany({});
    await prisma.team.deleteMany({});
    
    console.log('\n📋 Step 2: Clearing all employee records...');
    
    // Clear all employees (this will remove all user data)
    const deletedEmployees = await prisma.employee.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEmployees.count} employee records`);
    
    console.log('\n📋 Step 3: Clearing departments...');
    
    // Clear departments
    const deletedDepartments = await prisma.department.deleteMany({});
    console.log(`   ✅ Deleted ${deletedDepartments.count} departments`);
    
    console.log('\n📋 Step 4: Resetting system to default state...');
    
    // Keep roles but reset the system to clean state
    console.log('   🔐 Roles preserved for system functionality');
    
    console.log('   🏢 Creating default departments...');
    
    // Create default departments
    await prisma.department.createMany({
      data: [
        {
          name: 'Engineering',
          description: 'Software development and technical operations'
        },
        {
          name: 'Human Resources',
          description: 'Employee management and organizational development'
        },
        {
          name: 'Marketing',
          description: 'Brand promotion and customer engagement'
        },
        {
          name: 'Sales',
          description: 'Customer acquisition and revenue generation'
        },
        {
          name: 'Operations',
          description: 'Business operations and process management'
        }
      ]
    });

    console.log('\n✅ System reset completed successfully!');
    console.log('\n📋 System is now in fresh state:');
    console.log('   🏢 Default departments created');
    console.log('   🔐 Role system maintained');
    console.log('   👤 No user accounts (first user will become SUPER_ADMIN)');
    console.log('   📊 All historical data cleared');
    console.log('   💬 All communications cleared');
    console.log('   📝 All projects and tasks cleared');
    console.log('   ⏰ All time tracking data cleared');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. First user to sign up will automatically become SUPER_ADMIN');
    console.log('   2. They can then create other users and assign roles');
    console.log('   3. System is ready for fresh deployment');

  } catch (error) {
    console.error('❌ Error resetting system:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the reset
resetSystemToFreshState()
  .then(() => {
    console.log('\n🎉 System reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 System reset failed:', error);
    process.exit(1);
  });
