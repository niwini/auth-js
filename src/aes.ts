import crypto from "crypto";

import _ from "lodash";

import BufferLike, { TBufferLikeInput } from "./buffer";

//#####################################################
// Types
//#####################################################
interface ICipherParams {
  ciphertext: BufferLike;
  iv: BufferLike;
  salt: BufferLike;
}

//#####################################################
// Functions
//#####################################################
/**
 * This function encrypt a message using AES.
 *
 * @param msg - Message to encrypt.
 * @param secret - The encryption secret.
 */
export function encrypt(
  msg: TBufferLikeInput,
  secret: TBufferLikeInput,
) {
  // eslint-disable-next-line no-sync
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(8);
  // eslint-disable-next-line no-sync
  const key = crypto.pbkdf2Sync(
    BufferLike.cast(secret).toBuffer(),
    salt,
    5000,
    24,
    "sha512",
  );

  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(BufferLike.cast(msg).toBuffer()),
    cipher.final(),
  ]);

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
}

/**
 * This function encrypt a message using AES.
 *
 * @param msg - The stringified message.
 * @param secret - The encryption secret.
 */
export function decrypt<TData = string>(
  msg: string | ICipherParams,
  secret: TBufferLikeInput,
) {
  let params: ICipherParams;

  if (_.isString(msg)) {
    const msgBuff = BufferLike.cast(msg);

    if (msgBuff.size <= 24) {
      throw new Error("invalid buffer size");
    }

    params = {
      ciphertext: msgBuff.slice(24),
      iv: msgBuff.slice(0, 16),
      salt: msgBuff.slice(16, 24),
    };
  } else {
    params = msg;
  }

  // eslint-disable-next-line no-sync
  const key = crypto.pbkdf2Sync(
    BufferLike.cast(secret).toBuffer(),
    params.salt.toBuffer(),
    5000,
    24,
    "sha512",
  );

  const decipher = crypto.createDecipheriv(
    "aes-192-cbc",
    key,
    params.iv.toBuffer(),
  );
  const decrypted = Buffer.concat([
    decipher.update(params.ciphertext.toBuffer()),
    decipher.final(),
  ]).toString("utf8");

  try {
    return JSON.parse(decrypted) as TData;
  } catch (error) {
    // Do nothing;
  }

  return decrypted;
}
