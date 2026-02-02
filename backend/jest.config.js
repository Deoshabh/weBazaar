module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
    "!**/*.test.js",
    "!**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
