"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ec = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const elliptic_1 = require("elliptic");
const buffer_1 = __importDefault(require("./buffer"));
exports.ec = new elliptic_1.ec("secp256k1");
/**
 * Secpt module implementation for browser.
 */
const secp = {
    /**
     * Generate random keypair.
     *
     * @param args -
     * @param args.pvtkey -
     */
    genKeyPair(args = {}) {
        const pair = args.pvtkey
            ? exports.ec.keyFromPrivate(buffer_1.default.from(args.pvtkey).toBuffer())
            : exports.ec.genKeyPair();
        const pvtkey = pair.getPrivate().toBuffer();
        const pubkey = Buffer.from(pair.getPublic().encode("hex", true), "hex");
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
        const key = buffer_1.default.cast(pvtkey).toBuffer();
        let error = null;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (key.length === 32) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const kNum = new bn_js_1.default(Buffer.from(key).toString("hex"), 16);
            if (kNum.lt(new bn_js_1.default(0))) {
                error = new Error("Private keys should be greater than 0");
            }
            else if (exports.ec.n && kNum.gt(exports.ec.n)) {
                error = new Error("Private keys should be in eliptic curve range");
            }
        }
        else {
            error = new Error("Private keys should be 32 bytes length");
        }
        if (error) {
            return [false, error];
        }
        return [true, null];
    },
    /**
     * Compute an ECDH shared secret.
     *
     * @param pvtKey - The private key.
     * @param otherPubKey - A public key not associated with the pvt key.
     */
    sharedSecret(pvtKey, otherPubKey) {
        const eph = exports.ec.keyFromPrivate(buffer_1.default.cast(pvtKey).toBuffer());
        // Derive the secret
        const secret = eph.derive(exports.ec.keyFromPublic(buffer_1.default.cast(otherPubKey).toBuffer()).getPublic());
        return buffer_1.default.from(secret);
    },
    /**
     * This function is going to sign a piece of data
     * using a provided private key.
     *
     * @param payload - Data to be signed.
     * @param pvtKey - The private key to be used in sign.
     */
    async sign(payload, pvtKey) {
        const pvtKeyBuff = buffer_1.default.cast(pvtKey).toBuffer();
        const [, error] = this.isValidPvtKey(pvtKeyBuff);
        if (error) {
            throw error;
        }
        const keypair = exports.ec.keyFromPrivate(pvtKeyBuff);
        const sgn = keypair.sign(buffer_1.default.from(payload).toBuffer(), { canonical: true });
        return Promise.resolve(buffer_1.default.from(sgn.toDER()));
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
        const key = exports.ec.keyFromPublic(buffer_1.default.cast(pubKey).toBuffer());
        let isValid = false;
        try {
            isValid = key.verify(buffer_1.default.from(payload).toBuffer(), buffer_1.default.cast(signature).toBuffer());
        }
        catch (error) {
            isValid = false;
        }
        return Promise.resolve(isValid);
    },
};
exports.default = secp;
//# sourceMappingURL=secp.js.map