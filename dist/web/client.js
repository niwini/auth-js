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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const preset_browser_1 = require("@otplib/preset-browser");
const axios_1 = __importDefault(require("axios"));
const graphql_1 = require("graphql");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_ws_1 = require("graphql-ws");
const lodash_1 = __importDefault(require("lodash"));
const nanoid_1 = require("nanoid");
const hash = __importStar(require("./hash"));
//#####################################################
// Constants
//#####################################################
const API_PORT = 9010;
const ACCESS_TOKEN_STORE_KEY = "niwini:accessToken";
//#####################################################
// Main Class
//#####################################################
/**
 * This is the web client we use in web applications.
 */
class AuthWeb {
    /**
     * Creates a new auth web client.
     *
     * @param config - Set of configs.
     */
    constructor(config) {
        /**
         * Current session code verifier.
         */
        this._codeVerifier = null;
        /**
         * Auth server public key.
         */
        this._serverPubKey = null;
        /**
         * Current access token.
         */
        this._accessToken = null;
        /**
         * Event listeners.
         */
        this._listeners = {};
        /**
         * Current session secret. This should be stored as securely as
         * possible in this web client. We can use web worker to keep
         * this secure and prevent XSS attacker from accessing it with
         * javascript.
         */
        this._sessionSecret = null;
        /**
         * Flag indicating if we are signed in or not.
         */
        this._isSigned = false;
        this._storage = config.storage ?? localStorage;
        const apiUrl = config.apiUrl ?? `https://api.niwini.io:${API_PORT}/gql`;
        this._apiAxios = axios_1.default.create({
            baseURL: apiUrl,
            method: "post",
            withCredentials: true,
        });
        /**
         * Check this:
         *
         * https://github.com/enisdenjo/graphql-ws#use-the-client
         */
        this._gqlWsClient = (0, graphql_ws_1.createClient)({
            url: apiUrl.replace(/^http/, "ws"),
        });
        this._initialized = this._init(config);
    }
    /**
     * This static function creates a new auth web client
     * and await for its initialization to get done.
     *
     * @param config -
     */
    static async create(config) {
        const client = new AuthWeb(config);
        await client.initialized;
        return client;
    }
    /**
     * This function initializes the auth web client.
     *
     * @param config -
     */
    async _init(config) {
        /**
         * First get current server pub key.
         */
        this._serverPubKey = await this._apiAxios.request({
            data: {
                query: (0, graphql_1.print)((0, graphql_tag_1.default) `
          query webAuthServer($id: String!) {
            authServer(
              id: $id,
            ) {
              pubKey,
            }
          }
        `),
                variables: {
                    id: config.serverId,
                },
            },
        }).then((res) => lodash_1.default.get(res.data, "data.authServer.pubKey"));
        if (!this._serverPubKey) {
            throw new Error("Could not get auth server info");
        }
        this._accessToken = await Promise.resolve(this._storage.getItem(ACCESS_TOKEN_STORE_KEY));
        /**
         * If we have an access token in local storage but
         * we don't have a session secret set yet we need to
         * try to refresh the access token first. In case we
         * have a session secret set into cookies we are going
         * to refresh the access token successfully, otherwise
         * we are not going to be able to refresh the token
         * and therefore we need to clear the current token.
         */
        if (this._accessToken) {
            try {
                const { data: { data: { authAccessTokenRefresh: authData, }, }, } = await this._apiAxios.request({
                    data: {
                        query: (0, graphql_1.print)((0, graphql_tag_1.default) `
              mutation webAuthAccessTokenRefresh($accessToken: String!) {
                authAccessTokenRefresh(
                  accessToken: $accessToken,
                ) {
                  accessToken,
                  sessionSecret,
                  expiresAt
                }
              }
            `),
                        variables: {
                            accessToken: this._accessToken,
                        },
                    },
                });
                this._accessToken = authData.accessToken;
                this._sessionSecret = authData.sessionSecret;
                this._isSigned = true;
                this._storage.setItem(ACCESS_TOKEN_STORE_KEY, this._accessToken);
            }
            catch (error) {
                this._accessToken = null;
                this._storage.removeItem(ACCESS_TOKEN_STORE_KEY);
            }
        }
    }
    /**
     * This function handles the session signed event.
     *
     * @param evt -
     * @param evt.code -
     */
    async _handleSignedEvent(evt) {
        const { data: { data: { authSessionActivate: authData, }, }, } = await this._apiAxios.request({
            data: {
                query: (0, graphql_1.print)((0, graphql_tag_1.default) `
          mutation webAuthSessionActivate($code: String!, $verifier: String!) {
            authSessionActivate(
              code: $code,
              verifier: $verifier,
            ) {
              accessToken,
              sessionSecret,
              expiresAt
            }
          }
        `),
                variables: {
                    code: evt.code,
                    verifier: this._codeVerifier,
                },
            },
        });
        this._accessToken = authData.accessToken;
        this._sessionSecret = authData.sessionSecret;
        this._isSigned = true;
        this._storage.setItem(ACCESS_TOKEN_STORE_KEY, this._accessToken);
        if (this._listeners["session:signed"]) {
            this._listeners["session:signed"].forEach((callback) => callback());
        }
    }
    /**
     * Get flag indicating if user is signed.
     */
    get isSigned() {
        return this._isSigned;
    }
    /**
     * Register listeners to events.
     *
     * @param evtName -
     * @param callback -
     */
    on(evtName, callback) {
        this._listeners[evtName] = this._listeners[evtName] ?? [];
        this._listeners[evtName].push(callback);
    }
    /**
     * Unregister listeners to events.
     *
     * @param evtName -
     * @param callback -
     */
    off(evtName, callback) {
        this._listeners[evtName] = this._listeners[evtName] ?? [];
        lodash_1.default.pull(this._listeners[evtName], callback);
    }
    /**
     * Get the initialized promise flag.
     */
    get initialized() {
        return this._initialized;
    }
    /**
     * Get axios client.
     */
    get apiAxios() {
        return this._apiAxios;
    }
    /**
     * Check if we have an access token in place.
     */
    hasAccessToken() {
        return Boolean(this._accessToken);
    }
    /**
     * This function request a new auth session.
     *
     * @param args -
     * @param args.scopes -
     */
    async session(args) {
        if (!this._serverPubKey) {
            throw new Error("server public key is not set");
        }
        /**
         * Create code verifier and code challenge.
         */
        this._codeVerifier = (0, nanoid_1.nanoid)();
        const codeChallenge = hash.sha256(this._codeVerifier).toHex();
        const { data: { data: { authSessionCreate: session, }, }, } = await this._apiAxios.request({
            data: {
                query: (0, graphql_1.print)((0, graphql_tag_1.default) `
          mutation webAuthSessionCreate(
            $codeChallenge: String!,
            $scopes: [String!]!,
            $serverPubKey: String!
          ) {
            authSessionCreate(
              codeChallenge: $codeChallenge,
              scopes: $scopes,
              serverPubKey: $serverPubKey
            ) {
              id
              records {
                id
                valStr
                valStrList
              }
              meta {
                auditor {
                  pubKey
                  signature
                }
                qrcode
              }
            }
          }
        `),
                variables: {
                    codeChallenge,
                    scopes: args.scopes,
                    serverPubKey: this._serverPubKey,
                },
            },
        });
        /**
         * Start listening for session events.
         */
        return new Promise((res) => {
            this._gqlWsClient.subscribe({
                query: (0, graphql_1.print)((0, graphql_tag_1.default) `
          subscription authWebSessionEventEmitted(
            $sessionId: String!
          ) {
            authSessionEventEmitted(sessionId: $sessionId) {
              signed {
                code
              }
            }
          }
        `),
                variables: {
                    sessionId: session.id,
                },
            }, {
                complete: () => {
                    /* Do something? */
                },
                error: () => {
                    /* Do something? */
                },
                next: (response) => {
                    const evt = response.data?.authSessionEventEmitted;
                    if (evt?.signed) {
                        this._handleSignedEvent(evt.signed);
                    }
                },
            });
            res(session);
        });
    }
    /**
     * Sign an user into the session.
     *
     * @param session - The signed session containing user encoded data.
     */
    async signin(session) {
        const { data: { data: { authSessionSignin, }, }, } = await this._apiAxios.request({
            data: {
                query: (0, graphql_1.print)((0, graphql_tag_1.default) `
          mutation webAuthSessionSignin(
            $session: AuthSessionInput!,
          ) {
            authSessionSignin(session: $session) {
              ok
            }
          }
        `),
                variables: {
                    session,
                },
            },
        });
        return authSessionSignin;
    }
    /**
     * This function is going to get new access token.
     */
    genAuthTokens() {
        if (!this._serverPubKey) {
            throw new Error("server public key is not set");
        }
        if (!this._accessToken || !this._sessionSecret) {
            throw new Error("you must be authenticated to call this functions");
        }
        /**
         * Generate an one otp request token.
         */
        const reqToken = preset_browser_1.totp.generate(this._sessionSecret);
        /**
         * The auth tokens we need in order to make a request to
         * private resources.
         */
        return {
            accessToken: this._accessToken,
            reqToken,
        };
    }
}
exports.default = AuthWeb;
//# sourceMappingURL=client.js.map