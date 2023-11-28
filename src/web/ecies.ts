import _ from "lodash";

import * as aes from "./aes";
import BufferLike, { TBufferLikeInput } from "./buffer";
import * as hash from "./hash";
import * as secp from "./secp";

//#####################################################
// Types
//#####################################################
interface ICipherParams {
  ciphertext: BufferLike;
  ephPubKey: BufferLike;
  iv: BufferLike;
  mac: BufferLike;
  salt: BufferLike;
}

//#####################################################
// Auxiliary Functions
//#####################################################
/**
 * Check if we have constant time difference between two macs.
 *
 * @param bytes1 -
 * @param bytes2 -
 */
function equalConstTime(
  bytes1: Uint8Array,
  bytes2: Uint8Array,
) {
  if (bytes1.length !== bytes2.length) {
    return false;
  }

  let res = 0;

  for (let i = 0; i < bytes1.length; i++) {
    // eslint-disable-next-line no-bitwise
    res |= bytes1[i] ^ bytes2[i];
  }

  return res === 0;
}

//#####################################################
// Main Functions
//#####################################################
/**
 * This function encrypt a message using AES ECIES.
 *
 * @param msg - The stringified message.
 * @param pubKey - Decryptor public key.
 */
export function encrypt(
  msg: TBufferLikeInput,
  pubKey: TBufferLikeInput,
) {
  /**
   * Compute the shared secret using ECDH.
   */
  const eph = secp.genKeyPair();
  const secret = secp.sharedSecret(eph.pvtkey, pubKey);

  /**
   * Encrypt with AES.
   */
  const encrypted = aes.encrypt(msg, secret);

  /**
   * Calculate a mac key to prevent tempering.
   */
  const macKey = hash.sha256(secret);
  const dataToMac = BufferLike.concat([
    encrypted.iv,
    eph.pubkey,
    encrypted.salt,
    encrypted.ciphertext,
  ]);
  const mac = hash.hmac256(dataToMac, macKey);

  /**
   * Add the ephemeral pub key as part of encrypted message
   * so we can decrypt it. So the first 33 bytes of the
   * encrypted message is going to be ephemeral public key.
   */
  return {
    ...encrypted,
    ephPubKey: eph.pubkey,
    mac,

    /**
     * This function is going to convert to hex version
     * of this encrypted data.
     */
    toHex() {
      /* eslint-disable line-comment-position, no-inline-comments */
      return BufferLike.concat([
        this.iv, // 16 bytes
        this.ephPubKey, // 33 bytes
        this.mac, // 32 bytes
        this.salt, // 8 bytes
        this.ciphertext, // Var bytes
      ]).toHex();
      /* eslint-enable line-comment-position, no-inline-comments */
    },
  };
}

/**
 * This function encrypt a message using AES ECIES.
 *
 * @param msg - The stringified message.
 * @param pvtKey - Decryptor private key.
 */
export function decrypt(
  msg: string | ICipherParams,
  pvtKey: TBufferLikeInput,
) {
  let params: ICipherParams;

  if (_.isString(msg)) {
    const msgBuff = BufferLike.from(msg);

    if (msgBuff.size < 90) {
      throw new Error("incorrect message length");
    }

    /* eslint-disable sort-keys */
    params = {
      iv: msgBuff.slice(0, 16),
      ephPubKey: msgBuff.slice(16, 49),
      mac: msgBuff.slice(49, 81),
      salt: msgBuff.slice(81, 89),
      ciphertext: msgBuff.slice(89),
    };
    /* eslint-enable sort-keys */
  } else {
    params = msg;
  }

  /**
   * Compute the shared secret using ECDH.
   */
  const secret = secp.sharedSecret(
    pvtKey,
    params.ephPubKey,
  );

  // Validate the mac
  const macKey = hash.sha256(secret);
  const dataToMac = BufferLike.concat([
    params.iv,
    params.ephPubKey,
    params.salt,
    params.ciphertext,
  ]);
  const mac = hash.hmac256(dataToMac, macKey);

  if (!equalConstTime(mac.toBuffer(), params.mac.toBuffer())) {
    throw new Error("Bad Mac");
  }

  return aes.decrypt(params, secret);
}
