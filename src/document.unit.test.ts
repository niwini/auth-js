import _ from "lodash";

import { TBufferLike } from "./buffer";
import Document, { TDocumentObj } from "./document";
import secp from "./secp";

//#####################################################
// Test definitions
//#####################################################
let pubkey: TBufferLike;
let pvtkey: TBufferLike;
let doc: Document;

/**
 * This function is going to setup test environment.
 *
 * @param obj -
 */
function setup(obj?: Omit<Partial<TDocumentObj>, "pubkey">) {
  const keys = secp.genKeyPair();

  pubkey = keys.pubkey;
  pvtkey = keys.pvtkey;
  doc = new Document({
    ...obj ?? {},
    pubkey: pubkey.toHex(),
    variant: "test",
  });
}

describe("document", () => {
  beforeEach(() => {
    setup();
  });

  it("should have valid and stable hash", () => {
    expect(doc.hash).toBeTruthy();
    expect(doc.hash).toBe(doc.hash);
  });

  it("should have valid fields", async () => {
    const docObj = doc.toObject();

    expect(docObj).toEqual({
      _id: expect.any(String),
      category: "document",
      created_at: expect.any(Date),
      header: {},
      is_encrypted: false,
      pubkey: expect.any(String),
      variant: "test",
    });
  });

  it("should encrypt data", async () => {
    const data = { full_name: "Bruno Fonseca" };

    setup({ data });

    expect(doc.is_encrypted).toBe(false);
    expect(doc.data).toEqual(data);

    // Encrypt document data for document owner pubkey.
    doc.encrypt(doc.pubkey);

    expect(doc.is_encrypted).toBe(true);
    expect(doc.data).toEqual(expect.any(String));

    // Decript document data.
    doc.decrypt(pvtkey);

    expect(doc.is_encrypted).toBe(false);
    expect(doc.data).toEqual(data);
  });
});
