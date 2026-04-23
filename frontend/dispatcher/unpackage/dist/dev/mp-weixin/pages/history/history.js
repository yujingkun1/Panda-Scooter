"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const api_modules_scooter = require("../../api/modules/scooter.js");
const _sfc_main = {
  data() {
    return {
      historyList: [],
      currentFilter: "all",
      lockingId: null
    };
  },
  computed: {
    filteredHistory() {
      const filters = {
        all: () => true,
        today: (item) => item.isToday,
        processing: (item) => item.status === 1
      };
      return this.historyList.filter(filters[this.currentFilter]);
    }
  },
  onShow() {
    if (!common_vendor.index.getStorageSync("dispatcherToken")) {
      common_vendor.index.reLaunch({
        url: "/pages/login/login?mode=login"
      });
      return;
    }
    this.loadHistory();
  },
  methods: {
    async loadHistory() {
      try {
        const res = await api_modules_user.getDispatchHistory();
        const rawList = res.data && res.data.history || res.data && res.data.records || res.data && res.data.list || [];
        this.historyList = Array.isArray(rawList) ? rawList.map((item, index) => this.normalizeHistory(item, index)).sort((first, second) => second.sortTime - first.sortTime) : [];
      } catch (error) {
        this.historyList = [];
      }
    },
    normalizeHistory(item, index) {
      const startTime = item.startTime || item.createTime || item.dispatchTime || item.updateTime;
      const endTime = item.endTime || item.finishTime || "";
      const rideStatus = this.normalizeRideStatus(item);
      const faultStatus = this.normalizeFaultStatus(item);
      const status = this.normalizeStatus(item, rideStatus);
      return {
        id: item.id || item.dispatchId || index + 1,
        code: item.scooterCode || item.code || item.vehicleCode || `车辆 ${index + 1}`,
        sortTime: this.toTimestamp(startTime),
        status,
        statusText: status === 1 ? "调度中" : "已完成",
        statusClass: status === 1 ? "tag-processing" : "tag-completed",
        canLock: status === 1,
        startTimeText: this.formatDateTime(startTime),
        endTimeText: endTime ? this.formatDateTime(endTime) : "--",
        rideStatus,
        rideStatusText: this.mapRideStatus(rideStatus),
        faultStatus,
        faultStatusText: faultStatus === 1 ? "故障" : "正常",
        batteryText: this.formatBattery(item.battery),
        batteryValue: this.extractBatteryValue(item.battery),
        isToday: this.isToday(startTime)
      };
    },
    normalizeStatus(item, rideStatus) {
      const rawStatus = item.status ?? item.dispatchStatus ?? item.taskStatus ?? item.resultStatus;
      const numericStatus = Number(rawStatus);
      if (numericStatus === 0 || numericStatus === 1) {
        return numericStatus;
      }
      return Number(rideStatus) === 1 ? 1 : 0;
    },
    normalizeRideStatus(item) {
      const rawStatus = item.rideStatus ?? item.ride_status ?? item.vehicleStatus;
      const numericStatus = Number(rawStatus);
      return Number.isFinite(numericStatus) ? numericStatus : 0;
    },
    normalizeFaultStatus(item) {
      const rawStatus = item.faultStatus ?? item.fault_status;
      const numericStatus = Number(rawStatus);
      return Number.isFinite(numericStatus) ? numericStatus : 0;
    },
    mapRideStatus(status) {
      const statusMap = {
        0: "空闲",
        1: "调度中",
        2: "维修中",
        3: "使用中"
      };
      return statusMap[Number(status)] || "--";
    },
    formatDateTime(value) {
      if (!value) {
        return "--";
      }
      return String(value).replace("T", " ").replace("Z", "").slice(0, 19);
    },
    toTimestamp(value) {
      if (!value) {
        return 0;
      }
      const timestamp = new Date(String(value).replace(" ", "T")).getTime();
      return Number.isFinite(timestamp) ? timestamp : 0;
    },
    formatBattery(value) {
      const numericValue = this.extractBatteryValue(value);
      return Number.isFinite(numericValue) ? `${numericValue}%` : "--";
    },
    extractBatteryValue(value) {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : null;
    },
    isToday(value) {
      if (!value) {
        return false;
      }
      const date = new Date(String(value).replace(" ", "T"));
      if (Number.isNaN(date.getTime())) {
        return false;
      }
      const now = /* @__PURE__ */ new Date();
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
    },
    changeFilter(filter) {
      this.currentFilter = filter;
    },
    getLocation() {
      return new Promise((resolve, reject) => {
        common_vendor.index.getLocation({
          type: "gcj02",
          success: resolve,
          fail: reject
        });
      });
    },
    confirmLock(item) {
      if (this.lockingId) {
        return;
      }
      common_vendor.index.showModal({
        title: "关锁停放",
        content: `确认将车辆 ${item.code} 关锁停放吗？`,
        confirmText: "确认投放",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          this.lockingId = item.id;
          try {
            common_vendor.index.showLoading({
              title: "投放中..."
            });
            const location = await this.getLocation();
            await api_modules_scooter.lockScooter({
              code: item.code,
              battery: item.batteryValue ?? 0,
              latitude: Number(location.latitude),
              longitude: Number(location.longitude)
            });
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "投放成功",
              icon: "success"
            });
            await this.loadHistory();
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "投放失败，请稍后重试",
              icon: "none"
            });
          } finally {
            this.lockingId = null;
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.currentFilter === "all" ? 1 : "",
    b: common_vendor.o(($event) => $options.changeFilter("all"), "7c"),
    c: $data.currentFilter === "today" ? 1 : "",
    d: common_vendor.o(($event) => $options.changeFilter("today"), "51"),
    e: $data.currentFilter === "processing" ? 1 : "",
    f: common_vendor.o(($event) => $options.changeFilter("processing"), "2c"),
    g: $options.filteredHistory.length > 0
  }, $options.filteredHistory.length > 0 ? {
    h: common_vendor.f($options.filteredHistory, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.code),
        b: common_vendor.t(item.startTimeText),
        c: common_vendor.t(item.statusText),
        d: common_vendor.n(item.statusClass),
        e: item.status !== 1
      }, item.status !== 1 ? {
        f: common_vendor.t(item.endTimeText)
      } : {}, {
        g: common_vendor.t(item.rideStatusText),
        h: common_vendor.t(item.faultStatusText),
        i: item.faultStatus === 1 ? 1 : "",
        j: common_vendor.t(item.batteryText),
        k: item.canLock
      }, item.canLock ? {
        l: common_vendor.t($data.lockingId === item.id ? "投放中..." : "关锁停放"),
        m: $data.lockingId === item.id,
        n: common_vendor.o(($event) => $options.confirmLock(item), item.id)
      } : {}, {
        o: item.id
      });
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/history.js.map
