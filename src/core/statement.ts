import { TBufferLikeInput } from "./buffer.types";
import { TCrypto } from "./crypto.types";
import DocumentBase from "./document";
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
export abstract class CertificateBase<TData = any> extends DocumentBase<
  TData,
  TCertificateObj["header"],
  TCertificateObj["category"]
> {
  /**
   * This is the SECP module we are going to use.
   */
  protected abstract _crypto: TCrypto;

  /**
   * The statement which this certificate is associated with.
   */
  private readonly _stmt: StatementBase;

  /**
   * Creates a new instance of this class.
   *
   * @param stmt - The associated statement.
   * @param obj - The underlying certificate object.
   */
  constructor(
    stmt: StatementBase,
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
    this._obj.header.signature = (await this._crypto.secp.sign(
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
      isValid = await this._crypto.secp.signVerify(
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
export abstract class StatementBase<
  TData = any,
> extends DocumentBase<
  TStatementObj["data"],
  TStatementObj["header"],
  TStatementObj["category"]
> {
  /**
   * This is the SECP module we are going to use.
   */
  protected abstract _crypto: TCrypto & {
    Certificate: new(
      stmt: StatementBase,
      obj: IPartialRequired<TCertificateObj<TData>, "pubkey">,
    ) => CertificateBase;
  };

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
   * Get the certificates of this document.
   */
  get certificates(): CertificateBase[] {
    return this._obj.header.certificates.map(

      /**
       * For some reason we need to cast crt to any here
       * because on running 'yarn build' typescript is throwing
       * the following error:
       *
       * src/core/statement.ts:175:51 - error TS2345: Argument of type '{ data?: any; _id?: string; created_at?: Date; is_encrypted?: boolean; pubkey?: string; variant?: string; category?: "certificate"; header?: { signature?: string; }; }' is not assignable to parameter of type 'IPartialRequired<TCertificateObj<any>, "pubkey">'.
       * Type '{ data?: any; _id?: string; created_at?: Date; is_encrypted?: boolean; pubkey?: string; variant?: string; category?: "certificate"; header?: { signature?: string; }; }' is not assignable to type 'Required<Pick<TCertificateObj<any>, "pubkey">>'.
       * Property 'pubkey' is optional in type '{ data?: any; _id?: string; created_at?: Date; is_encrypted?: boolean; pubkey?: string; variant?: string; category?: "certificate"; header?: { signature?: string; }; }' but required in type 'Required<Pick<TCertificateObj<any>, "pubkey">>'.
       *
       * 175       (crt) => new this._crypto.Certificate(this, crt),
       *
       * Found 1 error in src/core/statement.ts:175
       *
       * @param crt -
       */
      (crt) =>
        new this._crypto.Certificate(this, crt as any),
    );
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
    const { pubkey } = this._crypto.secp.genKeyPair({ pvtkey: args.pvtkey });

    /**
     * Generate the certificate (which is another doc).
     */
    const certificate = new this._crypto.Certificate(this, {
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
export { StatementBase as default };
