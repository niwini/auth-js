/* eslint-disable import/prefer-default-export */
import jsHmac256 from "crypto-js/hmac-sha256";
import jsMd5 from "crypto-js/md5";
import jsSha256 from "crypto-js/sha256";
import jsSha512 from "crypto-js/sha512";
import {
  keccak256 as jsKeccak256,
  sha3_256 as jsSha3_256,
} from "js-sha3";

import { THash } from "../core/hash.types";

import BufferLike, { TBufferLikeInput } from "./buffer";

/**
 * Hash module implementation for browser.
 */
const hash: THash<BufferLike> = {
  /**
   * This function is going to hash a message using
   * sha3 256 bits (= 32 bytes) keccak algorithm.
   *
   * @param msg -
   * @param secret -
   */
  hmac256(
    msg: TBufferLikeInput,
    secret: TBufferLikeInput,
  ) {
    return BufferLike.from(
      jsHmac256(
        BufferLike.cast(msg).toWordArray(),
        BufferLike.cast(secret).toWordArray(),
      ),
    );
  },

  /**
   * This function is going to hash a message using
   * sha3 256 bits (= 32 bytes) keccak algorithm.
   *
   * @param msg -
   */
  keccak256(
    msg: TBufferLikeInput,
  ) {
    return BufferLike.from(
      jsKeccak256(BufferLike.cast(msg).toBuffer()),
    );
  },

  /**
   * This function is going to hash a message using
   * md5 hash algorithm
   *
   * @param msg -
   * @param secret -
   */
  md5(
    msg: TBufferLikeInput,
  ) {
    return BufferLike.from(
      jsMd5(BufferLike.from(msg).toWordArray()),
    );
  },

  /**
   * This function hash the provided message using the
   * sha2 algo with 256 bits (= 32 bytes) of size.
   *
   * @param msg -
   */
  sha256(
    msg: TBufferLikeInput,
  ) {
    return BufferLike.from(
      jsSha256(BufferLike.cast(msg).toWordArray()),
    );
  },

  /**
   * This function hash the provided message using the
   * sha3 algo with 256 bits (= 32 bytes) of size.
   *
   * @param msg -
   */
  sha3_256( // eslint-disable-line @typescript-eslint/naming-convention
    msg: TBufferLikeInput,
  ) {
    return BufferLike.from(
      jsSha3_256(BufferLike.cast(msg).toBuffer()),
    );
  },

  /**
   * This function hash the provided message using the
   * sha2 algo with 512 bits (= 64 bytes) of size.
   *
   * @param msg -
   */
  sha512(
    msg: TBufferLikeInput,
  ) {
    return BufferLike.from(
      jsSha512(BufferLike.cast(msg).toWordArray()),
    );
  },
};

export default hash;
