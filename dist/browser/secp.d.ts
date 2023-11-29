import { ec as EC } from "elliptic";
import { TSECP } from "../core/secp.types";
import BufferLike from "./buffer";
export declare const ec: EC;
/**
 * Secpt module implementation for browser.
 */
declare const secp: TSECP<BufferLike>;
export default secp;
