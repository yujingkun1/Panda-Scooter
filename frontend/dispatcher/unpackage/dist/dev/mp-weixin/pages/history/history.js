"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const _sfc_main = {
  data() {
    return {
      hasToken: false,
      historyList: [],
      currentFilter: "all",
      filters: {
        all: () => true,
        unlock: (item) => item.type === "unlock",
        lock: (item) => item.type === "lock"
      }
    };
  },
  computed: {
    filteredHistory() {
      return this.historyList.filter(this.filters[this.currentFilter]);
    }
  },
  onShow() {
    this.hasToken = Boolean(common_vendor.index.getStorageSync("dispatcherToken"));
    if (this.hasToken) {
      this.loadHistory();
    }
  },
  methods: {
    async loadHistory() {
      try {
        const res = await api_modules_user.getDispatchHistory();
        const rawList = res.data && res.data.history || res.data && res.data.records || res.data && res.data.list || [];
        this.historyList = Array.isArray(rawList) ? rawList.map((item, index) => this.normalizeHistory(item, index)) : [];
      } catch (error) {
        this.historyList = [];
      }
    },
    normalizeHistory(item, index) {
      const rawType = String(item.type || item.dispatchType || item.action || "").toLowerCase();
      const isLock = rawType.includes("lock") || rawType.includes("placement") || rawType.includes("投放") || rawType.includes("关锁") || rawType === "2";
      const position = this.formatPosition(item.latitude, item.longitude);
      const battery = item.battery !== void 0 && item.battery !== null ? `${item.battery}%` : "--";
      const statusText = item.statusText || item.status || item.result || "已完成";
      return {
        id: item.id || item.dispatchId || index + 1,
        code: item.code || item.scooterCode || item.vehicleCode || `车辆 ${index + 1}`,
        time: this.formatDateTime(item.createTime || item.dispatchTime || item.updateTime),
        type: isLock ? "lock" : "unlock",
        typeText: isLock ? "关锁投放" : "开锁调度",
        tagClass: isLock ? "tag-lock" : "tag-unlock",
        statusText,
        battery,
        position,
        remark: item.remark || item.description || ""
      };
    },
    formatDateTime(value) {
      if (!value) {
        return "--";
      }
      return String(value).replace("T", " ").replace("Z", "").slice(0, 19);
    },
    formatPosition(latitude, longitude) {
      if (latitude === void 0 || longitude === void 0 || latitude === null || longitude === null) {
        return "--";
      }
      return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
    },
    changeFilter(filter) {
      this.currentFilter = filter;
    },
    goLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login?mode=login"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.hasToken
  }, !$data.hasToken ? {
    b: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "d1")
  } : common_vendor.e({
    c: $data.currentFilter === "all" ? 1 : "",
    d: common_vendor.o(($event) => $options.changeFilter("all"), "0f"),
    e: $data.currentFilter === "unlock" ? 1 : "",
    f: common_vendor.o(($event) => $options.changeFilter("unlock"), "4d"),
    g: $data.currentFilter === "lock" ? 1 : "",
    h: common_vendor.o(($event) => $options.changeFilter("lock"), "8f"),
    i: $options.filteredHistory.length > 0
  }, $options.filteredHistory.length > 0 ? {
    j: common_vendor.f($options.filteredHistory, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.code),
        b: common_vendor.t(item.time),
        c: common_vendor.t(item.typeText),
        d: common_vendor.n(item.tagClass),
        e: common_vendor.t(item.statusText),
        f: common_vendor.t(item.battery),
        g: common_vendor.t(item.position),
        h: item.remark
      }, item.remark ? {
        i: common_vendor.t(item.remark)
      } : {}, {
        j: item.id
      });
    })
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/history.js.map
