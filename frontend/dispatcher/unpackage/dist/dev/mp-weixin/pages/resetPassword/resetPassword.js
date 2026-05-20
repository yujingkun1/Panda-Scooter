"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const common_assets = require("../../common/assets.js");
const DEFAULT_FORM = () => ({
  email: "",
  verificationCode: "",
  newPassword: "",
  showPassword: false
});
const clearDispatcherSession = () => {
  common_vendor.index.removeStorageSync("dispatcherToken");
  common_vendor.index.removeStorageSync("dispatcherUserInfo");
  common_vendor.index.removeStorageSync("dispatcherCurrentTask");
};
const _sfc_main = {
  data() {
    return {
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
      isSendingCode: false,
      isSubmitting: false
    };
  },
  onLoad(options) {
    this.resetPageState();
    if (options && options.email) {
      this.form.email = decodeURIComponent(options.email);
    }
  },
  onUnload() {
    this.clearTimer();
  },
  methods: {
    resetPageState() {
      this.form = DEFAULT_FORM();
      this.clearTimer();
      this.countdown = 0;
      this.isSendingCode = false;
      this.isSubmitting = false;
    },
    togglePasswordVisibility() {
      this.form.showPassword = !this.form.showPassword;
    },
    goLogin() {
      common_vendor.index.reLaunch({
        url: "/pages/login/login?mode=login"
      });
    },
    async sendCode() {
      if (!this.form.email) {
        common_vendor.index.showToast({
          title: "请输入邮箱",
          icon: "none"
        });
        return;
      }
      if (this.isSendingCode) {
        return;
      }
      this.isSendingCode = true;
      try {
        await api_modules_user.getVerificationCode(this.form.email);
        common_vendor.index.showToast({
          title: "验证码已发送",
          icon: "success"
        });
        this.startCountdown();
      } catch (error) {
      } finally {
        this.isSendingCode = false;
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
    async submit() {
      if (!this.form.email) {
        common_vendor.index.showToast({
          title: "请输入邮箱",
          icon: "none"
        });
        return;
      }
      if (!this.form.verificationCode || !this.form.newPassword) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      if (!this.isStrongPassword(this.form.newPassword)) {
        common_vendor.index.showToast({
          title: "密码至少 6 位，且必须包含字母和数字",
          icon: "none"
        });
        return;
      }
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;
      try {
        common_vendor.index.showLoading({
          title: "提交中..."
        });
        await api_modules_user.dispatcherPassword({
          verificationCode: this.form.verificationCode,
          newPassword: this.form.newPassword
        });
        common_vendor.index.hideLoading();
        clearDispatcherSession();
        common_vendor.index.showToast({
          title: "密码重置成功",
          icon: "success"
        });
        setTimeout(() => {
          this.goLogin();
        }, 800);
      } catch (error) {
        common_vendor.index.hideLoading();
      } finally {
        this.isSubmitting = false;
      }
    },
    isStrongPassword(password) {
      const value = String(password || "").trim();
      return value.length >= 6 && /[A-Za-z]/.test(value) && /\d/.test(value);
    },
    getPasswordStatusText(password) {
      return this.isStrongPassword(password) ? "密码格式已通过" : "密码至少 6 位，且必须同时包含字母和数字";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.form.email,
    c: common_vendor.o(common_vendor.m(($event) => $data.form.email = $event.detail.value, {
      trim: true
    }), "a8"),
    d: $data.form.verificationCode,
    e: common_vendor.o(common_vendor.m(($event) => $data.form.verificationCode = $event.detail.value, {
      trim: true
    }), "f3"),
    f: common_vendor.t($data.isSendingCode ? "发送中..." : $data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    g: $data.countdown > 0 || $data.isSendingCode,
    h: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "a9"),
    i: !$data.form.showPassword,
    j: $data.form.newPassword,
    k: common_vendor.o(common_vendor.m(($event) => $data.form.newPassword = $event.detail.value, {
      trim: true
    }), "c8"),
    l: $data.form.showPassword ? "/static/eye-open.svg" : "/static/eye-closed.svg",
    m: common_vendor.o((...args) => $options.togglePasswordVisibility && $options.togglePasswordVisibility(...args), "c5"),
    n: common_vendor.t($options.getPasswordStatusText($data.form.newPassword)),
    o: $options.isStrongPassword($data.form.newPassword) ? 1 : "",
    p: common_vendor.t($data.isSubmitting ? "提交中..." : "确认重置"),
    q: $data.isSubmitting,
    r: common_vendor.o((...args) => $options.submit && $options.submit(...args), "5c"),
    s: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "32")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/resetPassword/resetPassword.js.map
