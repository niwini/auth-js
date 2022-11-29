import { totp } from "@otplib/preset-browser";
import { print } from "graphql";
import gql from "graphql-tag";
import {
  createClient as createGqlWsClient,
  Client as GqlWsClient,
} from "graphql-ws";
import _ from "lodash";
import { nanoid } from "nanoid";

import remost, { IRemostFunction } from "../remost";

import * as hash from "./hash";

//#####################################################
// Types
//#####################################################
type IClientEvent = "session:signed" | "session:deleted";

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

type IListener = () => void;

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
export default class AuthWeb {
  /**
   * This static function creates a new auth web client
   * and await for its initialization to get done.
   *
   * @param config -
   */
  public static async create(config: IAuthWebConfig) {
    const client = new AuthWeb(config);

    await client.initialized;

    return client;
  }

  /**
   * Flag indicating if this auth web is already initialized.
   */
  private readonly _initialized: Promise<void>;

  /**
   * Remost instance to contact bini server.
   */
  private readonly _apiRemost: IRemostFunction;

  /**
   * Graphql ws client.
   */
  private readonly _gqlWsClient: GqlWsClient;

  /**
   * Local storage driver.
   */
  private readonly _storage: IStorage;

  /**
   * Current session code verifier.
   */
  private _codeVerifier: string | null = null;

  /**
   * Auth server public key.
   */
  private _serverPubKey: string | null = null;

  /**
   * Current access token.
   */
  private _accessToken: string | null = null;

  /**
   * Event listeners.
   */
  private _listeners: {
    [evtName: string]: IListener[];
  } = {};

  /**
   * Current session secret. This should be stored as securely as
   * possible in this web client. We can use web worker to keep
   * this secure and prevent XSS attacker from accessing it with
   * javascript.
   */
  private _sessionSecret: string | null = null;

  /**
   * Flag indicating if we are signed in or not.
   */
  private _isSigned = false;

  /**
   * Creates a new auth web client.
   *
   * @param config - Set of configs.
   */
  constructor(config: IAuthWebConfig) {
    this._storage = config.storage ?? localStorage;

    const apiUrl = config.apiUrl ?? `https://api.niwini.io:${API_PORT}/gql`;

    this._apiRemost = remost.create({
      baseURL: apiUrl,
      method: "post",
    });

    /**
     * Check this:
     *
     * https://github.com/enisdenjo/graphql-ws#use-the-client
     */
    this._gqlWsClient = createGqlWsClient({
      url: apiUrl.replace(/^http/, "ws"),
    });

    this._initialized = this._init(config);
  }

  /**
   * This function initializes the auth web client.
   *
   * @param config -
   */
  private async _init(config: IAuthWebConfig) {
    /**
     * First get current server pub key.
     */
    this._serverPubKey = await this._apiRemost.request<{
      data: {
        authServer: {
          pubKey: string;
        };
      };
    }>({
      data: {
        query: print(gql`
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
    }).then((res) => _.get(res.data, "data.authServer.pubKey"));

    if (!this._serverPubKey) {
      throw new Error("Could not get auth server info");
    }

    this._accessToken = await Promise.resolve(
      this._storage.getItem(ACCESS_TOKEN_STORE_KEY),
    );

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
        const {
          data: {
            data: {
              authAccessTokenRefresh: authData,
            },
          },
        } = await this._apiRemost.request<{
          data: {
            authAccessTokenRefresh: IAuthData;
          };
        }>({
          data: {
            query: print(gql`
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

        this._storage.setItem(
          ACCESS_TOKEN_STORE_KEY,
          this._accessToken,
        );
      } catch (error) {
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
  private async _handleSignedEvent(evt: {
    code: string;
  }) {
    const {
      data: {
        data: {
          authSessionActivate: authData,
        },
      },
    } = await this._apiRemost.request<{
      data: {
        authSessionActivate: IAuthData;
      };
    }>({
      data: {
        query: print(gql`
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

    this._storage.setItem(
      ACCESS_TOKEN_STORE_KEY,
      this._accessToken,
    );

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
  public on(evtName: IClientEvent, callback: () => void) {
    this._listeners[evtName] = this._listeners[evtName] ?? [];
    this._listeners[evtName].push(callback);
  }

  /**
   * Unregister listeners to events.
   *
   * @param evtName -
   * @param callback -
   */
  public off(evtName: IClientEvent, callback: () => void) {
    this._listeners[evtName] = this._listeners[evtName] ?? [];

    _.pull(this._listeners[evtName], callback);
  }

  /**
   * Get the initialized promise flag.
   */
  get initialized() {
    return this._initialized;
  }

  /**
   * Get remost client.
   */
  get apiRemost() {
    return this._apiRemost;
  }

  /**
   * Check if we have an access token in place.
   */
  public hasAccessToken() {
    return Boolean(this._accessToken);
  }

  /**
   * This function request a new auth session.
   *
   * @param args -
   * @param args.scopes -
   */
  public async session(args: {
    scopes: string[];
  }) {
    if (!this._serverPubKey) {
      throw new Error("server public key is not set");
    }

    /**
     * Create code verifier and code challenge.
     */
    this._codeVerifier = nanoid();
    const codeChallenge = hash.sha256(this._codeVerifier).toHex();

    const {
      data: {
        data: {
          authSessionCreate: session,
        },
      },
    } = await this._apiRemost.request<{
      data: {
        authSessionCreate: IAuthSessionDoc;
      };
    }>({
      data: {
        query: print(gql`
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
    return new Promise<IAuthSessionDoc>((res) => {
      this._gqlWsClient.subscribe<{
        authSessionEventEmitted: {
          signed?: { code: string };
        };
      }>({
        query: print(gql`
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
  public async signin(
    session: IAuthSessionDoc,
  ) {
    const {
      data: {
        data: {
          authSessionSignin,
        },
      },
    } = await this._apiRemost.request<{
      data: {
        authSessionSignin: {
          ok: boolean;
        };
      };
    }>({
      data: {
        query: print(gql`
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
  public genAuthTokens() {
    if (!this._serverPubKey) {
      throw new Error("server public key is not set");
    }

    if (!this._accessToken || !this._sessionSecret) {
      throw new Error("you must be authenticated to call this functions");
    }

    /**
     * Generate an one otp request token.
     */
    const reqToken = totp.generate(this._sessionSecret);

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

