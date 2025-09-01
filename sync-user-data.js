const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncUserDataToLocalStorage() {
  console.log('⚠️ DEPRECATED: This script is no longer needed.');
  console.log('The system has been reset and all user data has been cleared.');
  console.log('');
  console.log('� To use the system:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Sign up with any email - you will automatically become SUPER_ADMIN');
  console.log('3. The system will automatically handle user data and localStorage');
}

syncUserDataToLocalStorage();
