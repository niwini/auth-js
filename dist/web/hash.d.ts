import BufferLike, { IBufferLikeInput } from "./buffer";
/**
 * This function is going to hash a message using
 * sha3 256 bits (= 32 bytes) keccak algorithm.
 *
 * @param msg -
 * @param secret -
 */
export declare function hmac256(msg: IBufferLikeInput, secret: IBufferLikeInput): BufferLike;
/**
 * This function hash the provided message using the
 * sha3 algo with 256 bits (= 32 bytes) of size.
 *
 * @param msg -
 */
export declare function sha3_256(// eslint-disable-line @typescript-eslint/naming-convention
msg: IBufferLikeInput): BufferLike;
/**
 * This function hash the provided message using the
 * sha2 algo with 256 bits (= 32 bytes) of size.
 *
 * @param msg -
 */
export declare function sha256(msg: IBufferLikeInput): BufferLike;
/**
 * This function hash the provided message using the
 * sha2 algo with 512 bits (= 64 bytes) of size.
 *
 * @param msg -
 */
export declare function sha512(msg: IBufferLikeInput): BufferLike;
/**
 * This function is going to hash a message using
 * sha3 256 bits (= 32 bytes) keccak algorithm.
 *
 * @param msg -
 */
export declare function keccak256(msg: IBufferLikeInput): BufferLike;
