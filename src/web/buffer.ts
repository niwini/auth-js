import BN from "bn.js";
import WordArray from "crypto-js/lib-typedarrays";
import stringify from "json-stable-stringify";
import _ from "lodash";

import {} from "./utils";

//#####################################################
// Types
//#####################################################
export type TBufferLikeInput
  = string | Object | Buffer | BN | WordArray | Uint8Array | BufferLike;

//#####################################################
// Utils
//#####################################################
/**
 * This function checks if an object is an instance of
 * word array.
 *
 * @param wordArray - The object to check.
 */
function isWordArray<T extends Object>(wordArray: T) {
  /* eslint-disable no-prototype-builtins */
  if (
    wordArray.hasOwnProperty("sigBytes")
    && wordArray.hasOwnProperty("words")
  ) {
    return true;
  }
  /* eslint-enable no-prototype-builtins */

  return false;
}

/**
 * This function converts an Uint8Array to cryptojs wordarray.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param buff - Buffer to get converted.
 */
function bufferToWordArray(
  buff: Buffer,
) {
  const words: number[] = [];

  for (let i = 0; i < buff.length; i++) {
    // eslint-disable-next-line no-bitwise
    words[(i / 4) | 0] |= buff[i] << (24 - 8 * i);
  }

  return WordArray.create(words, buff.length);
}

/**
 * Auxiliary function.
 *
 * @param word -
 * @param length -
 */
function wordToBytes(
  word: number,
  length: number,
) {
  const bytes: number[] = [];
  const xFF = 0xFF;

  /* eslint-disable no-bitwise */
  if (length > 0) {
    bytes.push(word >>> 24);
  }
  if (length > 1) {
    bytes.push((word >>> 16) & xFF);
  }
  if (length > 2) {
    bytes.push((word >>> 8) & xFF);
  }
  if (length > 3) {
    bytes.push(word & xFF);
  }
  /* eslint-enable no-bitwise */

  return bytes;
}

/**
 * This function converts cryptojs wordarray to Uint8Array.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param wordArray - The word array to get converted.
 */
function wordArrayToBuffer(wordArray: WordArray): Buffer {
  const { words } = wordArray;
  let length = wordArray.sigBytes;

  const result: number[][] = [];
  let i = 0;

  while (length > 0) {
    const bytes = wordToBytes(words[i], Math.min(4, length));
    length -= bytes.length;
    result.push(bytes);
    i++;
  }

  return Buffer.from(([] as any[]).concat(...result));
}

//#####################################################
// Main Class
//#####################################################
/**
 * This is a class which wraps a buffer and offer some
 * util conversion functions.
 */
export default class BufferLike {
  private readonly _buff: Buffer;

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
    } else if (data instanceof BN) {
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
    } else if (isWordArray(data)) {
      this._buff = wordArrayToBuffer(data as WordArray);
    } else if (_.isPlainObject(data)) {
      this._buff = Buffer.from(stringify(data), "utf8");
    } else {
      this._buff = Buffer.from(data as Buffer);
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
   * Convert to word array.
   */
  public toWordArray() {
    return bufferToWordArray(this.toBuffer());
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
