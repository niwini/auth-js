/* eslint-disable max-classes-per-file */
import { DocumentBase } from "../core/document";
import {
  TDocumentHeader,
} from "../core/document.types";

import crypto from "./crypto";

//#####################################################
// Main class
//#####################################################
/**
 * This function implements a base document.
 */
export class Document<
  TData = any,
  THeader extends TDocumentHeader = TDocumentHeader,
  TCategory extends string = string
> extends DocumentBase<TData, THeader, TCategory> {
  /**
   * Creates a document from base64 representation.
   *
   * @param str - The base64 string representation of this document.
   */
  public static fromBase64(str: string) {
    const obj = JSON.parse(Buffer.from(str, "base64").toString());

    return new Document(obj);
  }

  protected _crypto = crypto;
}

export * from "../core/document.types";
export { Document as default };
