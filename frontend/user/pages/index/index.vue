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
        @regionchange="onRegionChange"
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
          <button class="subscription-btn" @click="handleSubscription(pkg)">立即购买</button>
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
    getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject
        })
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
        this.markers = this.mapScooterMarkers(data.scooters || [])
        this.polygons = this.mapNoParkingAreas(data.noParkingAreas || [])
        this.parkingPoints = this.mapParkingPoints(data.parkingPoints || [])
      } catch (error) {
        this.markers = []
        this.polygons = []
        this.parkingPoints = []
        uni.showToast({
          title: '地图数据加载失败',
          icon: 'none'
        })
      }
    },
    mapScooterMarkers(list) {
      return list
        .map((item) => {
          if (!this.isValidPoint(item.latitude, item.longitude)) {
            return null
          }

          return {
            id: item.id,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            iconPath: '/static/scooter.svg',
            width: 30,
            height: 30,
            callout: {
              content: `${item.battery || 0}%`,
              color: '#333',
              fontSize: 12,
              borderRadius: 5,
              bgColor: 'rgba(255,255,255,0.8)',
              padding: 5,
              display: 'BYCLICK'
            }
          }
        })
        .filter(Boolean)
    },
    mapParkingPoints(list) {
      return list
        .map((item) => this.normalizePoint(item))
        .filter(Boolean)
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
            fillColor: 'rgba(255, 0, 0, 0.15)',
            strokeColor: 'rgba(255, 0, 0, 0.5)',
            strokeWidth: 2
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
          if (Array.isArray(parsed)) {
            return parsed.map((item) => this.normalizePoint(item)).filter(Boolean)
          }
        } catch (error) {
          const segments = polygon.split(';').map((item) => item.trim()).filter(Boolean)
          return segments
            .map((segment) => {
              const normalized = segment.replace(/^\[|\]$/g, '')
              const values = normalized.split(',').map((item) => Number(item.trim()))
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
    isValidPoint(latitude, longitude) {
      return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    },
    onRegionChange() {
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
        uni.setStorageSync('currentRide', res.data || {})

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
        content: '请佩戴头盔、遵守交通规则，在指定区域规范停车。',
        showCancel: false
      })
    },
    handleSubscription(pkg) {
      uni.showToast({
        title: `${pkg.title} 开发中`,
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
      return Number(value || 0).toFixed(2)
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
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar:hover {
  opacity: 0.7;
}

.map-container {
  width: 100%;
  height: 520rpx;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
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
  align-items: center;
}

.unlock-btn {
  width: 85%;
  height: 96rpx;
  background-color: #0b0e0d;
  color: #ffffff;
  border-radius: 5rpx;
  font-size: 32rpx;
  font-weight: 300;
  border: none;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 4rpx;
}

.unlock-btn:hover {
  background-color: #222222;
  transform: translateY(-2rpx);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.function-item:hover {
  color: #0b0e0d;
}

.function-text {
  font-size: 26rpx;
  color: #525252;
  font-weight: 300;
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
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.subscription-more {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subscription-item:hover {
  transform: translateY(-4rpx);
  border-color: #d4d4d1;
  background-color: #ffffff;
}

.subscription-info {
  flex: 1;
}

.subscription-name {
  font-size: 28rpx;
  font-weight: 400;
  color: #0b0e0d;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.subscription-desc {
  font-size: 22rpx;
  color: #737373;
  margin-bottom: 16rpx;
  line-height: 1.6;
  font-weight: 300;
}

.subscription-price {
  font-size: 32rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.subscription-btn {
  background-color: transparent;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
  padding: 20rpx 48rpx;
  border-radius: 0;
  font-size: 24rpx;
  font-weight: 300;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 2rpx;
}

.subscription-btn:hover {
  background-color: #0b0e0d;
  color: #ffffff;
  border-color: #0b0e0d;
  transform: translateY(-2rpx);
}

.empty-state {
  padding: 64rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}
</style>
