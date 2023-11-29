import _ from "lodash";

import { TBufferLike } from "./buffer";
import secp from "./secp";
import Statement, { TStatementObj } from "./statement";

//#####################################################
// Test definitions
//#####################################################
let pubkey: TBufferLike;
let pvtkey: TBufferLike;
let stmt: Statement;

/**
 * This function is going to setup test environment.
 *
 * @param obj -
 */
function setupStatement(obj?: Omit<Partial<TStatementObj>, "pubkey">) {
  const keys = secp.genKeyPair();

  pubkey = keys.pubkey;
  pvtkey = keys.pvtkey;
  stmt = new Statement({
    ...obj ?? {},
    pubkey: pubkey.toHex(),
  });
}

describe("[browser] statement", () => {
  beforeEach(() => {
    setupStatement();
  });

  it("should have valid fields", () => {
    const stmtObj = stmt.toObject();

    expect(stmtObj).toEqual({
      _id: expect.any(String),
      category: "statement",
      created_at: expect.any(Date),
      header: {
        certificates: [],
      },
      is_encrypted: false,
      pubkey: expect.any(String),
    });
  });

  it("should be correctly certified", async () => {
    await stmt.certify({ pvtkey, variant: "creator" });

    expect(stmt.certificates.length).toBe(1);

    const [isValid, error] = await stmt.check();

    expect(isValid).toBe(true);
    expect(error).toBe(null);
  });

  it("should fail check if required certificate is not present", async () => {
    const keys = secp.genKeyPair();

    await stmt.certify({ pvtkey, variant: "creator" });

    const [isValid, error] = await stmt.check({
      required_certificate_pubkeys: [keys.pubkey.toHex()],
    });

    expect(isValid).toBe(false);
    expect(error).toEqual(expect.any(Error));
  });
});
