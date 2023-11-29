"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const lodash_1 = __importDefault(require("lodash"));
const buffer_1 = __importDefault(require("./buffer"));
/**
 * AES module implementation for NodeJS.
 */
const aes = {
    /**
     * This function encrypt a message using AES.
     *
     * @param msg - The stringified message.
     * @param secret - The encryption secret.
     */
    decrypt(msg, secret) {
        let params;
        if (lodash_1.default.isString(msg)) {
            const msgBuff = buffer_1.default.cast(msg);
            if (msgBuff.size <= 24) {
                throw new Error("invalid buffer size");
            }
            params = {
                ciphertext: msgBuff.slice(24),
                iv: msgBuff.slice(0, 16),
                salt: msgBuff.slice(16, 24),
            };
        }
        else {
            params = msg;
        }
        // eslint-disable-next-line no-sync
        const key = crypto_1.default.pbkdf2Sync(buffer_1.default.cast(secret).toBuffer(), params.salt.toBuffer(), 5000, 24, "sha512");
        const decipher = crypto_1.default.createDecipheriv("aes-192-cbc", key, params.iv.toBuffer());
        const decrypted = Buffer.concat([
            decipher.update(params.ciphertext.toBuffer()),
            decipher.final(),
        ]).toString("utf8");
        try {
            return JSON.parse(decrypted);
        }
        catch (error) {
            // Do nothing;
        }
        return decrypted;
    },
    /**
     * This function encrypt a message using AES.
     *
     * @param msg - Message to encrypt.
     * @param secret - The encryption secret.
     */
    encrypt(msg, secret) {
        // eslint-disable-next-line no-sync
        const iv = crypto_1.default.randomBytes(16);
        const salt = crypto_1.default.randomBytes(8);
        // eslint-disable-next-line no-sync
        const key = crypto_1.default.pbkdf2Sync(buffer_1.default.cast(secret).toBuffer(), salt, 5000, 24, "sha512");
        const cipher = crypto_1.default.createCipheriv("aes-192-cbc", key, iv);
        const ciphertext = Buffer.concat([
            cipher.update(buffer_1.default.cast(msg).toBuffer()),
            cipher.final(),
        ]);
        return {
            ciphertext: buffer_1.default.from(ciphertext),
            iv: buffer_1.default.from(iv),
            salt: buffer_1.default.from(salt),
            /**
             * This function is going to generate the encrypted
             * string in hex format.
             */
            toHex() {
                /* eslint-disable line-comment-position, no-inline-comments */
                return buffer_1.default.concat([
                    this.iv,
                    this.salt,
                    this.ciphertext, // Var bytes
                ]).toHex();
                /* eslint-enable line-comment-position, no-inline-comments */
            },
        };
    },
};
exports.default = aes;
//# sourceMappingURL=aes.js.map