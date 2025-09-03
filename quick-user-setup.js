// Quick user setup script to bypass slow auth-setup page
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickSetup() {
  try {
    console.log('🚀 Starting quick user setup...');

    const clerkUserId = 'user_31rxl2mNODsaNM9z2wWgdIVvJdT';
    
    // Check if user already exists
    let user = await prisma.employee.findUnique({
      where: { clerkUserId }
    });

    if (user) {
      console.log('✅ User already exists:', user.email);
      
      // Update user to have admin role
      await prisma.employee.update({
        where: { clerkUserId },
        data: {
          role: 'Super Administrator',
          position: 'System Administrator'
        }
      });
      
      console.log('✅ User role updated to Super Administrator');
    } else {
      // Create new user
      user = await prisma.employee.create({
        data: {
          clerkUserId,
          name: 'System Administrator',
          email: 'admin@example.com',
          role: 'Super Administrator',
          position: 'System Administrator',
          hireDate: new Date()
        }
      });
      
      console.log('✅ New admin user created:', user.email);
    }

    // Update Clerk user metadata to mark setup as complete
    console.log('✅ Quick setup completed successfully!');
    console.log('📝 User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clerkUserId: user.clerkUserId
    });

    console.log('\n🔄 Please restart the development server and refresh the browser');

  } catch (error) {
    console.error('❌ Error during quick setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSetup();
