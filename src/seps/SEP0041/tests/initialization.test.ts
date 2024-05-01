import { NetworkConfig } from "stellar-plus/lib/stellar-plus/network";
import { IStartSep41TestsOptions } from "../types";
import { SorobanTokenHandler } from "stellar-plus/lib/stellar-plus/asset";
import {
  AccountHandler,
  DefaultAccountHandler,
} from "stellar-plus/lib/stellar-plus/account";
import { loadWasmFile } from "../../../utils/wasm";
import { TransactionInvocation } from "stellar-plus/lib/stellar-plus/types";
import { TestCase } from "../../../core";
import { StellarPlusError } from "stellar-plus/lib/stellar-plus/error";
import {
  CONTRACT_ID_PATTERN,
  WASM_HASH_PATTERN,
} from "../../../utils/constants";
import { getSimpleTxInvocation } from "../../../utils/helpers";
import { Account } from "stellar-plus/lib/stellar-plus";

describe("SEP0041 Soroban Token Contract Initialization", () => {
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
  });

  describe("before initialization", () => {
    let userA: AccountHandler;
    let userB: AccountHandler;

    beforeAll(async () => {
      userA = new DefaultAccountHandler({ networkConfig });
      userB = new DefaultAccountHandler({ networkConfig });
      await userA.initializeWithFriendbot();
      await userB.initializeWithFriendbot();
    });

    it("should not invoke allowance", async () => {
      await expect(
        token.allowance({
          from: userA.getPublicKey(),
          spender: userB.getPublicKey(),
          ...getSimpleTxInvocation(userA),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke approve", async () => {
      await expect(
        token.approve({
          from: userA.getPublicKey(),
          spender: userB.getPublicKey(),
          amount: BigInt(1000),
          expiration_ledger: 100,
          ...getSimpleTxInvocation(userA),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke balance", async () => {
      await expect(
        token.balance({
          id: userA.getPublicKey(),
          ...getSimpleTxInvocation(userA),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke transfer", async () => {
      await expect(
        token.transfer({
          from: userA.getPublicKey(),
          to: userB.getPublicKey(),
          amount: BigInt(1000),
          ...getSimpleTxInvocation(userA),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke transferFrom", async () => {
      await expect(
        token.transferFrom({
          spender: userA.getPublicKey(),
          from: userA.getPublicKey(),
          to: userB.getPublicKey(),
          amount: BigInt(1000),
          ...getSimpleTxInvocation(userA),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke setAuthorized", async () => {
      await expect(
        token.setAuthorized({
          id: userA.getPublicKey(),
          authorize: true,
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke admin", async () => {
      await expect(token.admin(getSimpleTxInvocation(issuer))).rejects.toThrow(
        StellarPlusError
      );
    });

    it("should not invoke setAdmin", async () => {
      await expect(
        token.setAdmin({
          id: issuer.getPublicKey(),
          new_admin: userB.getPublicKey(),
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke mint", async () => {
      await expect(
        token.mint({
          to: userA.getPublicKey(),
          amount: BigInt(1000),
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke burn", async () => {
      await expect(
        token.burn({
          from: issuer.getPublicKey(),
          amount: BigInt(1000),
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke burnFrom", async () => {
      await expect(
        token.burnFrom({
          from: issuer.getPublicKey(),
          spender: userA.getPublicKey(),
          amount: BigInt(1000),
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke decimals", async () => {
      await expect(
        token.decimals(getSimpleTxInvocation(issuer))
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke name", async () => {
      await expect(token.name(getSimpleTxInvocation(issuer))).rejects.toThrow(
        StellarPlusError
      );
    });

    it("should not invoke symbol", async () => {
      await expect(token.symbol(getSimpleTxInvocation(issuer))).rejects.toThrow(
        StellarPlusError
      );
    });

    it("should not invoke spendableBalance", async () => {
      await expect(
        token.spendableBalance({
          id: userA.getPublicKey(),
          ...getSimpleTxInvocation(userA),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should not invoke clawback", async () => {
      await expect(
        token.clawback({
          from: userA.getPublicKey(),
          amount: BigInt(1000),
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });
  });

  describe("at initialization", () => {
    it("should fail to initialize with an invalid symbol", async () => {
      const freshToken = new SorobanTokenHandler({
        contractParameters: {
          wasmHash: token.getWasmHash(),
        },
        networkConfig,
      });
      await freshToken.deploy(getSimpleTxInvocation(issuer));

      await expect(
        freshToken.initialize({
          admin: issuer.getPublicKey(),
          symbol: "",
          name: tokenConfig.name,
          decimal: tokenConfig.decimals,
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should fail to initialize with exceeding decimals", async () => {
      const freshToken = new SorobanTokenHandler({
        contractParameters: {
          wasmHash: token.getWasmHash(),
        },
        networkConfig,
      });
      await freshToken.deploy(getSimpleTxInvocation(issuer));

      await expect(
        freshToken.initialize({
          admin: issuer.getPublicKey(),
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          decimal: 1000000,
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });

    it("should initialize the contract with the proper parameters", async () => {
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
  });
  describe("after initialization", () => {
    it("should fail to initialize the contract if it is already initialized", async () => {
      await expect(
        token.initialize({
          admin: issuer.getPublicKey(),
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          decimal: tokenConfig.decimals,
          ...getSimpleTxInvocation(issuer),
        })
      ).rejects.toThrow(StellarPlusError);
    });
  });
});
