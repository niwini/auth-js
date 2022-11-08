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
exports.AuthClient = exports.default = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const graphql_1 = require("graphql");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otplib_1 = require("otplib");
const aes = __importStar(require("./aes"));
const buffer_1 = __importDefault(require("./buffer"));
const remost_1 = __importDefault(require("./remost"));
const secp = __importStar(require("./secp"));
//#####################################################
// Constants
//#####################################################
const API_PORT = 9010;
//#####################################################
// Main Class
//#####################################################
/**
 * This is the web client we use in web applications.
 */
class AuthClient {
    /**
     * Creates a new auth js client intended to be used in nodejs
     * applications on server side.
     *
     * @param config - Auth client config.
     */
    constructor(config) {
        /**
         * Cache sessions so we don't need to go to bini server
         * every time client makes a request.
         */
        this._cache = new Map();
        this._pvtKey = buffer_1.default.from(config.serverPvtKey);
        this._apiRemost = remost_1.default.create({
            baseURL: config.apiUrl ?? `https://api.niwini.io:${API_PORT}/gql`,
            method: "post",
        });
    }
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
    async decodeToken(accessToken, reqToken) {
        if (!accessToken || !reqToken) {
            throw new Error("invalid tokens");
        }
        const payload = jsonwebtoken_1.default.decode(accessToken);
        const cache = this._cache.has(payload.sid)
            ? this._cache.get(payload.sid)
            : {
                session: null,
                sessionEphKey: null,
                sessionSecret: null,
                sessionUpdatedAt: null,
                user: null,
                userEphKey: null,
                userSecret: null,
            };
        let { session, sessionUpdatedAt } = cache;
        /**
         * If we don't have session document or if it's too old
         * let's get it.
         */
        if (!session
            || cache.sessionEphKey !== payload.key
            || (0, dayjs_1.default)().diff(sessionUpdatedAt, "minutes") > 10) {
            /**
             * Make a request to Niwini server in order to resolve
             * the session.
             */
            const { data: { data: { documentById: sessionDoc, }, }, } = await this._apiRemost.request({
                data: {
                    query: (0, graphql_1.print)((0, graphql_tag_1.default) `
            query webAuthSession(
              $sessionId: String!
            ) {
              documentById(id: $sessionId) {
                id
                records {
                  id
                  valStr
                  valStrList
                }
              }
            }
          `),
                    variables: {
                        sessionId: payload.sid,
                    },
                },
            });
            session = sessionDoc;
            sessionUpdatedAt = (0, dayjs_1.default)().toISOString();
        }
        const sessionEphKey = session.records.find((rec) => rec.id === "ephKey").valStr;
        const userEphKey = session.records.find((rec) => rec.id === "userEphKey").valStr;
        /**
         * If access token key is different than what we have in
         * session then we should consider the token expired.
         */
        if (sessionEphKey !== payload.key) {
            throw new Error("invalid tokens");
        }
        /**
         * Regenerate shared session secret. This secret
         * is used for proof of possession of access token.
         */
        if (sessionEphKey !== cache.sessionEphKey) {
            cache.sessionSecret = secp.sharedSecret(this._pvtKey, sessionEphKey).toHex();
            cache.sessionEphKey = sessionEphKey;
        }
        /**
         * Check TOTP token.
         */
        const isReqValid = otplib_1.totp.check(reqToken, cache.sessionSecret);
        if (!isReqValid) {
            throw new Error("invalid tokens");
        }
        /**
         * Regenerate shared user secret. This secret
         * is used to decrypt user encrypted info.
         */
        if (userEphKey !== cache.userEphKey) {
            cache.userSecret = secp.sharedSecret(this._pvtKey, userEphKey).toHex();
            cache.userEphKey = userEphKey;
            /**
             * Lets decrypt user data.
             */
            const encodedUser = session.records.find((rec) => rec.id === "user").valStr;
            try {
                const userStr = aes.decrypt(encodedUser, cache.userSecret);
                cache.user = JSON.parse(userStr);
            }
            catch (error) {
                // Do nothing.
            }
        }
        // Update session
        cache.session = session;
        cache.sessionUpdatedAt = sessionUpdatedAt;
        // Set cache back.
        this._cache.set(payload.sid, cache);
        // Return decoded info.
        return {
            user: cache.user,
        };
    }
}
exports.default = AuthClient;
exports.AuthClient = AuthClient;
//# sourceMappingURL=client.js.map