"use strict";
const common_vendor = require("../common/vendor.js");
const api_env = require("./env.js");
const isAbsoluteUrl = (url) => /^https?:\/\//.test(url);
const isSuccessCode = (code) => ["0", "1", "200"].includes(String(code));
const serializeParams = (params = {}) => {
  return Object.keys(params).filter((key) => params[key] !== void 0 && params[key] !== null && params[key] !== "").map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
};
const buildUrl = (url, params, baseURL) => {
  const normalizedUrl = isAbsoluteUrl(url) ? url : `${baseURL}${url.startsWith("/") ? url : `/${url}`}`;
  const queryString = serializeParams(params);
  if (!queryString) {
    return normalizedUrl;
  }
  return `${normalizedUrl}${normalizedUrl.includes("?") ? "&" : "?"}${queryString}`;
};
const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      params,
      baseURL: customBaseURL,
      env,
      header = {},
      method = "GET",
      ...rest
    } = options;
    const resolvedBaseURL = customBaseURL || api_env.getApiBaseURL(env);
    if (!isAbsoluteUrl(url) && !resolvedBaseURL) {
      const apiConfig = api_env.getApiConfig(env);
      const message = `${apiConfig.label} API URL is not configured`;
      common_vendor.index.showToast({
        title: message,
        icon: "none"
      });
      reject(new Error(message));
      return;
    }
    const config = {
      url: buildUrl(url, params, resolvedBaseURL),
      method,
      timeout: 1e4,
      header: {
        "Content-Type": "application/json",
        ...header
      },
      ...rest
    };
    const token = common_vendor.index.getStorageSync("dispatcherToken");
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }
    common_vendor.index.request({
      ...config,
      success: (res) => {
        const { statusCode, data } = res;
        if (statusCode >= 200 && statusCode < 300) {
          if (data && typeof data.code !== "undefined" && !isSuccessCode(data.code)) {
            const message2 = data.msg || "Request failed";
            common_vendor.index.showToast({
              title: message2,
              icon: "none"
            });
            reject(new Error(message2));
            return;
          }
          resolve(data);
          return;
        }
        const message = `Request failed: ${statusCode}`;
        common_vendor.index.showToast({
          title: message,
          icon: "none"
        });
        reject(new Error(message));
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "Network error",
          icon: "none"
        });
        reject(err);
      }
    });
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/request.js.map
