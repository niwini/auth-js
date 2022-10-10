"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keccak256 = exports.sha512 = exports.sha256 = exports.sha3_256 = exports.hmac256 = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const hmac_1 = require("@noble/hashes/hmac");
const sha256_1 = require("@noble/hashes/sha256");
const sha3_1 = require("@noble/hashes/sha3");
const sha512_1 = require("@noble/hashes/sha512");
const buffer_1 = __importDefault(require("./buffer"));
/**
 * This function is going to hash a message using
 * sha3 256 bits (= 32 bytes) keccak algorithm.
 *
 * @param msg -
 * @param secret -
 */
function hmac256(msg, secret) {
    return buffer_1.default.from((0, hmac_1.hmac)(sha256_1.sha256, buffer_1.default.cast(secret).toBuffer(), buffer_1.default.cast(msg).toBuffer()));
}
exports.hmac256 = hmac256;
/**
 * This function hash the provided message using the
 * sha3 algo with 256 bits (= 32 bytes) of size.
 *
 * @param msg -
 */
function sha3_256(msg) {
    return buffer_1.default.from((0, sha3_1.sha3_256)(buffer_1.default.cast(msg).toBuffer()));
}
exports.sha3_256 = sha3_256;
/**
 * This function hash the provided message using the
 * sha2 algo with 256 bits (= 32 bytes) of size.
 *
 * @param msg -
 */
function sha256(msg) {
    return buffer_1.default.from((0, sha256_1.sha256)(buffer_1.default.cast(msg).toBuffer()));
}
exports.sha256 = sha256;
/**
 * This function hash the provided message using the
 * sha2 algo with 512 bits (= 64 bytes) of size.
 *
 * @param msg -
 */
function sha512(msg) {
    return buffer_1.default.from((0, sha512_1.sha512)(buffer_1.default.cast(msg).toBuffer()));
}
exports.sha512 = sha512;
/**
 * This function is going to hash a message using
 * sha3 256 bits (= 32 bytes) keccak algorithm.
 *
 * @param msg -
 */
function keccak256(msg) {
    return buffer_1.default.from((0, sha3_1.keccak_256)(buffer_1.default.cast(msg).toBuffer()));
}
exports.keccak256 = keccak256;
//# sourceMappingURL=hash.js.map