import { DefaultAccountHandlerClient } from "stellar-plus/lib/stellar-plus/account/account-handler/default";
import configManager from "../../../core/config";
import { Network } from "stellar-plus/lib/stellar-plus";

describe("SEP0041", () => {
  it("should pass", async () => {
    console.log(configManager.getConfig());
    expect(true).toBe(true);

    const opex = new DefaultAccountHandlerClient({
      networkConfig: Network.TestNet(),
    });

    await opex.initializeWithFriendbot();

    console.log(await opex.getBalances());
    expect(opex).toBeDefined();
  });
});
