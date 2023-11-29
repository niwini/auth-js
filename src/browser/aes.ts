/* eslint-disable new-cap */
import { algo } from "crypto-js";
import AES from "crypto-js/aes";
import ENC_HEX from "crypto-js/enc-hex";
import ENC_UTF8 from "crypto-js/enc-utf8";
import FORMAT_HEX from "crypto-js/format-hex";
import WordArray from "crypto-js/lib-typedarrays";
import PBKDF2 from "crypto-js/pbkdf2";
import _ from "lodash";

import { TAES, TCipherParams } from "../core/aes.types";

import BufferLike, { TBufferLikeInput } from "./buffer";

/**
 * AES module implementation for Browser.
 */
const aes: TAES<BufferLike> = {
  /**
   * This function encrypt a message using AES.
   *
   * @param msg - The stringified message.
   * @param secret - The encryption secret.
   */
  decrypt<TData = string>(
    msg: string | TCipherParams<BufferLike>,
    secret: TBufferLikeInput,
  ) {
    let params: TCipherParams<BufferLike>;

    if (typeof msg === "string") {
      const msgBuff = BufferLike.cast(msg);

      params = {
        ciphertext: msgBuff.slice(24),
        iv: msgBuff.slice(0, 16),
        salt: msgBuff.slice(16, 24),
      };
    } else {
      params = msg;
    }

    // eslint-disable-next-line no-sync
    const key = PBKDF2(
      BufferLike.cast(secret).toWordArray(),
      params.salt.toWordArray(),
      {
        hasher: algo.SHA512,
        iterations: 5000,
        keySize: 24 / 4,
      },
    );

    const decrypted = AES.decrypt(
      params.ciphertext.toHex({ raw: true }),
      key,
      {
        format: FORMAT_HEX,
        iv: params.iv.toWordArray(),
      },
    ).toString(ENC_UTF8);

    try {
      return JSON.parse(decrypted) as TData;
    } catch (error) {
      // Do nothing;
    }

    return decrypted;
  },

  /**
   * This function encrypt a message using AES.
   *
   * @param msg - The stringified message.
   * @param secret - The encryption secret.
   */
  encrypt(
    msg: TBufferLikeInput,
    secret: TBufferLikeInput,
  ) {
    const iv = WordArray.random(16);
    const salt = WordArray.random(8);
    const key = PBKDF2(
      BufferLike.cast(secret).toWordArray(),
      salt,
      {
        hasher: algo.SHA512,
        iterations: 5000,
        keySize: 24 / 4,
      },
    );

    const ciphertext = `0x${AES.encrypt(
      BufferLike.cast(msg).toWordArray(),
      key,
      { iv },
    ).ciphertext.toString(ENC_HEX)}`;

    return {
      ciphertext: BufferLike.from(ciphertext),
      iv: BufferLike.from(iv),
      salt: BufferLike.from(salt),

      /**
       * This function is going to generate the encrypted
       * string in hex format.
       */
      toHex() {
        /* eslint-disable line-comment-position, no-inline-comments */
        return BufferLike.concat([
          this.iv, // 16 bytes
          this.salt, // 8 bytes
          this.ciphertext, // Var bytes
        ]).toHex();
        /* eslint-enable line-comment-position, no-inline-comments */
      },
    };
  },
};

export default aes;
