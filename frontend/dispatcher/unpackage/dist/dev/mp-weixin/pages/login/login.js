"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const common_assets = require("../../common/assets.js");
const MODE_META = {
  login: {
    title: "登录调度账号",
    subtitle: "进入调度控制台执行车辆调度",
    submitText: "立即登录"
  },
  signup: {
    title: "注册调度账号",
    subtitle: "使用邮箱创建新的调度员账户",
    submitText: "完成注册"
  }
};
const DEFAULT_FORM = () => ({
  name: "",
  email: "",
  password: "",
  verificationCode: ""
});
const _sfc_main = {
  data() {
    return {
      mode: "login",
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
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
          title: "请先输入邮箱",
          icon: "none"
        });
        return;
      }
      try {
        await api_modules_user.getVerificationCode(this.form.email);
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
          title: "请填写完整注册信息",
          icon: "none"
        });
        return;
      }
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
          if (data.token) {
            common_vendor.index.setStorageSync("dispatcherToken", data.token);
          }
          common_vendor.index.setStorageSync("dispatcherUserInfo", {
            id: data.id || "",
            name: data.name || "调度员",
            email: data.email || this.form.email
          });
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
          title: "注册成功，请登录",
          icon: "success"
        });
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
    m: $data.form.verificationCode,
    n: common_vendor.o(common_vendor.m(($event) => $data.form.verificationCode = $event.detail.value, {
      trim: true
    }), "2f"),
    o: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    p: $data.countdown > 0,
    q: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "c6")
  } : {}, {
    r: common_vendor.t($options.submitText),
    s: common_vendor.o((...args) => $options.submit && $options.submit(...args), "1c"),
    t: $data.mode === "login"
  }, $data.mode === "login" ? {
    v: common_vendor.o(($event) => $options.switchMode("signup"), "58")
  } : {}, {
    w: $data.mode !== "login"
  }, $data.mode !== "login" ? {
    x: common_vendor.o(($event) => $options.switchMode("login"), "6c")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
