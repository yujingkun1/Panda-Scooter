"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_user = require("../../api/modules/user.js");
const api_modules_map = require("../../api/modules/map.js");
const common_assets = require("../../common/assets.js");
const DEFAULT_LOCATION = {
  latitude: 30.75953206821905,
  longitude: 103.98442619779992
};
const MARKER_ICONS = {
  scooter: "/static/scooter.svg",
  parking: "/static/parking.svg",
  noParking: "/static/no-parking.svg"
};
const DEFAULT_DISPATCHER = {
  name: "调度员",
  email: "未登录",
  areaName: "未分配辖区",
  todayDispatchedNum: "0"
};
const _sfc_main = {
  data() {
    return {
      hasToken: false,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      scale: 16,
      markers: [],
      polygons: [],
      availableScooterCount: 0,
      dispatcherInfo: { ...DEFAULT_DISPATCHER },
      scooterLookup: {}
    };
  },
  onShow() {
    this.hasToken = Boolean(common_vendor.index.getStorageSync("dispatcherToken"));
    this.loadPageData();
  },
  methods: {
    async loadPageData() {
      await Promise.all([this.loadMapData(), this.loadDispatcherInfo()]);
    },
    async loadDispatcherInfo() {
      if (!this.hasToken) {
        const cached = common_vendor.index.getStorageSync("dispatcherUserInfo") || {};
        this.dispatcherInfo = {
          ...DEFAULT_DISPATCHER,
          ...cached
        };
        return;
      }
      try {
        const res = await api_modules_user.getDispatcherInfo();
        const data = res.data || {};
        this.dispatcherInfo = {
          name: data.name || DEFAULT_DISPATCHER.name,
          email: data.email || DEFAULT_DISPATCHER.email,
          areaName: data.areaName || DEFAULT_DISPATCHER.areaName,
          todayDispatchedNum: String(data.todayDispatchedNum || "0")
        };
        common_vendor.index.setStorageSync("dispatcherUserInfo", this.dispatcherInfo);
      } catch (error) {
      }
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
        this.availableScooterCount = scooters.length;
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
          width: 34,
          height: 34,
          meta: {
            code: item.code || "--",
            battery: item.battery || "0",
            rideStatus: item.ride_status,
            faultStatus: item.fault_status
          }
        };
      }).filter(Boolean);
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
        fillColor: "rgba(24, 144, 255, 0.08)",
        strokeColor: "rgba(24, 144, 255, 0.45)",
        strokeWidth: 2
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
      const firstPoint = this.normalizePoint(Array.isArray(data.scooters) ? data.scooters[0] : null) || parkingPoints[0] || this.normalizePoint(noParkingMarkers[0]);
      if (firstPoint) {
        this.latitude = firstPoint.latitude;
        this.longitude = firstPoint.longitude;
      }
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
    navigateTo(page) {
      if (!this.hasToken) {
        this.goLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/${page}/${page}`
      });
    },
    navigateToProfile() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/profile"
      });
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
    a: common_assets._imports_0,
    b: common_vendor.t($data.dispatcherInfo.areaName || "调度控制台"),
    c: common_assets._imports_0$1,
    d: common_vendor.o((...args) => $options.navigateToProfile && $options.navigateToProfile(...args), "eb"),
    e: $data.latitude,
    f: $data.longitude,
    g: $data.scale,
    h: $data.markers,
    i: $data.polygons,
    j: common_vendor.o((...args) => $options.handleMarkerTap && $options.handleMarkerTap(...args), "97"),
    k: !$data.hasToken
  }, !$data.hasToken ? {
    l: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "a3")
  } : {
    m: common_vendor.t($data.dispatcherInfo.name),
    n: common_vendor.t($data.dispatcherInfo.todayDispatchedNum),
    o: common_vendor.t($data.availableScooterCount),
    p: common_vendor.o(($event) => $options.navigateTo("unlock"), "ef"),
    q: common_vendor.o(($event) => $options.navigateTo("lock"), "4f"),
    r: common_vendor.o(($event) => $options.navigateTo("history"), "f0")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
