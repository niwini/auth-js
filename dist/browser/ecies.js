"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const time_1 = require("../core/time");
const aes_1 = __importDefault(require("./aes"));
const buffer_1 = __importDefault(require("./buffer"));
const hash_1 = __importDefault(require("./hash"));
const secp_1 = __importDefault(require("./secp"));
/**
 * ECIES module implementation for Browser.
 */
const ecies = {
    /**
     * This function encrypt a message using AES ECIES.
     *
     * @param msg - The stringified message.
     * @param pvtKey - Decryptor private key.
     */
    decrypt(msg, pvtKey) {
        let params;
        if (lodash_1.default.isString(msg)) {
            const msgBuff = buffer_1.default.from(msg);
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
        }
        else {
            params = msg;
        }
        /**
         * Compute the shared secret using ECDH.
         */
        const secret = secp_1.default.sharedSecret(pvtKey, params.ephPubKey);
        // Validate the mac
        const macKey = hash_1.default.sha256(secret);
        const dataToMac = buffer_1.default.concat([
            params.iv,
            params.ephPubKey,
            params.salt,
            params.ciphertext,
        ]);
        const mac = hash_1.default.hmac256(dataToMac, macKey);
        if (!(0, time_1.equalConstTime)(mac.toBuffer(), params.mac.toBuffer())) {
            throw new Error("Bad Mac");
        }
        return aes_1.default.decrypt(params, secret);
    },
    /**
     * This function encrypt a message using AES ECIES.
     *
     * @param msg - The stringified message.
     * @param pubKey - Decryptor public key.
     */
    encrypt(msg, pubKey) {
        /**
         * Compute the shared secret using ECDH.
         */
        const eph = secp_1.default.genKeyPair();
        const secret = secp_1.default.sharedSecret(eph.pvtkey, pubKey);
        /**
         * Encrypt with AES.
         */
        const encrypted = aes_1.default.encrypt(msg, secret);
        /**
         * Calculate a mac key to prevent tempering.
         */
        const macKey = hash_1.default.sha256(secret);
        const dataToMac = buffer_1.default.concat([
            encrypted.iv,
            eph.pubkey,
            encrypted.salt,
            encrypted.ciphertext,
        ]);
        const mac = hash_1.default.hmac256(dataToMac, macKey);
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
                return buffer_1.default.concat([
                    this.iv,
                    this.ephPubKey,
                    this.mac,
                    this.salt,
                    this.ciphertext, // Var bytes
                ]).toHex();
                /* eslint-enable line-comment-position, no-inline-comments */
            },
        };
    },
};
exports.default = ecies;
//# sourceMappingURL=ecies.js.map