"use strict";
const api_request = require("../request.js");
const LOCK_URL = "https://m1.apifoxmock.com/m1/7776188-7522280-7128400/scooter/lock";
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
    url: LOCK_URL,
    method: "POST",
    params: {
      apifoxApiId: "431532462"
    },
    data
  });
};
exports.lockScooter = lockScooter;
exports.unlockScooter = unlockScooter;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/api/modules/scooter.js.map
