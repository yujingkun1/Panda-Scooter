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
  onShow() {
    if (!common_vendor.index.getStorageSync("dispatcherToken")) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login?mode=login"
      });
    }
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
            title: "已填入当前位置",
            icon: "success"
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "获取位置失败",
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
          title: "请输入车辆编号",
          icon: "none"
        });
        return;
      }
      if (!Number.isFinite(payload.battery) || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
        common_vendor.index.showToast({
          title: "请填写完整投放信息",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "提交中..."
        });
        await api_modules_scooter.lockScooter(payload);
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("dispatcherCurrentTask", {
          ...payload,
          taskType: "lock"
        });
        common_vendor.index.showModal({
          title: "关锁投放成功",
          content: `车辆 ${payload.code} 已完成投放。`,
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
    }), "a3"),
    c: $data.form.battery,
    d: common_vendor.o(common_vendor.m(($event) => $data.form.battery = $event.detail.value, {
      trim: true
    }), "1d"),
    e: common_vendor.o((...args) => $options.fillCurrentLocation && $options.fillCurrentLocation(...args), "54"),
    f: $data.form.latitude,
    g: common_vendor.o(common_vendor.m(($event) => $data.form.latitude = $event.detail.value, {
      trim: true
    }), "21"),
    h: $data.form.longitude,
    i: common_vendor.o(common_vendor.m(($event) => $data.form.longitude = $event.detail.value, {
      trim: true
    }), "46"),
    j: common_vendor.o((...args) => $options.confirmLock && $options.confirmLock(...args), "c7")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/lock/lock.js.map
