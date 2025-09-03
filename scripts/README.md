# Empty File Checker

This script helps prevent build failures by detecting empty TypeScript files before deployment.

## What it does

- Scans your entire project for `.ts` and `.tsx` files
- Identifies files that are empty or contain only whitespace/comments
- Fails the build if any empty files are found
- Provides clear error messages about which files need to be fixed

## Usage

### Run manually
```bash
npm run check-empty-files
```

### Automatic checks
The script is automatically run during:
- `npm run build` (prevents deployment of empty files)
- Pre-commit hook (catches issues before committing)

## Setup

### 1. Pre-commit Hook (Windows)
Since `chmod` doesn't work on Windows, you'll need to manually enable the pre-commit hook:

1. Open `.git/hooks/pre-commit` in a text editor
2. Make sure it has execute permissions (you may need to use Git Bash or WSL)

Or use a tool like [Husky](https://typicode.github.io/husky/) for better cross-platform support:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run check-empty-files"
```

### 2. CI/CD Integration
Add to your Vercel build command or GitHub Actions:

```yaml
- name: Check for empty files
  run: npm run check-empty-files
```

## What files are checked

- `.ts` files (TypeScript)
- `.tsx` files (TypeScript React)
- Excludes: `node_modules`, `.next`, `dist`, `build`, `.git`, `coverage`, `.vercel`

## Common issues it catches

- Empty page components (`app/*/page.tsx`)
- Empty API routes (`app/api/*/route.ts`)
- Empty utility files
- Files with only `export {};` or empty objects

## Fixing empty files

When the script finds empty files, you have two options:

1. **Add content**: Implement the missing functionality
2. **Remove the file**: If it's not needed, delete it

Example fix for an empty page:
```tsx
import React from 'react';

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <p>Content coming soon...</p>
    </div>
  );
}
```
