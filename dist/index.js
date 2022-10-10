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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferLike = exports.ecies = exports.hash = exports.secp = exports.aes = void 0;
const client_1 = __importDefault(require("./client"));
//#####################################################
// Exports
//#####################################################
exports.default = client_1.default;
__exportStar(require("./client"), exports);
exports.aes = __importStar(require("./aes"));
exports.secp = __importStar(require("./secp"));
exports.hash = __importStar(require("./hash"));
exports.ecies = __importStar(require("./ecies"));
var buffer_1 = require("./buffer");
Object.defineProperty(exports, "BufferLike", { enumerable: true, get: function () { return __importDefault(buffer_1).default; } });
__exportStar(require("./buffer"), exports);
//# sourceMappingURL=index.js.map