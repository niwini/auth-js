import { CertificateBase, StatementBase } from "../core/statement";

import crypto from "./crypto";

//#####################################################
// Certificate
//#####################################################
/**
 * This class implements a certificate document.
 */
export class Certificate<TData = any> extends CertificateBase<TData> {
  protected _crypto = crypto;
}

//#####################################################
// Statement
//#####################################################
/**
 * This class implements a general statement document.
 */
export class Statement<TData = any> extends StatementBase<TData> {
  protected _crypto = {
    ...crypto,
    Certificate,
  };
}

export * from "../core/statement.types";
export { Statement as default };
