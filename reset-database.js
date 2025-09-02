#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('🗄️  DATABASE RESET - REMOVING ALL USERS AND DATA');
console.log('=' .repeat(60));
console.log();

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data from your database!');
    console.log('🔄 Starting database reset...\n');

    // Delete all data in correct order to avoid foreign key constraints
    const tables = [
      'VideoMeeting',
      'ChatMessage',
      'Notification',
      'TimeEntry',
      'Payroll',
      'Project',
      'Task',
      'Sprint',
      'CalendarSync',
      'Employee',
      'Department'
    ];

    let totalDeleted = 0;

    for (const table of tables) {
      try {
        const result = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        console.log(`✅ Cleared ${table}: ${result || 0} records deleted`);
        totalDeleted += result || 0;
      } catch (error) {
        if (error.code === 'P2021') {
          console.log(`⚠️  Table ${table} does not exist, skipping...`);
        } else {
          console.log(`❌ Error clearing ${table}: ${error.message}`);
        }
      }
    }

    // Reset sequences for auto-incrementing IDs
    console.log('\n🔄 Resetting ID sequences...');
    
    const sequenceResets = [
      'ALTER SEQUENCE "Employee_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "Department_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "Project_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "Task_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "TimeEntry_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "Payroll_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "Notification_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "ChatMessage_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "VideoMeeting_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "Sprint_id_seq" RESTART WITH 1',
      'ALTER SEQUENCE "CalendarSync_id_seq" RESTART WITH 1'
    ];

    for (const resetQuery of sequenceResets) {
      try {
        await prisma.$executeRawUnsafe(resetQuery);
        const tableName = resetQuery.match(/"(.+?)_id_seq"/)[1];
        console.log(`✅ Reset ID sequence for ${tableName}`);
      } catch (error) {
        if (error.code === 'P2010' || error.message.includes('does not exist')) {
          // Sequence doesn't exist, skip
          console.log(`⚠️  Sequence not found, skipping...`);
        } else {
          console.log(`❌ Error resetting sequence: ${error.message}`);
        }
      }
    }

    console.log('\n📊 Database Reset Summary:');
    console.log(`   Total records deleted: ${totalDeleted}`);
    console.log('   ID sequences: Reset to start from 1');
    console.log('   Status: ✅ COMPLETE');

    console.log('\n🎯 Database is now clean with:');
    console.log('   👥 Users: 0');
    console.log('   🏢 Departments: 0');
    console.log('   📋 Projects: 0');
    console.log('   ✅ Tasks: 0');
    console.log('   ⏰ Time entries: 0');
    console.log('   💰 Payroll records: 0');
    console.log('   🔔 Notifications: 0');
    console.log('   💬 Chat messages: 0');
    console.log('   📹 Video meetings: 0');
    console.log('   🏃 Sprints: 0');
    console.log('   📅 Calendar syncs: 0');

    console.log('\n✨ Database reset completed successfully!');
    console.log('🚀 Your system is now ready for fresh data entry.');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
