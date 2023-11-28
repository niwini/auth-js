import { TBufferLikeInput } from "./buffer";
import Document from "./document";
import * as secp from "./secp";
import {
  TCertificateObj,
  TStatementObj,
} from "./statement.types";
import { IPartialRequired } from "./types";

//#####################################################
// Certificate
//#####################################################
/**
 * This class implements a certificate document.
 */
export class Certificate<TData = any> extends Document<
  TData,
  TCertificateObj["header"],
  TCertificateObj["category"]
> {
  /**
   * The statement which this certificate is associated with.
   */
  private readonly _stmt: Statement;

  /**
   * Creates a new instance of this class.
   *
   * @param stmt - The associated statement.
   * @param obj - The underlying certificate object.
   */
  constructor(
    stmt: Statement,
    obj: IPartialRequired<TCertificateObj<TData>, "pubkey">,
  ) {
    if (obj.category && obj.category !== "certificate") {
      throw new Error("only certificate objects are allowed");
    }

    super({
      ...obj,
      category: "certificate",
    });

    this._stmt = stmt;
  }

  /**
   * Get hashes to sign.
   */
  private _hashToSign() {
    /**
     * Dependeing on the type of the certificate we should sign
     * more hashes. For example, a "validator" certificate must also
     * sign the hashes of all other certificates presented in the
     * document while a "creator" certificate must sign only the
     * document hash itself (i.e., the core contents of the document).
     */
    const hashes: string[] = [
      this._stmt.hash,
    ];

    switch (this.variant) {
      case "verifier": {
        hashes.push(
          ...this._stmt.certificates.filter(
            (crt) => crt.variant !== "verifier",
          ).map((crt) => crt.hash),
        );
        break;
      }

      default: {
        break;
      }
    }

    return hashes.sort().join("");
  }

  /**
   * Signs this certificate.
   *
   * @param args -
   * @param args.pvtkey - The signer private key.
   */
  public async sign(args: {
    pvtkey: TBufferLikeInput;
  }) {
    this._obj.header.signature = (await secp.sign(
      this._hashToSign(),
      args.pvtkey,
    )).toHex();
  }

  /**
   * This function checks if this certificate is valid.
   */
  public async check(): Promise<[boolean, Error | null]> {
    if (!this._obj.header.signature) {
      return [false, null];
    }

    let error: Error | null = null;
    let isValid = false;

    try {
      isValid = await secp.signVerify(
        this._obj.header.signature,
        this._hashToSign(),
        this._obj.pubkey,
      );
    } catch (anError) {
      error = new Error([
        `Invalid signature for certificate ${this.pubkey}`,
        (anError as Error).message,
      ].join(" : "));
    }

    return [isValid, error];
  }
}

//#####################################################
// Statement
//#####################################################
/**
 * This class implements a general statement document.
 */
export class Statement<TData = any> extends Document<
  TStatementObj["data"],
  TStatementObj["header"],
  TStatementObj["category"]
> {
  /**
   * Creates a document from base64 representation.
   *
   * @param str - The base64 string representation of this document.
   */
  public static fromBase64(str: string) {
    const obj = JSON.parse(Buffer.from(str, "base64").toString());

    return new Statement(obj);
  }

  /**
   * Get the certificates of this document.
   */
  get certificates(): Certificate[] {
    return this._obj.header.certificates.map(
      (crt) => new Certificate(this, crt),
    );
  }

  /**
   * Creates a new instance of this class.
   *
   * @param obj - The underlying statement object.
   * @param opts -
   * @param opts.pvtkey -
   */
  constructor(
    obj: IPartialRequired<TStatementObj<TData>, "pubkey">,
  ) {
    if (obj.category && obj.category !== "statement") {
      throw new Error("only statement objects are allowed");
    }

    super({
      ...obj,
      category: "statement",
      header: {
        certificates: obj.header?.certificates ?? [],
      },
    });
  }

  /**
   * This function is going to certify this statement.
   *
   * @param args -
   * @param args.pvtkey - Signer private key.
   * @param args.data - Signer custom data.
   * @param args.variant - Certificate variant.
   */
  public async certify(args: {
    data?: any;
    pvtkey: TBufferLikeInput;
    variant?: string;
  }) {
    /**
     * First check if this document is valid.
     */
    const { pubkey } = secp.genKeyPair({ pvtkey: args.pvtkey });

    /**
     * Generate the certificate (which is another doc).
     */
    const certificate = new Certificate(this, {
      data: args.data,
      pubkey: pubkey.toHex(),
      variant: args.variant,
    });

    /**
     * Dependeing on the type of the certificate we should sign
     * more hashes. For example, a "validator" certificate must also
     * sign the hashes of all other certificates presented in the
     * document while a "creator" certificate must sign only the
     * document hash itself (i.e., the core contents of the document).
     */
    await certificate.sign({ pvtkey: args.pvtkey });

    /**
     * Set the certificate among the certificates.
     */
    this._obj.header.certificates = [
      ...this._obj.header.certificates ?? [],
      certificate.toObject(),
    ];
  }

  /**
   * This function checks if this statement is valid which
   * essentially consist in checking if all its certificates
   * are valid.
   *
   * @param args -
   * @param args.required_certificate_pubkeys - List of certifiers which
   * must be present.
   */
  public async check(args: {
    required_certificate_pubkeys?: TBufferLikeInput[];
  } = {}): Promise<[boolean, Error | null]> {
    const docCrts = this.certificates;
    let reqCrtPubKeys = [
      ...args.required_certificate_pubkeys ?? [],
    ];

    if (reqCrtPubKeys.length) {
      docCrts.forEach((crt) => {
        reqCrtPubKeys = reqCrtPubKeys.filter((pubkey) => pubkey !== crt.pubkey);
      });
    }

    // Check if all certificates are valid.
    const crtChecks = await Promise.all(
      docCrts.map((crt) => crt.check()),
    );

    /**
     * If required certificates are not present or if
     * any of the presented certificates is not valid
     * then we fail the check.
     */
    if (reqCrtPubKeys.length) {
      return [false, new Error("missing required certificates")];
    }

    const invalidCheck = crtChecks.find(([isValid]) => !isValid);

    if (invalidCheck) {
      return [false, invalidCheck[1]];
    }

    return [true, null];
  }
}

export * from "./statement.types";
export { Statement as default };
