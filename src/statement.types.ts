import { z } from "zod";

import {
  zDocumentObj,
} from "./document.types";

//#####################################################
// Certificate Schemas
//#####################################################
export const zCertificateObj = zDocumentObj.extend({
  category: z.literal("certificate"),
  header: z.object({
    signature: z.string().optional(),
  }),
});

//#####################################################
// Certificate Types
//#####################################################
export interface TCertificateObj<
  TData = any
> extends z.infer<typeof zCertificateObj> {
  data?: TData | string;
}

//#####################################################
// Statement Schemas
//#####################################################
export const zStatementObj = zDocumentObj.extend({
  category: z.literal("statement"),
  header: z.object({
    certificates: z.array(zCertificateObj),
  }),
});

//#####################################################
// Statement Types
//#####################################################
export interface TStatementObj<
  TData = any
> extends z.infer<typeof zStatementObj> {
  data?: TData | string;
}
