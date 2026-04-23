"use strict";
const common_vendor = require("../common/vendor.js");
const api_env = require("./env.js");
const isAbsoluteUrl = (url) => /^https?:\/\//.test(url);
const isSuccessCode = (code) => ["0", "200"].includes(String(code));
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
const resolveErrorMessage = (payload, fallback) => {
  if (payload && typeof payload.msg === "string" && payload.msg.trim()) {
    return payload.msg.trim();
  }
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return "请求失败";
};
const showRequestError = (message) => {
  if (typeof common_vendor.index.hideLoading === "function") {
    common_vendor.index.hideLoading();
  }
  setTimeout(() => {
    common_vendor.index.showToast({
      title: message,
      icon: "none"
    });
  }, 50);
};
const rejectWithMessage = (reject, message, extra = {}) => {
  showRequestError(message);
  const error = new Error(message);
  Object.assign(error, { handled: true }, extra);
  reject(error);
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
      const message = `${apiConfig.label} API 地址未配置`;
      rejectWithMessage(reject, message);
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
        if (statusCode < 200 || statusCode >= 300) {
          const message = resolveErrorMessage(data, `请求失败: ${statusCode}`);
          rejectWithMessage(reject, message, { statusCode, data });
          return;
        }
        if (data && typeof data.code !== "undefined" && !isSuccessCode(data.code)) {
          const message = resolveErrorMessage(data);
          rejectWithMessage(reject, message, { statusCode, data, code: data.code });
          return;
        }
        resolve(data);
      },
      fail: (err) => {
        const message = resolveErrorMessage(null, err && err.errMsg ? err.errMsg : "网络异常");
        rejectWithMessage(reject, message, { cause: err });
      }
    });
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/request.js.map
