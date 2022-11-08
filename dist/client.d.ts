import { IBufferLikeInput } from "./buffer";
interface IDocRecord {
    id: string;
    valBool?: boolean;
    valFloat?: number;
    valFloatList?: {
        items: number[];
    };
    valInt?: number;
    valIntList?: {
        items: number[];
    };
    valStr?: string;
    valStrList?: {
        items: string[];
    };
}
interface IDocSigner {
    id?: string;
    pubKey: string;
    records: IDocRecord[];
}
interface IDocMeta {
    auditor?: {
        pubKey: string;
        records: IDocRecord[];
        signature: string;
    };
    qrcode?: string;
}
interface IOriginRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "origin";
    valStr: string;
}
interface IEphKeyRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "ephKey";
    valStr: string;
}
interface IUseRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "user";
    valStr: string;
}
interface IUserEphKeyRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "userEphKey";
    valStr: string;
}
interface ITokenExpiresAtRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "tokenExpiresAt";
    valStr: string;
}
interface IChallengeRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "challenge";
    valStr: string;
}
interface IScopesRec extends Omit<IDocRecord, "id" | "valStrList"> {
    id: "scopes";
    valStrList: {
        items: string[];
    };
}
interface IServerPubKeyRec extends Omit<IDocRecord, "id" | "valStr"> {
    id: "serverPubKey";
    valStr: string;
}
declare type IAuthSessionRec = IOriginRec | IEphKeyRec | IUseRec | IUserEphKeyRec | ITokenExpiresAtRec | IChallengeRec | IScopesRec | IServerPubKeyRec;
export interface IAuthSessionDoc {
    audience: string[];
    createdAt: string;
    deletedAt?: string;
    expiresAt?: string;
    id: string;
    meta: IDocMeta;
    ownerPubKey: string;
    records: IAuthSessionRec[];
    searchHash: string;
    signers?: IDocSigner[];
    type: string;
}
export interface IAccessTokenPayload {
    sid: string;
    key: string;
}
interface IAuthClientConfig {
    /**
     * Niwini api url.
     */
    apiUrl?: string;
    /**
     * Auth server private key.
     */
    serverPvtKey: IBufferLikeInput;
}
/**
 * This is the web client we use in web applications.
 */
declare class AuthClient<TUser extends Object = any> {
    /**
     * Remost instance to contact bini server.
     */
    private readonly _apiRemost;
    /**
     * Auth server private key.
     */
    private readonly _pvtKey;
    /**
     * Cache sessions so we don't need to go to bini server
     * every time client makes a request.
     */
    private readonly _cache;
    /**
     * Creates a new auth js client intended to be used in nodejs
     * applications on server side.
     *
     * @param config - Auth client config.
     */
    constructor(config: IAuthClientConfig);
    /**
     * This function is going decode tokens into the corresponding
     * auth session. First it validate the tokens, then it
     * try to get the session from a local cache. If the cache
     * is expired (= old) its going to request the data from
     * bini server.
     *
     * @param accessToken -
     * @param reqToken -
     */
    decodeToken(accessToken: string, reqToken: string): Promise<{
        user: TUser;
    }>;
}
export { AuthClient as default, AuthClient, };
