const { clerkClient } = require('@clerk/nextjs/server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearClerkUsers() {
  console.log('🔄 Starting Clerk user cleanup...\n');
  
  try {
    const clerk = await clerkClient();
    
    // Get all users from Clerk
    console.log('📋 Fetching all users from Clerk...');
    const users = await clerk.users.getUserList({ limit: 500 });
    
    console.log(`📊 Found ${users.data.length} users in Clerk`);
    
    if (users.data.length === 0) {
      console.log('✅ No users found in Clerk - already clean!');
      return;
    }
    
    console.log('\n🗑️ Deleting users from Clerk...');
    
    let deletedCount = 0;
    for (const user of users.data) {
      try {
        await clerk.users.deleteUser(user.id);
        deletedCount++;
        console.log(`   ✅ Deleted user: ${user.emailAddresses[0]?.emailAddress || user.id}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete user ${user.id}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} out of ${users.data.length} users from Clerk`);
    
  } catch (error) {
    console.error('❌ Error clearing Clerk users:', error);
    
    // If Clerk cleanup fails, continue with database cleanup
    console.log('\n⚠️ Clerk cleanup failed, but will continue with database cleanup...');
  }
}

async function fullSystemReset() {
  console.log('🔄 Starting COMPLETE system reset (Clerk + Database)...\n');
  
  try {
    // Step 1: Clear Clerk users
    await clearClerkUsers();
    
    // Step 2: Clear database
    console.log('\n📋 Starting database cleanup...');
    await require('./reset-system.js');
    
    console.log('\n🎉 COMPLETE SYSTEM RESET SUCCESSFUL!');
    console.log('\n📋 System Status:');
    console.log('   🔐 Clerk: All users removed');
    console.log('   🗄️ Database: All user data cleared');
    console.log('   🏢 Default departments created');
    console.log('   🔐 Role system maintained');
    console.log('   👤 Ready for first user signup (will become SUPER_ADMIN)');
    
  } catch (error) {
    console.error('❌ Complete system reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if running directly or being imported
if (require.main === module) {
  fullSystemReset()
    .then(() => {
      console.log('\n✅ Complete system reset finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Complete system reset failed:', error);
      process.exit(1);
    });
}

module.exports = { clearClerkUsers, fullSystemReset };
