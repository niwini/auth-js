import { AxiosInstance } from "axios";
declare type IClientEvent = "session:signed" | "session:deleted";
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
export interface IAuthData {
    accessToken: string;
    sessionSecret: string;
}
interface IStorage {
    getItem: (key: string) => Promise<string | null> | string | null;
    setItem: (key: string, val: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
}
interface IAuthWebConfig {
    /**
     * Niwini server url.
     */
    apiUrl?: string;
    /**
     * Auth server id which we are going to use to
     * retrieve the public key.
     */
    serverId: string;
    /**
     * Client private key. This is useful if we are using
     * this client on a secure environment like a mobile app.
     */
    pvtKey?: string;
    /**
     * The local storage to be used.
     */
    storage?: IStorage;
}
/**
 * This is the web client we use in web applications.
 */
export default class AuthWeb {
    /**
     * This static function creates a new auth web client
     * and await for its initialization to get done.
     *
     * @param config -
     */
    static create(config: IAuthWebConfig): Promise<AuthWeb>;
    /**
     * Flag indicating if this auth web is already initialized.
     */
    private readonly _initialized;
    /**
     * Axios instance to contact our server.
     */
    private readonly _apiAxios;
    /**
     * Graphql ws client.
     */
    private readonly _gqlWsClient;
    /**
     * Local storage driver.
     */
    private readonly _storage;
    /**
     * Current session code verifier.
     */
    private _codeVerifier;
    /**
     * Auth server public key.
     */
    private _serverPubKey;
    /**
     * Current access token.
     */
    private _accessToken;
    /**
     * Event listeners.
     */
    private _listeners;
    /**
     * Current session secret. This should be stored as securely as
     * possible in this web client. We can use web worker to keep
     * this secure and prevent XSS attacker from accessing it with
     * javascript.
     */
    private _sessionSecret;
    /**
     * Flag indicating if we are signed in or not.
     */
    private _isSigned;
    /**
     * Creates a new auth web client.
     *
     * @param config - Set of configs.
     */
    constructor(config: IAuthWebConfig);
    /**
     * This function initializes the auth web client.
     *
     * @param config -
     */
    private _init;
    /**
     * This function handles the session signed event.
     *
     * @param evt -
     * @param evt.code -
     */
    private _handleSignedEvent;
    /**
     * Get flag indicating if user is signed.
     */
    get isSigned(): boolean;
    /**
     * Register listeners to events.
     *
     * @param evtName -
     * @param callback -
     */
    on(evtName: IClientEvent, callback: () => void): void;
    /**
     * Unregister listeners to events.
     *
     * @param evtName -
     * @param callback -
     */
    off(evtName: IClientEvent, callback: () => void): void;
    /**
     * Get the initialized promise flag.
     */
    get initialized(): Promise<void>;
    /**
     * Get axios client.
     */
    get apiAxios(): AxiosInstance;
    /**
     * Check if we have an access token in place.
     */
    hasAccessToken(): boolean;
    /**
     * This function request a new auth session.
     *
     * @param args -
     * @param args.scopes -
     */
    session(args: {
        scopes: string[];
    }): Promise<IAuthSessionDoc>;
    /**
     * Sign an user into the session.
     *
     * @param session - The signed session containing user encoded data.
     */
    signin(session: IAuthSessionDoc): Promise<{
        ok: boolean;
    }>;
    /**
     * This function is going to get new access token.
     */
    genAuthTokens(): {
        accessToken: string;
        reqToken: string;
    };
}
export {};
