"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_scooter = require("../../api/modules/scooter.js");
const _sfc_main = {
  data() {
    return {
      scooterCode: "",
      maxLength: 6,
      isFlashlightOn: false,
      isFlashlightPending: false,
      inputFocused: false,
      keyboardHeight: 0,
      keyboardHeightHandler: null,
      cameraVisible: false,
      cameraFlash: "off",
      isConfirmPending: false
    };
  },
  computed: {
    displayChars() {
      return Array.from({ length: this.maxLength }, (_, index) => this.scooterCode[index] || "");
    },
    canUnlock() {
      return /^\d{6}$/.test(this.scooterCode);
    },
    confirmSectionStyle() {
      return {
        bottom: `${this.keyboardHeight}px`
      };
    }
  },
  onLoad(options) {
    if (!common_vendor.index.getStorageSync("dispatcherToken")) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login?mode=login"
      });
      return;
    }
    if (options && options.code) {
      this.scooterCode = this.extractDigits(decodeURIComponent(options.code));
    }
    this.registerKeyboardHeightListener();
    setTimeout(() => {
      this.inputFocused = true;
    }, 0);
  },
  onHide() {
    this.forceReleaseFlashlight();
  },
  onUnload() {
    this.unregisterKeyboardHeightListener();
    this.forceReleaseFlashlight();
  },
  methods: {
    extractDigits(rawCode) {
      return String(rawCode || "").replace(/\D/g, "").slice(-6);
    },
    normalizeScooterCode(rawCode) {
      const digits = this.extractDigits(rawCode);
      return digits.length === 6 ? `PDSC${digits}` : "";
    },
    focusCodeInput() {
      this.inputFocused = false;
      setTimeout(() => {
        this.inputFocused = true;
      }, 0);
    },
    handleCodeInput(event) {
      this.scooterCode = this.extractDigits(event && event.detail ? event.detail.value : "");
    },
    handleCodeBlur() {
      this.inputFocused = false;
      this.keyboardHeight = 0;
    },
    registerKeyboardHeightListener() {
      if (typeof common_vendor.index.onKeyboardHeightChange !== "function" || this.keyboardHeightHandler) {
        return;
      }
      this.keyboardHeightHandler = (res) => {
        this.keyboardHeight = Math.max(Number(res && res.height) || 0, 0);
      };
      common_vendor.index.onKeyboardHeightChange(this.keyboardHeightHandler);
    },
    unregisterKeyboardHeightListener() {
      if (!this.keyboardHeightHandler || typeof common_vendor.index.offKeyboardHeightChange !== "function") {
        this.keyboardHeightHandler = null;
        return;
      }
      common_vendor.index.offKeyboardHeightChange(this.keyboardHeightHandler);
      this.keyboardHeightHandler = null;
    },
    async toggleFlashlight() {
      if (this.isFlashlightPending) {
        return;
      }
      if (this.isFlashlightOn) {
        this.turnOffFlashlight();
        return;
      }
      await this.turnOnFlashlight();
    },
    wait(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    getSetting() {
      return new Promise((resolve, reject) => {
        common_vendor.index.getSetting({
          success: resolve,
          fail: reject
        });
      });
    },
    authorizeCamera() {
      return new Promise((resolve, reject) => {
        common_vendor.index.authorize({
          scope: "scope.camera",
          success: resolve,
          fail: reject
        });
      });
    },
    showCameraPermissionModal() {
      return new Promise((resolve) => {
        common_vendor.index.showModal({
          title: "需要相机权限",
          content: "打开补光需要相机权限，请授权后重试。",
          confirmText: "去设置",
          success: (res) => {
            resolve(!!(res && res.confirm));
          },
          fail: () => {
            resolve(false);
          }
        });
      });
    },
    openSetting() {
      return new Promise((resolve, reject) => {
        common_vendor.index.openSetting({
          success: resolve,
          fail: reject
        });
      });
    },
    async ensureCameraPermission() {
      const setting = await this.getSetting();
      const authSetting = setting && setting.authSetting || {};
      if (authSetting["scope.camera"] === true) {
        return;
      }
      if (authSetting["scope.camera"] === void 0) {
        try {
          await this.authorizeCamera();
          return;
        } catch (error) {
        }
      }
      const confirmed = await this.showCameraPermissionModal();
      if (!confirmed) {
        throw new Error("camera-permission-cancelled");
      }
      const openSettingResult = await this.openSetting();
      const nextAuthSetting = openSettingResult && openSettingResult.authSetting || {};
      if (!nextAuthSetting["scope.camera"]) {
        throw new Error("camera-permission-denied");
      }
    },
    async ensureCameraMounted() {
      if (!this.cameraVisible) {
        this.cameraVisible = true;
        await this.$nextTick();
      }
      await this.wait(120);
    },
    async turnOnFlashlight() {
      this.isFlashlightPending = true;
      try {
        await this.ensureCameraPermission();
        await this.ensureCameraMounted();
        this.cameraFlash = "off";
        await this.wait(80);
        this.cameraFlash = "torch";
        this.isFlashlightOn = true;
      } catch (error) {
        this.turnOffFlashlight();
        if (!String(error && error.message || "").startsWith("camera-permission")) {
          common_vendor.index.showToast({
            title: "补光开启失败",
            icon: "none"
          });
        }
      } finally {
        this.isFlashlightPending = false;
      }
    },
    turnOffFlashlight() {
      this.cameraFlash = "off";
      this.isFlashlightOn = false;
      setTimeout(() => {
        if (!this.isFlashlightOn) {
          this.cameraVisible = false;
        }
      }, 80);
    },
    forceReleaseFlashlight() {
      this.cameraFlash = "off";
      this.isFlashlightOn = false;
      this.isFlashlightPending = false;
      this.cameraVisible = false;
    },
    handleCameraError() {
      this.isFlashlightPending = false;
      this.turnOffFlashlight();
      common_vendor.index.showToast({
        title: "补光开启失败",
        icon: "none"
      });
    },
    async confirmUnlock() {
      if (!this.canUnlock || this.isConfirmPending) {
        if (!this.canUnlock) {
          common_vendor.index.showToast({
            title: "请输入有效编号",
            icon: "none"
          });
        }
        return;
      }
      const normalizedCode = this.normalizeScooterCode(this.scooterCode);
      if (!normalizedCode) {
        common_vendor.index.showToast({
          title: "请输入 6 位编号",
          icon: "none"
        });
        return;
      }
      this.isConfirmPending = true;
      try {
        common_vendor.index.showLoading({
          title: "开锁中..."
        });
        const res = await api_modules_scooter.unlockScooter(normalizedCode);
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("dispatcherCurrentTask", {
          ...res.data || {},
          scooterCode: normalizedCode,
          taskType: "unlock"
        });
        this.turnOffFlashlight();
        common_vendor.index.navigateTo({
          url: `/pages/scooterInfo/scooterInfo?code=${encodeURIComponent(normalizedCode)}`
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "开锁失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.isConfirmPending = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cameraVisible
  }, $data.cameraVisible ? {
    b: $data.cameraFlash,
    c: common_vendor.o((...args) => $options.handleCameraError && $options.handleCameraError(...args), "9c")
  } : {}, {
    d: common_vendor.f($options.displayChars, (char, index, i0) => {
      return {
        a: common_vendor.t(char),
        b: index,
        c: index === $data.scooterCode.length && $data.scooterCode.length < $data.maxLength ? 1 : ""
      };
    }),
    e: $data.scooterCode,
    f: $data.inputFocused,
    g: $data.maxLength,
    h: common_vendor.o((...args) => $options.handleCodeInput && $options.handleCodeInput(...args), "39"),
    i: common_vendor.o((...args) => $options.handleCodeBlur && $options.handleCodeBlur(...args), "cd"),
    j: common_vendor.o((...args) => $options.confirmUnlock && $options.confirmUnlock(...args), "1f"),
    k: common_vendor.o((...args) => $options.focusCodeInput && $options.focusCodeInput(...args), "2f"),
    l: common_vendor.t($data.isFlashlightPending ? "处理中..." : $data.isFlashlightOn ? "关闭补光" : "打开补光"),
    m: $data.isFlashlightOn ? 1 : "",
    n: $data.isFlashlightPending,
    o: common_vendor.o((...args) => $options.toggleFlashlight && $options.toggleFlashlight(...args), "12"),
    p: common_vendor.t($data.isConfirmPending ? "开锁中..." : "确认开锁"),
    q: !$options.canUnlock || $data.isConfirmPending,
    r: common_vendor.o((...args) => $options.confirmUnlock && $options.confirmUnlock(...args), "c7"),
    s: common_vendor.s($options.confirmSectionStyle)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/unlock/unlock.js.map
