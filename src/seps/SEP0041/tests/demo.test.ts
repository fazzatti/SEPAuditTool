import { DefaultAccountHandlerClient } from "stellar-plus/lib/stellar-plus/account/account-handler/default";
import configManager from "../../../core/config";
import { Network } from "stellar-plus/lib/stellar-plus";
import { IStartSep41TestsOptions } from "../types";
import {
  Transaction,
  TransactionInvocation,
} from "stellar-plus/lib/stellar-plus/types";
import { SorobanTokenHandler } from "stellar-plus/lib/stellar-plus/asset";

describe("SEP0041", () => {
  const lastArg = process.argv[process.argv.length - 1];
  let testSuitArgs: IStartSep41TestsOptions;
  try {
    testSuitArgs = JSON.parse(lastArg as string);
    console.log("Test running with parameters:", testSuitArgs);

    // Use testParams as needed in your tests
  } catch (e) {
    console.error("Error parsing test parameters:", e);
  }

  it("should pass", async () => {
    // console.log(configManager.getConfig());
    expect(true).toBe(true);

    const opex = new DefaultAccountHandlerClient({
      networkConfig: Network.TestNet(),
    });

    await opex.initializeWithFriendbot();

    const txInvocation: TransactionInvocation = {
      header: {
        source: opex.getPublicKey(),
        fee: "100",
        timeout: 30,
      },
      signers: [opex],
    };

    if (testSuitArgs.wasmHash) {
      console.log("Wasm hash:", testSuitArgs.wasmHash);

      const token = new SorobanTokenHandler({
        contractParameters: {
          wasmHash: testSuitArgs.wasmHash,
        },
        networkConfig: Network.TestNet(),
      });

      await token.deploy(txInvocation);

      console.log(token.getContractId());
    }

    console.log(await opex.getBalances());
    expect(opex).toBeDefined();
  });
});
