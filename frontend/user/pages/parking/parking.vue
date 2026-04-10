<template>
  <view class="page">
    <view class="map-container">
      <map
        class="map"
        :latitude="latitude"
        :longitude="longitude"
        :scale="scale"
        :markers="markers"
        :show-location="true"
        @markertap="handleMarkerTap"
      ></map>
    </view>

    <view class="search-panel">
      <view class="search-box">
        <input
          v-model.trim="keyword"
          class="search-input"
          type="text"
          placeholder="搜索停车点名称"
          confirm-type="search"
        />
        <text v-if="keyword" class="clear-btn" @click="clearKeyword">清空</text>
      </view>

      <view class="result-meta">
        <text class="result-text">共 {{ filteredParkingPoints.length }} 个停车点</text>
      </view>

      <scroll-view class="result-list" scroll-y>
        <view
          v-for="item in filteredParkingPoints"
          :key="item.id"
          class="result-item"
          :class="{ active: item.id === selectedParkingId }"
          @click="selectParkingPoint(item)"
        >
          <text class="result-name">{{ item.name }}</text>
          <text class="result-location">{{ formatDistance(item.distance) }}</text>
        </view>
        <view v-if="!filteredParkingPoints.length" class="empty-state">
          <text class="empty-text">暂无匹配的停车点</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getMapData } from '@/api/index'

const DEFAULT_LOCATION = {
  latitude: 30.75953206821905,
  longitude: 103.98442619779992
}

const PARKING_ICON = '/static/parking.svg'

export default {
  data() {
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      originLatitude: DEFAULT_LOCATION.latitude,
      originLongitude: DEFAULT_LOCATION.longitude,
      scale: 17,
      keyword: '',
      selectedParkingId: null,
      parkingPoints: []
    }
  },
  computed: {
    filteredParkingPoints() {
      const keyword = this.keyword.trim().toLowerCase()
      if (!keyword) {
        return this.parkingPoints
      }

      return this.parkingPoints.filter((item) => item.name.toLowerCase().includes(keyword))
    },
    markers() {
      return this.filteredParkingPoints.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: PARKING_ICON,
        width: 30,
        height: 30,
        callout: {
          content: item.name,
          color: '#0b0e0d',
          fontSize: 12,
          borderRadius: 6,
          bgColor: '#ffffff',
          padding: 6,
          display: item.id === this.selectedParkingId ? 'ALWAYS' : 'BYCLICK'
        }
      }))
    }
  },
  async onLoad() {
    if (!uni.getStorageSync('token')) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
      return
    }

    await this.loadLocationAndParkingPoints()
  },
  methods: {
    getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject
        })
      })
    },
    async loadLocationAndParkingPoints() {
      try {
        const location = await this.getLocation()
        this.latitude = Number(location.latitude)
        this.longitude = Number(location.longitude)
        this.originLatitude = Number(location.latitude)
        this.originLongitude = Number(location.longitude)
      } catch (error) {
      }

      await this.loadParkingPoints()
    },
    async loadParkingPoints() {
      try {
        const res = await getMapData({
          latitude: this.latitude,
          longitude: this.longitude,
          scale: this.normalizeMapScale(this.scale)
        })
        const data = res.data || {}
        const points = this.normalizeParkingPoints(data.parkingPoints || [])
        this.parkingPoints = points

        if (points.length) {
          this.selectParkingPoint(points[0], false)
        }
      } catch (error) {
        this.parkingPoints = []
      }
    },
    normalizeParkingPoints(list) {
      return list
        .map((item, index) => {
          const latitude = Number(item.latitude)
          const longitude = Number(item.longitude)
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null
          }

          return {
            id: index + 1,
            name: item.name || `停车点 ${index + 1}`,
            latitude,
            longitude,
            distance: this.calculateDistance(this.originLatitude, this.originLongitude, latitude, longitude)
          }
        })
        .filter(Boolean)
        .sort((first, second) => first.distance - second.distance)
    },
    handleMarkerTap(event) {
      const current = this.filteredParkingPoints.find((item) => item.id === event.detail.markerId)
      if (current) {
        this.selectParkingPoint(current)
      }
    },
    normalizeMapScale(scale) {
      const roundedScale = Math.round(Number(scale))
      if (!Number.isFinite(roundedScale)) {
        return 17
      }
      return Math.min(20, Math.max(3, roundedScale))
    },
    selectParkingPoint(item, adjustScale = true) {
      this.selectedParkingId = item.id
      this.latitude = item.latitude
      this.longitude = item.longitude
      if (adjustScale) {
        this.scale = this.normalizeMapScale(18)
      }
    },
    clearKeyword() {
      this.keyword = ''
      if (this.parkingPoints.length && !this.selectedParkingId) {
        this.selectParkingPoint(this.parkingPoints[0], false)
      }
    },
    calculateDistance(fromLatitude, fromLongitude, toLatitude, toLongitude) {
      const toRadians = (degree) => degree * (Math.PI / 180)
      const earthRadius = 6371000
      const deltaLatitude = toRadians(toLatitude - fromLatitude)
      const deltaLongitude = toRadians(toLongitude - fromLongitude)
      const startLatitude = toRadians(fromLatitude)
      const endLatitude = toRadians(toLatitude)
      const haversine = Math.sin(deltaLatitude / 2) ** 2
        + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2
      const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
      return earthRadius * arc
    },
    formatDistance(distance) {
      const meters = Number(distance || 0)
      if (meters < 1000) {
        return `直线距离 ${Math.round(meters)} m`
      }
      return `直线距离 ${(meters / 1000).toFixed(2)} km`
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
  height: 520rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.map {
  width: 100%;
  height: 100%;
}

.search-panel {
  padding: 32rpx;
}

.search-box {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 20rpx;
  padding: 0 24rpx;
  height: 88rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #0b0e0d;
}

.clear-btn {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #737373;
}

.result-meta {
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.result-text {
  font-size: 24rpx;
  color: #737373;
}

.result-list {
  height: calc(100vh - 720rpx);
}

.result-item {
  margin-bottom: 16rpx;
  padding: 28rpx 24rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.result-item.active {
  border-color: #0b0e0d;
}

.result-name {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #0b0e0d;
}

.result-location {
  display: block;
  font-size: 22rpx;
  color: #737373;
}

.empty-state {
  padding: 96rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
}
</style>
