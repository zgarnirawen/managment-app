module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'app/**/*.ts',
    'lib/**/*.ts',
    '!app/**/*.d.ts',
    '!lib/**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  // Suppress Clerk middleware warnings in tests
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Handle Clerk imports in tests
  transformIgnorePatterns: [
    'node_modules/(?!(jose|uuid|@clerk)/)'
  ]
};
