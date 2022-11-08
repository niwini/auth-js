import url from "url";

import fetch from "cross-fetch";
import _ from "lodash";

//#####################################################
// Types
//#####################################################
type IRestMethodLower = "post" | "get" | "put" | "patch" | "options" | "delete";
type IRestMethodUpper = "POST" | "GET" | "PUT" | "PATH" | "OPTIONS" | "DELETE";
type IRestMethod = IRestMethodLower | IRestMethodUpper;

interface IRemostConfigObject {
  method?: IRestMethod;
  url?: string;
  data?: any;
}

type IRemostConfig = string | IRemostConfigObject;

interface IRemostCreateConfig extends Omit<IRemostConfigObject, "url"> {
  baseURL?: string;
}

interface IRemostResponse<TData = any> {
  data: TData;
}

export interface IRemostFunction {
  (config: IRemostConfig): Promise<IRemostResponse>;

  request: <TData = any>(
    config: IRemostConfig,
  ) => Promise<IRemostResponse<TData>>;

  create: (config: IRemostCreateConfig) => IRemostFunction;
}

//#####################################################
// Main Function
//#####################################################
/**
 * This function creates a new scoped remost function.
 *
 * @param createConfig - The config.
 */
const remostFnCreate = (
  createConfig?: IRemostCreateConfig,
) => {
  /**
   * This function creates a new remost function.
   *
   * @param config - The request config.
   */
  const remostFn: IRemostFunction = (
    config: IRemostConfig,
  ) => remostFn.request(config);

  /**
   * This function creates a new remost function.
   *
   * @param newCreateConfig - The new config to use.
   */
  remostFn.create = (
    newCreateConfig: IRemostCreateConfig,
  ) => remostFnCreate(newCreateConfig);

  /**
   * This function makes a request using remost.
   *
   * @param configOrUrl - The request config or url.
   */
  remostFn.request = async <TData = any>(
    configOrUrl: IRemostConfig,
  ) => {
    const baseConfig = _.isString(configOrUrl)
      ? { url: configOrUrl }
      : configOrUrl;

    const config = _.merge({}, createConfig, baseConfig);

    config.url = config.baseURL
      ? url.resolve(config.baseURL, config.url)
      : config.url;

    const isPlainObjectData = _.isPlainObject(config.data);

    const headers: {
      [key: string]: string;
    } = {};

    if (isPlainObjectData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(config.url, {
      body: isPlainObjectData
        ? JSON.stringify(config.data)
        : config.data,
      headers,
      method: config.method,
    });

    const data: TData = await response.json();

    return {
      data,
    };
  };

  return remostFn;
};

/**
 * Create the main remost function.
 */
const remost = remostFnCreate();

/**
 * Export the main remost function as the default one.
 */
export default remost;
