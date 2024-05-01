import { NetworkConfig } from "stellar-plus/lib/stellar-plus/network";
import { IStartSep41TestsOptions } from "../types";
import { SorobanTokenHandler } from "stellar-plus/lib/stellar-plus/asset";
import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { loadWasmFile } from "../../../utils/wasm";
import { TransactionInvocation } from "stellar-plus/lib/stellar-plus/types";
import { TestCase } from "../../../core";
import { StellarPlusError } from "stellar-plus/lib/stellar-plus/error";
import {
  CONTRACT_ID_PATTERN,
  WASM_HASH_PATTERN,
} from "../../../utils/constants";
import { getSimpleTxInvocation } from "../../../utils/helpers";
import exp from "constants";

describe("SEP0041 Supply Management", () => {
  let networkConfig: NetworkConfig;
  let invocationArgs: IStartSep41TestsOptions;

  let token: SorobanTokenHandler;
  let issuer: DefaultAccountHandler;

  const tokenConfig = {
    symbol: "TST",
    name: "Token",
    decimals: 7,
  };

  beforeAll(async () => {
    ({ networkConfig, invocationArgs } =
      await TestCase.getTestCase<IStartSep41TestsOptions>());

    issuer = new DefaultAccountHandler({
      networkConfig,
    });

    await issuer.initializeWithFriendbot();
    expect(issuer.getPublicKey()).toBeTruthy();

    let contractParameters: {};
    if (invocationArgs.wasmFilePath) {
      const wasmBuffer = await loadWasmFile(invocationArgs.wasmFilePath);

      token = new SorobanTokenHandler({
        contractParameters: { wasm: wasmBuffer },
        networkConfig,
      });

      await token.uploadWasm(getSimpleTxInvocation(issuer));
    } else {
      token = new SorobanTokenHandler({
        contractParameters: {
          wasmHash: invocationArgs.wasmHash,
        },
        networkConfig,
      });
    }

    expect(token.getWasmHash()).toMatch(WASM_HASH_PATTERN);

    await token.deploy(getSimpleTxInvocation(issuer));
    expect(token.getContractId()).toMatch(CONTRACT_ID_PATTERN);

    await expect(
      token.initialize({
        admin: issuer.getPublicKey(),
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        decimal: tokenConfig.decimals,
        ...getSimpleTxInvocation(issuer),
      })
    ).resolves.toBeTruthy();
  });

  describe("after initialization", () => {
    describe("the admin", () => {
      it("should be able to mint new supply to its own address", async () => {
        await expect(
          token.mint({
            to: issuer.getPublicKey(),
            amount: BigInt(100),
            ...getSimpleTxInvocation(issuer),
          })
        ).resolves.toBeTruthy();
        expect(
          await token.balance({
            id: issuer.getPublicKey(),
            ...getSimpleTxInvocation(issuer),
          })
        ).toBe(BigInt(100));
      });

      it("should be able to mint new supply to another address", async () => {
        const recipient = new DefaultAccountHandler({
          networkConfig,
        });

        await expect(
          token.mint({
            to: recipient.getPublicKey(),
            amount: BigInt(235),
            ...getSimpleTxInvocation(issuer),
          })
        ).resolves.toBeTruthy();
        expect(
          await token.balance({
            id: recipient.getPublicKey(),
            ...getSimpleTxInvocation(issuer),
          })
        ).toBe(BigInt(235));
      });
    });
  });

  describe("An Initialized contract", () => {
    // describe("Contains read functions for its contract data", () => {
    // it("should return the contract's symbol", async () => {
    //   const symbom = await token.symbol(getSimpleTxInvocation(issuer));
    //   expect(symbom).toBe(tokenConfig.symbol);
    // });
    // it("should return the contract's name", async () => {
    //   const name = await token.name(getSimpleTxInvocation(issuer));
    //   expect(name).toBe(tokenConfig.name);
    // });
    // });
  });

  it("should pass ", async () => {
    expect(true).toBe(true);
  });
});
