/* eslint-disable import/no-commonjs */

const config = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!**/*.d.ts",
    "!**/*.test.ts",
  ],
  coverageDirectory: "coverage",
  forceExit: true,
  moduleDirectories: [
    "<rootDir>",
    "node_modules",
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  setupFilesAfterEnv: [
    "./jest.setup.ts",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/dist",
    "<rootDir>/src_2",
  ],
  testRegex: "(?<!\\.integ)\\.(test|spec)\\.tsx?$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};

// Setup config for local integration test.
if ((process.env.NODE_ENV || "").startsWith("test-integ")) {
  config.collectCoverage = false;
  config.testRegex = "\\.integ\\.(test|spec)\\.tsx?$";
}

// Export
module.exports = config;
