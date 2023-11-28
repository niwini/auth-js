import crypto from "crypto";

import stringify from "json-stable-stringify";
import _ from "lodash";

export type TBufferLikeInput
  = string | Object | Buffer | Uint8Array | BufferLike;

/**
 * This is a class which wraps a buffer and offer some
 * util conversion functions.
 */
export default class BufferLike {
  private readonly _buff: Buffer;

  /**
   * Creates a random buffer like with provided size.
   *
   * @param size - The size of the random buffer to create.
   */
  public static random(size: number) {
    const buff = crypto.randomBytes(size);

    return BufferLike.from(buff);
  }

  /**
   * Creates a new buffer like.
   *
   * @param data - Data to be converted.
   * @param encoding - Encoding to use when data is string.
   */
  public static cast(
    data: TBufferLikeInput,
    encoding?: BufferEncoding,
  ) {
    if (data instanceof BufferLike) {
      return data;
    }

    return new BufferLike(data, encoding);
  }

  /**
   * Creates a new buffer like.
   *
   * @param data - Data to be converted.
   * @param encoding - Encoding to use when data is string.
   */
  public static from(
    data: TBufferLikeInput,
    encoding?: BufferEncoding,
  ) {
    return new BufferLike(data, encoding);
  }

  /**
   * Concat multiple buffer likes together.
   *
   * @param {...any} items - Data to concat.
   */
  public static concat(items: BufferLike[]) {
    const buff = Buffer.concat(
      items.map((item) => item.toBuffer()),
    );

    return BufferLike.from(buff);
  }

  /**
   * This function creates a new buffer like instance.
   *
   * @param data - Data to be converted.
   * @param encoding - Encoding to use when data is string.
   */
  constructor(
    data: TBufferLikeInput,
    encoding?: BufferEncoding,
  ) {
    if (data instanceof BufferLike) {
      this._buff = data.toBuffer();
    } else if (_.isString(data)) {
      /**
       * The encoding is going to be inferred by the string
       * itself. If it starts with an 0x it means an
       * hexadecimal encoding.
       */
      const hexMatch = (/^(0x)?([0-9a-fA-F]+)$/).exec(data);

      let str = data;
      let finalEncoding: BufferEncoding = encoding ?? "utf8";

      if (hexMatch) {
        str = hexMatch[2];
        finalEncoding = "hex";
      }

      this._buff = Buffer.from(str, finalEncoding);
    } else if (_.isPlainObject(data)) {
      this._buff = Buffer.from(stringify(data), "utf8");
    } else {
      this._buff = Buffer.from(data as any);
    }
  }

  /**
   * Check if buffers are equal.
   *
   * @param target - The target element to compare to.
   */
  public isEqual(target: TBufferLikeInput) {
    const buff = BufferLike.from(target);

    return this._buff.equals(buff.toBuffer());
  }

  /**
   * Convert to hex string.
   *
   * @param opts -
   * @param opts.raw -
   */
  public toHex(opts: {
    raw?: boolean;
  } = {}) {
    const rawVal = this._buff.toString("hex");

    if (opts.raw) {
      return rawVal;
    }

    return `0x${rawVal}`;
  }

  /**
   * Convert to buffer.
   */
  public toBuffer() {
    return Buffer.from(this._buff);
  }

  /**
   * Convert to string.
   *
   * @param encoding - Output encoding.
   */
  public toString(encoding?: BufferEncoding) {
    if (encoding === "hex") {
      return this.toHex();
    }

    return this._buff.toString(encoding);
  }

  /**
   * Get a slice of the underlying buffer.
   *
   * @param start - Start position.
   * @param end - End position.
   */
  public slice(start: number, end?: number) {
    return BufferLike.from(
      this._buff.subarray(start, end),
    );
  }

  /**
   * Get bytes length.
   */
  get size() {
    return this._buff.byteLength;
  }
}

/**
 * Utility function to create a buffer like instance.
 *
 * @param input - The input to be converted to a buffer like.
 */
export function makeBufferLike(input: TBufferLikeInput) {
  return BufferLike.cast(input);
}
