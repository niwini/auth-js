import { TAES } from "../core/aes.types";
import BufferLike from "./buffer";
/**
 * AES module implementation for Browser.
 */
declare const aes: TAES<BufferLike>;
export default aes;
