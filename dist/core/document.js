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
exports.default = exports.DocumentBase = void 0;
/* eslint-disable max-classes-per-file */
const lodash_1 = __importDefault(require("lodash"));
const qrcode_1 = __importDefault(require("qrcode"));
const id_1 = require("./id");
//#####################################################
// Constant
//#####################################################
const idGen = new id_1.IdGenerator({ prefix: "doc" });
//#####################################################
// Main class
//#####################################################
/**
 * This function implements a base document.
 */
class DocumentBase {
    /**
     * This function creates a new base document.
     *
     * @param obj -
     * @param idGen -
     */
    constructor(obj) {
        this._obj = {
            ...obj,
            _id: obj._id ?? idGen.new(),
            category: obj.category ?? "document",
            created_at: obj.created_at ?? new Date(),
            header: obj.header ?? {},
            is_encrypted: obj.is_encrypted ?? false,
            pubkey: obj.pubkey,
        };
    }
    /**
     * Get the header of this document.
     */
    get header() {
        return lodash_1.default.cloneDeep(this._obj.header);
    }
    /**
     * Get document pubkey.
     */
    get pubkey() {
        return this._obj.pubkey;
    }
    /**
     * Get document variant.
     */
    get variant() {
        return this._obj.variant;
    }
    /**
     * Get document category.
     */
    get category() {
        return this._obj.category;
    }
    /**
     * The document type is the doc typename concatenated with
     * document variant (if any).
     */
    get type() {
        return [
            this.category,
            this.variant,
        ].filter(Boolean).join(".");
    }
    /**
     * Get document data.
     */
    get data() {
        return lodash_1.default.cloneDeep(this._obj.data);
    }
    /**
     * Get document is_encrypted.
     */
    get is_encrypted() {
        return this._obj.is_encrypted;
    }
    /**
     * This function is going to hash this document contents
     * (which means everything but the header). Clients signs
     * this document hash when issuing a certificate for this
     * document.
     */
    get hash() {
        const buff = this._crypto.BufferLike.cast(lodash_1.default.omit(this.toObject(), "header"));
        return this._crypto.hash.keccak256(buff).toHex();
    }
    /**
     * This function is going to decrypt this document data.
     *
     * @param pvtkey - Recipient private key.
     */
    decrypt(pvtkey) {
        if (!this._obj.data || !this._obj.is_encrypted) {
            return;
        }
        this._obj.data = this._crypto.ecies.decrypt(this._obj.data, pvtkey);
        try {
            this._obj.data = JSON.parse(this._obj.data);
        }
        catch (error) {
            // Do nothing.
        }
        this._obj.is_encrypted = false;
    }
    /**
     * This function is going to encrypt this document data.
     *
     * @param pubkey - Recipient public key.
     */
    encrypt(pubkey) {
        if (!this._obj.data || this._obj.is_encrypted) {
            return;
        }
        this._obj.data = this._crypto.ecies.encrypt(this._obj.data, pubkey ?? this._obj.pubkey).toHex();
        this._obj.is_encrypted = true;
    }
    /**
     * This function generates the query code representing this document.
     */
    async qrcode() {
        return qrcode_1.default.toDataURL(JSON.stringify(this.toObject()));
    }
    /**
     * This function get the object representation of
     * this document.
     */
    toObject() {
        return lodash_1.default.cloneDeep(this._obj);
    }
    /**
     * Convert this document to a base64 representation.
     */
    toBase64() {
        return Buffer.from(JSON.stringify(this.toObject())).toString("base64");
    }
}
exports.DocumentBase = DocumentBase;
exports.default = DocumentBase;
__exportStar(require("./document.types"), exports);
//# sourceMappingURL=document.js.map