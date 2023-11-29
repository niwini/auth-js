"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable new-cap */
const crypto_js_1 = require("crypto-js");
const aes_1 = __importDefault(require("crypto-js/aes"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const format_hex_1 = __importDefault(require("crypto-js/format-hex"));
const lib_typedarrays_1 = __importDefault(require("crypto-js/lib-typedarrays"));
const pbkdf2_1 = __importDefault(require("crypto-js/pbkdf2"));
const buffer_1 = __importDefault(require("./buffer"));
/**
 * AES module implementation for Browser.
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
        if (typeof msg === "string") {
            const msgBuff = buffer_1.default.cast(msg);
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
        const key = (0, pbkdf2_1.default)(buffer_1.default.cast(secret).toWordArray(), params.salt.toWordArray(), {
            hasher: crypto_js_1.algo.SHA512,
            iterations: 5000,
            keySize: 24 / 4,
        });
        const decrypted = aes_1.default.decrypt(params.ciphertext.toHex({ raw: true }), key, {
            format: format_hex_1.default,
            iv: params.iv.toWordArray(),
        }).toString(enc_utf8_1.default);
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
     * @param msg - The stringified message.
     * @param secret - The encryption secret.
     */
    encrypt(msg, secret) {
        const iv = lib_typedarrays_1.default.random(16);
        const salt = lib_typedarrays_1.default.random(8);
        const key = (0, pbkdf2_1.default)(buffer_1.default.cast(secret).toWordArray(), salt, {
            hasher: crypto_js_1.algo.SHA512,
            iterations: 5000,
            keySize: 24 / 4,
        });
        const ciphertext = `0x${aes_1.default.encrypt(buffer_1.default.cast(msg).toWordArray(), key, { iv }).ciphertext.toString(enc_hex_1.default)}`;
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