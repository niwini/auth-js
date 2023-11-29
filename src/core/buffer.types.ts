export type TBufferLikeInput
  = string | Object | Buffer | Uint8Array | TBufferLike;

/**
 * This is an interface for the buffer like instance.
 */
export interface TBufferLike {

  /**
   * Get bytes length.
   */
  size: number;

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
  slice(start: number, end?: number): TBufferLike;
}

/**
 * Interface for a BufferLike class.
 */
export interface TBufferLikeClass {

  /**
   * This function creates a new buffer like instance.
   *
   * @param data - Data to be converted.
   * @param encoding - Encoding to use when data is string.
   */
  new(
    data: TBufferLikeInput,
    encoding?: BufferEncoding,
  ): TBufferLike;

  /**
   * Creates a random buffer like with provided size.
   *
   * @param size - The size of the random buffer to create.
   */
  random(size: number): TBufferLike;

  /**
   * Creates a new buffer like.
   *
   * @param data - Data to be converted.
   * @param encoding - Encoding to use when data is string.
   */
  cast(
    data: TBufferLikeInput,
    encoding?: BufferEncoding,
  ): TBufferLike;

  /**
   * Creates a new buffer like.
   *
   * @param data - Data to be converted.
   * @param encoding - Encoding to use when data is string.
   */
  from(
    data: TBufferLikeInput,
    encoding?: BufferEncoding,
  ): TBufferLike;

  /**
   * Concat multiple buffer likes together.
   *
   * @param {...any} items - Data to concat.
   */
  concat(items: TBufferLike[]): TBufferLike;
}
