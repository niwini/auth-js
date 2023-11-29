import { TBufferLikeInput } from "./buffer.types";
import { TCrypto } from "./crypto.types";
import DocumentBase from "./document";
import { TCertificateObj, TStatementObj } from "./statement.types";
import { IPartialRequired } from "./types";
/**
 * This class implements a certificate document.
 */
export declare class CertificateBase<TData = any> extends DocumentBase<TData, TCertificateObj["header"], TCertificateObj["category"]> {
    /**
     * This is the SECP module we are going to use.
     */
    protected _crypto: TCrypto;
    /**
     * The statement which this certificate is associated with.
     */
    private readonly _stmt;
    /**
     * Creates a new instance of this class.
     *
     * @param stmt - The associated statement.
     * @param obj - The underlying certificate object.
     */
    constructor(stmt: StatementBase, obj: IPartialRequired<TCertificateObj<TData>, "pubkey">);
    /**
     * Get hashes to sign.
     */
    private _hashToSign;
    /**
     * Signs this certificate.
     *
     * @param args -
     * @param args.pvtkey - The signer private key.
     */
    sign(args: {
        pvtkey: TBufferLikeInput;
    }): Promise<void>;
    /**
     * This function checks if this certificate is valid.
     */
    check(): Promise<[boolean, Error | null]>;
}
/**
 * This class implements a general statement document.
 */
export declare abstract class StatementBase<TData = any> extends DocumentBase<TStatementObj["data"], TStatementObj["header"], TStatementObj["category"]> {
    /**
     * This is the SECP module we are going to use.
     */
    protected _crypto: TCrypto & {
        Certificate: typeof CertificateBase;
    };
    /**
     * Creates a new instance of this class.
     *
     * @param obj - The underlying statement object.
     * @param opts -
     * @param opts.pvtkey -
     */
    constructor(obj: IPartialRequired<TStatementObj<TData>, "pubkey">);
    /**
     * Get the certificates of this document.
     */
    get certificates(): CertificateBase[];
    /**
     * This function is going to certify this statement.
     *
     * @param args -
     * @param args.pvtkey - Signer private key.
     * @param args.data - Signer custom data.
     * @param args.variant - Certificate variant.
     */
    certify(args: {
        data?: any;
        pvtkey: TBufferLikeInput;
        variant?: string;
    }): Promise<void>;
    /**
     * This function checks if this statement is valid which
     * essentially consist in checking if all its certificates
     * are valid.
     *
     * @param args -
     * @param args.required_certificate_pubkeys - List of certifiers which
     * must be present.
     */
    check(args?: {
        required_certificate_pubkeys?: TBufferLikeInput[];
    }): Promise<[boolean, Error | null]>;
}
export * from "./statement.types";
export { StatementBase as default };
