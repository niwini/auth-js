import { CertificateBase, StatementBase } from "./core/statement";
/**
 * This class implements a certificate document.
 */
export declare class Certificate<TData = any> extends CertificateBase<TData> {
    protected _crypto: {
        BufferLike: typeof import("./buffer").default;
        aes: import("./core/aes.types").TAES<import("./buffer").TBufferLike>;
        ecies: import("./core/ecies.types").TECIES<import("./buffer").TBufferLike>;
        hash: import("./core/hash.types").THash<import("./buffer").TBufferLike>;
        secp: import("./core/secp.types").TSECP<import("./buffer").TBufferLike>;
    };
}
/**
 * This class implements a general statement document.
 */
export declare class Statement<TData = any> extends StatementBase<TData> {
    protected _crypto: {
        Certificate: typeof Certificate;
        BufferLike: typeof import("./buffer").default;
        aes: import("./core/aes.types").TAES<import("./buffer").TBufferLike>;
        ecies: import("./core/ecies.types").TECIES<import("./buffer").TBufferLike>;
        hash: import("./core/hash.types").THash<import("./buffer").TBufferLike>;
        secp: import("./core/secp.types").TSECP<import("./buffer").TBufferLike>;
    };
}
export * from "./core/statement.types";
export { Statement as default };
//# sourceMappingURL=statement.d.ts.map