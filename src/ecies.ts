import _ from "lodash";

import aes from "./aes";
import BufferLike, { TBufferLikeInput } from "./buffer";
import { TCipherParams, TECIES } from "./core/ecies.types";
import { equalConstTime } from "./core/time";
import hash from "./hash";
import secp from "./secp";

/**
 * This class implements the ECIES module for NodeJS.
 */
const ecies: TECIES = {
  /**
   * This function encrypt a message using AES ECIES.
   *
   * @param msg - The stringified message.
   * @param pvtKey - Decryptor private key.
   */
  decrypt<TData = string>(
    msg: string | TCipherParams,
    pvtKey: TBufferLikeInput,
  ) {
    let params: TCipherParams;

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

    return aes.decrypt<TData>(params, secret);
  },

  /**
   * This function encrypt a message using AES ECIES.
   *
   * @param msg - The stringified message.
   * @param pubKey - Decoder public key.
   */
  encrypt(
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
  },
};

export default ecies;