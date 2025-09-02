#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 SYSTEM CLEANUP - REMOVING ALL TEST FILES AND EXAMPLE DATA');
console.log('=' .repeat(70));
console.log();

// List of test files and example data files to delete
const filesToDelete = [
  // Test files
  'test-advanced-features.js',
  'test-all-dashboards.js',
  'test-button-functionality.js',
  'test-clock-in-fixed.js', 
  'test-clock-in.js',
  'test-communication-features.js',
  'test-complete-system.js',
  'test-dashboard-accessibility.js',
  'test-dashboard-features.js',
  'test-dashboards.js',
  'test-db-connection.js',
  'test-emp-count.js',
  'test-enhanced-features.js',
  'test-feature-completeness.js',
  'test-features-comprehensive.js',
  'test-first-user.js',
  'test-intern-dashboard.js',
  'test-intern-dashboard-simple.js',
  'test-live-features.js',
  'test-navigation-logic.js',
  'test-new-features.js',
  'test-onboarding-promotion.js',
  'test-production-readiness.js',
  'test-role-based-system.js',
  'test-route-accessibility.js',
  'test-setup.js',
  'test-shared-features.js',
  'test-sprint-integration.js',
  'test-super-admin-transfer.js',
  'test-user-metadata.js',
  
  // Example data and setup files
  'create-demo-data.js',
  'create-intern-user.js',
  'create-manager-user.js',
  'create-notifications.js',
  'create-notifications-simple.js',
  'create-welcome-notifications.js',
  'setup-admin-user.js',
  'setup-user-role-fix.js',
  'sync-user-data.js',
  
  // Analysis and debug files
  'analyze-project-completeness.js',
  'comprehensive-feature-analysis.js',
  'comprehensive-feature-test.js',
  'comprehensive-feature-verification.js',
  'comprehensive-phase4-analysis.js',
  'debug-user-role.js',
  'diagnose-system.js',
  'final-feature-status.js',
  'final-production-audit.js',
  'phase-5a-analysis.js',
  'specification-analysis.js',
  
  // Check files
  'check-current-role.js',
  'check-db.js',
  'check-employees.js',
  'check-employees-simple.js',
  'complete-setup-verification.js',
  
  // Role and system setup files
  'role-switcher.js',
  'update-to-super-admin.js',
  'initialize-chat-system.js',
  'navigation-test-guide.js',
  
  // Test API files
  'pages/api/test-session.js',
  
  // Script files
  'scripts/test-employee.js',
  'scripts/reset-system.js',
  'scripts/complete-system-reset.js',
  'scripts/compiled/seed-role-based.js'
];

let deletedCount = 0;
let errors = [];

console.log('🗑️  Deleting test files and example data...\n');

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`⚠️  Not found: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error deleting ${file}: ${error.message}`);
    errors.push(`${file}: ${error.message}`);
  }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`   Files deleted: ${deletedCount}`);
console.log(`   Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ Errors encountered:');
  errors.forEach(error => console.log(`   • ${error}`));
}

console.log('\n🎯 Next Steps:');
console.log('   1. Run database reset to remove all users and data');
console.log('   2. Reset Prisma migrations if needed');
console.log('   3. Clear any cached data');

console.log('\n✨ Test files and example data cleanup completed!');
