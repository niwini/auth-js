"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = require("@noble/secp256k1");
const buffer_1 = __importDefault(require("./buffer"));
/**
 * This is the main class implementing the SECP module for Nodejs.
 */
const secp = {
    /**
     * Generate random keypair.
     *
     * @param args -
     * @param args.pvtkey -
     */
    genKeyPair(args = {}) {
        const pvtkey = args.pvtkey
            ? buffer_1.default.from(args.pvtkey).toBuffer()
            : secp256k1_1.utils.randomPrivateKey();
        const pubkey = (0, secp256k1_1.getPublicKey)(pvtkey, true);
        return {
            pubkey: buffer_1.default.from(pubkey),
            pvtkey: buffer_1.default.from(pvtkey),
        };
    },
    /**
     * Verify if public key is valid.
     *
     * @param _pubkey - The public key to be validated.
     */
    isValidPubKey(_pubkey) {
        // We must implememt a check here since @noble/secp256k1 does not
        // seems to provide one.
        return [true, null];
    },
    /**
     * Verify the private key.
     *
     * @param pvtkey - The private key to be validated.
     */
    isValidPvtKey(pvtkey) {
        return [
            secp256k1_1.utils.isValidPrivateKey(buffer_1.default.from(pvtkey).toBuffer()),
            null,
        ];
    },
    /**
     * Compute an ECDH shared secret.
     *
     * @param pvtKey - The private key.
     * @param otherPubKey - A public key not associated with the pvt key.
     */
    sharedSecret(pvtKey, otherPubKey) {
        const secret = (0, secp256k1_1.getSharedSecret)(buffer_1.default.cast(pvtKey).toBuffer(), buffer_1.default.cast(otherPubKey).toBuffer(), true);
        return buffer_1.default.from(secret);
    },
    /**
     * This function is going to sign a piece of data
     * using a provided private key.
     *
     * @param payload - Payload to be signed.
     * @param pvtKey - The private key to be used in sign.
     */
    async sign(payload, pvtKey) {
        const signature = await (0, secp256k1_1.sign)(buffer_1.default.cast(payload).toBuffer(), buffer_1.default.cast(pvtKey).toBuffer());
        return buffer_1.default.from(signature);
    },
    /**
     * This function is going to verify a secp256k1 signature
     * against the provided piece of data.
     *
     * @param signature - The signature to be verified.
     * @param payload - Piece of data to verify against.
     * @param pubKey - The signer public key to use in check.
     */
    async signVerify(signature, payload, pubKey) {
        return Promise.resolve((0, secp256k1_1.verify)(buffer_1.default.cast(signature).toBuffer(), buffer_1.default.cast(payload).toBuffer(), buffer_1.default.cast(pubKey).toBuffer()));
    },
};
exports.default = secp;
//# sourceMappingURL=secp.js.map