import { TBufferLikeInput } from "./buffer.types";
import { TCrypto } from "./crypto.types";
import { TDocumentHeader, TDocumentObj } from "./document.types";
import { IPartialRequired } from "./types";
/**
 * This function implements a base document.
 */
export declare abstract class DocumentBase<TData = any, THeader extends TDocumentHeader = TDocumentHeader, TCategory extends string = string> {
    /**
     * The auth module to use.
     */
    protected abstract _crypto: Pick<TCrypto, "BufferLike" | "ecies" | "hash">;
    /**
     * Underlying document object.
     */
    protected readonly _obj: TDocumentObj<TData, THeader, TCategory>;
    /**
     * This function creates a new base document.
     *
     * @param obj -
     * @param idGen -
     */
    constructor(obj: IPartialRequired<TDocumentObj<TData, THeader, TCategory>, "pubkey">);
    /**
     * Get the header of this document.
     */
    get header(): THeader;
    /**
     * Get document pubkey.
     */
    get pubkey(): string;
    /**
     * Get document variant.
     */
    get variant(): string | undefined;
    /**
     * Get document category.
     */
    get category(): TCategory;
    /**
     * The document type is the doc typename concatenated with
     * document variant (if any).
     */
    get type(): string;
    /**
     * Get document data.
     */
    get data(): string | TData | undefined;
    /**
     * Get document is_encrypted.
     */
    get is_encrypted(): boolean;
    /**
     * This function is going to hash this document contents
     * (which means everything but the header). Clients signs
     * this document hash when issuing a certificate for this
     * document.
     */
    get hash(): string;
    /**
     * This function is going to decrypt this document data.
     *
     * @param pvtkey - Recipient private key.
     */
    decrypt(pvtkey: TBufferLikeInput): void;
    /**
     * This function is going to encrypt this document data.
     *
     * @param pubkey - Recipient public key.
     */
    encrypt(pubkey?: TBufferLikeInput): void;
    /**
     * This function generates the query code representing this document.
     */
    qrcode(): Promise<string>;
    /**
     * This function get the object representation of
     * this document.
     */
    toObject(): TDocumentObj<TData, THeader, TCategory>;
    /**
     * Convert this document to a base64 representation.
     */
    toBase64(): string;
}
export * from "./document.types";
export { DocumentBase as default };
//# sourceMappingURL=document.d.ts.map