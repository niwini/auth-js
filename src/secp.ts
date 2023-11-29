import {
  getPublicKey,
  getSharedSecret,
  sign,
  utils,
  verify,
} from "@noble/secp256k1";

import BufferLike, { TBufferLikeInput } from "./buffer";
import { TSECP } from "./core/secp.types";

/**
 * This is the main class implementing the SECP module for Nodejs.
 */
const secp: TSECP = {
  /**
   * Generate random keypair.
   *
   * @param args -
   * @param args.pvtkey -
   */
  genKeyPair(
    args: {
      pvtkey?: TBufferLikeInput;
    } = {},
  ) {
    const pvtkey = args.pvtkey
      ? BufferLike.from(args.pvtkey).toBuffer()
      : utils.randomPrivateKey();

    const pubkey = getPublicKey(pvtkey, true);

    return {
      pubkey: BufferLike.from(pubkey),
      pvtkey: BufferLike.from(pvtkey),
    };
  },

  /**
   * Verify if public key is valid.
   *
   * @param _pubkey - The public key to be validated.
   */
  isValidPubKey(_pubkey: TBufferLikeInput) {
    // We must implememt a check here since @noble/secp256k1 does not
    // seems to provide one.
    return [true, null];
  },

  /**
   * Verify the private key.
   *
   * @param pvtkey - The private key to be validated.
   */
  isValidPvtKey(pvtkey: TBufferLikeInput) {
    return [
      utils.isValidPrivateKey(BufferLike.from(pvtkey).toBuffer()),
      null,
    ];
  },

  /**
   * Compute an ECDH shared secret.
   *
   * @param pvtKey - The private key.
   * @param otherPubKey - A public key not associated with the pvt key.
   */
  sharedSecret(
    pvtKey: TBufferLikeInput,
    otherPubKey: TBufferLikeInput,
  ) {
    const secret = getSharedSecret(
      BufferLike.cast(pvtKey).toBuffer(),
      BufferLike.cast(otherPubKey).toBuffer(),
      true,
    );

    return BufferLike.from(secret);
  },

  /**
   * This function is going to sign a piece of data
   * using a provided private key.
   *
   * @param payload - Payload to be signed.
   * @param pvtKey - The private key to be used in sign.
   */
  async sign(
    payload: TBufferLikeInput,
    pvtKey: TBufferLikeInput,
  ) {
    const signature = await sign(
      BufferLike.cast(payload).toBuffer(),
      BufferLike.cast(pvtKey).toBuffer(),
    );

    return BufferLike.from(signature);
  },

  /**
   * This function is going to verify a secp256k1 signature
   * against the provided piece of data.
   *
   * @param signature - The signature to be verified.
   * @param payload - Piece of data to verify against.
   * @param pubKey - The signer public key to use in check.
   */
  async signVerify(
    signature: TBufferLikeInput,
    payload: TBufferLikeInput,
    pubKey: TBufferLikeInput,
  ) {
    return Promise.resolve(verify(
      BufferLike.cast(signature).toBuffer(),
      BufferLike.cast(payload).toBuffer(),
      BufferLike.cast(pubKey).toBuffer(),
    ));
  },
};

export default secp;
