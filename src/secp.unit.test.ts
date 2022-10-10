import * as secp from "./secp";

//#####################################################
// Test definitions
//#####################################################
describe("secp test", () => {
  it("should correctly generate a shared secret", async () => {
    const targetKeys = secp.genKeyPair();
    const ephKeys = secp.genKeyPair();

    const secretA = secp.sharedSecret(ephKeys.pvtKey, targetKeys.pubKey);
    const secretB = secp.sharedSecret(targetKeys.pvtKey, ephKeys.pubKey);

    expect(secretB.toHex()).toBe(secretA.toHex());
  });

  it("should correctly sign and verify data", async () => {
    const data = "This is a test";
    const keys = secp.genKeyPair();
    const signature = await secp.signData(data, keys.pvtKey);

    expect(signature).toBeTruthy();

    const isValid = await secp.signVerify(signature, data, keys.pubKey);

    expect(isValid).toBe(true);
  });
});
