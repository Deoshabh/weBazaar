const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/utils/**/*.{js,jsx}",
    "src/components/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/**/__tests__/**",
  ],
  // Coverage thresholds set per-directory for tested utilities
  coverageThreshold: {
    "./src/utils/validation.js": {
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50,
    },
    "./src/utils/helpers.js": {
      branches: 10,
      functions: 15,
      lines: 25,
      statements: 25,
    },
    "./src/components/ProductCard.jsx": {
      branches: 30,
      functions: 20,
      lines: 40,
      statements: 40,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
