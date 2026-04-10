<template>
  <view class="page">
    <view class="header">
      <view class="brand">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <view class="brand-text">
          <text class="brand-title">熊猫出行</text>
          <text class="brand-subtitle">{{ headerUsername }}</text>
        </view>
      </view>
      <image class="avatar" src="/static/avatar.png" mode="aspectFit" @click="navigateToProfile"></image>
    </view>

    <view class="map-container">
      <map
        class="map"
        id="map"
        :latitude="latitude"
        :longitude="longitude"
        :scale="scale"
        :markers="markers"
        :polygons="polygons"
        :show-location="true"
        @regionchange="handleMapRegionChange"
      ></map>
    </view>

    <view class="unlock-section">
      <button class="unlock-btn" :disabled="isActionPending('scanUnlock') || isActionPending('unlockByCode')" @click="scanUnlock">
        <text class="unlock-btn-text">{{ isActionPending('scanUnlock') || isActionPending('unlockByCode') ? '处理中...' : '扫码开锁' }}</text>
      </button>
    </view>

    <view class="function-area">
      <view class="function-item" @click="showParkingPoints">
        <text class="function-text">搜停车点</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item" @click="navigateTo('fault')">
        <text class="function-text">故障上报</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item" @click="navigateTo('unlock')">
        <text class="function-text">编号开锁</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item" @click="showRideNotice">
        <text class="function-text">骑行须知</text>
      </view>
    </view>

    <view class="subscription-area">
      <view class="subscription-header">
        <text class="subscription-title">优惠套餐</text>
        <text class="subscription-more">{{ subscriptionPackages.length }} 个套餐</text>
      </view>
      <view v-if="subscriptionPackages.length" class="subscription-list">
        <view v-for="pkg in subscriptionPackages" :key="pkg.id" class="subscription-item">
          <view class="subscription-info">
            <text class="subscription-name">{{ pkg.title }}</text>
            <text class="subscription-desc">{{ pkg.description || '骑行套餐' }}</text>
            <text class="subscription-price">¥{{ formatAmount(pkg.price) }}</text>
          </view>
          <button class="subscription-btn" :disabled="isActionPending('viewSubscription')" @click="handleSubscription(pkg)">
            {{ isActionPending('viewSubscription') ? '处理中...' : '查看详情' }}
          </button>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-text">暂无可用套餐</text>
      </view>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { getMapData, getScooterInfo, getSubscriptions, unlockScooter } from '@/api/index'

const CURRENT_RIDE_STORAGE_KEY = 'currentRide'

const DEFAULT_LOCATION = {
  latitude: 39.9042,
  longitude: 116.4074
}

const MARKER_ICONS = {
  scooter: '/static/scooter.svg',
  parking: '/static/parking.svg',
  noParking: '/static/no-parking.svg'
}

