"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_scooter = require("../../api/modules/scooter.js");
const DEFAULT_FORM = () => ({
  code: "",
  battery: "",
  latitude: "",
  longitude: ""
});
const _sfc_main = {
  data() {
    return {
      form: DEFAULT_FORM()
    };
  },
  onLoad(options) {
    if (options && options.code) {
      this.form.code = options.code;
    }
  },
  methods: {
    fillCurrentLocation() {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          this.form.latitude = String(res.latitude);
          this.form.longitude = String(res.longitude);
          common_vendor.index.showToast({
            title: "Location applied",
            icon: "success"
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "Location failed",
            icon: "none"
          });
        }
      });
    },
    async confirmLock() {
      const payload = {
        code: this.form.code.trim(),
        battery: Number(this.form.battery),
        latitude: Number(this.form.latitude),
        longitude: Number(this.form.longitude)
      };
      if (!payload.code) {
        common_vendor.index.showToast({
          title: "Enter scooter code",
          icon: "none"
        });
        return;
      }
      if (!Number.isFinite(payload.battery) || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
        common_vendor.index.showToast({
          title: "Complete all fields",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "Submitting..."
        });
        await api_modules_scooter.lockScooter(payload);
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("dispatcherCurrentTask", {
          ...payload,
          taskType: "lock"
        });
        common_vendor.index.showModal({
          title: "Lock placement saved",
          content: `Scooter ${payload.code} has been placed successfully.`,
          showCancel: false,
          success: () => {
            this.form = DEFAULT_FORM();
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
    a: $data.form.code,
    b: common_vendor.o(common_vendor.m(($event) => $data.form.code = $event.detail.value, {
      trim: true
    }), "ed"),
    c: $data.form.battery,
    d: common_vendor.o(common_vendor.m(($event) => $data.form.battery = $event.detail.value, {
      trim: true
    }), "88"),
    e: common_vendor.o((...args) => $options.fillCurrentLocation && $options.fillCurrentLocation(...args), "2b"),
    f: $data.form.latitude,
    g: common_vendor.o(common_vendor.m(($event) => $data.form.latitude = $event.detail.value, {
      trim: true
    }), "0a"),
    h: $data.form.longitude,
    i: common_vendor.o(common_vendor.m(($event) => $data.form.longitude = $event.detail.value, {
      trim: true
    }), "4a"),
    j: common_vendor.o((...args) => $options.confirmLock && $options.confirmLock(...args), "bd")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/lock/lock.js.map
