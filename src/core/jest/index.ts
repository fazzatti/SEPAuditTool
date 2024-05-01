import { runCLI } from "jest";

export interface IStartJestTestsOptions {
  testDirectory: string;
  roots: string[];
}

// const args = process.argv.slice(2); // Skip Node and script path arguments

export const startJestTests = async (args: IStartJestTestsOptions) => {
  const jestConfig = {
    testMatch: [`${args.testDirectory}/**/*.test.js`], // Match all test files within the specified directory
    roots: args.roots,
    testEnvironment: "node",
  };

  try {
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
