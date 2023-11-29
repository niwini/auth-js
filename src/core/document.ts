/* eslint-disable max-classes-per-file */
import _ from "lodash";
import QRCode from "qrcode";

import {
  TBufferLikeInput,
} from "./buffer.types";
import { TCrypto } from "./crypto.types";
import {
  TDocumentHeader,
  TDocumentObj,
} from "./document.types";
import { IdGenerator } from "./id";
import { IPartialRequired } from "./types";

//#####################################################
// Constant
//#####################################################
const idGen = new IdGenerator({ prefix: "doc" });

//#####################################################
// Main class
//#####################################################
/**
 * This function implements a base document.
 */
export abstract class DocumentBase<
  TData = any,
  THeader extends TDocumentHeader = TDocumentHeader,
  TCategory extends string = string
> {
  /**
   * The auth module to use.
   */
  protected _crypto: Pick<
    TCrypto,
    "BufferLike" | "ecies" | "hash"
  >;

  /**
   * Underlying document object.
   */
  protected readonly _obj: TDocumentObj<TData, THeader, TCategory>;

  /**
   * This function creates a new base document.
   *
   * @param obj -
   * @param idGen -
   */
  constructor(
    obj: IPartialRequired<
      TDocumentObj<TData, THeader, TCategory>,
      "pubkey"
    >,
  ) {
    this._obj = {
      ...obj,
      _id: obj._id ?? idGen.new(),
      category: obj.category ?? "document" as any,
      created_at: obj.created_at ?? new Date(),
      header: obj.header ?? {} as any,
      is_encrypted: obj.is_encrypted ?? false,
      pubkey: obj.pubkey,
    };
  }

  /**
   * Get the header of this document.
   */
  get header() {
    return _.cloneDeep(this._obj.header);
  }

  /**
   * Get document pubkey.
   */
  get pubkey() {
    return this._obj.pubkey;
  }

  /**
   * Get document variant.
   */
  get variant() {
    return this._obj.variant;
  }

  /**
   * Get document category.
   */
  get category() {
    return this._obj.category;
  }

  /**
   * The document type is the doc typename concatenated with
   * document variant (if any).
   */
  get type() {
    return [
      this.category,
      this.variant,
    ].filter(Boolean).join(".");
  }

  /**
   * Get document data.
   */
  get data() {
    return _.cloneDeep(this._obj.data);
  }

  /**
   * Get document is_encrypted.
   */
  get is_encrypted() {
    return this._obj.is_encrypted;
  }

  /**
   * This function is going to hash this document contents
   * (which means everything but the header). Clients signs
   * this document hash when issuing a certificate for this
   * document.
   */
  get hash() {
    const buff = this._crypto.BufferLike.cast(
      _.omit(this.toObject(), "header"),
    );
    return this._crypto.hash.keccak256(buff).toHex();
  }

  /**
   * This function is going to decrypt this document data.
   *
   * @param pvtkey - Recipient private key.
   */
  public decrypt(pvtkey: TBufferLikeInput) {
    if (!this._obj.data || !this._obj.is_encrypted) {
      return;
    }

    this._obj.data = this._crypto.ecies.decrypt(
      this._obj.data as string,
      pvtkey,
    );

    try {
      this._obj.data = JSON.parse(this._obj.data as string) as TData;
    } catch (error) {
      // Do nothing.
    }

    this._obj.is_encrypted = false;
  }

  /**
   * This function is going to encrypt this document data.
   *
   * @param pubkey - Recipient public key.
   */
  public encrypt(pubkey?: TBufferLikeInput) {
    if (!this._obj.data || this._obj.is_encrypted) {
      return;
    }

    this._obj.data = this._crypto.ecies.encrypt(
      this._obj.data,
      pubkey ?? this._obj.pubkey,
    ).toHex();
    this._obj.is_encrypted = true;
  }

  /**
   * This function generates the query code representing this document.
   */
  public async qrcode() {
    return QRCode.toDataURL(JSON.stringify(this.toObject()));
  }

  /**
   * This function get the object representation of
   * this document.
   */
  public toObject(): TDocumentObj<TData, THeader, TCategory> {
    return _.cloneDeep(this._obj);
  }

  /**
   * Convert this document to a base64 representation.
   */
  public toBase64() {
    return Buffer.from(JSON.stringify(this.toObject())).toString("base64");
  }
}

export * from "./document.types";
export { DocumentBase as default };
