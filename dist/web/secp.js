"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signVerify = exports.signData = exports.signHash = exports.sharedSecret = exports.genKeyPair = exports.assertValidPvtKey = exports.ec = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const elliptic_1 = require("elliptic");
const buffer_1 = __importDefault(require("./buffer"));
const hash_1 = require("./hash");
exports.ec = new elliptic_1.ec("secp256k1");
/**
 * This function checks if provided key is a valid private key.
 *
 * @param key - Key to check.
 */
function assertValidPvtKey(key) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (key.length !== 32) {
        throw new Error("Private keys should be 32 bytes length");
    }
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const kNum = new bn_js_1.default(Buffer.from(key).toString("hex"), 16);
    if (kNum.lt(new bn_js_1.default(0))) {
        throw new Error("Private keys should be greater than 0");
    }
    if (exports.ec.n && kNum.gt(exports.ec.n)) {
        throw new Error("Private keys should be in eliptic curve range");
    }
}
exports.assertValidPvtKey = assertValidPvtKey;
/**
 * Generate random keypair.
 */
function genKeyPair() {
    const pair = exports.ec.genKeyPair();
    const pvtKey = pair.getPrivate().toBuffer();
    const pubKey = Buffer.from(pair.getPublic().encode("hex", true), "hex");
    return {
        pubKey: buffer_1.default.from(pubKey),
        pvtKey: buffer_1.default.from(pvtKey),
    };
}
exports.genKeyPair = genKeyPair;
/**
 * Compute an ECDH shared secret.
 *
 * @param pvtKey - The private key.
 * @param otherPubKey - A public key not associated with the pvt key.
 */
function sharedSecret(pvtKey, otherPubKey) {
    const eph = exports.ec.keyFromPrivate(buffer_1.default.cast(pvtKey).toBuffer());
    // Derive the secret
    const secret = eph.derive(exports.ec.keyFromPublic(buffer_1.default.cast(otherPubKey).toBuffer()).getPublic());
    return buffer_1.default.from(secret);
}
exports.sharedSecret = sharedSecret;
/**
 * This function create a hashed version of a string message
 * so we can sign it.
 *
 * @param msg - The stringified message to hash.
 */
function signHash(msg) {
    const msgBuff = buffer_1.default.cast(msg);
    const prefix = buffer_1.default.from(`\u0019Ethereum Signed Message:\n${msgBuff.size}`);
    return (0, hash_1.keccak256)(buffer_1.default.concat([
        prefix,
        msgBuff,
    ]));
}
exports.signHash = signHash;
/**
 * This function is going to sign a piece of data
 * using a provided private key.
 *
 * @param data - Data to be signed.
 * @param pvtKey - The private key to be used in sign.
 */
async function signData(data, pvtKey) {
    const pvtKeyBuff = buffer_1.default.cast(pvtKey).toBuffer();
    assertValidPvtKey(pvtKeyBuff);
    const dataHash = signHash(data);
    const keypair = exports.ec.keyFromPrivate(pvtKeyBuff);
    const sgn = keypair.sign(dataHash.toBuffer(), { canonical: true });
    return buffer_1.default.from(sgn.toDER());
}
exports.signData = signData;
/**
 * This function is going to verify a secp256k1 signature
 * against the provided piece of data.
 *
 * @param signature - The signature to be verified.
 * @param data - Piece of data to verify against.
 * @param pubKey - The signer public key to use in check.
 */
async function signVerify(signature, data, pubKey) {
    const dataHash = signHash(data);
    const key = exports.ec.keyFromPublic(buffer_1.default.cast(pubKey).toBuffer());
    let isValid = false;
    try {
        isValid = key.verify(dataHash.toBuffer(), buffer_1.default.cast(signature).toBuffer());
    }
    catch (error) {
        isValid = false;
    }
    return Promise.resolve(isValid);
}
exports.signVerify = signVerify;
//# sourceMappingURL=secp.js.map