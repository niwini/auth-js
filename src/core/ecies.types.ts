import { TBufferLike, TBufferLikeInput } from "./buffer.types";

export interface TCipherParams<
  IBufferLike extends TBufferLike = TBufferLike
> {
  ciphertext: IBufferLike;
  ephPubKey: IBufferLike;
  iv: IBufferLike;
  mac: IBufferLike;
  salt: IBufferLike;
}

/**
 * This is an interface for the AES util.
 */
export interface TECIES<
  IBufferLike extends TBufferLike = TBufferLike
> {

  /**
   * This function encrypts a message using AES ECIES.
   *
   * @param msg - The stringified message.
   * @param pubKey - Decoder public key.
   */
  encrypt(
    msg: TBufferLikeInput,
    pubKey: TBufferLikeInput,
  ): TCipherParams<IBufferLike> & { toHex(): string };

  /**
   * This function decrypts a message using AES ECIES.
   *
   * @param msg - The stringified message.
   * @param pvtKey - Decryptor private key.
   */
  decrypt<TData = string>(
    msg: string | TCipherParams<IBufferLike>,
    pvtKey: TBufferLikeInput,
  ): TData | string;
}
