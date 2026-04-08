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
      this.scooterCode = options.code;
    }
  },
  methods: {
    async confirmUnlock() {
      if (!this.canSubmit) {
        common_vendor.index.showToast({
          title: "Enter scooter code",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "Unlocking..."
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
          title: "Dispatch unlock created",
          content: `Scooter ${code} is now in the dispatch flow.`,
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
    }), "95"),
    c: !$options.canSubmit,
    d: common_vendor.o((...args) => $options.confirmUnlock && $options.confirmUnlock(...args), "b3")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/unlock/unlock.js.map
