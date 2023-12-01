import BufferLike from "./buffer";
declare const crypto: {
    BufferLike: typeof BufferLike;
    aes: import("./core/aes.types").TAES<import("./buffer").TBufferLike>;
    ecies: import("./core/ecies.types").TECIES<import("./buffer").TBufferLike>;
    hash: import("./core/hash.types").THash<import("./buffer").TBufferLike>;
    secp: import("./core/secp.types").TSECP<import("./buffer").TBufferLike>;
};
export default crypto;
//# sourceMappingURL=crypto.d.ts.map