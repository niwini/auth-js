import aes from "./aes";

//#####################################################
// Constants
//#####################################################
const SECRET = "shhh..";

//#####################################################
// Test definitions
//#####################################################
describe("aes", () => {
  it("should encrypt message correctly using aes", async () => {
    const encrypted = aes.encrypt(
      "This is a test message",
      SECRET,
    ).toHex();

    expect(encrypted.length)
      .toBe(114);
  });

  it("should decrypt message correctly using aes", async () => {
    const msg = "This is a test message";
    const encrypted = aes.encrypt(msg, SECRET).toHex();

    expect(encrypted.length)
      .toBe(114);

    const decrypted = aes.decrypt(encrypted, SECRET);

    expect(decrypted).toBe(msg);
  });
});
