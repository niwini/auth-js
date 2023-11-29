import { DocumentBase } from "../core/document";
import { TDocumentHeader } from "../core/document.types";
/**
 * This function implements a base document.
 */
export declare class Document<TData = any, THeader extends TDocumentHeader = TDocumentHeader, TCategory extends string = string> extends DocumentBase<TData, THeader, TCategory> {
    /**
     * Creates a document from base64 representation.
     *
     * @param str - The base64 string representation of this document.
     */
    static fromBase64(str: string): Document<any, TDocumentHeader, string>;
    protected _crypto: {
        BufferLike: typeof import("./buffer").default;
        aes: import("../core/aes.types").TAES<import("./buffer").default>;
        ecies: import("../core/ecies.types").TECIES<import("./buffer").default>;
        hash: import("../core/hash.types").THash<import("./buffer").default>;
        secp: import("../core/secp.types").TSECP<import("./buffer").default>;
    };
}
export * from "../core/document.types";
export { Document as default };
