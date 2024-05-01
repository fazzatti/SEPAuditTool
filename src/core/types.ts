import { NetworkConfig } from "stellar-plus/lib/stellar-plus/network";

export interface ITestCaseOptions<TestArgs> {
  testDirectory: string;
  invocationArgs: TestArgs;
}

export interface ITestCase<TestArgs> {
  invocationArgs: TestArgs;
  networkConfig: NetworkConfig;
}
