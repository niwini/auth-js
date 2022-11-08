declare type IRestMethodLower = "post" | "get" | "put" | "patch" | "options" | "delete";
declare type IRestMethodUpper = "POST" | "GET" | "PUT" | "PATH" | "OPTIONS" | "DELETE";
declare type IRestMethod = IRestMethodLower | IRestMethodUpper;
interface IRemostConfigObject {
    method?: IRestMethod;
    url?: string;
    data?: any;
}
declare type IRemostConfig = string | IRemostConfigObject;
interface IRemostCreateConfig extends Omit<IRemostConfigObject, "url"> {
    baseURL?: string;
}
interface IRemostResponse<TData = any> {
    data: TData;
}
export interface IRemostFunction {
    (config: IRemostConfig): Promise<IRemostResponse>;
    request: <TData = any>(config: IRemostConfig) => Promise<IRemostResponse<TData>>;
    create: (config: IRemostCreateConfig) => IRemostFunction;
}
/**
 * Create the main remost function.
 */
declare const remost: IRemostFunction;
/**
 * Export the main remost function as the default one.
 */
export default remost;
