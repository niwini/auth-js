"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const hmac_1 = require("@noble/hashes/hmac");
const sha256_1 = require("@noble/hashes/sha256");
const sha3_1 = require("@noble/hashes/sha3");
const sha512_1 = require("@noble/hashes/sha512");
const buffer_1 = __importDefault(require("./buffer"));
/**
 * This is the main class implementing the hashing module.
 */
const hash = {
    /**
     * This function is going to hash a message using
     * sha3 256 bits (= 32 bytes) keccak algorithm.
     *
     * @param msg -
     * @param secret -
     */
    hmac256(msg, secret) {
        return buffer_1.default.from((0, hmac_1.hmac)(sha256_1.sha256, buffer_1.default.cast(secret).toBuffer(), buffer_1.default.cast(msg).toBuffer()));
    },
    /**
     * This function is going to hash a message using
     * sha3 256 bits (= 32 bytes) keccak algorithm.
     *
     * @param msg -
     */
    keccak256(msg) {
        return buffer_1.default.from((0, sha3_1.keccak_256)(buffer_1.default.cast(msg).toBuffer()));
    },
    /**
     * This function hash the provided message using the
     * sha2 algo with 256 bits (= 32 bytes) of size.
     *
     * @param msg -
     */
    sha256(msg) {
        return buffer_1.default.from((0, sha256_1.sha256)(buffer_1.default.cast(msg).toBuffer()));
    },
    /**
     * This function hash the provided message using the
     * sha3 algo with 256 bits (= 32 bytes) of size.
     *
     * @param msg -
     */
    sha3_256(msg) {
        return buffer_1.default.from((0, sha3_1.sha3_256)(buffer_1.default.cast(msg).toBuffer()));
    },
    /**
     * This function hash the provided message using the
     * sha2 algo with 512 bits (= 64 bytes) of size.
     *
     * @param msg -
     */
    sha512(msg) {
        return buffer_1.default.from((0, sha512_1.sha512)(buffer_1.default.cast(msg).toBuffer()));
    },
};
exports.default = hash;
//# sourceMappingURL=hash.js.map