import BufferLike, { IBufferLikeInput } from "./buffer";
interface ICipherParams {
    ciphertext: BufferLike;
    iv: BufferLike;
    salt: BufferLike;
}
/**
 * This function encrypt a message using AES.
 *
 * @param msg - Message to encrypt.
 * @param secret - The encryption secret.
 */
export declare function encrypt(msg: IBufferLikeInput, secret: IBufferLikeInput): {
    ciphertext: BufferLike;
    iv: BufferLike;
    salt: BufferLike;
    /**
     * This function is going to generate the encrypted
     * string in hex format.
     */
    toHex(): string;
};
/**
 * This function encrypt a message using AES.
 *
 * @param msg - The stringified message.
 * @param secret - The encryption secret.
 */
export declare function decrypt<TData = string>(msg: string | ICipherParams, secret: IBufferLikeInput): string | TData;
export {};
