import hash from "./hash";

//#####################################################
// Test definitions
//#####################################################
describe("[browser] hash", () => {
  it("should hash message correctly using sha256", async () => {
    const sha = hash.sha256("This is a test message").toHex();

    expect(sha)
      .toBe(
        // eslint-disable-next-line max-len
        "0x6f3438001129a90c5b1637928bf38bf26e39e57c6e9511005682048bedbef906",
      );
  });

  it("should hash message correctly using sha3_256", async () => {
    const sha = hash.sha3_256("This is a test message").toHex();

    expect(sha)
      .toBe(
        // eslint-disable-next-line max-len
        "0xdfce1be7affff1a4cd637356233d031b46aedf43176a734cbdfba4f8c178921e",
      );
  });

  it("should hash message correctly using sha512", async () => {
    const sha = hash.sha512("This is a test message").toHex();

    expect(sha)
      .toBe(
        // eslint-disable-next-line max-len
        "0x8f3ab9d29c6d32e68d8bd46ebc16e320269585c55b2a211449ecca6329b4c0c6dcd09b5fd980f2ea3a8b69b25cf21bcfb2e68ebe48f6e2b4fa4d94061700fcd0",
      );
  });

  it("should hash message correctly using keccak256", async () => {
    const sha = hash.keccak256("This is a test message").toHex();

    expect(sha)
      .toBe(
        // eslint-disable-next-line max-len
        "0x2750c90065ce5155632f83abd2a5272679a670d415050275105659297ca8463f",
      );
  });

  it("should hash message correctly using hmac256", async () => {
    const sha = hash.hmac256(
      "This is a test message",
      "secret",
    ).toHex();

    expect(sha)
      .toBe(
        // eslint-disable-next-line max-len
        "0x32bb2dbac495c19e5aa7ea538540d141dab4c8c6813be58675be0535e3d5a995",
      );
  });
});
