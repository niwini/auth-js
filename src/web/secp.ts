import BN from "bn.js";
import { ec as EC } from "elliptic";

import BufferLike, { TBufferLikeInput } from "./buffer";

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
 * Verify the private key.
 *
 * @param pvtkey - The private key to be validated.
 */
export function isValidPvtKey(pvtkey: TBufferLikeInput) {
  try {
    assertValidPvtKey(BufferLike.cast(pvtkey).toBuffer());

    return true;
  } catch (error) {
    // Do nothing.
  }

  return false;
}

/**
 * Generate random keypair.
 *
 * @param args -
 * @param args.pvtkey -
 */
export function genKeyPair(
  args: {
    pvtkey?: TBufferLikeInput;
  } = {},
) {
  const pair = args.pvtkey
    ? ec.keyFromPrivate(BufferLike.from(args.pvtkey).toBuffer())
    : ec.genKeyPair();

  const pvtkey = pair.getPrivate().toBuffer();
  const pubkey = Buffer.from(
    pair.getPublic().encode("hex", true),
    "hex",
  );

  return {
    pubkey: BufferLike.from(pubkey),
    pvtkey: BufferLike.from(pvtkey),
  };
}

/**
 * Compute an ECDH shared secret.
 *
 * @param pvtKey - The private key.
 * @param otherPubKey - A public key not associated with the pvt key.
 */
export function sharedSecret(
  pvtKey: TBufferLikeInput,
  otherPubKey: TBufferLikeInput,
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
 * This function is going to sign a piece of data
 * using a provided private key.
 *
 * @param payload - Data to be signed.
 * @param pvtKey - The private key to be used in sign.
 */
export async function sign(
  payload: TBufferLikeInput,
  pvtKey: TBufferLikeInput,
) {
  const pvtKeyBuff = BufferLike.cast(pvtKey).toBuffer();

  assertValidPvtKey(pvtKeyBuff);

  const keypair = ec.keyFromPrivate(pvtKeyBuff);
  const sgn = keypair.sign(
    BufferLike.from(payload).toBuffer(),
    { canonical: true },
  );

  return BufferLike.from(sgn.toDER());
}

/**
 * This function is going to verify a secp256k1 signature
 * against the provided piece of data.
 *
 * @param signature - The signature to be verified.
 * @param payload - Piece of data to verify against.
 * @param pubKey - The signer public key to use in check.
 */
export async function signVerify(
  signature: TBufferLikeInput,
  payload: TBufferLikeInput,
  pubKey: TBufferLikeInput,
) {
  const key = ec.keyFromPublic(
    BufferLike.cast(pubKey).toBuffer(),
  );

  let isValid = false;

  try {
    isValid = key.verify(
      BufferLike.from(payload).toBuffer(),
      BufferLike.cast(signature).toBuffer(),
    );
  } catch (error) {
    isValid = false;
  }

  return Promise.resolve(isValid);
}
