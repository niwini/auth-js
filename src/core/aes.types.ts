import { TBufferLike, TBufferLikeInput } from "./buffer.types";

export interface TCipherParams<
  IBufferLike extends TBufferLike = TBufferLike
> {
  ciphertext: IBufferLike;
  iv: IBufferLike;
  salt: IBufferLike;
}

/**
 * This is an interface for the AES util.
 */
export interface TAES<
  IBufferLike extends TBufferLike = TBufferLike
> {

  /**
   * This function encrypt a message using AES.
   *
   * @param msg - Message to encrypt.
   * @param secret - The encryption secret.
   */
  encrypt(
    msg: TBufferLikeInput,
    secret: TBufferLikeInput,
  ): TCipherParams<IBufferLike> & { toHex(): string };

  /**
   * This function encrypt a message using AES.
   *
   * @param msg - The stringified message.
   * @param secret - The encryption secret.
   */
  decrypt<TData = string>(
    msg: string | TCipherParams<IBufferLike>,
    secret: TBufferLikeInput,
  ): TData | string;
}
