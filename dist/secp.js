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
exports.signVerify = exports.signData = exports.signHash = exports.sharedSecret = exports.genKeyPair = void 0;
const secp = __importStar(require("@noble/secp256k1"));
const buffer_1 = __importDefault(require("./buffer"));
const hash_1 = require("./hash");
/**
 * Generate random keypair.
 */
function genKeyPair() {
    const pvtKey = secp.utils.randomPrivateKey();
    const pubKey = secp.getPublicKey(pvtKey, true);
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
    const secret = secp.getSharedSecret(buffer_1.default.cast(pvtKey).toBuffer(), buffer_1.default.cast(otherPubKey).toBuffer(), true);
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
    const dataHash = signHash(data);
    const signature = await secp.sign(dataHash.toBuffer(), buffer_1.default.cast(pvtKey).toBuffer());
    return buffer_1.default.from(signature);
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
    return Promise.resolve(secp.verify(buffer_1.default.cast(signature).toBuffer(), signHash(data).toBuffer(), buffer_1.default.cast(pubKey).toBuffer()));
}
exports.signVerify = signVerify;
//# sourceMappingURL=secp.js.map