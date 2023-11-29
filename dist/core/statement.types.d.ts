import { z } from "zod";
export declare const zCertificateObj: z.ZodObject<{
    data: z.ZodOptional<z.ZodAny>;
    _id: z.ZodString;
    created_at: z.ZodDate;
    is_encrypted: z.ZodBoolean;
    pubkey: z.ZodString;
    variant: z.ZodOptional<z.ZodString>;
    category: z.ZodLiteral<"certificate">;
    header: z.ZodObject<{
        signature: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        signature?: string;
    }, {
        signature?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    data?: any;
    _id?: string;
    created_at?: Date;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
    category?: "certificate";
    header?: {
        signature?: string;
    };
}, {
    data?: any;
    _id?: string;
    created_at?: Date;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
    category?: "certificate";
    header?: {
        signature?: string;
    };
}>;
export interface TCertificateObj<TData = any> extends z.infer<typeof zCertificateObj> {
    data?: TData | string;
}
export declare const zStatementObj: z.ZodObject<{
    data: z.ZodOptional<z.ZodAny>;
    _id: z.ZodString;
    created_at: z.ZodDate;
    is_encrypted: z.ZodBoolean;
    pubkey: z.ZodString;
    variant: z.ZodOptional<z.ZodString>;
    category: z.ZodLiteral<"statement">;
    header: z.ZodObject<{
        certificates: z.ZodArray<z.ZodObject<{
            data: z.ZodOptional<z.ZodAny>;
            _id: z.ZodString;
            created_at: z.ZodDate;
            is_encrypted: z.ZodBoolean;
            pubkey: z.ZodString;
            variant: z.ZodOptional<z.ZodString>;
            category: z.ZodLiteral<"certificate">;
            header: z.ZodObject<{
                signature: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                signature?: string;
            }, {
                signature?: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            data?: any;
            _id?: string;
            created_at?: Date;
            is_encrypted?: boolean;
            pubkey?: string;
            variant?: string;
            category?: "certificate";
            header?: {
                signature?: string;
            };
        }, {
            data?: any;
            _id?: string;
            created_at?: Date;
            is_encrypted?: boolean;
            pubkey?: string;
            variant?: string;
            category?: "certificate";
            header?: {
                signature?: string;
            };
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        certificates?: {
            data?: any;
            _id?: string;
            created_at?: Date;
            is_encrypted?: boolean;
            pubkey?: string;
            variant?: string;
            category?: "certificate";
            header?: {
                signature?: string;
            };
        }[];
    }, {
        certificates?: {
            data?: any;
            _id?: string;
            created_at?: Date;
            is_encrypted?: boolean;
            pubkey?: string;
            variant?: string;
            category?: "certificate";
            header?: {
                signature?: string;
            };
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    data?: any;
    _id?: string;
    created_at?: Date;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
    category?: "statement";
    header?: {
        certificates?: {
            data?: any;
            _id?: string;
            created_at?: Date;
            is_encrypted?: boolean;
            pubkey?: string;
            variant?: string;
            category?: "certificate";
            header?: {
                signature?: string;
            };
        }[];
    };
}, {
    data?: any;
    _id?: string;
    created_at?: Date;
    is_encrypted?: boolean;
    pubkey?: string;
    variant?: string;
    category?: "statement";
    header?: {
        certificates?: {
            data?: any;
            _id?: string;
            created_at?: Date;
            is_encrypted?: boolean;
            pubkey?: string;
            variant?: string;
            category?: "certificate";
            header?: {
                signature?: string;
            };
        }[];
    };
}>;
export interface TStatementObj<TData = any> extends z.infer<typeof zStatementObj> {
    data?: TData | string;
}
