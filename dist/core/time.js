"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalConstTime = void 0;
/* eslint-disable import/prefer-default-export */
//#####################################################
// Auxiliary Functions
//#####################################################
/**
 * Check if we have constant time difference between two macs.
 *
 * @param bytes1 -
 * @param bytes2 -
 */
function equalConstTime(bytes1, bytes2) {
    if (bytes1.length !== bytes2.length) {
        return false;
    }
    let res = 0;
    for (let i = 0; i < bytes1.length; i++) {
        // eslint-disable-next-line no-bitwise
        res |= bytes1[i] ^ bytes2[i];
    }
    return res === 0;
}
exports.equalConstTime = equalConstTime;
//# sourceMappingURL=time.js.map