module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
    coverageDirectory: "coverage",
    collectCoverage: true,
    collectCoverageFrom: ["backend/**/*.js", "!backend/server.js"],
  };
  