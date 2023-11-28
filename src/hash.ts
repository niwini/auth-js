/* eslint-disable @typescript-eslint/naming-convention */
import { hmac } from "@noble/hashes/hmac";
import { sha256 as nobleSha256 } from "@noble/hashes/sha256";
import {
  keccak_256,
  sha3_256 as nobleSha3_256,
} from "@noble/hashes/sha3";
import { sha512 as nobleSha512 } from "@noble/hashes/sha512";

import BufferLike, { TBufferLikeInput } from "./buffer";

/**
 * This function is going to hash a message using
 * sha3 256 bits (= 32 bytes) keccak algorithm.
 *
 * @param msg -
 * @param secret -
 */
export function hmac256(
  msg: TBufferLikeInput,
  secret: TBufferLikeInput,
) {
  return BufferLike.from(
    hmac(
      nobleSha256,
      BufferLike.cast(secret).toBuffer(),
      BufferLike.cast(msg).toBuffer(),
    ),
  );
}

/**
 * This function hash the provided message using the
 * sha3 algo with 256 bits (= 32 bytes) of size.
 *
 * @param msg -
 */
export function sha3_256(
  msg: TBufferLikeInput,
) {
  return BufferLike.from(
    nobleSha3_256(BufferLike.cast(msg).toBuffer()),
  );
}

/**
 * This function hash the provided message using the
 * sha2 algo with 256 bits (= 32 bytes) of size.
 *
 * @param msg -
 */
export function sha256(
  msg: TBufferLikeInput,
) {
  return BufferLike.from(
    nobleSha256(BufferLike.cast(msg).toBuffer()),
  );
}

/**
 * This function hash the provided message using the
 * sha2 algo with 512 bits (= 64 bytes) of size.
 *
 * @param msg -
 */
export function sha512(
  msg: TBufferLikeInput,
) {
  return BufferLike.from(
    nobleSha512(BufferLike.cast(msg).toBuffer()),
  );
}

/**
 * This function is going to hash a message using
 * sha3 256 bits (= 32 bytes) keccak algorithm.
 *
 * @param msg -
 */
export function keccak256(
  msg: TBufferLikeInput,
) {
  return BufferLike.from(
    keccak_256(BufferLike.cast(msg).toBuffer()),
  );
}
