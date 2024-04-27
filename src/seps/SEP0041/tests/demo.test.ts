import configManager from "../../../core/config";

describe("SEP0041", () => {
  it("should pass", () => {
    console.log(configManager.getConfig());
    expect(true).toBe(true);
  });
});
