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
exports.default = exports.StatementBase = exports.CertificateBase = void 0;
const document_1 = __importDefault(require("./document"));
//#####################################################
// Certificate
//#####################################################
/**
 * This class implements a certificate document.
 */
class CertificateBase extends document_1.default {
    /**
     * Creates a new instance of this class.
     *
     * @param stmt - The associated statement.
     * @param obj - The underlying certificate object.
     */
    constructor(stmt, obj) {
        if (obj.category && obj.category !== "certificate") {
            throw new Error("only certificate objects are allowed");
        }
        super({
            ...obj,
            category: "certificate",
        });
        this._stmt = stmt;
    }
    /**
     * Get hashes to sign.
     */
    _hashToSign() {
        /**
         * Dependeing on the type of the certificate we should sign
         * more hashes. For example, a "validator" certificate must also
         * sign the hashes of all other certificates presented in the
         * document while a "creator" certificate must sign only the
         * document hash itself (i.e., the core contents of the document).
         */
        const hashes = [
            this._stmt.hash,
        ];
        switch (this.variant) {
            case "verifier": {
                hashes.push(...this._stmt.certificates.filter((crt) => crt.variant !== "verifier").map((crt) => crt.hash));
                break;
            }
            default: {
                break;
            }
        }
        return hashes.sort().join("");
    }
    /**
     * Signs this certificate.
     *
     * @param args -
     * @param args.pvtkey - The signer private key.
     */
    async sign(args) {
        this._obj.header.signature = (await this._crypto.secp.sign(this._hashToSign(), args.pvtkey)).toHex();
    }
    /**
     * This function checks if this certificate is valid.
     */
    async check() {
        if (!this._obj.header.signature) {
            return [false, null];
        }
        let error = null;
        let isValid = false;
        try {
            isValid = await this._crypto.secp.signVerify(this._obj.header.signature, this._hashToSign(), this._obj.pubkey);
        }
        catch (anError) {
            error = new Error([
                `Invalid signature for certificate ${this.pubkey}`,
                anError.message,
            ].join(" : "));
        }
        return [isValid, error];
    }
}
exports.CertificateBase = CertificateBase;
//#####################################################
// Statement
//#####################################################
/**
 * This class implements a general statement document.
 */
class StatementBase extends document_1.default {
    /**
     * Creates a new instance of this class.
     *
     * @param obj - The underlying statement object.
     * @param opts -
     * @param opts.pvtkey -
     */
    constructor(obj) {
        if (obj.category && obj.category !== "statement") {
            throw new Error("only statement objects are allowed");
        }
        super({
            ...obj,
            category: "statement",
            header: {
                certificates: obj.header?.certificates ?? [],
            },
        });
    }
    /**
     * Get the certificates of this document.
     */
    get certificates() {
        return this._obj.header.certificates.map(
        /**
         * For some reason we need to cast crt to any here
         * because on running 'yarn build' typescript is throwing
         * the following error:
         *
         * src/core/statement.ts:175:51 - error TS2345: Argument of type '{ data?: any; _id?: string; created_at?: Date; is_encrypted?: boolean; pubkey?: string; variant?: string; category?: "certificate"; header?: { signature?: string; }; }' is not assignable to parameter of type 'IPartialRequired<TCertificateObj<any>, "pubkey">'.
         * Type '{ data?: any; _id?: string; created_at?: Date; is_encrypted?: boolean; pubkey?: string; variant?: string; category?: "certificate"; header?: { signature?: string; }; }' is not assignable to type 'Required<Pick<TCertificateObj<any>, "pubkey">>'.
         * Property 'pubkey' is optional in type '{ data?: any; _id?: string; created_at?: Date; is_encrypted?: boolean; pubkey?: string; variant?: string; category?: "certificate"; header?: { signature?: string; }; }' but required in type 'Required<Pick<TCertificateObj<any>, "pubkey">>'.
         *
         * 175       (crt) => new this._crypto.Certificate(this, crt),
         *
         * Found 1 error in src/core/statement.ts:175
         *
         * @param crt -
         */
        (crt) => new this._crypto.Certificate(this, crt));
    }
    /**
     * This function is going to certify this statement.
     *
     * @param args -
     * @param args.pvtkey - Signer private key.
     * @param args.data - Signer custom data.
     * @param args.variant - Certificate variant.
     */
    async certify(args) {
        /**
         * First check if this document is valid.
         */
        const { pubkey } = this._crypto.secp.genKeyPair({ pvtkey: args.pvtkey });
        /**
         * Generate the certificate (which is another doc).
         */
        const certificate = new this._crypto.Certificate(this, {
            data: args.data,
            pubkey: pubkey.toHex(),
            variant: args.variant,
        });
        /**
         * Dependeing on the type of the certificate we should sign
         * more hashes. For example, a "validator" certificate must also
         * sign the hashes of all other certificates presented in the
         * document while a "creator" certificate must sign only the
         * document hash itself (i.e., the core contents of the document).
         */
        await certificate.sign({ pvtkey: args.pvtkey });
        /**
         * Set the certificate among the certificates.
         */
        this._obj.header.certificates = [
            ...this._obj.header.certificates ?? [],
            certificate.toObject(),
        ];
    }
    /**
     * This function checks if this statement is valid which
     * essentially consist in checking if all its certificates
     * are valid.
     *
     * @param args -
     * @param args.required_certificate_pubkeys - List of certifiers which
     * must be present.
     */
    async check(args = {}) {
        const docCrts = this.certificates;
        let reqCrtPubKeys = [
            ...args.required_certificate_pubkeys ?? [],
        ];
        if (reqCrtPubKeys.length) {
            docCrts.forEach((crt) => {
                reqCrtPubKeys = reqCrtPubKeys.filter((pubkey) => pubkey !== crt.pubkey);
            });
        }
        // Check if all certificates are valid.
        const crtChecks = await Promise.all(docCrts.map((crt) => crt.check()));
        /**
         * If required certificates are not present or if
         * any of the presented certificates is not valid
         * then we fail the check.
         */
        if (reqCrtPubKeys.length) {
            return [false, new Error("missing required certificates")];
        }
        const invalidCheck = crtChecks.find(([isValid]) => !isValid);
        if (invalidCheck) {
            return [false, invalidCheck[1]];
        }
        return [true, null];
    }
}
exports.StatementBase = StatementBase;
exports.default = StatementBase;
__exportStar(require("./statement.types"), exports);
//# sourceMappingURL=statement.js.map