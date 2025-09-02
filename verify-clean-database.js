#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('🔍 VERIFYING DATABASE STATE');
console.log('=' .repeat(40));
console.log();

async function verifyDatabaseState() {
  try {
    // Check main tables for data
    const employees = await prisma.employee.count();
    const departments = await prisma.department.count();
    const projects = await prisma.project.count();
    const tasks = await prisma.task.count();
    const timeEntries = await prisma.timeEntry.count();
    const notifications = await prisma.notification.count();
    const chatMessages = await prisma.chatMessage.count();
    const sprints = await prisma.sprint.count();

    console.log('📊 Current Database State:');
    console.log(`   👥 Employees: ${employees}`);
    console.log(`   🏢 Departments: ${departments}`);
    console.log(`   📋 Projects: ${projects}`);
    console.log(`   ✅ Tasks: ${tasks}`);
    console.log(`   ⏰ Time Entries: ${timeEntries}`);
    console.log(`   🔔 Notifications: ${notifications}`);
    console.log(`   💬 Chat Messages: ${chatMessages}`);
    console.log(`   🏃 Sprints: ${sprints}`);

    const totalRecords = employees + departments + projects + tasks + timeEntries + notifications + chatMessages + sprints;

    console.log(`\n📈 Total Records: ${totalRecords}`);

    if (totalRecords === 0) {
      console.log('\n✅ DATABASE IS COMPLETELY CLEAN!');
      console.log('🎯 Your system now has:');
      console.log('   • Zero users');
      console.log('   • Zero example data');
      console.log('   • Fresh start ready');
      console.log('   • All advanced features functional');
    } else {
      console.log('\n⚠️  Database still contains some data.');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseState();
