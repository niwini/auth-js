"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdGenerator = void 0;
/* eslint-disable import/prefer-default-export */
const nanoid_1 = require("nanoid");
const customNanoid = (0, nanoid_1.customAlphabet)("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
//#####################################################
// Types
//#####################################################
/**
 * This class implements an id generator.
 */
class IdGenerator {
    /**
     * Creates a new generator.
     *
     * @param args -
     * @param args.prefix -
     */
    constructor(args = {}) {
        this._prefix = args.prefix;
    }
    /**
     * Creates a new id.
     */
    new() {
        return [this._prefix, customNanoid()].filter(Boolean).join("_");
    }
}
exports.IdGenerator = IdGenerator;
//# sourceMappingURL=id.js.map