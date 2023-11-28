import url from "url";

import fetch from "cross-fetch";
import _ from "lodash";

//#####################################################
// Types
//#####################################################
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

  request: <TData = any>(
    config: TRemostConfig,
  ) => Promise<IRemostResponse<TData>>;

  create: (config: TRemostCreateConfig) => TRemostFunction;
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
  createConfig?: TRemostCreateConfig,
) => {
  /**
   * This function creates a new remost function.
   *
   * @param config - The request config.
   */
  const remostFn: TRemostFunction = (
    config: TRemostConfig,
  ) => remostFn.request(config);

  /**
   * This function creates a new remost function.
   *
   * @param newCreateConfig - The new config to use.
   */
  remostFn.create = (
    newCreateConfig: TRemostCreateConfig,
  ) => remostFnCreate(newCreateConfig);

  /**
   * This function makes a request using remost.
   *
   * @param configOrUrl - The request config or url.
   */
  remostFn.request = async <TData = any>(
    configOrUrl: TRemostConfig,
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
