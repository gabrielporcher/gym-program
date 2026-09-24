import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  passWithNoTests: true,
  testMatch: [
    '<rootDir>/src/lib/**/*.test.ts',
    '<rootDir>/src/lib/**/*.integration.test.ts',
  ],
};

export default config;
