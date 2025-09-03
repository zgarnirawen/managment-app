#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to check for empty TypeScript files that would cause build failures
 * This prevents deployment issues by catching empty .ts/.tsx files early
 */

const EXTENSIONS = ['.ts', '.tsx'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'coverage',
  '.vercel'
];

function isIgnored(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function findEmptyFiles(dir, results = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (isIgnored(fullPath)) {
      continue;
    }

    if (stat.isDirectory()) {
      findEmptyFiles(fullPath, results);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (EXTENSIONS.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const trimmedContent = content.trim();

          // Check if file is empty or contains only whitespace/comments
          if (trimmedContent === '' ||
              trimmedContent === '{}' ||
              trimmedContent === 'export {};' ||
              /^\/\*\s*\*\/$/.test(trimmedContent) ||
              /^\/\/.*$/.test(trimmedContent)) {
            results.push(fullPath);
          }
        } catch (error) {
          console.warn(`Warning: Could not read file ${fullPath}:`, error.message);
        }
      }
    }
  }

  return results;
}

function main() {
  console.log('🔍 Checking for empty TypeScript files...');

  const projectRoot = process.cwd();
  const emptyFiles = findEmptyFiles(projectRoot);

  if (emptyFiles.length > 0) {
    console.error('❌ Found empty TypeScript files that will cause build failures:');
    emptyFiles.forEach(file => {
      console.error(`   - ${path.relative(projectRoot, file)}`);
    });
    console.error('\n💡 Please add proper content to these files or remove them.');
    console.error('   Empty files are not valid TypeScript modules and will break the build.');
    process.exit(1);
  } else {
    console.log('✅ No empty TypeScript files found. Build should proceed successfully!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findEmptyFiles };
