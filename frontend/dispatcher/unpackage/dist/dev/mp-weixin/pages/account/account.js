"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const DEFAULT_USER_INFO = {
  name: "访客调度员",
  email: "未登录"
};
const DEFAULT_DELETE_FORM = () => ({
  password: "",
  verificationCode: ""
});
const _sfc_main = {
  data() {
    return {
      userInfo: { ...DEFAULT_USER_INFO },
      deleteForm: DEFAULT_DELETE_FORM(),
      countdown: 0,
      timer: null
    };
  },
  onShow() {
    const token = common_vendor.index.getStorageSync("dispatcherToken");
    if (!token) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login?mode=login"
      });
      return;
    }
    this.loadUserInfo();
  },
  onUnload() {
    this.clearTimer();
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await api_modules_user.getDispatcherInfo();
        const data = res.data || {};
        this.userInfo = {
          name: data.name || DEFAULT_USER_INFO.name,
          email: data.email || DEFAULT_USER_INFO.email
        };
      } catch (error) {
        const cached = common_vendor.index.getStorageSync("dispatcherUserInfo") || {};
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...cached
        };
      }
    },
    async sendDeleteCode() {
      if (!this.userInfo.email || this.userInfo.email === DEFAULT_USER_INFO.email) {
        common_vendor.index.showToast({
          title: "当前账号没有可用邮箱",
          icon: "none"
        });
        return;
      }
      try {
        await api_modules_user.getVerificationCode(this.userInfo.email);
        common_vendor.index.showToast({
          title: "验证码已发送",
          icon: "success"
        });
        this.startCountdown();
      } catch (error) {
      }
    },
    startCountdown() {
      this.clearTimer();
      this.countdown = 60;
      this.timer = setInterval(() => {
        if (this.countdown <= 1) {
          this.clearTimer();
          this.countdown = 0;
          return;
        }
        this.countdown -= 1;
      }, 1e3);
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    async logout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定退出当前调度账号吗？",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          try {
            await api_modules_user.dispatcherLogout();
          } catch (error) {
          }
          common_vendor.index.removeStorageSync("dispatcherToken");
          common_vendor.index.removeStorageSync("dispatcherUserInfo");
          common_vendor.index.removeStorageSync("dispatcherCurrentTask");
          common_vendor.index.showToast({
            title: "已退出登录",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/login/login?mode=login"
            });
          }, 800);
        }
      });
    },
    async deleteAccount() {
      if (!this.deleteForm.password || !this.deleteForm.verificationCode) {
        common_vendor.index.showToast({
          title: "请填写密码和验证码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "账号注销",
        content: "注销后将退出当前登录状态，确认继续吗？",
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          try {
            common_vendor.index.showLoading({
              title: "注销中..."
            });
            await api_modules_user.dispatcherDelete({
              password: this.deleteForm.password,
              verificationCode: this.deleteForm.verificationCode
            });
            common_vendor.index.hideLoading();
            common_vendor.index.removeStorageSync("dispatcherToken");
            common_vendor.index.removeStorageSync("dispatcherUserInfo");
            common_vendor.index.removeStorageSync("dispatcherCurrentTask");
            common_vendor.index.showToast({
              title: "账号已注销",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/login/login?mode=login"
              });
            }, 800);
          } catch (error) {
            common_vendor.index.hideLoading();
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.userInfo.name),
    b: common_vendor.t($data.userInfo.email),
    c: common_vendor.o((...args) => $options.logout && $options.logout(...args), "dc"),
    d: $data.deleteForm.password,
    e: common_vendor.o(common_vendor.m(($event) => $data.deleteForm.password = $event.detail.value, {
      trim: true
    }), "d7"),
    f: $data.deleteForm.verificationCode,
    g: common_vendor.o(common_vendor.m(($event) => $data.deleteForm.verificationCode = $event.detail.value, {
      trim: true
    }), "fb"),
    h: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    i: $data.countdown > 0,
    j: common_vendor.o((...args) => $options.sendDeleteCode && $options.sendDeleteCode(...args), "0a"),
    k: common_vendor.o((...args) => $options.deleteAccount && $options.deleteAccount(...args), "79")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/account.js.map
