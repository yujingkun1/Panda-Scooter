"use strict";
const common_vendor = require("../common/vendor.js");
const API_ENV_STORAGE_KEY = "dispatcherApiEnv";
const DEFAULT_API_ENV = "mock";
const API_ENVS = Object.freeze({
  mock: {
    key: "mock",
    label: "Mock",
    baseURL: "http://127.0.0.1:4523/m1/7776188-7522280-7128400"
  },
  test: {
    key: "test",
    label: "Test",
    baseURL: ""
  },
  prod: {
    key: "prod",
    label: "Production",
    baseURL: ""
  }
});
const hasStorage = () => typeof common_vendor.index !== "undefined" && typeof common_vendor.index.getStorageSync === "function";
const isValidApiEnv = (env) => Boolean(API_ENVS[env]);
const normalizeApiEnv = (env) => isValidApiEnv(env) ? env : DEFAULT_API_ENV;
const getCurrentApiEnv = () => {
  if (!hasStorage()) {
    return DEFAULT_API_ENV;
  }
  return normalizeApiEnv(common_vendor.index.getStorageSync(API_ENV_STORAGE_KEY));
};
const getApiConfig = (env = getCurrentApiEnv()) => {
  return API_ENVS[normalizeApiEnv(env)];
};
const getApiBaseURL = (env = getCurrentApiEnv()) => {
  return getApiConfig(env).baseURL;
};
exports.getApiBaseURL = getApiBaseURL;
exports.getApiConfig = getApiConfig;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/env.js.map
