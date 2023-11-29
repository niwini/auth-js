"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zDocumentObjPart = exports.zDocumentObj = void 0;
const zod_1 = require("zod");
//#####################################################
// Schemas
//#####################################################
/**
 * This is the base schema for any document.
 */
exports.zDocumentObj = zod_1.z.object({
    // Unique string identifying this document.
    _id: zod_1.z.string(),
    /**
     * The high level category of this document.
     */
    category: zod_1.z.string(),
    // Date/time when this document got created.
    created_at: zod_1.z.date(),
    // Custom data associated with this document.
    data: zod_1.z.any().optional(),
    // Meta data associated with this document.
    header: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    // Flag indicating if data is encrypted or not.
    is_encrypted: zod_1.z.boolean(),
    // Public key associated with this document.
    pubkey: zod_1.z.string(),
    // Variant of this document type.
    variant: zod_1.z.string().optional(),
});
exports.zDocumentObjPart = exports.zDocumentObj.deepPartial();
//# sourceMappingURL=document.types.js.map