import * as secp from "@noble/secp256k1";

import BufferLike, { IBufferLikeInput } from "./buffer";
import { keccak256 } from "./hash";

/**
 * Generate random keypair.
 */
export function genKeyPair() {
  const pvtKey = secp.utils.randomPrivateKey();
  const pubKey = secp.getPublicKey(pvtKey, true);

  return {
    pubKey: BufferLike.from(pubKey),
    pvtKey: BufferLike.from(pvtKey),
  };
}

/**
 * Compute an ECDH shared secret.
 *
 * @param pvtKey - The private key.
 * @param otherPubKey - A public key not associated with the pvt key.
 */
export function sharedSecret(
  pvtKey: IBufferLikeInput,
  otherPubKey: IBufferLikeInput,
) {
  const secret = secp.getSharedSecret(
    BufferLike.cast(pvtKey).toBuffer(),
    BufferLike.cast(otherPubKey).toBuffer(),
    true,
  );

  return BufferLike.from(secret);
}

/**
 * This function create a hashed version of a string message
 * so we can sign it.
 *
 * @param msg - The stringified message to hash.
 */
export function signHash(
  msg: IBufferLikeInput,
) {
  const msgBuff = BufferLike.cast(msg);
  const prefix = BufferLike.from(
    `\u0019Ethereum Signed Message:\n${msgBuff.size}`,
  );

  return keccak256(BufferLike.concat([
    prefix,
    msgBuff,
  ]));
}

/**
 * This function is going to sign a piece of data
 * using a provided private key.
 *
 * @param data - Data to be signed.
 * @param pvtKey - The private key to be used in sign.
 */
export async function signData(
  data: IBufferLikeInput,
  pvtKey: IBufferLikeInput,
) {
  const dataHash = signHash(data);

  const signature = await secp.sign(
    dataHash.toBuffer(),
    BufferLike.cast(pvtKey).toBuffer(),
  );

  return BufferLike.from(signature);
}

/**
 * This function is going to verify a secp256k1 signature
 * against the provided piece of data.
 *
 * @param signature - The signature to be verified.
 * @param data - Piece of data to verify against.
 * @param pubKey - The signer public key to use in check.
 */
export async function signVerify(
  signature: IBufferLikeInput,
  data: IBufferLikeInput,
  pubKey: IBufferLikeInput,
) {
  return Promise.resolve(secp.verify(
    BufferLike.cast(signature).toBuffer(),
    signHash(data).toBuffer(),
    BufferLike.cast(pubKey).toBuffer(),
  ));
}
