/// <reference types="crypto-js" />
import WordArray from "crypto-js/lib-typedarrays";
/**
 * This function converts an Uint8Array to cryptojs wordarray.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param u8Array - The Uint8Array to get converted.
 */
export declare function uint8ArrayToWordArray(u8Array: Uint8Array): WordArray;
/**
 * This function converts cryptojs wordarray to Uint8Array.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param wordArray - The word array to get converted.
 */
export declare function wordArrayToUint8Array(wordArray: WordArray): Uint8Array;
//# sourceMappingURL=utils.d.ts.map