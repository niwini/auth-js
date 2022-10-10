/// <reference types="node" />
/// <reference types="crypto-js" />
import BN from "bn.js";
import WordArray from "crypto-js/lib-typedarrays";
export declare type IBufferLikeInput = string | Object | Buffer | BN | WordArray | Uint8Array | BufferLike;
/**
 * This is a class which wraps a buffer and offer some
 * util conversion functions.
 */
export default class BufferLike {
    private readonly _buff;
    /**
     * Creates a new buffer like.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    static cast(data: IBufferLikeInput, encoding?: BufferEncoding): BufferLike;
    /**
     * Creates a new buffer like.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    static from(data: IBufferLikeInput, encoding?: BufferEncoding): BufferLike;
    /**
     * Concat multiple buffer likes together.
     *
     * @param {...any} items - Data to concat.
     */
    static concat(items: BufferLike[]): BufferLike;
    /**
     * This function creates a new buffer like instance.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    constructor(data: IBufferLikeInput, encoding?: BufferEncoding);
    /**
     * Check if buffers are equal.
     *
     * @param target - The target element to compare to.
     */
    isEqual(target: IBufferLikeInput): boolean;
    /**
     * Convert to hex string.
     *
     * @param opts -
     * @param opts.raw -
     */
    toHex(opts?: {
        raw?: boolean;
    }): string;
    /**
     * Convert to buffer.
     */
    toBuffer(): Buffer;
    /**
     * Convert to word array.
     */
    toWordArray(): WordArray;
    /**
     * Convert to string.
     *
     * @param encoding - Output encoding.
     */
    toString(encoding?: BufferEncoding): string;
    /**
     * Get a slice of the underlying buffer.
     *
     * @param start - Start position.
     * @param end - End position.
     */
    slice(start: number, end?: number): BufferLike;
    /**
     * Get bytes length.
     */
    get size(): number;
}
/**
 * Utility function to create a buffer like instance.
 *
 * @param input - The input to be converted to a buffer like.
 */
export declare function makeBufferLike(input: IBufferLikeInput): BufferLike;
