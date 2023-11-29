import { TAES } from "./aes.types";
import { TBufferLikeClass } from "./buffer.types";
import { TECIES } from "./ecies.types";
import { THash } from "./hash.types";
import { TSECP } from "./secp.types";
export interface TCrypto {
    aes: TAES;
    BufferLike: TBufferLikeClass;
    ecies: TECIES;
    hash: THash;
    secp: TSECP;
}
