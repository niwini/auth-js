/* eslint-disable import/prefer-default-export */
import { customAlphabet } from "nanoid";

const customNanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
);

//#####################################################
// Types
//#####################################################
/**
 * This class implements an id generator.
 */
export class IdGenerator {
  private readonly _prefix?: string;

  /**
   * Creates a new generator.
   *
   * @param args -
   * @param args.prefix -
   */
  constructor(args: {
    prefix?: string;
  } = {}) {
    this._prefix = args.prefix;
  }

  /**
   * Creates a new id.
   */
  public new() {
    return [this._prefix, customNanoid()].filter(Boolean).join("_");
  }
}
