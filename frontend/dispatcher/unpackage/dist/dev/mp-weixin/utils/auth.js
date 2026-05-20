"use strict";
const common_vendor = require("../common/vendor.js");
const AUTH_ERROR_MESSAGES = [
  "未登录",
  "登录已失效，请重新登录"
];
const clearDispatcherSession = () => {
  common_vendor.index.removeStorageSync("dispatcherToken");
  common_vendor.index.removeStorageSync("dispatcherCurrentTask");
  common_vendor.index.removeStorageSync("dispatcherUserInfo");
};
const isAuthErrorMessage = (message = "") => {
  const normalizedMessage = String(message || "").trim();
  return AUTH_ERROR_MESSAGES.includes(normalizedMessage);
};
const isUnauthorizedError = (error) => {
  return Boolean(error && error.unauthorized);
};
exports.clearDispatcherSession = clearDispatcherSession;
exports.isAuthErrorMessage = isAuthErrorMessage;
exports.isUnauthorizedError = isUnauthorizedError;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
