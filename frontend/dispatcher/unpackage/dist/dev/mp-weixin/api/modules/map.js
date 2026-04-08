"use strict";
const api_request = require("../request.js");
const getMapData = (params) => {
  return api_request.request({
    url: "/map",
    method: "GET",
    params: {
      ...params,
      apifoxApiId: "431523493"
    }
  });
};
exports.getMapData = getMapData;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/api/modules/map.js.map
