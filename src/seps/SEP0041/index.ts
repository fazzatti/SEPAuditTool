import path from "path";

import configManager from "../../core/config";
import { IStartSep41TestsOptions } from "./types";
import { TestCase } from "../../core";

const testDirectory = path.resolve(__dirname, "./", "tests");
// const testDirectory = "src/seps/SEP0041/tests";

export const startSep41Tests = async (args: IStartSep41TestsOptions) => {
  console.log("Running SEP 0041 tests with :", args);

  validateTestConditions(args);

  const testCase = new TestCase<IStartSep41TestsOptions>({
    testDirectory: testDirectory,
    invocationArgs: args,
  });

  return testCase.run();
};

const validateTestConditions = async (args: IStartSep41TestsOptions) => {
  const config = configManager.getConfig();

  if (args.wasmHash && config.network === "local") {
    throw new Error(
      "Local environment requires a WASM file. There will be no deployed contracts in a new network."
    );
  }
};
