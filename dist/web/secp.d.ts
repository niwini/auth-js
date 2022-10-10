import BufferLike, { IBufferLikeInput } from "./buffer";
export declare const ec: any;
/**
 * This function checks if provided key is a valid private key.
 *
 * @param key - Key to check.
 */
export declare function assertValidPvtKey(key: Uint8Array): void;
/**
 * Generate random keypair.
 */
export declare function genKeyPair(): {
    pubKey: BufferLike;
    pvtKey: BufferLike;
};
/**
 * Compute an ECDH shared secret.
 *
 * @param pvtKey - The private key.
 * @param otherPubKey - A public key not associated with the pvt key.
 */
export declare function sharedSecret(pvtKey: IBufferLikeInput, otherPubKey: IBufferLikeInput): BufferLike;
/**
 * This function create a hashed version of a string message
 * so we can sign it.
 *
 * @param msg - The stringified message to hash.
 */
export declare function signHash(msg: IBufferLikeInput): BufferLike;
/**
 * This function is going to sign a piece of data
 * using a provided private key.
 *
 * @param data - Data to be signed.
 * @param pvtKey - The private key to be used in sign.
 */
export declare function signData(data: IBufferLikeInput, pvtKey: IBufferLikeInput): Promise<BufferLike>;
/**
 * This function is going to verify a secp256k1 signature
 * against the provided piece of data.
 *
 * @param signature - The signature to be verified.
 * @param data - Piece of data to verify against.
 * @param pubKey - The signer public key to use in check.
 */
export declare function signVerify(signature: IBufferLikeInput, data: IBufferLikeInput, pubKey: IBufferLikeInput): Promise<boolean>;
