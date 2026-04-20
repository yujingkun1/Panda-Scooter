"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_map = require("../../api/modules/map.js");
const api_modules_scooter = require("../../api/modules/scooter.js");
const DEFAULT_SCOOTER_INFO = {
  id: "",
  code: "",
  ride_status: 0,
  fault_status: 0,
  battery: 0,
  latitude: "",
  longitude: ""
};
const DEFAULT_LOCATION = {
  latitude: 30.75953206821905,
  longitude: 103.98442619779992
};
const MARKER_ICONS = {
  scooter: "/static/scooter.svg",
  parking: "/static/parking.svg",
  noParking: "/static/no-parking.svg"
};
const _sfc_main = {
  data() {
    return {
      currentCode: "",
      scooterInfo: { ...DEFAULT_SCOOTER_INFO },
      currentLocation: null,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      scale: 16,
      markers: [],
      polygons: [],
      scooterLookup: {},
      isLocking: false,
      isContinuing: false
    };
  },
  computed: {
    rideStatusText() {
      const statusMap = {
        0: "空闲",
        1: "使用中",
        2: "维修中",
        3: "调度中"
      };
      return statusMap[Number(this.scooterInfo.ride_status)] || "--";
    },
    faultStatusText() {
      return Number(this.scooterInfo.fault_status) === 1 ? "故障" : "正常";
    },
    batteryText() {
      const battery = Number(this.scooterInfo.battery);
      return Number.isFinite(battery) ? `${battery}%` : "--";
    }
  },
  onLoad(options) {
    if (!common_vendor.index.getStorageSync("dispatcherToken")) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login?mode=login"
      });
      return;
    }
    const task = common_vendor.index.getStorageSync("dispatcherCurrentTask") || {};
    this.currentCode = this.normalizeScooterCode(
      (options && options.code ? decodeURIComponent(options.code) : "") || task.scooterCode || ""
    );
    if (!this.currentCode) {
      common_vendor.index.showToast({
        title: "缺少车辆编号",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack({
          delta: 1
        });
      }, 600);
      return;
    }
    this.loadScooterInfo();
    this.loadCurrentLocation();
  },
  methods: {
    async loadCurrentLocation() {
      try {
        const location = await this.getLocation();
        this.currentLocation = {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude)
        };
        this.latitude = this.currentLocation.latitude;
        this.longitude = this.currentLocation.longitude;
        this.loadMapData();
      } catch (error) {
        this.currentLocation = null;
        this.loadMapData();
      }
    },
    async loadScooterInfo() {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const res = await api_modules_scooter.getScooterInfo(this.currentCode);
        common_vendor.index.hideLoading();
        const data = res.data || {};
        this.scooterInfo = {
          ...DEFAULT_SCOOTER_INFO,
          ...data,
          code: data.code || this.currentCode
        };
        this.syncMapCenter();
        this.loadMapData();
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "加载车辆信息失败",
          icon: "none"
        });
      }
    },
    normalizeScooterCode(rawCode) {
      const value = String(rawCode || "").trim().toUpperCase();
      if (!value) {
        return "";
      }
      if (value.startsWith("PDSC")) {
        return value;
      }
      const numericPart = value.replace(/\D/g, "");
      return numericPart ? `PDSC${numericPart.padStart(6, "0")}` : value;
    },
    extractScooterCode(rawCode) {
      const value = String(rawCode || "").trim();
      if (!value) {
        return "";
      }
      const matchedCode = value.match(/PDSC\d+/i);
      if (matchedCode && matchedCode[0]) {
        return matchedCode[0].toUpperCase();
      }
      if (value.includes("code=")) {
        const query = value.split("?")[1] || "";
        const params = {};
        query.split("&").forEach((item) => {
          const [key, val] = item.split("=");
          if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(val || "");
          }
        });
        return params.code || value;
      }
      const segments = value.split("/");
      return segments[segments.length - 1] || value;
    },
    async loadMapData() {
      try {
        const res = await api_modules_map.getMapData({
          latitude: this.latitude,
          longitude: this.longitude,
          scale: this.scale
        });
        const data = res.data || {};
        const scooters = this.mapScooters(data.scooters || []);
        const parkingPoints = this.mapParkingPoints(data.parkingPoints || []);
        const noParkingAreas = this.mapNoParkingAreas(data.noParkingAreas || []);
        const areaPolygon = this.mapDispatcherArea(data.area);
        const noParkingMarkers = this.mapNoParkingAreaMarkers(data.noParkingAreas || [], noParkingAreas);
        this.polygons = [...areaPolygon ? [areaPolygon] : [], ...noParkingAreas];
        this.markers = [
          ...scooters,
          ...this.mapParkingPointMarkers(parkingPoints),
          ...noParkingMarkers
        ];
        this.scooterLookup = scooters.reduce((result, item) => {
          result[item.id] = item.meta;
          return result;
        }, {});
        this.syncMapCenter(data, parkingPoints, noParkingMarkers);
      } catch (error) {
        this.markers = [];
        this.polygons = [];
        this.scooterLookup = {};
      }
    },
    mapScooters(list) {
      return list.map((item, index) => {
        const point = this.normalizePoint(item);
        if (!point) {
          return null;
        }
        return {
          id: Number(item.id) || index + 1,
          latitude: point.latitude,
          longitude: point.longitude,
          iconPath: MARKER_ICONS.scooter,
          width: this.isCurrentScooter(item) ? 40 : 34,
          height: this.isCurrentScooter(item) ? 40 : 34,
          callout: this.isCurrentScooter(item) ? {
            content: item.code || this.currentCode,
            color: "#0b0e0d",
            fontSize: 12,
            borderRadius: 6,
            bgColor: "#ffffff",
            padding: 6,
            display: "ALWAYS"
          } : void 0,
          meta: {
            code: item.code || "--",
            battery: item.battery || "0",
            rideStatus: item.ride_status,
            faultStatus: item.fault_status
          }
        };
      }).filter(Boolean);
    },
    isCurrentScooter(item) {
      return this.normalizeScooterCode(item && item.code) === this.currentCode;
    },
    mapParkingPoints(list) {
      return list.map((item) => this.normalizePoint(item)).filter(Boolean);
    },
    mapParkingPointMarkers(list) {
      return list.map((item, index) => ({
        id: 1e4 + index + 1,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: MARKER_ICONS.parking,
        width: 28,
        height: 28
      }));
    },
    mapNoParkingAreas(list) {
      return list.map((item, index) => {
        const points = this.parsePolygon(item.polygon);
        if (!points.length) {
          return null;
        }
        return {
          id: item.id || index + 1,
          points,
          fillColor: "rgba(255, 77, 79, 0.18)",
          strokeColor: "rgba(255, 77, 79, 0.45)",
          strokeWidth: 2
        };
      }).filter(Boolean);
    },
    mapDispatcherArea(area) {
      if (!area || !area.polygon) {
        return null;
      }
      const points = this.parsePolygon(area.polygon);
      if (!points.length) {
        return null;
      }
      return {
        id: 999,
        points,
        fillColor: "rgba(18, 52, 120, 0.14)",
        strokeColor: "rgba(58, 157, 232, 0.9)",
        strokeWidth: 3
      };
    },
    mapNoParkingAreaMarkers(sourceAreas, polygons) {
      return polygons.map((polygon, index) => {
        const center = this.resolveAreaCenter(sourceAreas[index], polygon.points);
        if (!center) {
          return null;
        }
        return {
          id: 2e4 + Number(polygon.id || index + 1),
          latitude: center.latitude,
          longitude: center.longitude,
          iconPath: MARKER_ICONS.noParking,
          width: 30,
          height: 30
        };
      }).filter(Boolean);
    },
    parsePolygon(polygon) {
      if (!polygon) {
        return [];
      }
      if (Array.isArray(polygon)) {
        return polygon.map((item) => this.normalizePoint(item)).filter(Boolean);
      }
      if (typeof polygon === "string") {
        try {
          const parsed = JSON.parse(polygon);
          return Array.isArray(parsed) ? parsed.map((item) => this.normalizePoint(item)).filter(Boolean) : [];
        } catch (error) {
          return polygon.split(";").map((segment) => segment.trim()).filter(Boolean).map((segment) => {
            const values = segment.replace(/^\[|\]$/g, "").split(",").map((item) => Number(item.trim()));
            return this.normalizePoint(values);
          }).filter(Boolean);
        }
      }
      return [];
    },
    normalizePoint(point) {
      if (!point) {
        return null;
      }
      if (Array.isArray(point) && point.length >= 2) {
        const first = Number(point[0]);
        const second = Number(point[1]);
        if (!Number.isFinite(first) || !Number.isFinite(second)) {
          return null;
        }
        if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
          return { latitude: first, longitude: second };
        }
        return { latitude: second, longitude: first };
      }
      const latitude = Number(point.latitude);
      const longitude = Number(point.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return { latitude, longitude };
    },
    resolveAreaCenter(area, points = []) {
      if (area && area.center) {
        const center = this.parseCenter(area.center);
        if (center) {
          return center;
        }
      }
      return this.computePolygonCenter(points);
    },
    parseCenter(center) {
      if (!center) {
        return null;
      }
      if (typeof center === "string") {
        const values = center.split(",").map((item) => Number(item.trim()));
        return this.normalizePoint(values);
      }
      return this.normalizePoint(center);
    },
    computePolygonCenter(points) {
      if (!points.length) {
        return null;
      }
      const total = points.reduce((result, item) => ({
        latitude: result.latitude + Number(item.latitude || 0),
        longitude: result.longitude + Number(item.longitude || 0)
      }), { latitude: 0, longitude: 0 });
      return {
        latitude: total.latitude / points.length,
        longitude: total.longitude / points.length
      };
    },
    syncMapCenter(data, parkingPoints, noParkingMarkers) {
      const currentScooterPoint = this.findCurrentScooterPoint(Array.isArray(data && data.scooters) ? data.scooters : []) || this.findCurrentScooterPoint([this.scooterInfo]);
      if (currentScooterPoint) {
        this.latitude = currentScooterPoint.latitude;
        this.longitude = currentScooterPoint.longitude;
        return;
      }
      const fallbackPoint = parkingPoints && parkingPoints[0] ? parkingPoints[0] : this.normalizePoint(noParkingMarkers && noParkingMarkers[0]);
      if (fallbackPoint) {
        this.latitude = fallbackPoint.latitude;
        this.longitude = fallbackPoint.longitude;
      }
    },
    findCurrentScooterPoint(list = []) {
      const matched = list.find((item) => this.isCurrentScooter(item));
      return this.normalizePoint(matched);
    },
    handleMarkerTap(event) {
      const marker = this.scooterLookup[event.detail.markerId];
      if (!marker) {
        return;
      }
      common_vendor.index.showModal({
        title: `车辆 ${marker.code}`,
        content: `电量 ${marker.battery}%
状态 ${this.mapRideStatus(marker.rideStatus)}
故障 ${Number(marker.faultStatus) === 1 ? "是" : "否"}`,
        showCancel: false
      });
    },
    mapRideStatus(status) {
      const statusMap = {
        0: "空闲",
        1: "使用中",
        2: "维修中",
        3: "调度中"
      };
      return statusMap[Number(status)] || "--";
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
    async lockAndPark() {
      if (this.isLocking) {
        return;
      }
      this.isLocking = true;
      try {
        common_vendor.index.showLoading({
          title: "停放中..."
        });
        let latitude = Number(this.scooterInfo.latitude);
        let longitude = Number(this.scooterInfo.longitude);
        try {
          const location = await this.getLocation();
          latitude = Number(location.latitude);
          longitude = Number(location.longitude);
        } catch (error) {
        }
        const payload = {
          code: this.scooterInfo.code || this.currentCode,
          battery: Number(this.scooterInfo.battery || 0),
          latitude,
          longitude
        };
        await api_modules_scooter.lockScooter(payload);
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("dispatcherCurrentTask", {
          ...payload,
          taskType: "lock"
        });
        common_vendor.index.showModal({
          title: "关锁停放成功",
          content: `车辆 ${payload.code} 已完成停放。`,
          showCancel: false,
          success: () => {
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "停放失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.isLocking = false;
      }
    },
    continueUnlock() {
      if (this.isContinuing) {
        return;
      }
      this.isContinuing = true;
      common_vendor.index.scanCode({
        success: async (res) => {
          const code = this.normalizeScooterCode(this.extractScooterCode(res.result));
          if (!code) {
            common_vendor.index.showToast({
              title: "未识别到车辆编号",
              icon: "none"
            });
            return;
          }
          try {
            common_vendor.index.showLoading({
              title: "开锁中..."
            });
            const unlockRes = await api_modules_scooter.unlockScooter(code);
            common_vendor.index.hideLoading();
            common_vendor.index.setStorageSync("dispatcherCurrentTask", {
              ...unlockRes.data || {},
              scooterCode: code,
              taskType: "unlock"
            });
            this.currentCode = code;
            await this.loadScooterInfo();
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "开锁失败，请稍后重试",
              icon: "none"
            });
          }
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "扫码失败，请重试",
            icon: "none"
          });
        },
        complete: () => {
          this.isContinuing = false;
        }
      });
    },
    goManualUnlock() {
      common_vendor.index.navigateTo({
        url: "/pages/unlock/unlock"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.latitude,
    b: $data.longitude,
    c: $data.scale,
    d: $data.markers,
    e: $data.polygons,
    f: common_vendor.o((...args) => $options.handleMarkerTap && $options.handleMarkerTap(...args), "39"),
    g: common_vendor.t($data.scooterInfo.code || "--"),
    h: common_vendor.t($options.rideStatusText),
    i: common_vendor.t($options.faultStatusText),
    j: common_vendor.t($options.batteryText),
    k: common_vendor.t($data.isContinuing ? "处理中..." : "继续开锁"),
    l: $data.isContinuing,
    m: common_vendor.o((...args) => $options.continueUnlock && $options.continueUnlock(...args), "cc"),
    n: common_vendor.t($data.isLocking ? "停放中..." : "关锁停放"),
    o: $data.isLocking,
    p: common_vendor.o((...args) => $options.lockAndPark && $options.lockAndPark(...args), "90"),
    q: common_vendor.o((...args) => $options.goManualUnlock && $options.goManualUnlock(...args), "93")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/scooterInfo/scooterInfo.js.map
