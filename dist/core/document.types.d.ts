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
    header: Record<string, any>;
    _id: string;
    category: string;
    created_at: Date;
    is_encrypted: boolean;
    pubkey: string;
    data?: any;
    variant?: string | undefined;
}, {
    header: Record<string, any>;
    _id: string;
    category: string;
    created_at: Date;
    is_encrypted: boolean;
    pubkey: string;
    data?: any;
    variant?: string | undefined;
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
    _id?: string | undefined;
    category?: string | undefined;
    created_at?: Date | undefined;
    data?: any;
    header?: Record<string, any> | undefined;
    is_encrypted?: boolean | undefined;
    pubkey?: string | undefined;
    variant?: string | undefined;
}, {
    _id?: string | undefined;
    category?: string | undefined;
    created_at?: Date | undefined;
    data?: any;
    header?: Record<string, any> | undefined;
    is_encrypted?: boolean | undefined;
    pubkey?: string | undefined;
    variant?: string | undefined;
}>;
export type TDocumentHeader = Record<string, any>;
export interface TDocumentObj<TData = any, THeader extends TDocumentHeader = TDocumentHeader, TCategory extends string = string> extends z.infer<typeof zDocumentObj> {
    category: TCategory;
    data?: TData | string;
    header: THeader;
}
//# sourceMappingURL=document.types.d.ts.map