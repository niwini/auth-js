"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const lodash_1 = __importDefault(require("lodash"));
const aes = __importStar(require("./aes"));
const buffer_1 = __importDefault(require("./buffer"));
const hash = __importStar(require("./hash"));
const secp = __importStar(require("./secp"));
//#####################################################
// Auxiliary Functions
//#####################################################
/**
 * Check if we have constant time difference between two macs.
 *
 * @param bytes1 -
 * @param bytes2 -
 */
function equalConstTime(bytes1, bytes2) {
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
// Functions
//#####################################################
/**
 * This function encrypt a message using AES ECIES.
 *
 * @param msg - The stringified message.
 * @param pubKey - Decoder public key.
 */
function encrypt(msg, pubKey) {
    /**
     * Compute the shared secret using ECDH.
     */
    const eph = secp.genKeyPair();
    const secret = secp.sharedSecret(eph.pvtKey, pubKey);
    /**
     * Encrypt with AES.
     */
    const encrypted = aes.encrypt(msg, secret);
    /**
     * Calculate a mac key to prevent tempering.
     */
    const macKey = hash.sha256(secret);
    const dataToMac = buffer_1.default.concat([
        encrypted.iv,
        eph.pubKey,
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
        ephPubKey: eph.pubKey,
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
}
exports.encrypt = encrypt;
/**
 * This function encrypt a message using AES ECIES.
 *
 * @param msg - The stringified message.
 * @param pvtKey - Decryptor private key.
 */
function decrypt(msg, pvtKey) {
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
    const secret = secp.sharedSecret(pvtKey, params.ephPubKey);
    // Validate the mac
    const macKey = hash.sha256(secret);
    const dataToMac = buffer_1.default.concat([
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
exports.decrypt = decrypt;
//# sourceMappingURL=ecies.js.map