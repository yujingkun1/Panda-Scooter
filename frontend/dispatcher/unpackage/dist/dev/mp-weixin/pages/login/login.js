"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const utils_dispatcherUser = require("../../utils/dispatcherUser.js");
const common_assets = require("../../common/assets.js");
const MODE_META = {
  login: {
    title: "调度员登录",
    subtitle: "登录后可使用调度功能",
    submitText: "登录"
  },
  signup: {
    title: "注册调度员账号",
    subtitle: "使用邮箱验证码完成调度员注册",
    submitText: "注册"
  }
};
const DEFAULT_FORM = () => ({
  name: "",
  email: "",
  password: "",
  verificationCode: "",
  agreedPrivacy: false
});
const _sfc_main = {
  data() {
    return {
      mode: "login",
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
      isSendingCode: false,
      isSubmitting: false,
      tabs: [
        { mode: "login", label: "登录" },
        { mode: "signup", label: "注册" }
      ]
    };
  },
  computed: {
    pageTitle() {
      return MODE_META[this.mode].title;
    },
    pageSubtitle() {
      return MODE_META[this.mode].subtitle;
    },
    submitText() {
      return MODE_META[this.mode].submitText;
    }
  },
  onLoad(options) {
    if (options && MODE_META[options.mode]) {
      this.mode = options.mode;
    }
    if (options && options.email) {
      this.form.email = decodeURIComponent(options.email);
    }
  },
  onUnload() {
    this.clearTimer();
  },
  methods: {
    switchMode(nextMode) {
      this.mode = nextMode;
      this.form = {
        ...DEFAULT_FORM(),
        email: this.form.email
      };
      this.clearTimer();
      this.countdown = 0;
      this.isSendingCode = false;
      this.isSubmitting = false;
    },
    openPrivacyPolicy() {
      common_vendor.index.navigateTo({
        url: "/pages/privacy/privacy"
      });
    },
    togglePrivacyAgreement(event) {
      this.form.agreedPrivacy = Boolean(event && event.detail && Array.isArray(event.detail.value) && event.detail.value.length);
    },
    goResetPassword() {
      const email = encodeURIComponent(this.form.email || "");
      common_vendor.index.navigateTo({
        url: `/pages/resetPassword/resetPassword${email ? `?email=${email}` : ""}`
      });
    },
    async sendCode() {
      if (!this.form.email) {
        common_vendor.index.showToast({
          title: "请先输入邮箱",
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
      if (!this.form.password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      if (this.mode === "signup" && (!this.form.name || !this.form.verificationCode)) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      if (this.mode === "signup" && !this.isStrongPassword(this.form.password)) {
        common_vendor.index.showToast({
          title: "密码至少 6 位，且必须包含字母和数字",
          icon: "none"
        });
        return;
      }
      if (this.mode === "signup" && !this.form.agreedPrivacy) {
        common_vendor.index.showToast({
          title: "请先勾选同意隐私政策",
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
        if (this.mode === "login") {
          const res = await api_modules_user.dispatcherLogin({
            email: this.form.email,
            password: this.form.password
          });
          const data = res.data || {};
          const dispatcherUserInfo = utils_dispatcherUser.normalizeDispatcherUserInfo(data, {
            email: this.form.email
          });
          if (data.token) {
            common_vendor.index.setStorageSync("dispatcherToken", data.token);
          }
          common_vendor.index.setStorageSync("dispatcherUserInfo", dispatcherUserInfo);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }, 800);
          return;
        }
        const email = this.form.email;
        await api_modules_user.dispatcherSignin({
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          verificationCode: this.form.verificationCode
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "注册成功",
          icon: "success"
        });
        this.switchMode("login");
        this.form.email = email;
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
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.t($options.pageTitle),
    c: common_vendor.t($options.pageSubtitle),
    d: common_vendor.f($data.tabs, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.mode,
        c: $data.mode === item.mode ? 1 : "",
        d: common_vendor.o(($event) => $options.switchMode(item.mode), item.mode)
      };
    }),
    e: $data.mode === "signup"
  }, $data.mode === "signup" ? {
    f: $data.form.name,
    g: common_vendor.o(common_vendor.m(($event) => $data.form.name = $event.detail.value, {
      trim: true
    }), "85")
  } : {}, {
    h: $data.form.email,
    i: common_vendor.o(common_vendor.m(($event) => $data.form.email = $event.detail.value, {
      trim: true
    }), "e7"),
    j: $data.form.password,
    k: common_vendor.o(common_vendor.m(($event) => $data.form.password = $event.detail.value, {
      trim: true
    }), "cf"),
    l: $data.mode === "signup"
  }, $data.mode === "signup" ? {
    m: common_vendor.t($options.getPasswordStatusText($data.form.password)),
    n: $options.isStrongPassword($data.form.password) ? 1 : ""
  } : {}, {
    o: $data.mode === "signup"
  }, $data.mode === "signup" ? {
    p: $data.form.verificationCode,
    q: common_vendor.o(common_vendor.m(($event) => $data.form.verificationCode = $event.detail.value, {
      trim: true
    }), "b3"),
    r: common_vendor.t($data.isSendingCode ? "发送中..." : $data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    s: $data.countdown > 0 || $data.isSendingCode,
    t: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "d3")
  } : {}, {
    v: common_vendor.t($data.isSubmitting ? "提交中..." : $options.submitText),
    w: $data.isSubmitting,
    x: common_vendor.o((...args) => $options.submit && $options.submit(...args), "bc"),
    y: $data.mode === "signup"
  }, $data.mode === "signup" ? {
    z: $data.form.agreedPrivacy,
    A: common_vendor.o((...args) => $options.togglePrivacyAgreement && $options.togglePrivacyAgreement(...args), "bb"),
    B: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args), "e4")
  } : {}, {
    C: $data.mode === "login"
  }, $data.mode === "login" ? {
    D: common_vendor.o(($event) => $options.switchMode("signup"), "4e")
  } : {}, {
    E: $data.mode === "login"
  }, $data.mode === "login" ? {
    F: common_vendor.o((...args) => $options.goResetPassword && $options.goResetPassword(...args), "ff")
  } : {}, {
    G: $data.mode !== "login"
  }, $data.mode !== "login" ? {
    H: common_vendor.o(($event) => $options.switchMode("login"), "66")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
