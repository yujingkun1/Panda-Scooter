"use strict";
const api_request = require("../request.js");
const USER_API_IDS = {
  signin: "431525072",
  login: "417608702",
  logout: "431523613",
  delete: "431525046",
  verification: "431525082",
  password: "431525408",
  info: "431534226"
};
const dispatcherSignin = (data) => {
  return api_request.request({
    url: "/user/signin",
    method: "POST",
    params: {
      apifoxApiId: USER_API_IDS.signin
    },
    data
  });
};
const dispatcherLogin = (data) => {
  return api_request.request({
    url: "/user/login",
    method: "POST",
    params: {
      apifoxApiId: USER_API_IDS.login
    },
    data
  });
};
const dispatcherLogout = () => {
  return api_request.request({
    url: "/user/logout",
    method: "POST",
    params: {
      apifoxApiId: USER_API_IDS.logout
    }
  });
};
const dispatcherDelete = (data) => {
  return api_request.request({
    url: "/user/delete",
    method: "DELETE",
    params: {
      apifoxApiId: USER_API_IDS.delete
    },
    data
  });
};
const getVerificationCode = (email) => {
  return api_request.request({
    url: "/user/verification",
    method: "GET",
    params: {
      email,
      apifoxApiId: USER_API_IDS.verification
    }
  });
};
const dispatcherPassword = (data) => {
  return api_request.request({
    url: "/user/password",
    method: "POST",
    params: {
      apifoxApiId: USER_API_IDS.password
    },
    data
  });
};
const getDispatcherInfo = () => {
  return api_request.request({
    url: "/user/info",
    method: "GET",
    params: {
      apifoxApiId: USER_API_IDS.info
    }
  });
};
const getDispatchHistory = () => {
  return api_request.request({
    url: "/user/dispatch-history",
    method: "GET"
  });
};
exports.dispatcherDelete = dispatcherDelete;
exports.dispatcherLogin = dispatcherLogin;
exports.dispatcherLogout = dispatcherLogout;
exports.dispatcherPassword = dispatcherPassword;
exports.dispatcherSignin = dispatcherSignin;
exports.getDispatchHistory = getDispatchHistory;
exports.getDispatcherInfo = getDispatcherInfo;
exports.getVerificationCode = getVerificationCode;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/api/modules/user.js.map
