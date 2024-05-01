import { AccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { TransactionInvocation } from "stellar-plus/lib/stellar-plus/types";

export const getSimpleTxInvocation = (
  account: AccountHandler,
  fee?: string,
  timeout?: number
): TransactionInvocation => {
  return {
    header: {
      source: account.getPublicKey(),
      fee: fee || "10000000", // 1 XLM
      timeout: timeout || 45, // 45 seconds
    },
    signers: [account],
  };
};
