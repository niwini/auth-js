type TRestMethodLower = "post" | "get" | "put" | "patch" | "options" | "delete";
type TRestMethodUpper = "POST" | "GET" | "PUT" | "PATH" | "OPTIONS" | "DELETE";
type TRestMethod = TRestMethodLower | TRestMethodUpper;
interface TRemostConfigObject {
    method?: TRestMethod;
    url: string;
    data?: any;
}
type TRemostConfig = string | TRemostConfigObject;
interface TRemostCreateConfig extends Omit<TRemostConfigObject, "url"> {
    baseURL?: string;
}
interface IRemostResponse<TData = any> {
    data: TData;
}
export interface TRemostFunction {
    (config: TRemostConfig): Promise<IRemostResponse>;
    request: <TData = any>(config: TRemostConfig) => Promise<IRemostResponse<TData>>;
    create: (config: TRemostCreateConfig) => TRemostFunction;
}
/**
 * Create the main remost function.
 */
declare const remost: TRemostFunction;
/**
 * Export the main remost function as the default one.
 */
export default remost;