export default {
  mixins: [actionGuard],
  data() {
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      scale: 16,
      markers: [],
      polygons: [],
      parkingPoints: [],
      subscriptionPackages: [],
      headerUsername: '游客用户',
      mapContext: null
    }
  },
  onLoad() {
    this.initPage()
  },
  onReady() {
    this.mapContext = uni.createMapContext('map', this)
  },
  onShow() {
    this.syncHeaderUser()
    this.resumeCurrentRide()
  },
  methods: {
    ensureLoggedIn() {
      const hasToken = Boolean(uni.getStorageSync('token'))
      if (hasToken) {
        return true
      }

      this.withAction('loginRedirect', () => new Promise((resolve) => {
        uni.navigateTo({
          url: '/pages/login/login?mode=login',
          complete: resolve
        })
      }))
      return false
    },
    syncHeaderUser() {
      const cachedUser = uni.getStorageSync('userInfo') || {}
      const hasToken = Boolean(uni.getStorageSync('token'))
      this.headerUsername = hasToken
        ? (cachedUser.username || cachedUser.email || '已登录用户')
        : '游客用户'
    },
    resumeCurrentRide() {
      const currentRide = uni.getStorageSync(CURRENT_RIDE_STORAGE_KEY)
      if (currentRide && currentRide.orderId && currentRide.active) {
        uni.navigateTo({
          url: '/pages/riding/riding'
        })
      }
    },
    async initPage() {
      await Promise.all([this.loadSubscriptions(), this.loadLocationAndMap()])
    },
    async loadSubscriptions() {
      try {
        const res = await getSubscriptions()
        const packages = res.data && Array.isArray(res.data.packages) ? res.data.packages : []
        this.subscriptionPackages = packages
      } catch (error) {
        this.subscriptionPackages = []
      }
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
    async loadLocationAndMap() {
      try {
        const location = await this.getLocation()
        this.latitude = location.latitude
        this.longitude = location.longitude
      } catch (error) {
        uni.showToast({
          title: '定位失败，使用默认位置',
          icon: 'none'
        })
      }

      await this.loadMapData()
    },
    async loadMapData() {
      try {
        const res = await getMapData({
          latitude: this.latitude,
          longitude: this.longitude,
          scale: this.normalizeMapScale(this.scale)
        })
        const data = res.data || {}
        const scooters = this.mapScooters(data.scooters || [])
        const parkingPoints = this.mapParkingPoints(data.parkingPoints || [])
        const noParkingAreas = this.mapNoParkingAreas(data.noParkingAreas || [])
        const noParkingAreaMarkers = this.mapNoParkingAreaMarkers(data.noParkingAreas || [], noParkingAreas)

        this.parkingPoints = parkingPoints
        this.polygons = noParkingAreas
        this.markers = [
          ...scooters,
          ...this.mapParkingPointMarkers(parkingPoints),
          ...noParkingAreaMarkers
        ]
      } catch (error) {
        this.markers = []
        this.polygons = []
        this.parkingPoints = []
      }
    },
    getMapContext() {
      if (!this.mapContext) {
        this.mapContext = uni.createMapContext('map', this)
      }
      return this.mapContext
    },
    getCurrentMapScale() {
      return new Promise((resolve, reject) => {
        this.getMapContext().getScale({
          success: (res) => resolve(this.normalizeMapScale(res.scale)),
          fail: reject
        })
      })
    },
    normalizeMapScale(scale) {
      const roundedScale = Math.round(Number(scale))
      if (!Number.isFinite(roundedScale)) {
        return 16
      }
      return Math.min(20, Math.max(3, roundedScale))
    },
    async handleMapRegionChange(event) {
      if (!event || !event.detail || event.detail.type !== 'end') {
        return
      }

      await this.withAction('reloadMapByScale', async () => {
        try {
          const nextScale = await this.getCurrentMapScale()
          if (!Number.isFinite(nextScale) || nextScale === this.scale) {
            return
          }
          this.scale = this.normalizeMapScale(nextScale)
          await this.loadMapData()
        } catch (error) {
        }
      })
    },
    mapScooters(list) {
      return list
        .map((item, index) => {
          if (!this.isValidPoint(item.latitude, item.longitude)) {
            return null
          }
          return {
            id: Number(item.id) || index + 1,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            iconPath: MARKER_ICONS.scooter,
            width: 34,
            height: 34
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
            strokeColor: '#FF4D4F2E',
            strokeWidth: 0
          }
        })
        .filter(Boolean)
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
      if (!this.isValidPoint(latitude, longitude)) {
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

      if (Array.isArray(center)) {
        return this.normalizePoint(center)
      }

      if (typeof center === 'string') {
        const values = center
          .split(',')
          .map((item) => Number(item.trim()))
        return this.normalizePoint(values)
      }

      return this.normalizePoint(center)
    },
    computePolygonCenter(points) {
      if (!Array.isArray(points) || !points.length) {
        return null
      }

      const total = points.reduce((result, point) => {
        return {
          latitude: result.latitude + Number(point.latitude || 0),
          longitude: result.longitude + Number(point.longitude || 0)
        }
      }, { latitude: 0, longitude: 0 })

      return {
        latitude: total.latitude / points.length,
        longitude: total.longitude / points.length
      }
    },
    isValidPoint(latitude, longitude) {
      return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    },
    scanUnlock() {
      if (!this.ensureLoggedIn()) {
        return
      }

      this.withAction('scanUnlock', () => new Promise((resolve) => {
        uni.scanCode({
          success: async (res) => {
            const code = this.extractScooterCode(res.result)
            await this.unlockByCode(code)
          },
          fail: () => {
            uni.showToast({
              title: '扫码失败，请重试',
              icon: 'none'
            })
          },
          complete: resolve
        })
      }))
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
    async unlockByCode(code) {
      if (!code) {
        uni.showToast({
          title: '未识别到车辆编号',
          icon: 'none'
        })
        return
      }

      await this.withAction('unlockByCode', async () => {
        try {
          uni.showLoading({
            title: '正在开锁...'
          })
          const normalizedCode = this.normalizeScooterCode(code)
          const scooterRes = await getScooterInfo(normalizedCode)
          const scooterInfo = scooterRes.data || {}
          const res = await unlockScooter(normalizedCode)
          uni.hideLoading()
          uni.setStorageSync(CURRENT_RIDE_STORAGE_KEY, {
            ...(res.data || {}),
            scooterCode: normalizedCode,
            scooterId: scooterInfo.id || (res.data && res.data.scooterId) || '',
            battery: Number(scooterInfo.battery || 0),
            rideStatus: scooterInfo.rideStatus || 1,
            faultStatus: scooterInfo.faultStatus || 0,
            currentLatitude: Number(scooterInfo.latitude || this.latitude),
            currentLongitude: Number(scooterInfo.longitude || this.longitude),
            routePoints: [],
            startTime: new Date().toISOString(),
            totalKilometer: 0,
            amount: 0,
            active: true
          })
          await this.withAction('goRiding', () => new Promise((resolve) => {
            uni.navigateTo({
              url: '/pages/riding/riding',
              complete: resolve
            })
          }))
        } catch (error) {
          uni.hideLoading()
        }
      })
    },
    showParkingPoints() {
      if (!this.ensureLoggedIn()) {
        return
      }

      this.withAction('goParking', () => new Promise((resolve) => {
        uni.navigateTo({
          url: '/pages/parking/parking',
          complete: resolve
        })
      }))
    },
    showRideNotice() {
      if (!this.ensureLoggedIn()) {
        return
      }

      this.withAction('showRideNotice', () => new Promise((resolve) => {
        uni.showModal({
          title: '骑行须知',
          content: '请佩戴头盔、遵守交通规则，并在指定区域规范停车。',
          showCancel: false,
          complete: resolve
        })
      }))
    },
    handleSubscription(pkg) {
      if (!this.ensureLoggedIn()) {
        return
      }

      this.withAction('viewSubscription', async () => {
        uni.showToast({
          title: `${pkg.title} 购买功能暂未开放`,
          icon: 'none'
        })
      })
    },
    navigateTo(page) {
      if (!this.ensureLoggedIn()) {
        return
      }

      if (page === 'fault') {
        this.withAction('goFault', () => new Promise((resolve) => {
          uni.navigateTo({
            url: '/pages/reportFault/reportFault',
            complete: resolve
          })
        }))
        return
      }
      if (page === 'unlock') {
        this.withAction('goUnlock', () => new Promise((resolve) => {
          uni.navigateTo({
            url: '/pages/unlock/unlock',
            complete: resolve
          })
        }))
      }
    },
    navigateToProfile() {
      if (!this.ensureLoggedIn()) {
        return
      }

      this.withAction('goProfile', () => new Promise((resolve) => {
        uni.navigateTo({
          url: '/pages/profile/profile',
          complete: resolve
        })
      }))
    },
    formatAmount(value) {
      const amount = Number(value || 0)
      return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
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
  padding: 24rpx 0;
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

.subscription-area {
  background-color: #ffffff;
  padding: 64rpx 32rpx;
  flex: 1;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.subscription-title {
  font-size: 30rpx;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.subscription-more {
  font-size: 24rpx;
  color: #737373;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border: 1rpx solid #e5e5e2;
  background-color: #fafaf8;
}

.subscription-info {
  flex: 1;
}

.subscription-name {
  display: block;
  font-size: 28rpx;
  color: #0b0e0d;
  margin-bottom: 12rpx;
}

.subscription-desc {
  display: block;
  font-size: 22rpx;
  color: #737373;
  margin-bottom: 16rpx;
  line-height: 1.6;
}

.subscription-price {
  display: block;
  font-size: 32rpx;
  color: #0b0e0d;
}

.subscription-btn {
  background-color: transparent;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  padding: 20rpx 40rpx;
  font-size: 24rpx;
}

.subscription-btn[disabled] {
  color: #999999;
  border-color: #e5e5e2;
}

.empty-state {
  padding: 64rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
}
</style>
