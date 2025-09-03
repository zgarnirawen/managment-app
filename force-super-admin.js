// Force Super Admin Setup
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function forceSuperAdminSetup() {
  try {
    console.log('🚀 Force setting up Super Administrator...');

    const clerkUserId = 'user_31rxl2mNODsaNM9z2wWgdIVvJdT';
    
    // Force update to Super Administrator
    let user = await prisma.employee.upsert({
      where: { clerkUserId },
      update: {
        role: 'Super Administrator',
        position: 'Chief Executive Officer',
        name: 'Super Administrator'
      },
      create: {
        clerkUserId,
        name: 'Super Administrator',
        email: 'superadmin@company.com',
        role: 'Super Administrator',
        position: 'Chief Executive Officer',
        hireDate: new Date()
      }
    });

    console.log('✅ User updated to Super Administrator:', user.email);

    // Update Clerk metadata
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (clerkSecretKey) {
        const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            unsafeMetadata: {
              role: 'super_administrator',
              roleSetupComplete: true,
              databaseUserId: user.id,
              forcedSetup: true,
              setupDate: new Date().toISOString()
            }
          })
        });

        if (response.ok) {
          console.log('✅ Clerk metadata updated to Super Administrator');
        } else {
          console.log('⚠️  Failed to update Clerk metadata');
        }
      }
    } catch (clerkError) {
      console.log('⚠️  Clerk update error:', clerkError.message);
    }

    console.log('\n🎉 SUPER ADMINISTRATOR SETUP COMPLETE!');
    console.log('🔑 Your powers as Super Admin:');
    console.log('   ✅ Promote users to Administrator');
    console.log('   ✅ Demote any user role');
    console.log('   ✅ Transfer Super Admin role');
    console.log('   ✅ Access all dashboards');
    console.log('   ✅ Manage entire system');
    
    console.log('\n🏗️ Role Hierarchy System:');
    console.log('   📊 Super Administrator (You) - Level 4');
    console.log('   📈 Administrator - Level 3');
    console.log('   👔 Manager - Level 2');
    console.log('   👤 Employee - Level 1');
    console.log('   🎓 Intern - Level 0');

    console.log('\n🔄 Now restart dev server and access the application!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceSuperAdminSetup();
