"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zStatementObj = exports.zCertificateObj = void 0;
const zod_1 = require("zod");
const document_types_1 = require("./document.types");
//#####################################################
// Certificate Schemas
//#####################################################
exports.zCertificateObj = document_types_1.zDocumentObj.extend({
    category: zod_1.z.literal("certificate"),
    header: zod_1.z.object({
        signature: zod_1.z.string().optional(),
    }),
});
//#####################################################
// Statement Schemas
//#####################################################
exports.zStatementObj = document_types_1.zDocumentObj.extend({
    category: zod_1.z.literal("statement"),
    header: zod_1.z.object({
        certificates: zod_1.z.array(exports.zCertificateObj),
    }),
});
//# sourceMappingURL=statement.types.js.map