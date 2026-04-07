<template>
  <view class="page">
    <view class="header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
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
      ></map>
    </view>

    <view class="unlock-section">
      <button class="unlock-btn" @click="scanUnlock">
        <text class="unlock-btn-text">扫码开锁</text>
      </button>
    </view>

    <view class="function-area">
      <view class="function-item" @click="showParkingPoints">
        <text class="function-text">停车点</text>
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
          <button class="subscription-btn" @click="handleSubscription(pkg)">查看详情</button>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-text">暂无可用套餐</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getMapData, getSubscriptions, unlockScooter } from '@/api/index'

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
  data() {
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      scale: 16,
      markers: [],
      polygons: [],
      parkingPoints: [],
      subscriptionPackages: []
    }
  },
  onLoad() {
    this.initPage()
  },
  methods: {
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
          scale: this.scale
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
        this.syncMapCenter(data, parkingPoints, noParkingAreaMarkers)
      } catch (error) {
        this.markers = []
        this.polygons = []
        this.parkingPoints = []
      }
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
            fillColor: 'rgba(255,0,0,0.15)',
            strokeColor: 'rgba(255,0,0,0.45)',
            strokeWidth: 2
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
    syncMapCenter(data, parkingPoints, noParkingAreaMarkers) {
      const firstScooter = Array.isArray(data.scooters) ? data.scooters[0] : null
      const firstPoint =
        this.normalizePoint(firstScooter) ||
        parkingPoints[0] ||
        (noParkingAreaMarkers[0] && this.normalizePoint(noParkingAreaMarkers[0]))

      if (firstPoint) {
        this.latitude = firstPoint.latitude
        this.longitude = firstPoint.longitude
      }
    },
    isValidPoint(latitude, longitude) {
      return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    },
    scanUnlock() {
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
        }
      })
    },
    extractScooterCode(rawCode) {
      const value = String(rawCode || '').trim()
      if (!value) {
        return ''
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
    async unlockByCode(code) {
      if (!code) {
        uni.showToast({
          title: '未识别到车辆编号',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '正在开锁...'
        })
        const res = await unlockScooter(code)
        uni.hideLoading()
        uni.setStorageSync('currentRide', {
          ...(res.data || {}),
          scooterCode: code
        })
        uni.showModal({
          title: '开锁成功',
          content: `车辆 ${code} 已开锁，祝你骑行愉快。`,
          showCancel: false
        })
      } catch (error) {
        uni.hideLoading()
      }
    },
    showParkingPoints() {
      const count = this.parkingPoints.length
      uni.showToast({
        title: count ? `附近停车点 ${count} 个` : '附近暂无停车点',
        icon: 'none'
      })
    },
    showRideNotice() {
      uni.showModal({
        title: '骑行须知',
        content: '请佩戴头盔、遵守交通规则，并在指定区域规范停车。',
        showCancel: false
      })
    },
    handleSubscription(pkg) {
      uni.showToast({
        title: `${pkg.title} 购买功能暂未开放`,
        icon: 'none'
      })
    },
    navigateTo(page) {
      if (page === 'fault') {
        uni.navigateTo({
          url: '/pages/reportFault/reportFault'
        })
        return
      }
      if (page === 'unlock') {
        uni.navigateTo({
          url: '/pages/unlock/unlock'
        })
      }
    },
    navigateToProfile() {
      uni.navigateTo({
        url: '/pages/profile/profile'
      })
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

.logo {
  width: 80rpx;
  height: 80rpx;
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
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 32rpx;
  letter-spacing: 4rpx;
}

.unlock-btn-text {
  color: #ffffff;
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

.empty-state {
  padding: 64rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
}
</style>
