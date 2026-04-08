"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const DEFAULT_USER_INFO = {
  name: "Guest Dispatcher",
  email: "Not signed in"
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
    goToForgotPassword() {
      common_vendor.index.navigateTo({
        url: `/pages/login/login?mode=forgot-password&email=${encodeURIComponent(this.userInfo.email)}`
      });
    },
    async sendDeleteCode() {
      if (!this.userInfo.email || this.userInfo.email === DEFAULT_USER_INFO.email) {
        common_vendor.index.showToast({
          title: "No email is available",
          icon: "none"
        });
        return;
      }
      try {
        await api_modules_user.getVerificationCode(this.userInfo.email);
        common_vendor.index.showToast({
          title: "Code sent",
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
        title: "Sign Out",
        content: "Do you want to sign out of the dispatcher account?",
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
          common_vendor.index.showToast({
            title: "Signed out",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }, 800);
        }
      });
    },
    async deleteAccount() {
      if (!this.deleteForm.password || !this.deleteForm.verificationCode) {
        common_vendor.index.showToast({
          title: "Fill password and code",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "Delete Account",
        content: "Deleting the account will also clear the current sign-in state. Continue?",
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          try {
            common_vendor.index.showLoading({
              title: "Deleting..."
            });
            await api_modules_user.dispatcherDelete({
              password: this.deleteForm.password,
              verificationCode: this.deleteForm.verificationCode
            });
            common_vendor.index.hideLoading();
            common_vendor.index.removeStorageSync("dispatcherToken");
            common_vendor.index.removeStorageSync("dispatcherUserInfo");
            common_vendor.index.showToast({
              title: "Account deleted",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/index/index"
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
    c: common_vendor.o((...args) => $options.goToForgotPassword && $options.goToForgotPassword(...args), "68"),
    d: common_vendor.o((...args) => $options.logout && $options.logout(...args), "68"),
    e: $data.deleteForm.password,
    f: common_vendor.o(common_vendor.m(($event) => $data.deleteForm.password = $event.detail.value, {
      trim: true
    }), "9b"),
    g: $data.deleteForm.verificationCode,
    h: common_vendor.o(common_vendor.m(($event) => $data.deleteForm.verificationCode = $event.detail.value, {
      trim: true
    }), "eb"),
    i: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "Get Code"),
    j: $data.countdown > 0,
    k: common_vendor.o((...args) => $options.sendDeleteCode && $options.sendDeleteCode(...args), "55"),
    l: common_vendor.o((...args) => $options.deleteAccount && $options.deleteAccount(...args), "8f")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/account.js.map
