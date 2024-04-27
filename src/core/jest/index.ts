import path from "path";
import { Config, runCLI } from "jest";
import { IGlobalAuditParams } from "./types";

export interface IStartJestTestsOptions {
  testDirectory: string;
  roots: string[];
  globalVariables?: IGlobalAuditParams;
}

export const startJestTests = async (args: IStartJestTestsOptions) => {
  const jestConfig = {
    testMatch: [`${args.testDirectory}/**/*.test.js`], // Match all test files within the specified directory
    roots: args.roots,
    globals: {
      globalAuditParams: JSON.stringify(args.globalVariables),
    },
    testEnvironment: "node",
  };

  try {
    // Run Jest tests using jest.runCLI
    const { results } = await runCLI(jestConfig as any, [process.cwd()]);
    if (results.success) {
      return { results: "Jest tests completed successfully." };
    } else {
      throw new Error("Jest tests failed.");
    }
  } catch (error) {
    console.error("Failed to run Jest tests:", error);
    throw error;
  }
};
