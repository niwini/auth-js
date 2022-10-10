"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordArrayToUint8Array = exports.uint8ArrayToWordArray = void 0;
/* eslint-disable no-bitwise */
const lib_typedarrays_1 = __importDefault(require("crypto-js/lib-typedarrays"));
//#####################################################
// Convert Functions
//#####################################################
/**
 * This function converts an Uint8Array to cryptojs wordarray.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param u8Array - The Uint8Array to get converted.
 */
function uint8ArrayToWordArray(u8Array) {
    const words = [];
    const len = u8Array.length;
    let i = 0;
    while (i < len) {
        words.push((u8Array[i++] << 24)
            | (u8Array[i++] << 16)
            | (u8Array[i++] << 8)
            | u8Array[i++]);
    }
    return lib_typedarrays_1.default.create(words, words.length * 4);
}
exports.uint8ArrayToWordArray = uint8ArrayToWordArray;
/**
 * This function converts cryptojs wordarray to Uint8Array.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param wordArray - The word array to get converted.
 */
function wordArrayToUint8Array(wordArray) {
    const len = wordArray.words.length;
    const u8Array = new Uint8Array(len << 2);
    let offset = 0;
    for (let i = 0; i < len; i++) {
        const word = wordArray.words[i];
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        u8Array[offset++] = word >> 24;
        u8Array[offset++] = (word >> 16) & 0xff;
        u8Array[offset++] = (word >> 8) & 0xff;
        u8Array[offset++] = word & 0xff;
        /* eslint-emable @typescript-eslint/no-magic-numbers */
    }
    return u8Array;
}
exports.wordArrayToUint8Array = wordArrayToUint8Array;
//# sourceMappingURL=utils.js.map