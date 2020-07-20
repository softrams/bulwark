// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/interfaces',
    '<rootDir>/src/classes',
    '<rootDir>/src/entity',
    '<rootDir>/src/enums'
  ]
};
