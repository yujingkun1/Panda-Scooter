"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const common_assets = require("../../common/assets.js");
const MODE_META = {
  login: {
    title: "Dispatcher Sign In",
    subtitle: "Access the dispatch console",
    submitText: "Sign In"
  },
  signup: {
    title: "Create Dispatcher Account",
    subtitle: "Register a new dispatcher identity",
    submitText: "Register"
  },
  "forgot-password": {
    title: "Reset Password",
    subtitle: "Reset account password by email code",
    submitText: "Confirm Reset"
  }
};
const DEFAULT_FORM = () => ({
  name: "",
  email: "",
  password: "",
  verificationCode: "",
  newPassword: ""
});
const _sfc_main = {
  data() {
    return {
      mode: "login",
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
      tabs: [
        { mode: "login", label: "Login" },
        { mode: "signup", label: "Signup" },
        { mode: "forgot-password", label: "Reset" }
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
      this.form.email = options.email;
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
    },
    async sendCode() {
      if (!this.form.email) {
        common_vendor.index.showToast({
          title: "Enter email first",
          icon: "none"
        });
        return;
      }
      try {
        await api_modules_user.getVerificationCode(this.form.email);
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
    async submit() {
      if (!this.form.email) {
        common_vendor.index.showToast({
          title: "Email is required",
          icon: "none"
        });
        return;
      }
      if (this.mode === "login" && !this.form.password) {
        common_vendor.index.showToast({
          title: "Password is required",
          icon: "none"
        });
        return;
      }
      if (this.mode === "signup" && (!this.form.name || !this.form.password || !this.form.verificationCode)) {
        common_vendor.index.showToast({
          title: "Complete the signup form",
          icon: "none"
        });
        return;
      }
      if (this.mode === "forgot-password" && (!this.form.verificationCode || !this.form.newPassword)) {
        common_vendor.index.showToast({
          title: "Complete the reset form",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "Submitting..."
        });
        if (this.mode === "login") {
          const res = await api_modules_user.dispatcherLogin({
            email: this.form.email,
            password: this.form.password
          });
          const data = res.data || {};
          if (data.token) {
            common_vendor.index.setStorageSync("dispatcherToken", data.token);
          }
          common_vendor.index.setStorageSync("dispatcherUserInfo", {
            id: data.id || "",
            name: data.name || "Dispatcher",
            email: data.email || this.form.email
          });
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "Signed in",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/profile/profile"
            });
          }, 800);
          return;
        }
        if (this.mode === "signup") {
          const email2 = this.form.email;
          await api_modules_user.dispatcherSignin({
            name: this.form.name,
            email: this.form.email,
            password: this.form.password,
            verificationCode: this.form.verificationCode
          });
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "Registered",
            icon: "success"
          });
          this.switchMode("login");
          this.form.email = email2;
          return;
        }
        await api_modules_user.dispatcherPassword({
          verificationCode: this.form.verificationCode,
          newPassword: this.form.newPassword
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "Password updated",
          icon: "success"
        });
        const email = this.form.email;
        this.switchMode("login");
        this.form.email = email;
      } catch (error) {
        common_vendor.index.hideLoading();
      }
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
    }), "e6")
  } : {}, {
    h: $data.form.email,
    i: common_vendor.o(common_vendor.m(($event) => $data.form.email = $event.detail.value, {
      trim: true
    }), "fe"),
    j: $data.mode !== "forgot-password"
  }, $data.mode !== "forgot-password" ? {
    k: $data.form.password,
    l: common_vendor.o(common_vendor.m(($event) => $data.form.password = $event.detail.value, {
      trim: true
    }), "2e")
  } : {}, {
    m: $data.mode === "forgot-password"
  }, $data.mode === "forgot-password" ? {
    n: $data.form.newPassword,
    o: common_vendor.o(common_vendor.m(($event) => $data.form.newPassword = $event.detail.value, {
      trim: true
    }), "77")
  } : {}, {
    p: $data.mode !== "login"
  }, $data.mode !== "login" ? {
    q: $data.form.verificationCode,
    r: common_vendor.o(common_vendor.m(($event) => $data.form.verificationCode = $event.detail.value, {
      trim: true
    }), "cc"),
    s: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "Get Code"),
    t: $data.countdown > 0,
    v: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "72")
  } : {}, {
    w: common_vendor.t($options.submitText),
    x: common_vendor.o((...args) => $options.submit && $options.submit(...args), "0a"),
    y: $data.mode === "login"
  }, $data.mode === "login" ? {
    z: common_vendor.o(($event) => $options.switchMode("signup"), "ea")
  } : {}, {
    A: $data.mode === "login"
  }, $data.mode === "login" ? {} : {}, {
    B: $data.mode === "login"
  }, $data.mode === "login" ? {
    C: common_vendor.o(($event) => $options.switchMode("forgot-password"), "ad")
  } : {}, {
    D: $data.mode !== "login"
  }, $data.mode !== "login" ? {
    E: common_vendor.o(($event) => $options.switchMode("login"), "be")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
