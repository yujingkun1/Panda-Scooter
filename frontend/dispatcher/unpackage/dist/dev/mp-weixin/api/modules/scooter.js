"use strict";
const api_request = require("../request.js");
const unlockScooter = (code) => {
  return api_request.request({
    url: "/scooter/unlock",
    method: "POST",
    params: {
      apifoxApiId: "431533355"
    },
    data: {
      code
    }
  });
};
const lockScooter = (data) => {
  return api_request.request({
    url: "/scooter/lock",
    method: "POST",
    params: {
      apifoxApiId: "431532462"
    },
    data
  });
};
const getScooterInfo = (code) => {
  return api_request.request({
    url: "/scooter/info",
    method: "GET",
    params: {
      code
    }
  });
};
exports.getScooterInfo = getScooterInfo;
exports.lockScooter = lockScooter;
exports.unlockScooter = unlockScooter;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/api/modules/scooter.js.map
