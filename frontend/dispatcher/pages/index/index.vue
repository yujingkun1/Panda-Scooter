<template>
  <view class="page">
    <view class="header">
      <view class="brand">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <view class="brand-text">
          <text class="brand-title">熊猫调度</text>
          <text class="brand-subtitle">{{ dispatcherInfo.areaName || '调度控制台' }}</text>
        </view>
      </view>
      <image class="avatar" src="/static/avatar.png" mode="aspectFit" @click="navigateToProfile"></image>
    </view>

    <view class="map-container">
      <map
        class="map"
        :latitude="latitude"
        :longitude="longitude"
        :scale="scale"
        :markers="markers"
        :polygons="polygons"
        :show-location="true"
        @markertap="handleMarkerTap"
      ></map>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">登录后可查看个人辖区并执行开锁调度、关锁投放等任务。</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <template v-else>
      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-label">调度员</text>
          <text class="summary-value">{{ dispatcherInfo.name }}</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-label">今日调度</text>
          <text class="summary-value">{{ dispatcherInfo.todayDispatchedNum }}</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-label">可用车辆</text>
          <text class="summary-value">{{ availableScooterCount }}</text>
        </view>
      </view>

      <view class="function-area">
        <view class="function-item" @click="navigateTo('unlock')">
          <text class="function-text">开锁调度</text>
        </view>
        <text class="function-divider">|</text>
        <view class="function-item" @click="navigateTo('lock')">
          <text class="function-text">关锁投放</text>
        </view>
        <text class="function-divider">|</text>
        <view class="function-item" @click="navigateTo('history')">
          <text class="function-text">调度历史</text>
        </view>
      </view>

      <view class="tip-card">
        <text class="tip-title">地图说明</text>
        <text class="tip-desc">蓝色范围为调度辖区，红色透明区域为禁停区，图标用于标示车辆、停车点与禁停区中心。</text>
      </view>
    </template>
  </view>
</template>

<script>
import { getDispatcherInfo, getMapData } from '@/api/index'

const DEFAULT_LOCATION = {
  latitude: 30.75953206821905,
  longitude: 103.98442619779992
}

const MARKER_ICONS = {
  scooter: '/static/scooter.svg',
  parking: '/static/parking.svg',
  noParking: '/static/no-parking.svg'
}

const DEFAULT_DISPATCHER = {
  name: '调度员',
  email: '未登录',
  areaName: '未分配辖区',
  todayDispatchedNum: '0'
}

