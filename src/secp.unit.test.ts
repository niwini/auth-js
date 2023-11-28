import * as secp from "./secp";

//#####################################################
// Test definitions
//#####################################################
describe("secp", () => {
  it("should correctly generate a shared secret", async () => {
    const targetKeys = secp.genKeyPair();
    const ephKeys = secp.genKeyPair();

    const secretA = secp.sharedSecret(ephKeys.pvtkey, targetKeys.pubkey);
    const secretB = secp.sharedSecret(targetKeys.pvtkey, ephKeys.pubkey);

    expect(secretB.toHex()).toBe(secretA.toHex());
  });

  it("should correctly sign and verify data", async () => {
    const data = "This is a test";
    const { pubkey, pvtkey } = secp.genKeyPair();
    const signature = await secp.sign(data, pvtkey);

    expect(signature).toBeTruthy();

    const isValid = await secp.signVerify(signature, data, pubkey);

    expect(isValid).toBe(true);
  });
});
