import { z } from "zod";
/**
 * This is the base schema for any document.
 */
export declare const zDocumentObj: z.ZodObject<{
    _id: z.ZodString;
    /**
     * The high level category of this document.
     */
    category: z.ZodString;
    created_at: z.ZodDate;
    data: z.ZodOptional<z.ZodAny>;
    header: z.ZodRecord<z.ZodString, z.ZodAny>;
    is_encrypted: z.ZodBoolean;
    pubkey: z.ZodString;
    variant: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    _id?: string;
    category?: string;
    created_at?: Date;
    data?: any;
    header?: Record<string, any>;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
}, {
    _id?: string;
    category?: string;
    created_at?: Date;
    data?: any;
    header?: Record<string, any>;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
}>;
export declare const zDocumentObjPart: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodDate>;
    data: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
    header: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    is_encrypted: z.ZodOptional<z.ZodBoolean>;
    pubkey: z.ZodOptional<z.ZodString>;
    variant: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    _id?: string;
    category?: string;
    created_at?: Date;
    data?: any;
    header?: Record<string, any>;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
}, {
    _id?: string;
    category?: string;
    created_at?: Date;
    data?: any;
    header?: Record<string, any>;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
}>;
export type TDocumentHeader = Record<string, any>;
export interface TDocumentObj<TData = any, THeader extends TDocumentHeader = TDocumentHeader, TCategory extends string = string> extends z.infer<typeof zDocumentObj> {
    category: TCategory;
    data?: TData | string;
    header: THeader;
}
