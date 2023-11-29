import { TBufferLike, TBufferLikeInput } from "./buffer.types";
/**
 * This is an interface for the SECP util.
 */
export interface TSECP<IBufferLike extends TBufferLike = TBufferLike> {
    /**
     * Verify the private key.
     *
     * @param pvtkey - The private key to be validated.
     */
    isValidPvtKey(pvtkey: TBufferLikeInput): [boolean, Error | null];
    /**
     * Verify if public key is valid.
     *
     * @param _pubkey - The public key to be validated.
     */
    isValidPubKey(_pubkey: TBufferLikeInput): [boolean, Error | null];
    /**
     * Generate random keypair.
     *
     * @param args -
     * @param args.pvtkey -
     */
    genKeyPair(args?: {
        pvtkey?: TBufferLikeInput;
    }): {
        pubkey: IBufferLike;
        pvtkey: IBufferLike;
    };
    /**
     * Compute an ECDH shared secret.
     *
     * @param pvtKey - The private key.
     * @param otherPubKey - A public key not associated with the pvt key.
     */
    sharedSecret(pvtKey: TBufferLikeInput, otherPubKey: TBufferLikeInput): IBufferLike;
    /**
     * This function is going to sign a piece of data
     * using a provided private key.
     *
     * @param payload - Payload to be signed.
     * @param pvtKey - The private key to be used in sign.
     */
    sign(payload: TBufferLikeInput, pvtKey: TBufferLikeInput): Promise<IBufferLike>;
    /**
     * This function is going to verify a secp256k1 signature
     * against the provided piece of data.
     *
     * @param signature - The signature to be verified.
     * @param payload - Piece of data to verify against.
     * @param pubKey - The signer public key to use in check.
     */
    signVerify(signature: TBufferLikeInput, payload: TBufferLikeInput, pubKey: TBufferLikeInput): Promise<boolean>;
}
