
import { createDefaultEsmPreset } from "ts-jest";

const preset = createDefaultEsmPreset();

export default {
  ...preset,
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  clearMocks: true,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
};
