import { createDefaultPreset } from "ts-jest"

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/src/**/*.test.ts", "**/src/**/*.spec.ts"], 
  testPathIgnorePatterns: ["/node_modules/", "/dist/"], 
  verbose: true,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};