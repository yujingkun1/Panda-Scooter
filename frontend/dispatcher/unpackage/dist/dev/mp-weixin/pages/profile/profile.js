"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const common_assets = require("../../common/assets.js");
const DEFAULT_USER_INFO = {
  name: "访客调度员",
  email: "未登录",
  areaName: "未分配辖区",
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
      try {
        const res = await api_modules_user.getDispatcherInfo();
        const data = res.data || {};
        this.userInfo = {
          name: data.name || DEFAULT_USER_INFO.name,
          email: data.email || DEFAULT_USER_INFO.email,
          areaName: data.areaName || DEFAULT_USER_INFO.areaName,
          todayDispatchedNum: String(data.todayDispatchedNum || "0")
        };
        common_vendor.index.setStorageSync("dispatcherUserInfo", this.userInfo);
      } catch (error) {
        const cached = common_vendor.index.getStorageSync("dispatcherUserInfo") || {};
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...cached
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
    b: common_vendor.t($data.userInfo.name),
    c: common_vendor.t($data.userInfo.email),
    d: common_vendor.o((...args) => $options.openAccount && $options.openAccount(...args), "e8"),
    e: common_vendor.t($data.userInfo.areaName),
    f: common_vendor.t($data.userInfo.todayDispatchedNum),
    g: !$data.hasToken
  }, !$data.hasToken ? {
    h: common_vendor.o(($event) => $options.goLogin("login"), "b4")
  } : {}, {
    i: common_vendor.o(($event) => $options.navigateTo("unlock"), "11"),
    j: common_vendor.o(($event) => $options.navigateTo("lock"), "90"),
    k: common_vendor.o(($event) => $options.navigateTo("history"), "a0")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
