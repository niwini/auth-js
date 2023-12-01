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
        signature?: string | undefined;
    }, {
        signature?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    header: {
        signature?: string | undefined;
    };
    _id: string;
    category: "certificate";
    created_at: Date;
    is_encrypted: boolean;
    pubkey: string;
    data?: any;
    variant?: string | undefined;
}, {
    header: {
        signature?: string | undefined;
    };
    _id: string;
    category: "certificate";
    created_at: Date;
    is_encrypted: boolean;
    pubkey: string;
    data?: any;
    variant?: string | undefined;
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
                signature?: string | undefined;
            }, {
                signature?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            header: {
                signature?: string | undefined;
            };
            _id: string;
            category: "certificate";
            created_at: Date;
            is_encrypted: boolean;
            pubkey: string;
            data?: any;
            variant?: string | undefined;
        }, {
            header: {
                signature?: string | undefined;
            };
            _id: string;
            category: "certificate";
            created_at: Date;
            is_encrypted: boolean;
            pubkey: string;
            data?: any;
            variant?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        certificates: {
            header: {
                signature?: string | undefined;
            };
            _id: string;
            category: "certificate";
            created_at: Date;
            is_encrypted: boolean;
            pubkey: string;
            data?: any;
            variant?: string | undefined;
        }[];
    }, {
        certificates: {
            header: {
                signature?: string | undefined;
            };
            _id: string;
            category: "certificate";
            created_at: Date;
            is_encrypted: boolean;
            pubkey: string;
            data?: any;
            variant?: string | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    header: {
        certificates: {
            header: {
                signature?: string | undefined;
            };
            _id: string;
            category: "certificate";
            created_at: Date;
            is_encrypted: boolean;
            pubkey: string;
            data?: any;
            variant?: string | undefined;
        }[];
    };
    _id: string;
    category: "statement";
    created_at: Date;
    is_encrypted: boolean;
    pubkey: string;
    data?: any;
    variant?: string | undefined;
}, {
    header: {
        certificates: {
            header: {
                signature?: string | undefined;
            };
            _id: string;
            category: "certificate";
            created_at: Date;
            is_encrypted: boolean;
            pubkey: string;
            data?: any;
            variant?: string | undefined;
        }[];
    };
    _id: string;
    category: "statement";
    created_at: Date;
    is_encrypted: boolean;
    pubkey: string;
    data?: any;
    variant?: string | undefined;
}>;
export interface TStatementObj<TData = any> extends z.infer<typeof zStatementObj> {
    data?: TData | string;
}
//# sourceMappingURL=statement.types.d.ts.map