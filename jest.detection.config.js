module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/test/detection/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage/detection',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/detection/**/*.ts'
  ]
};