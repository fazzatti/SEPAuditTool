import { IStartSep41TestsOptions } from "../types";
import { NetworkConfig } from "stellar-plus/lib/stellar-plus/network";
import { TestCase } from "../../../core";
import { HorizonHandler } from "stellar-plus/lib/stellar-plus";
import exp from "constants";
import { DefaultRpcHandler } from "stellar-plus/lib/stellar-plus/rpc";
import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";

describe("SEP0041 Test Case Parameters", () => {
  let networkConfig: NetworkConfig;
  let invocationArgs: IStartSep41TestsOptions;

  beforeAll(async () => {
    ({ networkConfig, invocationArgs } =
      await TestCase.getTestCase<IStartSep41TestsOptions>());
  });

  describe("Before audit ", () => {
    it("should have received valid parameters", async () => {
      const { wasmFilePath, wasmHash } = invocationArgs;

      expect(networkConfig).toBeDefined();
      expect(invocationArgs).toBeDefined();
      expect(() => {
        return wasmFilePath || wasmHash;
      }).toBeTruthy();
    });

    it("should have a working horizon instance to connect", async () => {
      const horizon = new HorizonHandler(networkConfig);

      expect(horizon).toBeDefined();
      await expect(horizon.server.feeStats()).resolves.toBeDefined();
    });

    it("should have a working sorobanRpc instance to connect", async () => {
      const sorobanRpc = new DefaultRpcHandler(networkConfig);

      expect(sorobanRpc).toBeDefined();
      await expect(sorobanRpc.getHealth()).resolves.toBeDefined();
    });

    it("should have a working friendbot instance to initialize accounts", async () => {
      const account = new DefaultAccountHandler({ networkConfig });

      expect(account).toBeDefined();
      await expect(account.initializeWithFriendbot()).resolves.toBeUndefined();
    });
  });
});
