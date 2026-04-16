"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_scooter = require("../../api/modules/scooter.js");
const _sfc_main = {
  data() {
    return {
      scooterCode: ""
    };
  },
  computed: {
    canSubmit() {
      return Boolean(this.scooterCode.trim());
    }
  },
  onLoad(options) {
    if (options && options.code) {
      this.scooterCode = decodeURIComponent(options.code);
    }
  },
  onShow() {
    if (!common_vendor.index.getStorageSync("dispatcherToken")) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login?mode=login"
      });
    }
  },
  methods: {
    async confirmUnlock() {
      if (!this.canSubmit) {
        common_vendor.index.showToast({
          title: "请输入车辆编号",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "开锁中..."
        });
        const code = this.scooterCode.trim();
        const res = await api_modules_scooter.unlockScooter(code);
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("dispatcherCurrentTask", {
          ...res.data || {},
          scooterCode: code,
          taskType: "unlock"
        });
        common_vendor.index.showModal({
          title: "开锁调度成功",
          content: `车辆 ${code} 已进入调度流程。`,
          showCancel: false,
          success: () => {
            common_vendor.index.navigateBack({
              delta: 1
            });
          }
        });
      } catch (error) {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.scooterCode,
    b: common_vendor.o(common_vendor.m(($event) => $data.scooterCode = $event.detail.value, {
      trim: true
    }), "24"),
    c: !$options.canSubmit,
    d: common_vendor.o((...args) => $options.confirmUnlock && $options.confirmUnlock(...args), "60")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/unlock/unlock.js.map
