module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/integration/playwright/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage/playwright',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/integration/playwright/**/*.ts'
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};