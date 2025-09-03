// Comprehensive Role-Based Setup System
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function comprehensiveRoleSetup() {
  try {
    console.log('🚀 Starting comprehensive role-based setup...');

    const clerkUserId = 'user_31rxl2mNODsaNM9z2wWgdIVvJdT';
    
    // Check if this is the first user (should be Super Admin)
    const userCount = await prisma.employee.count();
    const isFirstUser = userCount === 0;
    
    console.log(`👤 User count: ${userCount} - ${isFirstUser ? 'FIRST USER (Super Admin)' : 'Subsequent User'}`);

    if (isFirstUser) {
      // First user automatically becomes Super Administrator
      let user = await prisma.employee.upsert({
        where: { clerkUserId },
        update: {
          role: 'Super Administrator',
          position: 'Chief Executive'
        },
        create: {
          clerkUserId,
          name: 'Super Administrator',
          email: 'superadmin@company.com',
          role: 'Super Administrator',
          position: 'Chief Executive',
          hireDate: new Date()
        }
      });

      console.log('✅ First user setup as Super Administrator');

      // Update Clerk metadata for Super Admin
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
                isFirstUser: true,
                setupDate: new Date().toISOString()
              }
            })
          });

          if (response.ok) {
            console.log('✅ Super Admin Clerk metadata updated');
          } else {
            console.log('⚠️  Failed to update Clerk metadata');
          }
        }
      } catch (clerkError) {
        console.log('⚠️  Clerk update error:', clerkError.message);
      }

      console.log('🎉 SUPER ADMINISTRATOR SETUP COMPLETE!');
      console.log('📝 As Super Admin, you can:');
      console.log('   - Promote users to Administrator');
      console.log('   - Manage all system roles');
      console.log('   - Transfer Super Admin role to another Admin');
      console.log('   - Access all dashboards and features');

    } else {
      console.log('📋 This is not the first user.');
      console.log('💡 New users should choose between:');
      console.log('   - Employee (default entry level)');
      console.log('   - Intern (temporary/learning role)');
      console.log('🔄 Role promotions handled by hierarchy:');
      console.log('   Super Admin → Admin → Manager → Employee/Intern');
    }

    console.log('\n🔄 Restart the dev server and refresh browser');
    console.log('🌐 Dashboard will redirect based on role automatically');

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveRoleSetup();
