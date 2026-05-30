const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  clearMocks: true,
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/.angular/'],
};
