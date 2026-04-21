<template>
  <view class="page">
    <view class="header">
      <view class="brand">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <view class="brand-text">
          <text class="brand-title">熊猫调度</text>
          <text class="brand-subtitle">{{ headerSubtitle }}</text>
        </view>
      </view>
      <view class="avatar-hit ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="navigateToProfile">
        <image class="avatar" src="/static/avatar.png" mode="aspectFit"></image>
      </view>
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

    <view class="unlock-section">
      <button
        class="unlock-btn"
        hover-class="button-hover"
        hover-start-time="0"
        hover-stay-time="90"
        :disabled="isScanning"
        @click="scanUnlock"
      >
        <text class="unlock-btn-text">{{ isScanning ? '处理中...' : '扫码开锁' }}</text>
      </button>
    </view>

    <view class="function-area">
      <view class="function-item ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="openVehicleLookup">
        <text class="function-text">车辆查询</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="navigateTo('unlock')">
        <text class="function-text">编号开锁</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="navigateTo('history')">
        <text class="function-text">调度历史</text>
      </view>
    </view>

    <view class="panel-area">
      <view v-if="!hasToken" class="guest-card">
        <text class="guest-title">登录后可执行扫码开锁、编号开锁和查看调度记录。</text>
        <button class="login-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" @click="goLogin">去登录</button>
      </view>
      <view v-else class="stats-card">
        <view class="stats-item">
          <text class="stats-label">辖区名称</text>
          <text class="stats-value">{{ currentAreaName }}</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-label">今日调度数量</text>
          <text class="stats-value">{{ todayDispatchedNum }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getDispatcherInfo, getMapData, unlockScooter } from '@/api/index'

const DEFAULT_LOCATION = {
  latitude: 30.75953206821905,
  longitude: 103.98442619779992
}

const MARKER_ICONS = {
  scooter: '/static/scooter.svg',
  parking: '/static/parking.svg',
  noParking: '/static/no-parking.svg'
}

