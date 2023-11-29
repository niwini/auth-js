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
exports.BufferLike = exports.ecies = exports.hash = exports.secp = exports.aes = void 0;
//#####################################################
// Exports
//#####################################################
__exportStar(require("./document"), exports);
__exportStar(require("./statement"), exports);
var aes_1 = require("./aes");
Object.defineProperty(exports, "aes", { enumerable: true, get: function () { return __importDefault(aes_1).default; } });
var secp_1 = require("./secp");
Object.defineProperty(exports, "secp", { enumerable: true, get: function () { return __importDefault(secp_1).default; } });
var hash_1 = require("./hash");
Object.defineProperty(exports, "hash", { enumerable: true, get: function () { return __importDefault(hash_1).default; } });
var ecies_1 = require("./ecies");
Object.defineProperty(exports, "ecies", { enumerable: true, get: function () { return __importDefault(ecies_1).default; } });
var buffer_1 = require("./buffer");
Object.defineProperty(exports, "BufferLike", { enumerable: true, get: function () { return __importDefault(buffer_1).default; } });
__exportStar(require("./buffer"), exports);
//# sourceMappingURL=index.js.map