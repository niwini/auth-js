import { TBufferLike, TBufferLikeInput } from "./buffer.types";

/**
 * This is an interface for the hash util.
 */
export interface THash<
  IBufferLike extends TBufferLike = TBufferLike
> {

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
  ): IBufferLike;

  /**
   * This function is going to hash a message using
   * md5 hash algorithm
   *
   * @param msg -
   * @param secret -
   */
  md5(
    msg: TBufferLikeInput,
  ): IBufferLike;

  /**
   * This function hash the provided message using the
   * sha3 algo with 256 bits (= 32 bytes) of size.
   *
   * @param msg -
   */
  sha3_256(
    msg: TBufferLikeInput,
  ): IBufferLike;

  /**
   * This function hash the provided message using the
   * sha2 algo with 256 bits (= 32 bytes) of size.
   *
   * @param msg -
   */
  sha256(
    msg: TBufferLikeInput,
  ): IBufferLike;

  /**
   * This function hash the provided message using the
   * sha2 algo with 512 bits (= 64 bytes) of size.
   *
   * @param msg -
   */
  sha512(
    msg: TBufferLikeInput,
  ): IBufferLike;

  /**
   * This function is going to hash a message using
   * sha3 256 bits (= 32 bytes) keccak algorithm.
   *
   * @param msg -
   */
  keccak256(
    msg: TBufferLikeInput,
  ): IBufferLike;
}