export default {
  data() {
    return {
      hasToken: false,
      currentDispatcherName: '访客调度员',
      headerSubtitle: '调度控制台',
      currentAreaName: '未分配辖区',
      todayDispatchedNum: '0',
      isScanning: false,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      hasCurrentLocation: false,
      scale: 16,
      markers: [],
      polygons: [],
      scooterLookup: {}
    }
  },
  onShow() {
    if (!uni.getStorageSync('dispatcherToken')) {
      uni.reLaunch({
        url: '/pages/login/login?mode=login'
      })
      return
    }
    this.initPage()
  },
  methods: {
    async initPage() {
      this.loadDispatcherInfo()
      await this.loadCurrentLocation()
      this.loadMapData()
    },
    async loadDispatcherInfo() {
      const cached = uni.getStorageSync('dispatcherUserInfo') || {}
      this.hasToken = Boolean(uni.getStorageSync('dispatcherToken'))

      if (!this.hasToken) {
        this.currentDispatcherName = '访客调度员'
        this.headerSubtitle = '调度控制台'
        this.currentAreaName = '未分配辖区'
        this.todayDispatchedNum = '0'
        return
      }

      this.applyDispatcherInfo(cached)

      try {
        const res = await getDispatcherInfo()
        const data = res.data || {}
        const nextInfo = {
          ...cached,
          name: data.name || cached.name || '',
          email: data.email || cached.email || '',
          areaName: data.areaName || cached.areaName || '',
          todayDispatchedNum: String(data.todayDispatchedNum || cached.todayDispatchedNum || '0')
        }
        uni.setStorageSync('dispatcherUserInfo', nextInfo)
        this.applyDispatcherInfo(nextInfo)
      } catch (error) {
      }
    },
    applyDispatcherInfo(info = {}) {
      this.currentDispatcherName = info.name || info.email || '已登录调度员'
      this.headerSubtitle = this.currentDispatcherName
      this.currentAreaName = info.areaName || '未分配辖区'
      this.todayDispatchedNum = String(info.todayDispatchedNum || '0')
    },
    ensureLoggedIn() {
      if (this.hasToken) {
        return true
      }

      this.goLogin()
      return false
    },
    getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject
        })
      })
    },
    async loadCurrentLocation() {
      try {
        const location = await this.getLocation()
        this.latitude = Number(location.latitude)
        this.longitude = Number(location.longitude)
        this.hasCurrentLocation = true
      } catch (error) {
        this.hasCurrentLocation = false
        uni.showToast({
          title: '定位失败，将使用默认位置',
          icon: 'none'
        })
      }
    },
    scanUnlock() {
      if (!this.ensureLoggedIn() || this.isScanning) {
        return
      }

      this.isScanning = true
      uni.scanCode({
        success: (res) => {
          const code = this.extractScooterCode(res.result)
          if (!code) {
            uni.showToast({
              title: '未识别到车辆编号',
              icon: 'none'
            })
            return
          }

          this.handleScanUnlock(code)
        },
        fail: () => {
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          })
        },
        complete: () => {
          this.isScanning = false
        }
      })
    },
    async handleScanUnlock(code) {
      try {
        uni.showLoading({
          title: '开锁中...'
        })
        const normalizedCode = this.normalizeScooterCode(code)
        if (!normalizedCode) {
          uni.hideLoading()
          uni.showToast({
            title: '未识别到车辆编号',
            icon: 'none'
          })
          return
        }

        const res = await unlockScooter(normalizedCode)
        uni.hideLoading()
        uni.setStorageSync('dispatcherCurrentTask', {
          ...(res.data || {}),
          scooterCode: normalizedCode,
          taskType: 'unlock'
        })
        uni.navigateTo({
          url: `/pages/scooterInfo/scooterInfo?code=${encodeURIComponent(normalizedCode)}`
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '开锁失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    extractScooterCode(rawCode) {
      const value = String(rawCode || '').trim()
      if (!value) {
        return ''
      }

      const matchedCode = value.match(/PDSC\d+/i)
      if (matchedCode && matchedCode[0]) {
        return matchedCode[0].toUpperCase()
      }

      if (value.includes('code=')) {
        const query = value.split('?')[1] || ''
        const params = {}
        query.split('&').forEach((item) => {
          const [key, val] = item.split('=')
          if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(val || '')
          }
        })
        return params.code || value
      }

      const segments = value.split('/')
      return segments[segments.length - 1] || value
    },
    normalizeScooterCode(rawCode) {
      const value = String(rawCode || '').trim().toUpperCase()
      if (!value) {
        return ''
      }
      if (value.startsWith('PDSC')) {
        return value
      }
      const numericPart = value.replace(/\D/g, '')
      return numericPart ? `PDSC${numericPart.padStart(6, '0')}` : value
    },
    openVehicleLookup() {
      if (!this.ensureLoggedIn()) {
        return
      }

      uni.showToast({
        title: '车辆查询接口开发中',
        icon: 'none'
      })
    },
    navigateTo(page) {
      if (!this.ensureLoggedIn()) {
        return
      }

      uni.navigateTo({
        url: `/pages/${page}/${page}`
      })
    },
    navigateToProfile() {
      if (!this.ensureLoggedIn()) {
        return
      }

      uni.navigateTo({
        url: '/pages/profile/profile'
      })
    },
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/login?mode=login'
      })
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
            fillColor: '#FF4D4F2E',
            strokeColor: '#FF4D4F73',
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
        fillColor: '#12347824',
        strokeColor: '#3A9DE8E6',
        strokeWidth: 3
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
      if (this.hasCurrentLocation) {
        return
      }

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
    }
  }
}
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafaf8;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.brand {
  display: flex;
  align-items: center;
}

.logo {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 30rpx;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.brand-subtitle {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #737373;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
}

.avatar-hit {
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-container {
  width: 100%;
  height: 520rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.map {
  width: 100%;
  height: 100%;
}

.unlock-section {
  padding-top: 32rpx;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
}

.unlock-btn {
  width: 85%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 32rpx;
  letter-spacing: 4rpx;
  line-height: 1;
}

.unlock-btn-text {
  display: block;
  color: #ffffff;
  line-height: 1;
}

.unlock-btn:disabled {
  background-color: #d4d4d1;
}

.function-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 0 32rpx;
  background-color: #ffffff;
}

.function-item {
  display: flex;
  align-items: center;
}

.function-text {
  font-size: 26rpx;
  color: #525252;
  letter-spacing: 2rpx;
}

.function-divider {
  font-size: 20rpx;
  color: #e5e5e2;
  margin: 0 16rpx;
}

.panel-area {
  background-color: #ffffff;
  padding: 32rpx;
  flex: 1;
}

.guest-card,
.stats-card {
  border: 1rpx solid #e5e5e2;
  background-color: #fafaf8;
  padding: 40rpx 32rpx;
}

.guest-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #0b0e0d;
}

.stats-card {
  display: flex;
  align-items: stretch;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.stats-label {
  display: block;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  color: #737373;
}

.stats-value {
  display: block;
  font-size: 30rpx;
  color: #0b0e0d;
  text-align: center;
  word-break: break-word;
}

.stats-divider {
  width: 1rpx;
  background-color: #e5e5e2;
  margin: 0 24rpx;
}

.login-btn {
  margin-top: 12rpx;
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 28rpx;
  letter-spacing: 4rpx;
}
</style>