export default {
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
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('dispatcherToken'))
    this.loadPageData()
  },
  methods: {
    async loadPageData() {
      await Promise.all([this.loadMapData(), this.loadDispatcherInfo()])
    },
    async loadDispatcherInfo() {
      if (!this.hasToken) {
        const cached = uni.getStorageSync('dispatcherUserInfo') || {}
        this.dispatcherInfo = {
          ...DEFAULT_DISPATCHER,
          ...cached
        }
        return
      }

      try {
        const res = await getDispatcherInfo()
        const data = res.data || {}
        this.dispatcherInfo = {
          name: data.name || DEFAULT_DISPATCHER.name,
          email: data.email || DEFAULT_DISPATCHER.email,
          areaName: data.areaName || DEFAULT_DISPATCHER.areaName,
          todayDispatchedNum: String(data.todayDispatchedNum || '0')
        }
        uni.setStorageSync('dispatcherUserInfo', this.dispatcherInfo)
      } catch (error) {
      }
    },
    async loadMapData() {
      try {
        const res = await getMapData({
          latitude: this.latitude,
          longitude: this.longitude,
          scale: this.scale
        })
        const data = res.data || {}
        const scooters = this.mapScooters(data.scooters || [])
        const parkingPoints = this.mapParkingPoints(data.parkingPoints || [])
        const noParkingAreas = this.mapNoParkingAreas(data.noParkingAreas || [])
        const areaPolygon = this.mapDispatcherArea(data.area)
        const noParkingMarkers = this.mapNoParkingAreaMarkers(data.noParkingAreas || [], noParkingAreas)

        this.availableScooterCount = scooters.length
        this.polygons = [...(areaPolygon ? [areaPolygon] : []), ...noParkingAreas]
        this.markers = [
          ...scooters,
          ...this.mapParkingPointMarkers(parkingPoints),
          ...noParkingMarkers
        ]
        this.scooterLookup = scooters.reduce((result, item) => {
          result[item.id] = item.meta
          return result
        }, {})
        this.syncMapCenter(data, parkingPoints, noParkingMarkers)
      } catch (error) {
        this.markers = []
        this.polygons = []
        this.scooterLookup = {}
      }
    },
    mapScooters(list) {
      return list
        .map((item, index) => {
          const point = this.normalizePoint(item)
          if (!point) {
            return null
          }

          return {
            id: Number(item.id) || index + 1,
            latitude: point.latitude,
            longitude: point.longitude,
            iconPath: MARKER_ICONS.scooter,
            width: 34,
            height: 34,
            meta: {
              code: item.code || '--',
              battery: item.battery || '0',
              rideStatus: item.ride_status,
              faultStatus: item.fault_status
            }
          }
        })
        .filter(Boolean)
    },
    mapParkingPoints(list) {
      return list.map((item) => this.normalizePoint(item)).filter(Boolean)
    },
    mapParkingPointMarkers(list) {
      return list.map((item, index) => ({
        id: 10000 + index + 1,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: MARKER_ICONS.parking,
        width: 28,
        height: 28
      }))
    },
    mapNoParkingAreas(list) {
      return list
        .map((item, index) => {
          const points = this.parsePolygon(item.polygon)
          if (!points.length) {
            return null
          }

          return {
            id: item.id || index + 1,
            points,
            fillColor: 'rgba(255, 77, 79, 0.18)',
            strokeColor: 'rgba(255, 77, 79, 0.45)',
            strokeWidth: 2
          }
        })
        .filter(Boolean)
    },
    mapDispatcherArea(area) {
      if (!area || !area.polygon) {
        return null
      }

      const points = this.parsePolygon(area.polygon)
      if (!points.length) {
        return null
      }

      return {
        id: 999,
        points,
        fillColor: 'rgba(24, 144, 255, 0.08)',
        strokeColor: 'rgba(24, 144, 255, 0.45)',
        strokeWidth: 2
      }
    },
    mapNoParkingAreaMarkers(sourceAreas, polygons) {
      return polygons
        .map((polygon, index) => {
          const center = this.resolveAreaCenter(sourceAreas[index], polygon.points)
          if (!center) {
            return null
          }

          return {
            id: 20000 + Number(polygon.id || index + 1),
            latitude: center.latitude,
            longitude: center.longitude,
            iconPath: MARKER_ICONS.noParking,
            width: 30,
            height: 30
          }
        })
        .filter(Boolean)
    },
    parsePolygon(polygon) {
      if (!polygon) {
        return []
      }

      if (Array.isArray(polygon)) {
        return polygon.map((item) => this.normalizePoint(item)).filter(Boolean)
      }

      if (typeof polygon === 'string') {
        try {
          const parsed = JSON.parse(polygon)
          return Array.isArray(parsed)
            ? parsed.map((item) => this.normalizePoint(item)).filter(Boolean)
            : []
        } catch (error) {
          return polygon
            .split(';')
            .map((segment) => segment.trim())
            .filter(Boolean)
            .map((segment) => {
              const values = segment
                .replace(/^\[|\]$/g, '')
                .split(',')
                .map((item) => Number(item.trim()))
              return this.normalizePoint(values)
            })
            .filter(Boolean)
        }
      }

      return []
    },
    normalizePoint(point) {
      if (!point) {
        return null
      }

      if (Array.isArray(point) && point.length >= 2) {
        const first = Number(point[0])
        const second = Number(point[1])
        if (!Number.isFinite(first) || !Number.isFinite(second)) {
          return null
        }

        if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
          return { latitude: first, longitude: second }
        }

        return { latitude: second, longitude: first }
      }

      const latitude = Number(point.latitude)
      const longitude = Number(point.longitude)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null
      }

      return { latitude, longitude }
    },
    resolveAreaCenter(area, points = []) {
      if (area && area.center) {
        const center = this.parseCenter(area.center)
        if (center) {
          return center
        }
      }

      return this.computePolygonCenter(points)
    },
    parseCenter(center) {
      if (!center) {
        return null
      }

      if (typeof center === 'string') {
        const values = center.split(',').map((item) => Number(item.trim()))
        return this.normalizePoint(values)
      }

      return this.normalizePoint(center)
    },
    computePolygonCenter(points) {
      if (!points.length) {
        return null
      }

      const total = points.reduce((result, item) => ({
        latitude: result.latitude + Number(item.latitude || 0),
        longitude: result.longitude + Number(item.longitude || 0)
      }), { latitude: 0, longitude: 0 })

      return {
        latitude: total.latitude / points.length,
        longitude: total.longitude / points.length
      }
    },
    syncMapCenter(data, parkingPoints, noParkingMarkers) {
      const firstPoint =
        this.normalizePoint(Array.isArray(data.scooters) ? data.scooters[0] : null) ||
        parkingPoints[0] ||
        this.normalizePoint(noParkingMarkers[0])

      if (firstPoint) {
        this.latitude = firstPoint.latitude
        this.longitude = firstPoint.longitude
      }
    },
    handleMarkerTap(event) {
      const marker = this.scooterLookup[event.detail.markerId]
      if (!marker) {
        return
      }

      uni.showModal({
        title: `车辆 ${marker.code}`,
        content: `电量 ${marker.battery}%\n状态 ${this.mapRideStatus(marker.rideStatus)}\n故障 ${Number(marker.faultStatus) === 1 ? '是' : '否'}`,
        showCancel: false
      })
    },
    mapRideStatus(status) {
      const statusMap = {
        0: '空闲',
        1: '使用中',
        2: '维修中',
        3: '调度中'
      }
      return statusMap[Number(status)] || '--'
    },
    navigateTo(page) {
      if (!this.hasToken) {
        this.goLogin()
        return
      }

      uni.navigateTo({
        url: `/pages/${page}/${page}`
      })
    },
    navigateToProfile() {
      uni.navigateTo({
        url: '/pages/profile/profile'
      })
    },
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/login?mode=login'
      })
    }
  }
}
</script>

