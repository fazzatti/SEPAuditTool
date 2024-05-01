import { ITestCase, ITestCaseOptions } from "./types";
import ConfigManager from "./config";
import { startJestTests } from "./jest";
import { NetworkOptions } from "./test-environment/types";
import { StellarTestLedger } from "./test-environment";
import {
  CustomNet,
  FutureNet,
  NetworkConfig,
  TestNet,
} from "stellar-plus/lib/stellar-plus/network";
import { config } from "process";

export class TestCase<TestArgs> {
  private readonly testDirectory: string;
  private readonly invocationArgs: TestArgs;
  private configManager = ConfigManager;
  private testLedger?: StellarTestLedger;
  constructor(options: ITestCaseOptions<TestArgs>) {
    this.testDirectory = options.testDirectory;
    this.invocationArgs = options.invocationArgs;
  }

  public async run(): Promise<void> {
    if (this.configManager.getConfig().network === NetworkOptions.Local) {
      await this.startTestLedger();
    }

    try {
      ConfigManager.setTestArgs<TestArgs>(this.invocationArgs);
      await this.startJest();
    } catch (e) {
      console.error("Error running Jest tests:", e);
    }

    ConfigManager.setTestArgs<{}>({});
    // improve this to configure when to destroy the test ledger
    await this.testLedger?.stop();
    await this.testLedger?.destroy();
  }

  protected async startJest(): Promise<void> {
    await startJestTests({
      testDirectory: this.testDirectory,
      roots: [this.testDirectory],
    });
  }

  protected async startTestLedger(): Promise<void> {
    console.log("Starting test ledger");
    this.testLedger = new StellarTestLedger({
      emitContainerLogs: false,
    });

    await this.testLedger.start();
  }

  static async getTestCase<TestArgs>(): Promise<ITestCase<TestArgs>> {
    let networkConfig: NetworkConfig;

    if (ConfigManager.getConfig().network === NetworkOptions.Local) {
      const testLedger = new StellarTestLedger({ useRunningLedger: true });

      try {
        await testLedger.start();
        networkConfig = CustomNet(await testLedger.getNetworkConfiguration());
      } catch (e) {
        console.log("Couldnt find a running Local test ledger:", e);
        throw e;
      }
    } else if (ConfigManager.getConfig().network === NetworkOptions.Futurenet) {
      networkConfig = FutureNet();
    } else {
      networkConfig = TestNet();
    }

    try {
      const testSuitArgs = ConfigManager.getTestArgs<TestArgs>();

      return {
        invocationArgs: testSuitArgs as TestArgs,
        networkConfig,
      };
    } catch (e) {
      console.error("Error parsing test parameters:", e);
      throw e;
    }
  }
}
