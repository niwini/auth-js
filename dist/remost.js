"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const lodash_1 = __importDefault(require("lodash"));
//#####################################################
// Main Function
//#####################################################
/**
 * This function creates a new scoped remost function.
 *
 * @param createConfig - The config.
 */
const remostFnCreate = (createConfig) => {
    /**
     * This function creates a new remost function.
     *
     * @param config - The request config.
     */
    const remostFn = (config) => remostFn.request(config);
    /**
     * This function creates a new remost function.
     *
     * @param newCreateConfig - The new config to use.
     */
    remostFn.create = (newCreateConfig) => remostFnCreate(newCreateConfig);
    /**
     * This function makes a request using remost.
     *
     * @param configOrUrl - The request config or url.
     */
    remostFn.request = async (configOrUrl) => {
        const baseConfig = lodash_1.default.isString(configOrUrl)
            ? { url: configOrUrl }
            : configOrUrl;
        const config = lodash_1.default.merge({}, createConfig, baseConfig);
        config.url = config.baseURL
            ? url_1.default.resolve(config.baseURL, config.url)
            : config.url;
        const isPlainObjectData = lodash_1.default.isPlainObject(config.data);
        const headers = {};
        if (isPlainObjectData) {
            headers["Content-Type"] = "application/json";
        }
        const response = await (0, cross_fetch_1.default)(config.url, {
            body: isPlainObjectData
                ? JSON.stringify(config.data)
                : config.data,
            headers,
            method: config.method,
        });
        const data = await response.json();
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
exports.default = remost;
//# sourceMappingURL=remost.js.map