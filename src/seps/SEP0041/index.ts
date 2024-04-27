import path from "path";
import { startJestTests } from "../../core/jest";

import { IStartSep41TestsOptions } from "./types";

const testDirectory = path.resolve(__dirname, "./", "tests");
// const testDirectory = "src/seps/SEP0041/tests";

export const startSep41Tests = async (args: IStartSep41TestsOptions) => {
  console.log("Running SEP 0041 tests with :", args);

  return startJestTests({
    testDirectory: testDirectory,
    roots: [testDirectory],
    invocationArgs: JSON.stringify(args),
  });
};
