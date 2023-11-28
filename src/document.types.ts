import { z } from "zod";

//#####################################################
// Schemas
//#####################################################
/**
 * This is the base schema for any document.
 */
export const zDocumentObj = z.object({
  // Unique string identifying this document.
  _id: z.string(),

  /**
   * The high level category of this document.
   */
  category: z.string(),

  // Date/time when this document got created.
  created_at: z.date(),

  // Custom data associated with this document.
  data: z.any().optional(),

  // Meta data associated with this document.
  header: z.record(z.string(), z.any()),

  // Flag indicating if data is encrypted or not.
  is_encrypted: z.boolean(),

  // Public key associated with this document.
  pubkey: z.string(),

  // Variant of this document type.
  variant: z.string().optional(),
});

export const zDocumentObjPart = zDocumentObj.deepPartial();

//#####################################################
// Types
//#####################################################
export type TDocumentHeader = Record<string, any>;

export interface TDocumentObj<
  TData = any,
  THeader extends TDocumentHeader = TDocumentHeader,
  TCategory extends string = string
> extends z.infer<typeof zDocumentObj> {
  category: TCategory;
  data?: TData | string;
  header: THeader;
}