<style>
.page { display: flex; flex-direction: column; min-height: 100vh; background-color: #fafaf8; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 32rpx; background-color: #ffffff; border-bottom: 1rpx solid #e5e5e2; }
.brand { display: flex; align-items: center; }
.logo { width: 84rpx; height: 84rpx; margin-right: 20rpx; }
.brand-text { display: flex; flex-direction: column; }
.brand-title { font-size: 30rpx; color: #0b0e0d; letter-spacing: 4rpx; }
.brand-subtitle { margin-top: 8rpx; font-size: 22rpx; color: #737373; }
.avatar { width: 64rpx; height: 64rpx; }
.map-container { width: 100%; height: 560rpx; background-color: #ffffff; border-bottom: 1rpx solid #e5e5e2; }
.map { width: 100%; height: 100%; }
.guest-card, .summary-card, .tip-card { margin: 32rpx; background-color: #ffffff; border: 1rpx solid #e5e5e2; }
.guest-card { padding: 40rpx 32rpx; }
.guest-title { display: block; margin-bottom: 24rpx; font-size: 28rpx; color: #0b0e0d; line-height: 1.6; }
.login-btn { background-color: #0b0e0d; color: #ffffff; border: none; border-radius: 0; }
.summary-card { display: flex; align-items: center; }
.summary-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
.summary-label { font-size: 22rpx; color: #737373; margin-bottom: 12rpx; }
.summary-value { font-size: 34rpx; color: #0b0e0d; text-align: center; padding: 0 16rpx; }
.summary-divider { width: 1rpx; align-self: stretch; background-color: #e5e5e2; }
.function-area { display: flex; justify-content: center; align-items: center; margin: 0 32rpx 32rpx; padding: 28rpx 0; background-color: #ffffff; border: 1rpx solid #e5e5e2; }
.function-item { display: flex; align-items: center; }
.function-text { font-size: 26rpx; color: #525252; letter-spacing: 2rpx; }
.function-divider { margin: 0 16rpx; font-size: 20rpx; color: #d4d4d1; }
.tip-card { padding: 36rpx 32rpx; }
.tip-title { display: block; margin-bottom: 16rpx; font-size: 28rpx; color: #0b0e0d; }
.tip-desc { display: block; font-size: 24rpx; color: #737373; line-height: 1.7; }
</style>
