// Jest setup file for configuring test environment
import { jest } from '@jest/globals';

// Set test environment variables
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  CLERK_SECRET_KEY: 'test_clerk_secret_key',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test_clerk_publishable_key'
});

// Global test setup
beforeAll(() => {
  // Setup code that runs before all tests
  console.log('🧪 Setting up test environment...');
});

afterAll(() => {
  // Cleanup code that runs after all tests
  console.log('🧪 Cleaning up test environment...');
});

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress Clerk middleware warnings in tests
  if (args[0]?.includes?.('Clerk middleware')) {
    return;
  }
  originalConsoleError(...args);
};

// Export for use in test files
export {};
