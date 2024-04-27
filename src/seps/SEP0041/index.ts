import path from "path";
import { startJestTests } from "../../core/jest";
import {
  NetworkOptions,
  ResourceLimitOptions,
} from "../../core/test-environment/types";

export interface IStartSep41TestsOptions {
  network: NetworkOptions;
  limits?: ResourceLimitOptions;
}

const testDirectory = path.resolve(__dirname, "./", "tests");
// const testDirectory = "src/seps/SEP0041/tests";

export const startSep41Tests = async (args: IStartSep41TestsOptions) => {
  const { network, limits } = args;

  console.log("Running SEP 0041 tests with network configuration:", network);
  if (limits) console.log("Resource limits:", limits);

  return startJestTests({
    testDirectory: testDirectory,
    roots: [testDirectory],
    globalVariables: {
      network: network,
      limits: limits,
    },
  });
};
