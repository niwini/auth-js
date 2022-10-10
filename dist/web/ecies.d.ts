import BufferLike, { IBufferLikeInput } from "./buffer";
interface ICipherParams {
    ciphertext: BufferLike;
    ephPubKey: BufferLike;
    iv: BufferLike;
    mac: BufferLike;
    salt: BufferLike;
}
/**
 * This function encrypt a message using AES ECIES.
 *
 * @param msg - The stringified message.
 * @param pubKey - Decryptor public key.
 */
export declare function encrypt(msg: IBufferLikeInput, pubKey: IBufferLikeInput): {
    ephPubKey: BufferLike;
    mac: BufferLike;
    /**
     * This function is going to convert to hex version
     * of this encrypted data.
     */
    toHex(): string;
    ciphertext: BufferLike;
    iv: BufferLike;
    salt: BufferLike;
};
/**
 * This function encrypt a message using AES ECIES.
 *
 * @param msg - The stringified message.
 * @param pvtKey - Decryptor private key.
 */
export declare function decrypt(msg: string | ICipherParams, pvtKey: IBufferLikeInput): string;
export {};
