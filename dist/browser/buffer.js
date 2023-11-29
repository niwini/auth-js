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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBufferLike = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const lib_typedarrays_1 = __importDefault(require("crypto-js/lib-typedarrays"));
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const lodash_1 = __importDefault(require("lodash"));
//#####################################################
// Utils
//#####################################################
/**
 * This function checks if an object is an instance of
 * word array.
 *
 * @param wordArray - The object to check.
 */
function isWordArray(wordArray) {
    /* eslint-disable no-prototype-builtins */
    if (wordArray.hasOwnProperty("sigBytes")
        && wordArray.hasOwnProperty("words")) {
        return true;
    }
    /* eslint-enable no-prototype-builtins */
    return false;
}
/**
 * This function converts an Uint8Array to cryptojs wordarray.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param buff - Buffer to get converted.
 */
function bufferToWordArray(buff) {
    const words = [];
    for (let i = 0; i < buff.length; i++) {
        // eslint-disable-next-line no-bitwise
        words[(i / 4) | 0] |= buff[i] << (24 - 8 * i);
    }
    return lib_typedarrays_1.default.create(words, buff.length);
}
/**
 * Auxiliary function.
 *
 * @param word -
 * @param length -
 */
function wordToBytes(word, length) {
    const bytes = [];
    const xFF = 0xFF;
    /* eslint-disable no-bitwise */
    if (length > 0) {
        bytes.push(word >>> 24);
    }
    if (length > 1) {
        bytes.push((word >>> 16) & xFF);
    }
    if (length > 2) {
        bytes.push((word >>> 8) & xFF);
    }
    if (length > 3) {
        bytes.push(word & xFF);
    }
    /* eslint-enable no-bitwise */
    return bytes;
}
/**
 * This function converts cryptojs wordarray to Uint8Array.
 * Code got from https://gist.github.com/getify/7325764.
 *
 * @param wordArray - The word array to get converted.
 */
function wordArrayToBuffer(wordArray) {
    const { words } = wordArray;
    let length = wordArray.sigBytes;
    const result = [];
    let i = 0;
    while (length > 0) {
        const bytes = wordToBytes(words[i], Math.min(4, length));
        length -= bytes.length;
        result.push(bytes);
        i++;
    }
    return Buffer.from([].concat(...result));
}
//#####################################################
// Main Class
//#####################################################
/**
 * This is a class which wraps a buffer and offer some
 * util conversion functions.
 */
class BufferLike {
    /**
     * Creates a random buffer like with provided size.
     *
     * @param size - The size of the random buffer to create.
     */
    static random(size) {
        const buff = lib_typedarrays_1.default.random(size);
        return BufferLike.from(buff);
    }
    /**
     * Creates a new buffer like.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    static cast(data, encoding) {
        if (data instanceof BufferLike) {
            return data;
        }
        return new BufferLike(data, encoding);
    }
    /**
     * Creates a new buffer like.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    static from(data, encoding) {
        return new BufferLike(data, encoding);
    }
    /**
     * Concat multiple buffer likes together.
     *
     * @param {...any} items - Data to concat.
     */
    static concat(items) {
        const buff = Buffer.concat(items.map((item) => item.toBuffer()));
        return BufferLike.from(buff);
    }
    /**
     * This function creates a new buffer like instance.
     *
     * @param data - Data to be converted.
     * @param encoding - Encoding to use when data is string.
     */
    constructor(data, encoding) {
        if (data instanceof BufferLike) {
            this._buff = data.toBuffer();
        }
        else if (data instanceof bn_js_1.default) {
            this._buff = data.toBuffer();
        }
        else if (lodash_1.default.isString(data)) {
            /**
             * The encoding is going to be inferred by the string
             * itself. If it starts with an 0x it means an
             * hexadecimal encoding.
             */
            const hexMatch = (/^(0x)?([0-9a-fA-F]+)$/).exec(data);
            let str = data;
            let finalEncoding = encoding ?? "utf8";
            if (hexMatch) {
                str = hexMatch[2];
                finalEncoding = "hex";
            }
            this._buff = Buffer.from(str, finalEncoding);
        }
        else if (isWordArray(data)) {
            this._buff = wordArrayToBuffer(data);
        }
        else if (lodash_1.default.isPlainObject(data)) {
            this._buff = Buffer.from((0, json_stable_stringify_1.default)(data), "utf8");
        }
        else {
            this._buff = Buffer.from(data);
        }
    }
    /**
     * Check if buffers are equal.
     *
     * @param target - The target element to compare to.
     */
    isEqual(target) {
        const buff = BufferLike.from(target);
        return this._buff.equals(buff.toBuffer());
    }
    /**
     * Convert to hex string.
     *
     * @param opts -
     * @param opts.raw -
     */
    toHex(opts = {}) {
        const rawVal = this._buff.toString("hex");
        if (opts.raw) {
            return rawVal;
        }
        return `0x${rawVal}`;
    }
    /**
     * Convert to buffer.
     */
    toBuffer() {
        return Buffer.from(this._buff);
    }
    /**
     * Convert to word array.
     */
    toWordArray() {
        return bufferToWordArray(this.toBuffer());
    }
    /**
     * Convert to string.
     *
     * @param encoding - Output encoding.
     */
    toString(encoding) {
        if (encoding === "hex") {
            return this.toHex();
        }
        return this._buff.toString(encoding);
    }
    /**
     * Get a slice of the underlying buffer.
     *
     * @param start - Start position.
     * @param end - End position.
     */
    slice(start, end) {
        return BufferLike.from(this._buff.subarray(start, end));
    }
    /**
     * Get bytes length.
     */
    get size() {
        return this._buff.byteLength;
    }
}
exports.default = BufferLike;
/**
 * Utility function to create a buffer like instance.
 *
 * @param input - The input to be converted to a buffer like.
 */
function makeBufferLike(input) {
    return BufferLike.cast(input);
}
exports.makeBufferLike = makeBufferLike;
__exportStar(require("../core/buffer.types"), exports);
//# sourceMappingURL=buffer.js.map