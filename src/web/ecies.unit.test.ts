import * as ecies from "./ecies";
import * as secp from "./secp";

//#####################################################
// Constants
//#####################################################
const keys = secp.genKeyPair();

//#####################################################
// Test definitions
//#####################################################
describe("[web] ecies", () => {
  it("should encrypt and decrypt message correctly using ecies", async () => {
    const msg = "This is a test message";
    const encrypted = ecies.encrypt(msg, keys.pubkey).toHex();

    expect(encrypted.length)
      .toBe(244);

    const decrypted = ecies.decrypt(encrypted, keys.pvtkey);

    expect(decrypted).toBe(msg);
  });
});
