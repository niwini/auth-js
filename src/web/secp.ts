import BN from "bn.js";
import { ec as EC } from "elliptic";

import BufferLike, { IBufferLikeInput } from "./buffer";
import { keccak256 } from "./hash";

export const ec = new EC("secp256k1");

/**
 * This function checks if provided key is a valid private key.
 *
 * @param key - Key to check.
 */
export function assertValidPvtKey(key: Uint8Array) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (key.length !== 32) {
    throw new Error("Private keys should be 32 bytes length");
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const kNum = new BN(Buffer.from(key).toString("hex"), 16);

  if (kNum.lt(new BN(0))) {
    throw new Error("Private keys should be greater than 0");
  }

  if (ec.n && kNum.gt(ec.n)) {
    throw new Error("Private keys should be in eliptic curve range");
  }
}

/**
 * Generate random keypair.
 */
export function genKeyPair() {
  const pair = ec.genKeyPair();

  const pvtKey = pair.getPrivate().toBuffer();
  const pubKey = Buffer.from(
    pair.getPublic().encode("hex", true),
    "hex",
  );

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
  const eph = ec.keyFromPrivate(
    BufferLike.cast(pvtKey).toBuffer(),
  );

  // Derive the secret
  const secret = eph.derive(
    ec.keyFromPublic(
      BufferLike.cast(otherPubKey).toBuffer(),
    ).getPublic(),
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
  const pvtKeyBuff = BufferLike.cast(pvtKey).toBuffer();

  assertValidPvtKey(pvtKeyBuff);

  const dataHash = signHash(data);

  const keypair = ec.keyFromPrivate(pvtKeyBuff);
  const sgn = keypair.sign(
    dataHash.toBuffer(),
    { canonical: true },
  );

  return BufferLike.from(sgn.toDER());
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
  const dataHash = signHash(data);
  const key = ec.keyFromPublic(
    BufferLike.cast(pubKey).toBuffer(),
  );

  let isValid = false;

  try {
    isValid = key.verify(
      dataHash.toBuffer(),
      BufferLike.cast(signature).toBuffer(),
    );
  } catch (error) {
    isValid = false;
  }

  return Promise.resolve(isValid);
}
