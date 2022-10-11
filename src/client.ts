import https from "https";

import axios, { AxiosInstance } from "axios";
import dayjs from "dayjs";
import { print } from "graphql";
import gql from "graphql-tag";
import jwt from "jsonwebtoken";
import { totp } from "otplib";

import * as aes from "./aes";
import BufferLike, { IBufferLikeInput } from "./buffer";
import * as secp from "./secp";

//#####################################################
// Types
//#####################################################
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

type IAuthSessionRec
  = IOriginRec
  | IEphKeyRec
  | IUseRec
  | IUserEphKeyRec
  | ITokenExpiresAtRec
  | IChallengeRec
  | IScopesRec
  | IServerPubKeyRec;

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

interface ITokenCache<TUser extends Object> {
  session: IAuthSessionDoc;
  sessionEphKey: string;
  sessionSecret: string;
  sessionUpdatedAt: string;
  user: TUser;
  userEphKey: string;
  userSecret: string;
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
class AuthClient<TUser extends Object = any> {
  /**
   * Axios instance to contact bini server.
   */
  private readonly _apiAxios: AxiosInstance;

  /**
   * Auth server private key.
   */
  private readonly _pvtKey: BufferLike;

  /**
   * Cache sessions so we don't need to go to bini server
   * every time client makes a request.
   */
  private readonly _cache: Map<string, ITokenCache<TUser>> = new Map();

  /**
   * Creates a new auth js client intended to be used in nodejs
   * applications on server side.
   *
   * @param config - Auth client config.
   */
  constructor(config: IAuthClientConfig) {
    this._pvtKey = BufferLike.from(config.serverPvtKey);
    this._apiAxios = axios.create({
      baseURL: config.apiUrl ?? `https://api.niwini.io:${API_PORT}/gql`,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
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
  public async decodeToken(
    accessToken: string,
    reqToken: string,
  ) {
    if (!accessToken || !reqToken) {
      throw new Error("invalid tokens");
    }

    const payload = jwt.decode(accessToken) as IAccessTokenPayload;
    const cache: ITokenCache<TUser> = this._cache.has(payload.sid)
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
    if (
      !session
      || cache.sessionEphKey !== payload.key
      || dayjs().diff(sessionUpdatedAt, "minutes") > 10
    ) {
      /**
       * Make a request to Niwini server in order to resolve
       * the session.
       */
      const {
        data: {
          data: {
            documentById: sessionDoc,
          },
        },
      } = await this._apiAxios.request<{
        data: {
          documentById: IAuthSessionDoc;
        };
      }>({
        data: {
          query: print(gql`
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
      sessionUpdatedAt = dayjs().toISOString();
    }

    const sessionEphKey = session.records.find(
      (rec) => rec.id === "ephKey",
    ).valStr;
    const userEphKey = session.records.find(
      (rec) => rec.id === "userEphKey",
    ).valStr;

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
      cache.sessionSecret = secp.sharedSecret(
        this._pvtKey,
        sessionEphKey,
      ).toHex();

      cache.sessionEphKey = sessionEphKey;
    }

    /**
     * Check TOTP token.
     */
    const isReqValid = totp.check(
      reqToken,
      cache.sessionSecret,
    );

    if (!isReqValid) {
      throw new Error("invalid tokens");
    }

    /**
     * Regenerate shared user secret. This secret
     * is used to decrypt user encrypted info.
     */
    if (userEphKey !== cache.userEphKey) {
      cache.userSecret = secp.sharedSecret(
        this._pvtKey,
        userEphKey,
      ).toHex();

      cache.userEphKey = userEphKey;

      /**
       * Lets decrypt user data.
       */
      const encodedUser = session.records.find(
        (rec) => rec.id === "user",
      ).valStr;

      try {
        const userStr = aes.decrypt(
          encodedUser,
          cache.userSecret,
        );

        cache.user = JSON.parse(userStr);
      } catch (error) {
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

export {
  AuthClient as default,
  AuthClient,
};
