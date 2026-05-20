"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const api_modules_map = require("../../api/modules/map.js");
const DEFAULT_LOCATION = {
  latitude: 30.75953206821905,
  longitude: 103.98442619779992
};
const SCOOTER_ICON = "/static/scooter.svg";
const _sfc_main = {
  data() {
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      originLatitude: DEFAULT_LOCATION.latitude,
      originLongitude: DEFAULT_LOCATION.longitude,
      scale: 17,
      selectedScooterId: null,
      selectedAreaId: null,
      violatingScooters: [],
      noParkingAreas: []
    };
  },
  computed: {
    markers() {
      return this.violatingScooters.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: SCOOTER_ICON,
        width: item.id === this.selectedScooterId ? 40 : 34,
        height: item.id === this.selectedScooterId ? 40 : 34,
        callout: {
          content: item.code,
          color: "#0b0e0d",
          fontSize: 12,
          borderRadius: 6,
          bgColor: "#ffffff",
          padding: 6,
          display: item.id === this.selectedScooterId ? "ALWAYS" : "BYCLICK"
        }
      }));
    },
    polygons() {
      return this.noParkingAreas.map((item) => ({
        id: item.id,
        points: item.points,
        fillColor: item.id === this.selectedAreaId ? "#FF4D4F52" : "#FF4D4F2E",
        strokeColor: item.id === this.selectedAreaId ? "#D9363E" : "#FF4D4F73",
        strokeWidth: item.id === this.selectedAreaId ? 3 : 2
      }));
    }
  },
  async onLoad() {
    if (!common_vendor.index.getStorageSync("dispatcherToken")) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login?mode=login"
      });
      return;
    }
    await this.loadVehicleLookup();
  },
  methods: {
    getLocation() {
      return new Promise((resolve, reject) => {
        common_vendor.index.getLocation({
          type: "gcj02",
          success: resolve,
          fail: reject
        });
      });
    },
    async loadVehicleLookup() {
      await this.loadCurrentLocation();
      await this.loadMapData();
    },
    async loadCurrentLocation() {
      try {
        const location = await this.getLocation();
        this.latitude = Number(location.latitude);
        this.longitude = Number(location.longitude);
        this.originLatitude = Number(location.latitude);
        this.originLongitude = Number(location.longitude);
      } catch (error) {
        common_vendor.index.showToast({
          title: "定位失败，将按默认位置查询",
          icon: "none"
        });
      }
    },
    async loadMapData() {
      try {
        const res = await api_modules_map.getMapData({
          latitude: this.latitude,
          longitude: this.longitude,
          scale: this.normalizeMapScale(this.scale)
        });
        const data = res.data || {};
        const noParkingAreas = this.normalizeNoParkingAreas(data.noParkingAreas || []);
        const scooters = this.normalizeScooters(data.scooters || []);
        const violatingScooters = this.filterViolatingScooters(scooters, noParkingAreas);
        const activeAreaIds = new Set(violatingScooters.map((item) => item.areaId));
        this.noParkingAreas = noParkingAreas.filter((item) => activeAreaIds.has(item.id));
        this.violatingScooters = violatingScooters;
        if (violatingScooters.length) {
          this.selectScooter(violatingScooters[0], false);
          return;
        }
        this.selectedScooterId = null;
        this.selectedAreaId = null;
      } catch (error) {
        this.violatingScooters = [];
        this.noParkingAreas = [];
        this.selectedScooterId = null;
        this.selectedAreaId = null;
        if (utils_auth.isUnauthorizedError(error)) {
          common_vendor.index.reLaunch({
            url: "/pages/login/login?mode=login"
          });
          return;
        }
        if (!error || !error.handled) {
          common_vendor.index.showToast({
            title: "加载车辆查询失败，请稍后重试",
            icon: "none"
          });
        }
      }
    },
    normalizeNoParkingAreas(list) {
      return list.map((item, index) => {
        const points = this.parsePolygon(item.polygon);
        if (!points.length) {
          return null;
        }
        return {
          id: Number(item.id) || index + 1,
          name: item.name || `禁停区 ${index + 1}`,
          points
        };
      }).filter(Boolean);
    },
    normalizeScooters(list) {
      return list.map((item, index) => {
        const point = this.normalizePoint(item);
        if (!point) {
          return null;
        }
        const rideStatus = Number(item.rideStatus ?? item.ride_status);
        const faultStatus = Number(item.faultStatus ?? item.fault_status);
        const batteryValue = this.extractBatteryValue(item.battery);
        return {
          id: Number(item.id) || index + 1,
          code: item.code || `车辆 ${index + 1}`,
          latitude: point.latitude,
          longitude: point.longitude,
          rideStatus: Number.isFinite(rideStatus) ? rideStatus : 0,
          faultStatus: Number.isFinite(faultStatus) ? faultStatus : 0,
          batteryValue,
          batteryText: Number.isFinite(batteryValue) ? `${batteryValue}%` : "--"
        };
      }).filter(Boolean);
    },
    filterViolatingScooters(scooters, noParkingAreas) {
      return scooters.map((item) => {
        const matchedArea = noParkingAreas.find((area) => this.isPointInPolygon(item, area.points));
        if (!matchedArea) {
          return null;
        }
        return {
          ...item,
          areaId: matchedArea.id,
          areaName: matchedArea.name,
          distance: this.calculateDistance(
            this.originLatitude,
            this.originLongitude,
            item.latitude,
            item.longitude
          ),
          rideStatusText: this.mapRideStatus(item.rideStatus),
          faultStatusText: item.faultStatus === 1 ? "故障" : "正常"
        };
      }).filter(Boolean).sort((first, second) => first.distance - second.distance);
    },
    handleMarkerTap(event) {
      const current = this.violatingScooters.find((item) => item.id === event.detail.markerId);
      if (current) {
        this.selectScooter(current);
      }
    },
    selectScooter(item, adjustScale = true) {
      this.selectedScooterId = item.id;
      this.selectedAreaId = item.areaId;
      this.latitude = item.latitude;
      this.longitude = item.longitude;
      if (adjustScale) {
        this.scale = this.normalizeMapScale(18);
      }
    },
    normalizeMapScale(scale) {
      const roundedScale = Math.round(Number(scale));
      if (!Number.isFinite(roundedScale)) {
        return 17;
      }
      return Math.min(20, Math.max(3, roundedScale));
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
    isPointInPolygon(point, polygon) {
      if (!polygon.length) {
        return false;
      }
      const x = Number(point.longitude);
      const y = Number(point.latitude);
      let isInside = false;
      for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
        const current = polygon[index];
        const previous = polygon[previousIndex];
        const currentX = Number(current.longitude);
        const currentY = Number(current.latitude);
        const previousX = Number(previous.longitude);
        const previousY = Number(previous.latitude);
        const intersect = currentY > y !== previousY > y && x < (previousX - currentX) * (y - currentY) / (previousY - currentY || Number.EPSILON) + currentX;
        if (intersect) {
          isInside = !isInside;
        }
      }
      return isInside;
    },
    calculateDistance(fromLatitude, fromLongitude, toLatitude, toLongitude) {
      const toRadians = (degree) => degree * (Math.PI / 180);
      const earthRadius = 6371e3;
      const deltaLatitude = toRadians(toLatitude - fromLatitude);
      const deltaLongitude = toRadians(toLongitude - fromLongitude);
      const startLatitude = toRadians(fromLatitude);
      const endLatitude = toRadians(toLatitude);
      const haversine = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;
      const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
      return earthRadius * arc;
    },
    extractBatteryValue(value) {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : null;
    },
    formatDistance(distance) {
      const meters = Number(distance || 0);
      if (meters < 1e3) {
        return `直线距离 ${Math.round(meters)} m`;
      }
      return `直线距离 ${(meters / 1e3).toFixed(2)} km`;
    },
    mapRideStatus(status) {
      const statusMap = {
        0: "空闲",
        1: "使用中",
        2: "维修中",
        3: "调度中"
      };
      return statusMap[Number(status)] || "--";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.latitude,
    b: $data.longitude,
    c: $data.scale,
    d: $options.markers,
    e: $options.polygons,
    f: common_vendor.o((...args) => $options.handleMarkerTap && $options.handleMarkerTap(...args), "eb"),
    g: common_vendor.t($data.violatingScooters.length),
    h: common_vendor.f($data.violatingScooters, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.code),
        b: common_vendor.t($options.formatDistance(item.distance)),
        c: common_vendor.t(item.areaName),
        d: common_vendor.t(item.rideStatusText),
        e: common_vendor.t(item.batteryText),
        f: common_vendor.t(item.faultStatusText),
        g: item.faultStatus === 1 ? 1 : "",
        h: item.id,
        i: item.id === $data.selectedScooterId ? 1 : "",
        j: common_vendor.o(($event) => $options.selectScooter(item), item.id)
      };
    }),
    i: !$data.violatingScooters.length
  }, !$data.violatingScooters.length ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vehicleLookup/vehicleLookup.js.map
