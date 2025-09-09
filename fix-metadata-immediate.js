#!/usr/bin/env node

/**
 * Emergency Clerk Metadata Fix Script
 * Forces immediate metadata sync for all users
 * Usage: node fix-metadata-immediate.js
 */

const { createClerkClient } = require('@clerk/clerk-sdk-node');

async function fixMetadataImmediate() {
  console.log('🚨 Emergency Clerk Metadata Fix Tool');
  console.log('=====================================\n');

  // Get Clerk secret key from environment
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    console.error('❌ CLERK_SECRET_KEY environment variable not found');
    console.log('Please set: $env:CLERK_SECRET_KEY="your_clerk_secret_key"');
    process.exit(1);
  }

  try {
    // Initialize Clerk client
    const clerk = createClerkClient({ secretKey: clerkSecretKey });

    // Get all users
    console.log('📋 Fetching all users from Clerk...');
    const users = await clerk.users.getUserList({ limit: 100 }); // Get more users for emergency fix

    if (users.length === 0) {
      console.log('⚠️  No users found in Clerk');
      return;
    }

    console.log(`✅ Found ${users.length} user(s)\n`);

    let fixedCount = 0;
    let errorCount = 0;

    // Fix each user
    for (const user of users) {
      try {
        console.log(`🔧 Fixing user: ${user.firstName || 'Unknown'} ${user.lastName || ''} (${user.id})`);

        const unsafeMetadata = user.unsafeMetadata || {};
        const publicMetadata = user.publicMetadata || {};

        // Check if user has role data
        const hasRole = unsafeMetadata.role || publicMetadata.role;

        if (!hasRole) {
          console.log(`   ⚠️  No role found for user, skipping...`);
          continue;
        }

        // Force update metadata with cache-busting
        await clerk.users.updateUser(user.id, {
          unsafeMetadata: {
            ...unsafeMetadata,
            roleSetupComplete: true,
            dbSynced: true,
            lastSync: new Date().getTime(),
            forceRefresh: Math.random(),
            emergencyFix: new Date().toISOString()
          },
          publicMetadata: {
            ...publicMetadata,
            roleSetupComplete: true,
            lastSync: new Date().getTime(),
            forceRefresh: Math.random(),
            emergencyFix: new Date().toISOString()
          }
        });

        console.log(`   ✅ Fixed metadata for user`);
        fixedCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`   ❌ Error fixing user ${user.id}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📈 Fix Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Successfully Fixed: ${fixedCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (fixedCount > 0) {
      console.log('\n✅ Emergency fix completed!');
      console.log('Users should now be able to access the dashboard without redirect loops.');
      console.log('Please ask users to:');
      console.log('1. Clear their browser cache/cookies');
      console.log('2. Sign out and sign back in');
      console.log('3. Or hard refresh the page (Ctrl+F5)');
    }

    if (errorCount > 0) {
      console.log('\n⚠️  Some users had errors during the fix.');
      console.log('Check the error messages above and try again if needed.');
    }

  } catch (error) {
    console.error('❌ Error during emergency fix:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify CLERK_SECRET_KEY is correct');
    console.log('2. Check your internet connection');
    console.log('3. Ensure Clerk API is accessible');
    console.log('4. Try again in a few minutes');
    process.exit(1);
  }
}

// Confirmation prompt
function askForConfirmation() {
  return new Promise((resolve) => {
    console.log('\n⚠️  WARNING: This will modify metadata for ALL users in your Clerk application.');
    console.log('This action cannot be undone. Make sure you have a backup of your data.');
    console.log('\nDo you want to continue? (type "yes" to confirm): ');

    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (input) => {
      const answer = input.trim().toLowerCase();
      resolve(answer === 'yes');
    });
  });
}

// Run the emergency fix
async function main() {
  const confirmed = await askForConfirmation();

  if (!confirmed) {
    console.log('❌ Emergency fix cancelled by user.');
    process.exit(0);
  }

  console.log('\n🚀 Starting emergency metadata fix...\n');
  await fixMetadataImmediate();
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
