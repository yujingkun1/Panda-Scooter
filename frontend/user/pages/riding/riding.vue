<template>
  <view class="page">
    <view class="map-container">
      <map
        class="map"
        :latitude="currentLatitude"
        :longitude="currentLongitude"
        :scale="scale"
        :polyline="polyline"
        :show-location="true"
      ></map>
    </view>

    <view class="panel">
      <view class="section">
        <text class="section-title">车辆信息</text>
        <view class="info-row">
          <text class="info-label">车辆编号</text>
          <text class="info-value">{{ ride.scooterCode }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">车辆状态</text>
          <text class="info-value">{{ rideStatusText }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">剩余电量</text>
          <text class="info-value">{{ currentBatteryText }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">骑行信息</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-label">骑行距离</text>
            <text class="stat-value">{{ distanceText }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">骑行时间</text>
            <text class="stat-value">{{ durationText }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">预计费用</text>
            <text class="stat-value">￥{{ amountText }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">平均速度</text>
            <text class="stat-value">{{ avgSpeedText }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">开始时间</text>
          <text class="info-value">{{ startTimeText }}</text>
        </view>
      </view>

      <button class="end-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" :disabled="isActionPending('finishRide')" @click="finishRide">
        {{ isActionPending('finishRide') ? '结束中...' : '结束用车' }}
      </button>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { lockScooter } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const CURRENT_RIDE_STORAGE_KEY = 'currentRide'
const DISTANCE_SAMPLE_INTERVAL = 5000
const CLOCK_INTERVAL = 1000
const BASE_FEE = 2
const FEE_PER_MINUTE = 0.2
const FEE_PER_KILOMETER = 1
const BATTERY_COST_PER_KILOMETER = 4
const DEFAULT_SCALE = 17

export default {
  mixins: [actionGuard],
  data() {
    return {
      scale: DEFAULT_SCALE,
      ride: {
        orderId: '',
        scooterId: '',
        scooterCode: '',
        battery: 0,
        rideStatus: 1,
        faultStatus: 0,
        startTime: '',
        totalKilometer: 0,
        amount: 0,
        routePoints: [],
        currentLatitude: 39.9042,
        currentLongitude: 116.4074,
        lastSampleTime: '',
        active: false
      },
      elapsedSeconds: 0,
      clockTimer: null,
      locationTimer: null
    }
  },
  computed: {
    currentLatitude() {
      return this.ride.currentLatitude
    },
    currentLongitude() {
      return this.ride.currentLongitude
    },
    rideStatusText() {
      const statusMap = {
        0: '待骑行',
        1: '骑行中',
        2: '已结束'
      }
      return statusMap[Number(this.ride.rideStatus)] || '骑行中'
    },
    currentBattery() {
      const current = Number(this.ride.battery || 0) - this.ride.totalKilometer * BATTERY_COST_PER_KILOMETER
      return Math.max(0, current)
    },
    currentBatteryText() {
      return `${this.currentBattery.toFixed(0)}%`
    },
    distanceText() {
      return `${this.ride.totalKilometer.toFixed(2)} km`
    },
    durationText() {
      const hours = String(Math.floor(this.elapsedSeconds / 3600)).padStart(2, '0')
      const minutes = String(Math.floor((this.elapsedSeconds % 3600) / 60)).padStart(2, '0')
      const seconds = String(this.elapsedSeconds % 60).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    },
    amountText() {
      return this.ride.amount.toFixed(2)
    },
    avgSpeedText() {
      if (!this.elapsedSeconds) {
        return '0.00 km/h'
      }
      const hours = this.elapsedSeconds / 3600
      return `${(this.ride.totalKilometer / hours).toFixed(2)} km/h`
    },
    startTimeText() {
      return this.formatDateTime(this.ride.startTime)
    },
    polyline() {
      if (this.ride.routePoints.length < 2) {
        return []
      }

      return [{
        points: this.ride.routePoints.map((item) => ({
          latitude: item.latitude,
          longitude: item.longitude
        })),
        color: '#0b0e0d',
        width: 4
      }]
    }
  },
  async onLoad() {
    if (!uni.getStorageSync('token')) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
      return
    }

    const cachedRide = uni.getStorageSync(CURRENT_RIDE_STORAGE_KEY)
    if (!cachedRide || !cachedRide.orderId) {
      uni.redirectTo({
        url: '/pages/index/index'
      })
      return
    }

    this.restoreRide(cachedRide)
    await this.bootstrapRide()
  },
  onUnload() {
    this.clearTimers()
  },
  methods: {
    async bootstrapRide() {
      this.updateElapsedSeconds()
      this.updateEstimatedAmount()
      this.startClock()

      if (!this.ride.routePoints.length) {
        await this.captureCurrentLocation()
      }

      if (!this.locationTimer) {
        this.startLocationTracking()
      }
    },
    restoreRide(cachedRide) {
      const routePoints = Array.isArray(cachedRide.routePoints) ? cachedRide.routePoints : []
      const currentLatitude = Number(cachedRide.currentLatitude || (routePoints[routePoints.length - 1] && routePoints[routePoints.length - 1].latitude) || 39.9042)
      const currentLongitude = Number(cachedRide.currentLongitude || (routePoints[routePoints.length - 1] && routePoints[routePoints.length - 1].longitude) || 116.4074)

      this.ride = {
        orderId: cachedRide.orderId || '',
        scooterId: cachedRide.scooterId || '',
        scooterCode: cachedRide.scooterCode || '',
        battery: Number(cachedRide.battery || 0),
        rideStatus: cachedRide.rideStatus || 1,
        faultStatus: cachedRide.faultStatus || 0,
        startTime: cachedRide.startTime || new Date().toISOString(),
        totalKilometer: Number(cachedRide.totalKilometer || 0),
        amount: Number(cachedRide.amount || 0),
        routePoints,
        currentLatitude,
        currentLongitude,
        lastSampleTime: cachedRide.lastSampleTime || '',
        active: true
      }
    },
    startClock() {
      this.clockTimer = setInterval(() => {
        this.updateElapsedSeconds()
        this.updateEstimatedAmount()
        this.persistRide()
      }, CLOCK_INTERVAL)
    },
    startLocationTracking() {
      this.locationTimer = setInterval(() => {
        this.captureCurrentLocation()
      }, DISTANCE_SAMPLE_INTERVAL)
    },
    clearTimers() {
      if (this.clockTimer) {
        clearInterval(this.clockTimer)
        this.clockTimer = null
      }
      if (this.locationTimer) {
        clearInterval(this.locationTimer)
        this.locationTimer = null
      }
    },
    updateElapsedSeconds() {
      const startTime = new Date(this.ride.startTime).getTime()
      const currentTime = Date.now()
      this.elapsedSeconds = Math.max(0, Math.floor((currentTime - startTime) / 1000))
    },
    updateEstimatedAmount() {
      const minuteCost = (this.elapsedSeconds / 60) * FEE_PER_MINUTE
      const distanceCost = this.ride.totalKilometer * FEE_PER_KILOMETER
      this.ride.amount = Number((BASE_FEE + minuteCost + distanceCost).toFixed(2))
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
    async captureCurrentLocation() {
      try {
        const location = await this.getLocation()
        const point = {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          timestamp: new Date().toISOString()
        }
        this.appendRoutePoint(point)
        if (!this.locationTimer) {
          this.startLocationTracking()
        }
      } catch (error) {
      }
    },
    appendRoutePoint(point) {
      const routePoints = [...this.ride.routePoints]
      const lastPoint = routePoints[routePoints.length - 1]

      if (lastPoint) {
        const distance = this.calculateDistance(lastPoint, point)
        if (distance > 0 && distance < 2) {
          this.ride.totalKilometer = Number((this.ride.totalKilometer + distance).toFixed(4))
          routePoints.push(point)
        } else if (!distance) {
          routePoints.push(point)
        }
      } else {
        routePoints.push(point)
      }

      this.ride.routePoints = routePoints
      this.ride.currentLatitude = point.latitude
      this.ride.currentLongitude = point.longitude
      this.ride.lastSampleTime = point.timestamp
      this.updateEstimatedAmount()
      this.persistRide()
    },
    calculateDistance(startPoint, endPoint) {
      const toRadians = (degree) => degree * Math.PI / 180
      const earthRadius = 6371
      const deltaLatitude = toRadians(endPoint.latitude - startPoint.latitude)
      const deltaLongitude = toRadians(endPoint.longitude - startPoint.longitude)
      const latitude1 = toRadians(startPoint.latitude)
      const latitude2 = toRadians(endPoint.latitude)

      const a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
        Math.cos(latitude1) * Math.cos(latitude2) *
        Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return earthRadius * c
    },
    persistRide() {
      uni.setStorageSync(CURRENT_RIDE_STORAGE_KEY, {
        ...this.ride,
        amount: this.ride.amount,
        totalKilometer: this.ride.totalKilometer,
        currentLatitude: this.currentLatitude,
        currentLongitude: this.currentLongitude,
        active: true
      })
    },
    formatDateTime(value) {
      if (!value) {
        return '--'
      }
      return String(value).replace('T', ' ').replace('Z', '').slice(0, 19)
    },
    async finishRide() {
      await this.withAction('finishRide', async () => {
        try {
          await this.captureCurrentLocation()
        } catch (error) {
          showUnhandledError(error, '定位失败，将使用上次位置结束用车')
        }

        try {
          uni.showLoading({
            title: '结束用车中...'
          })
          const endTime = new Date().toISOString()
          const payload = {
            orderId: Number(this.ride.orderId),
            startTime: this.ride.startTime,
            endTime,
            amount: Number(this.ride.amount.toFixed(2)),
            totalKilometer: Number(this.ride.totalKilometer.toFixed(2)),
            code: Number(this.ride.scooterId),
            battery: Number(this.currentBattery.toFixed(0)),
            latitude: this.currentLatitude,
            longitude: this.currentLongitude
          }
          await lockScooter(payload)
          uni.hideLoading()
          this.clearTimers()
          uni.removeStorageSync(CURRENT_RIDE_STORAGE_KEY)
          uni.showModal({
            title: '骑行结束',
            content: `本次骑行 ${this.distanceText}，预计费用 ￥${this.amountText}`,
            showCancel: false,
            success: () => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }
          })
        } catch (error) {
          uni.hideLoading()
          showUnhandledError(error, '结束用车失败，请稍后重试')
        }
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #fafaf8;
}

.map-container {
  width: 100%;
  height: 480rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.map {
  width: 100%;
  height: 100%;
}

.panel {
  padding: 32rpx;
}

.section {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.section-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 30rpx;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 18rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 24rpx;
  color: #737373;
}

.info-value {
  font-size: 26rpx;
  color: #0b0e0d;
  text-align: right;
  word-break: break-all;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  padding: 24rpx;
  background-color: #fafaf8;
  border: 1rpx solid #e5e5e2;
}

.stat-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 22rpx;
  color: #737373;
}

.stat-value {
  display: block;
  font-size: 30rpx;
  color: #0b0e0d;
}

.end-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.end-btn:disabled {
  background-color: #d4d4d1;
}
</style>
