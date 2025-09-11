#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running post-build cleanup...');

// Function to recursively find and handle client reference manifest files
function handleClientReferenceManifests(dir) {
  try {
    // Check if directory exists before trying to read it
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      // Check if file exists before trying to stat it
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
      }

      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        handleClientReferenceManifests(filePath);
      } else if (file.includes('_client-reference-manifest.js')) {
        console.log(`📄 Found client reference manifest: ${filePath}`);
        // Ensure the file exists and is readable
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content || content.trim() === '') {
            console.log(`⚠️  Empty client reference manifest found: ${filePath}`);
            // Create a minimal manifest if empty
            fs.writeFileSync(filePath, 'export default {};');
          }
        } catch (error) {
          console.log(`⚠️  Error reading client reference manifest: ${filePath}`, error.message);
          // Create a minimal manifest if unreadable
          try {
            fs.writeFileSync(filePath, 'export default {};');
          } catch (writeError) {
            console.log(`⚠️  Error writing to manifest file: ${filePath}`, writeError.message);
          }
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Error scanning directory ${dir}:`, error.message);
  }
}

// Check for .next directory and handle manifests
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('🔍 Scanning .next directory for client reference manifests...');
  handleClientReferenceManifests(nextDir);
} else {
  console.log('⚠️  .next directory not found');
}

console.log('✅ Post-build cleanup completed!');
