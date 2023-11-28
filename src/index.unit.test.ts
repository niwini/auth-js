import { nanoid } from "nanoid";
import { z } from "zod";

import * as hash from "./hash";
import * as secp from "./secp";
import Statement, { TStatementObj } from "./statement";

//#####################################################
// API Mock
//#####################################################
const challengeResponse = nanoid();

const zStmtCreateReqBase = z.object({
  pubkey: z.string(),
  should_encrypt: z.boolean().optional(),
});

const zEmailStmtCreateReq = zStmtCreateReqBase.extend({
  data: z.string().email(),
  variant: z.literal("email"),
});

const zFullNameStmtCreateReq = zStmtCreateReqBase.extend({
  data: z.string(),
  variant: z.literal("full_name"),
});

const zStmtCreateReq = z.discriminatedUnion("variant", [
  zEmailStmtCreateReq,
  zFullNameStmtCreateReq,
]);

const api = {
  _keys: secp.genKeyPair(),

  /**
   * This function is going to create a new statement.
   *
   * @param req -
   * @param req.data -
   * @param req.pubkey -
   * @param req.should_encrypt -
   * @param req.variant -
   */
  async statementCreate(req: z.infer<typeof zStmtCreateReq>) {
    const valid = zStmtCreateReq.parse(req);
    const crtData: { [key: string]: any } = {};
    const shouldEncrypt = req.should_encrypt ?? true;

    if (valid.variant === "email") {
      crtData.challenge = hash.sha256(challengeResponse).toHex();
    }

    const stmt = new Statement(valid);

    if (shouldEncrypt) {
      stmt.encrypt();
    }

    await stmt.certify({
      data: crtData,
      pvtkey: this._keys.pvtkey,
      variant: "creator",
    });

    return {
      base64: stmt.toBase64(),
      qrcode: await stmt.qrcode(),
      statement: stmt.toObject(),
    };
  },

  /**
   * This function is going to settle a statement
   * which consist in verifying its validity and
   * storing it in our db (or blockchain) so it
   * became retrievable.
   *
   * @param stmtObj -
   */
  async statementValidate(stmtObj: TStatementObj) {
    const stmt = new Statement(stmtObj);

    const [, error] = await stmt.check();

    if (error) {
      throw error;
    }

    // We must enforce the presence of a creator certificate
    // emitted by ourselves.

    /**
     * Enforce the presence of a creator certificate issued by
     * us and the owner certificate.
     */
    const ourPubKey = this._keys.pubkey.toHex();
    const creatorCrt = stmt.certificates.find(
      (crt) => crt.pubkey === ourPubKey && crt.variant === "creator",
    );
    const ownerCrt = stmt.certificates.find(
      (crt) => crt.pubkey === stmt.pubkey && crt.variant === "signer",
    );

    if (!creatorCrt) {
      throw new Error(
        "Niwini did not provide a valid creator certificate",
      );
    }

    if (!ownerCrt) {
      throw new Error(
        "The statement owner did not provide a valid certificate",
      );
    }

    /**
     * If we require a challenge then the statement owner must provide
     * a valid challenge response.
     */
    if (creatorCrt.data?.challenge) {
      const isChallengeResponseValid = Boolean(ownerCrt.data.challenge_response)
        && hash.sha256(
          ownerCrt.data.challenge_response,
        ).toHex() === creatorCrt.data?.challenge;

      if (!isChallengeResponseValid) {
        throw new Error("Invalid challenge response");
      }
    }

    /**
     * If everything is fine we finally certify the statement as a validator.
     */
    await stmt.certify({
      pvtkey: this._keys.pvtkey,
      variant: "validator",
    });

    return {
      base64: stmt.toBase64(),
      qrcode: await stmt.qrcode(),
      statement: stmt.toObject(),
    };
  },
};

//#####################################################
// Test definitions
//#####################################################
describe("global", () => {
  it("should correctly certify and sign an email statement", async () => {
    const ownerKeys = secp.genKeyPair();

    let res = await api.statementCreate({
      data: "test@email.com",
      pubkey: ownerKeys.pubkey.toHex(),
      variant: "email",
    });

    expect(res).toBeTruthy();

    const stmt = new Statement(res.statement);

    await stmt.certify({
      data: {
        challenge_response: challengeResponse,
      },
      pvtkey: ownerKeys.pvtkey,
      variant: "signer",
    });

    /**
     * Finally settle the statement.
     */
    res = await api.statementValidate(stmt.toObject());

    expect(res).toBeTruthy();
  });
});
