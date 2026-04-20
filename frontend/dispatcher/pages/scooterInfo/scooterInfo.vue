<template>
  <view class="page">
    <view class="header">
      <text class="title">车辆信息</text>
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

    <view class="info-card">
      <view class="info-row">
        <text class="info-label">车辆编号</text>
        <text class="info-value">{{ scooterInfo.code || '--' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">车辆状态</text>
        <text class="info-value">{{ rideStatusText }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">故障状态</text>
        <text class="info-value">{{ faultStatusText }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">剩余电量</text>
        <text class="info-value">{{ batteryText }}</text>
      </view>
    </view>

    <view class="tip-card">
      <text class="tip-text">扫码解锁成功后，可直接停放当前车辆，或继续扫码解锁下一辆。</text>
    </view>

    <view class="action-section">
      <view class="action-row">
        <button
          class="action-btn secondary-btn"
          hover-class="button-hover"
          hover-start-time="0"
          hover-stay-time="90"
          :disabled="isContinuing"
          @click="continueUnlock"
        >
          {{ isContinuing ? '处理中...' : '继续开锁' }}
        </button>
        <button
          class="action-btn primary-btn"
          hover-class="button-hover"
          hover-start-time="0"
          hover-stay-time="90"
          :disabled="isLocking"
          @click="lockAndPark"
        >
          {{ isLocking ? '停放中...' : '关锁停放' }}
        </button>
      </view>

      <button
        class="manual-btn"
        hover-class="button-hover"
        hover-start-time="0"
        hover-stay-time="90"
        @click="goManualUnlock"
      >
        编号开锁
      </button>
    </view>
  </view>
</template>

<script>
import { getMapData, getScooterInfo, lockScooter, unlockScooter } from '@/api/index'

const DEFAULT_SCOOTER_INFO = {
  id: '',
  code: '',
  ride_status: 0,
  fault_status: 0,
  battery: 0,
  latitude: '',
  longitude: ''
}

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
      currentCode: '',
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
    }
  },
  computed: {
    rideStatusText() {
      const statusMap = {
        0: '空闲',
        1: '使用中',
        2: '维修中',
        3: '调度中'
      }
      return statusMap[Number(this.scooterInfo.ride_status)] || '--'
    },
    faultStatusText() {
      return Number(this.scooterInfo.fault_status) === 1 ? '故障' : '正常'
    },
    batteryText() {
      const battery = Number(this.scooterInfo.battery)
      return Number.isFinite(battery) ? `${battery}%` : '--'
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('dispatcherToken')) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
      return
    }

    const task = uni.getStorageSync('dispatcherCurrentTask') || {}
    this.currentCode = this.normalizeScooterCode(
      (options && options.code ? decodeURIComponent(options.code) : '') || task.scooterCode || ''
    )

    if (!this.currentCode) {
      uni.showToast({
        title: '缺少车辆编号',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack({
          delta: 1
        })
      }, 600)
      return
    }

    this.loadScooterInfo()
    this.loadCurrentLocation()
  },
  methods: {
    async loadCurrentLocation() {
      try {
        const location = await this.getLocation()
        this.currentLocation = {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude)
        }
        this.latitude = this.currentLocation.latitude
        this.longitude = this.currentLocation.longitude
        this.loadMapData()
      } catch (error) {
        this.currentLocation = null
        this.loadMapData()
      }
    },
    async loadScooterInfo() {
      try {
        uni.showLoading({
          title: '加载中...'
        })
        const res = await getScooterInfo(this.currentCode)
        uni.hideLoading()
        const data = res.data || {}
        this.scooterInfo = {
          ...DEFAULT_SCOOTER_INFO,
          ...data,
          code: data.code || this.currentCode
        }
        this.syncMapCenter()
        this.loadMapData()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '加载车辆信息失败',
          icon: 'none'
        })
      }
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
            width: this.isCurrentScooter(item) ? 40 : 34,
            height: this.isCurrentScooter(item) ? 40 : 34,
            callout: this.isCurrentScooter(item)
              ? {
                  content: item.code || this.currentCode,
                  color: '#0b0e0d',
                  fontSize: 12,
                  borderRadius: 6,
                  bgColor: '#ffffff',
                  padding: 6,
                  display: 'ALWAYS'
                }
              : undefined,
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
    isCurrentScooter(item) {
      return this.normalizeScooterCode(item && item.code) === this.currentCode
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
        fillColor: 'rgba(18, 52, 120, 0.14)',
        strokeColor: 'rgba(58, 157, 232, 0.9)',
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
      const currentScooterPoint =
        this.findCurrentScooterPoint(Array.isArray(data && data.scooters) ? data.scooters : []) ||
        this.findCurrentScooterPoint([this.scooterInfo])

      if (currentScooterPoint) {
        this.latitude = currentScooterPoint.latitude
        this.longitude = currentScooterPoint.longitude
        return
      }

      const fallbackPoint =
        parkingPoints && parkingPoints[0]
          ? parkingPoints[0]
          : this.normalizePoint(noParkingMarkers && noParkingMarkers[0])

      if (fallbackPoint) {
        this.latitude = fallbackPoint.latitude
        this.longitude = fallbackPoint.longitude
      }
    },
    findCurrentScooterPoint(list = []) {
      const matched = list.find((item) => this.isCurrentScooter(item))
      return this.normalizePoint(matched)
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
    getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject
        })
      })
    },
    async lockAndPark() {
      if (this.isLocking) {
        return
      }

      this.isLocking = true
      try {
        uni.showLoading({
          title: '停放中...'
        })
        let latitude = Number(this.scooterInfo.latitude)
        let longitude = Number(this.scooterInfo.longitude)

        try {
          const location = await this.getLocation()
          latitude = Number(location.latitude)
          longitude = Number(location.longitude)
        } catch (error) {
        }

        const payload = {
          code: this.scooterInfo.code || this.currentCode,
          battery: Number(this.scooterInfo.battery || 0),
          latitude,
          longitude
        }

        await lockScooter(payload)
        uni.hideLoading()
        uni.setStorageSync('dispatcherCurrentTask', {
          ...payload,
          taskType: 'lock'
        })
        uni.showModal({
          title: '关锁停放成功',
          content: `车辆 ${payload.code} 已完成停放。`,
          showCancel: false,
          success: () => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '停放失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.isLocking = false
      }
    },
    continueUnlock() {
      if (this.isContinuing) {
        return
      }

      this.isContinuing = true
      uni.scanCode({
        success: async (res) => {
          const code = this.normalizeScooterCode(this.extractScooterCode(res.result))
          if (!code) {
            uni.showToast({
              title: '未识别到车辆编号',
              icon: 'none'
            })
            return
          }

          try {
            uni.showLoading({
              title: '开锁中...'
            })
            const unlockRes = await unlockScooter(code)
            uni.hideLoading()
            uni.setStorageSync('dispatcherCurrentTask', {
              ...(unlockRes.data || {}),
              scooterCode: code,
              taskType: 'unlock'
            })
            this.currentCode = code
            await this.loadScooterInfo()
          } catch (error) {
            uni.hideLoading()
            uni.showToast({
              title: '开锁失败，请稍后重试',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          })
        },
        complete: () => {
          this.isContinuing = false
        }
      })
    },
    goManualUnlock() {
      uni.navigateTo({
        url: '/pages/unlock/unlock'
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #fafaf8;
  padding-bottom: 48rpx;
}

.header {
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.title {
  font-size: 36rpx;
  color: #0b0e0d;
  letter-spacing: 4rpx;
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

.info-card,
.tip-card {
  margin: 32rpx;
  padding: 40rpx 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0efe8;
}

.info-row:first-child {
  padding-top: 0;
}

.info-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  font-size: 24rpx;
  color: #737373;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #0b0e0d;
  word-break: break-all;
}

.tip-text {
  display: block;
  font-size: 24rpx;
  color: #737373;
  line-height: 1.7;
}

.action-section {
  padding: 0 32rpx;
}

.action-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.action-btn {
  flex: 1;
  border-radius: 0;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.primary-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
}

.secondary-btn {
  background-color: #ffffff;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
}

.action-btn[disabled] {
  opacity: 0.7;
}

.manual-btn {
  width: 100%;
  background-color: #ffffff;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}
</style>
