import _ from "lodash";

import BufferLike from "./buffer";
import Document, { TDocumentObj } from "./document";
import * as secp from "./secp";

//#####################################################
// Test definitions
//#####################################################
let pubkey: BufferLike;
let pvtkey: BufferLike;
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
  });
}

describe("[web] document", () => {
  beforeEach(() => {
    setup();
  });

  it("should have valid and stable hash", () => {
    expect(doc.hash).toBeTruthy();
    expect(doc.hash).toBe(doc.hash);
  });

  it("should have valid fields", () => {
    const docObj = doc.toObject();

    expect(docObj).toEqual({
      _id: expect.any(String),
      created_at: expect.any(Date),
      header: {
        certificates: [],
      },
      is_data_encrypted: false,
      pubkey: expect.any(String),
      type: "document",
    });
  });

  it("should be correctly certified", async () => {
    await doc.certify({ pvtkey, type: "creator" });

    expect(doc.certificates.length).toBe(1);

    const [isValid, error] = await doc.check();

    expect(isValid).toBe(true);
    expect(error).toBe(null);
  });

  it("should fail check if required certificate is not present", async () => {
    const keys = secp.genKeyPair();

    await doc.certify({ pvtkey, type: "creator" });

    const [isValid, error] = await doc.check({
      required_certificate_pubkeys: [keys.pubkey.toHex()],
    });

    expect(isValid).toBe(false);
    expect(error).toEqual(expect.any(Error));
  });

  it("should encrypt data", async () => {
    const data = { full_name: "Bruno Fonseca" };

    setup({ data });

    expect(doc.is_data_encrypted).toBe(false);
    expect(doc.data).toEqual(data);

    // Encrypt document data for document owner pubkey.
    doc.encrypt(doc.pubkey);

    expect(doc.is_data_encrypted).toBe(true);
    expect(doc.data).toEqual(expect.any(String));

    // Decript document data.
    doc.decrypt(pvtkey);

    expect(doc.is_data_encrypted).toBe(false);
    expect(doc.data).toEqual(data);
  });
});
