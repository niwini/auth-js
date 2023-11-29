/// <reference types="node" />
/// <reference types="crypto-js" />
import BN from "bn.js";
import WordArray from "crypto-js/lib-typedarrays";
import { TBufferLike } from "../core/buffer.types";
export type TBufferLikeInput = string | Object | Buffer | BN | WordArray | Uint8Array | BufferLike;
/**
 * This is a class which wraps a buffer and offer some
 * util conversion functions.
 */
export default class BufferLike implements TBufferLike {
    private readonly _buff;
    /**
     * Creates a random buffer like with provided size.
     *
     * @param size - The size of the random buffer to create.
     */
    static random(size: number): BufferLike;
    /**
     * Creates a new buffer like.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    static cast(data: TBufferLikeInput, encoding?: BufferEncoding): BufferLike;
    /**
     * Creates a new buffer like.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    static from(data: TBufferLikeInput, encoding?: BufferEncoding): BufferLike;
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
    constructor(data: TBufferLikeInput, encoding?: BufferEncoding);
    /**
     * Check if buffers are equal.
     *
     * @param target - The target element to compare to.
     */
    isEqual(target: TBufferLikeInput): boolean;
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
export declare function makeBufferLike(input: TBufferLikeInput): BufferLike;
export * from "../core/buffer.types";
