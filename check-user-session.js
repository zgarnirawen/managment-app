#!/usr/bin/env node

/**
 * Clerk User Session Diagnostic Script
 * Checks user metadata status and session claims
 * Usage: node check-user-session.js
 */

const { createClerkClient } = require('@clerk/clerk-sdk-node');

async function checkUserSession() {
  console.log('🔍 Clerk User Session Diagnostic Tool');
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

    // Get all users (limit to first 10 for safety)
    console.log('📋 Fetching users from Clerk...');
    const users = await clerk.users.getUserList({ limit: 10 });

    if (users.length === 0) {
      console.log('⚠️  No users found in Clerk');
      return;
    }

    console.log(`✅ Found ${users.length} user(s)\n`);

    // Check each user
    for (const user of users) {
      console.log(`👤 User: ${user.firstName || 'Unknown'} ${user.lastName || ''} (${user.id})`);
      console.log(`   Email: ${user.emailAddresses[0]?.emailAddress || 'No email'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`   Last Sign In: ${user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Never'}`);

      // Check metadata
      const unsafeMetadata = user.unsafeMetadata || {};
      const publicMetadata = user.publicMetadata || {};

      console.log('\n📊 Metadata Status:');
      console.log(`   Role (unsafe): ${unsafeMetadata.role || '❌ Not set'}`);
      console.log(`   Role (public): ${publicMetadata.role || '❌ Not set'}`);
      console.log(`   Role Setup Complete: ${unsafeMetadata.roleSetupComplete ? '✅ Yes' : '❌ No'}`);
      console.log(`   DB Synced: ${unsafeMetadata.dbSynced ? '✅ Yes' : '❌ No'}`);
      console.log(`   Last Sync: ${unsafeMetadata.lastSync ? new Date(unsafeMetadata.lastSync).toLocaleString() : '❌ Never'}`);
      console.log(`   Force Refresh: ${unsafeMetadata.forceRefresh || '❌ Not set'}`);

      // Check for potential issues
      const issues = [];

      if (!unsafeMetadata.role && !publicMetadata.role) {
        issues.push('❌ No role found in metadata');
      }

      if (!unsafeMetadata.roleSetupComplete) {
        issues.push('❌ Role setup not marked as complete');
      }

      if (!unsafeMetadata.dbSynced) {
        issues.push('❌ Database sync not confirmed');
      }

      if (issues.length > 0) {
        console.log('\n🚨 Issues Found:');
        issues.forEach(issue => console.log(`   ${issue}`));
      } else {
        console.log('\n✅ No issues detected');
      }

      console.log('\n' + '='.repeat(60) + '\n');
    }

    // Summary
    const usersWithIssues = users.filter(user => {
      const unsafeMetadata = user.unsafeMetadata || {};
      const publicMetadata = user.publicMetadata || {};
      return !unsafeMetadata.role && !publicMetadata.role;
    });

    console.log('📈 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Users with Role Issues: ${usersWithIssues.length}`);
    console.log(`   Healthy Users: ${users.length - usersWithIssues.length}`);

    if (usersWithIssues.length > 0) {
      console.log('\n⚠️  Users needing attention:');
      usersWithIssues.forEach(user => {
        console.log(`   - ${user.firstName || 'Unknown'} (${user.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user sessions:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify CLERK_SECRET_KEY is correct');
    console.log('2. Check your internet connection');
    console.log('3. Ensure Clerk API is accessible');
    process.exit(1);
  }
}

// Run the diagnostic
checkUserSession().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
