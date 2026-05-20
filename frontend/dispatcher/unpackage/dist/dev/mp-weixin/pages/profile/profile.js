"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const api_modules_user = require("../../api/modules/user.js");
const utils_dispatcherUser = require("../../utils/dispatcherUser.js");
const common_assets = require("../../common/assets.js");
const DEFAULT_USER_INFO = {
  name: "",
  email: "未登录",
  areaName: "--",
  todayDispatchedNum: "0"
};
const _sfc_main = {
  data() {
    return {
      hasToken: false,
      userInfo: { ...DEFAULT_USER_INFO }
    };
  },
  onShow() {
    this.hasToken = Boolean(common_vendor.index.getStorageSync("dispatcherToken"));
    this.loadUserInfo();
  },
  methods: {
    async loadUserInfo() {
      if (!this.hasToken) {
        this.userInfo = { ...DEFAULT_USER_INFO };
        return;
      }
      const cached = common_vendor.index.getStorageSync("dispatcherUserInfo") || {};
      try {
        const res = await api_modules_user.getDispatcherInfo();
        const data = res.data || {};
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...utils_dispatcherUser.normalizeDispatcherUserInfo(data, cached)
        };
        common_vendor.index.setStorageSync("dispatcherUserInfo", this.userInfo);
      } catch (error) {
        this.hasToken = Boolean(common_vendor.index.getStorageSync("dispatcherToken"));
        this.userInfo = { ...DEFAULT_USER_INFO };
        if (utils_auth.isUnauthorizedError(error)) {
          return;
        }
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...utils_dispatcherUser.normalizeDispatcherUserInfo(cached)
        };
      }
    },
    openAccount() {
      if (!this.hasToken) {
        this.goLogin("login");
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/account/account"
      });
    },
    goLogin(mode) {
      common_vendor.index.navigateTo({
        url: `/pages/login/login?mode=${mode}`
      });
    },
    navigateTo(page) {
      if (!this.hasToken) {
        this.goLogin("login");
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/${page}/${page}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.t($data.userInfo.name || "未登录"),
    c: common_vendor.t($data.userInfo.email),
    d: common_vendor.o((...args) => $options.openAccount && $options.openAccount(...args), "e5"),
    e: common_vendor.t($data.userInfo.areaName),
    f: common_vendor.t($data.userInfo.todayDispatchedNum),
    g: !$data.hasToken
  }, !$data.hasToken ? {
    h: common_vendor.o(($event) => $options.goLogin("login"), "fa")
  } : {}, {
    i: common_vendor.o(($event) => $options.navigateTo("history"), "b4")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
