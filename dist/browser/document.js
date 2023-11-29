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
exports.default = exports.Document = void 0;
/* eslint-disable max-classes-per-file */
const document_1 = require("../core/document");
const crypto_1 = __importDefault(require("./crypto"));
//#####################################################
// Main class
//#####################################################
/**
 * This function implements a base document.
 */
class Document extends document_1.DocumentBase {
    constructor() {
        super(...arguments);
        this._crypto = crypto_1.default;
    }
    /**
     * Creates a document from base64 representation.
     *
     * @param str - The base64 string representation of this document.
     */
    static fromBase64(str) {
        const obj = JSON.parse(Buffer.from(str, "base64").toString());
        return new Document(obj);
    }
}
exports.Document = Document;
exports.default = Document;
__exportStar(require("../core/document.types"), exports);
//# sourceMappingURL=document.js.map