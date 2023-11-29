import { CertificateBase, StatementBase } from "../core/statement";
/**
 * This class implements a certificate document.
 */
export declare class Certificate<TData = any> extends CertificateBase<TData> {
    protected _crypto: {
        BufferLike: typeof import("./buffer").default;
        aes: import("../core/aes.types").TAES<import("./buffer").default>;
        ecies: import("../core/ecies.types").TECIES<import("./buffer").default>;
        hash: import("../core/hash.types").THash<import("./buffer").default>;
        secp: import("../core/secp.types").TSECP<import("./buffer").default>;
    };
}
/**
 * This class implements a general statement document.
 */
export declare class Statement<TData = any> extends StatementBase<TData> {
    protected _crypto: {
        Certificate: typeof Certificate;
        BufferLike: typeof import("./buffer").default;
        aes: import("../core/aes.types").TAES<import("./buffer").default>;
        ecies: import("../core/ecies.types").TECIES<import("./buffer").default>;
        hash: import("../core/hash.types").THash<import("./buffer").default>;
        secp: import("../core/secp.types").TSECP<import("./buffer").default>;
    };
}
export * from "../core/statement.types";
export { Statement as default };
