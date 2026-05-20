"use strict";
const PLACEHOLDER_DISPLAY_NAMES = ["调度员", "访客调度员", "已登录调度员"];
const pickText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};
const pickCount = (...values) => {
  for (const value of values) {
    if (value === 0 || value === "0") {
      return "0";
    }
    if (value !== void 0 && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "0";
};
const pickDisplayName = (...values) => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }
    const normalizedValue = value.trim();
    if (!normalizedValue || PLACEHOLDER_DISPLAY_NAMES.includes(normalizedValue)) {
      continue;
    }
    return normalizedValue;
  }
  return "";
};
const getDispatcherDisplayName = (data = {}, fallback = {}) => {
  return pickDisplayName(
    data.name,
    data.username,
    data.email,
    fallback.name,
    fallback.username,
    fallback.email
  );
};
const normalizeDispatcherUserInfo = (data = {}, fallback = {}) => {
  return {
    id: data.id ?? fallback.id ?? "",
    name: getDispatcherDisplayName(data, fallback),
    email: pickText(data.email, fallback.email),
    areaName: pickText(data.areaName, fallback.areaName),
    todayDispatchedNum: pickCount(data.todayDispatchedNum, fallback.todayDispatchedNum)
  };
};
exports.getDispatcherDisplayName = getDispatcherDisplayName;
exports.normalizeDispatcherUserInfo = normalizeDispatcherUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/dispatcherUser.js.map
