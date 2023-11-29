import BufferLike from "./buffer";
declare const crypto: {
    BufferLike: typeof BufferLike;
    aes: import("../core/aes.types").TAES<BufferLike>;
    ecies: import("../core/ecies.types").TECIES<BufferLike>;
    hash: import("../core/hash.types").THash<BufferLike>;
    secp: import("../core/secp.types").TSECP<BufferLike>;
};
export default crypto;
