<template>
  <view class="page">
    <view class="header">
      <text class="title">调度历史</text>
    </view>

    <view class="filter-section">
      <view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="changeFilter('all')">
        <text class="filter-text">全部</text>
      </view>
      <view class="filter-item" :class="{ active: currentFilter === 'today' }" @click="changeFilter('today')">
        <text class="filter-text">今日</text>
      </view>
      <view class="filter-item" :class="{ active: currentFilter === 'processing' }" @click="changeFilter('processing')">
        <text class="filter-text">调度中</text>
      </view>
    </view>

    <view class="history-list">
      <view v-if="filteredHistory.length > 0">
        <view v-for="item in filteredHistory" :key="item.id" class="history-item">
          <view class="history-header">
            <view>
              <text class="history-code">{{ item.code }}</text>
              <text class="history-time">开始时间 {{ item.startTimeText }}</text>
            </view>
            <view class="history-tag" :class="item.statusClass">
              <text class="tag-text">{{ item.statusText }}</text>
            </view>
          </view>

          <view class="history-body">
            <view v-if="item.status !== 1" class="info-row">
              <text class="info-label">结束时间</text>
              <text class="info-value">{{ item.endTimeText }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">车辆状态</text>
              <text class="info-value">{{ item.rideStatusText }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">故障状态</text>
              <text class="info-value" :class="{ 'fault-text': item.faultStatus === 1 }">{{ item.faultStatusText }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">电量</text>
              <text class="info-value">{{ item.batteryText }}</text>
            </view>
          </view>

          <view v-if="item.canLock" class="action-row">
            <button class="lock-btn" :disabled="lockingId === item.id" @click="confirmLock(item)">
              {{ lockingId === item.id ? '投放中...' : '关锁停放' }}
            </button>
          </view>
        </view>
      </view>
      <view v-else class="empty-history">
        <text class="empty-text">暂无调度记录。</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getDispatchHistory, lockScooter } from '@/api/index'

export default {
  data() {
    return {
      historyList: [],
      currentFilter: 'all',
      lockingId: null
    }
  },
  computed: {
    filteredHistory() {
      const filters = {
        all: () => true,
        today: (item) => item.isToday,
        processing: (item) => item.status === 1
      }
      return this.historyList.filter(filters[this.currentFilter])
    }
  },
  onShow() {
    if (!uni.getStorageSync('dispatcherToken')) {
      uni.reLaunch({
        url: '/pages/login/login?mode=login'
      })
      return
    }
    this.loadHistory()
  },
  methods: {
    async loadHistory() {
      try {
        const res = await getDispatchHistory()
        const rawList =
          (res.data && res.data.history) ||
          (res.data && res.data.records) ||
          (res.data && res.data.list) ||
          []
        this.historyList = Array.isArray(rawList)
          ? rawList
            .map((item, index) => this.normalizeHistory(item, index))
            .sort((first, second) => second.sortTime - first.sortTime)
          : []
      } catch (error) {
        this.historyList = []
      }
    },
    normalizeHistory(item, index) {
      const startTime = item.startTime || item.createTime || item.dispatchTime || item.updateTime
      const endTime = item.endTime || item.finishTime || ''
      const rideStatus = this.normalizeRideStatus(item)
      const faultStatus = this.normalizeFaultStatus(item)
      const status = this.normalizeStatus(item, rideStatus)

      return {
        id: item.id || item.dispatchId || index + 1,
        code: item.scooterCode || item.code || item.vehicleCode || `车辆 ${index + 1}`,
        sortTime: this.toTimestamp(startTime),
        status,
        statusText: status === 1 ? '调度中' : '已完成',
        statusClass: status === 1 ? 'tag-processing' : 'tag-completed',
        canLock: status === 1,
        startTimeText: this.formatDateTime(startTime),
        endTimeText: endTime ? this.formatDateTime(endTime) : '--',
        rideStatus,
        rideStatusText: this.mapRideStatus(rideStatus),
        faultStatus,
        faultStatusText: faultStatus === 1 ? '故障' : '正常',
        batteryText: this.formatBattery(item.battery),
        batteryValue: this.extractBatteryValue(item.battery),
        isToday: this.isToday(startTime)
      }
    },
    normalizeStatus(item, rideStatus) {
      const rawStatus = item.status ?? item.dispatchStatus ?? item.taskStatus ?? item.resultStatus
      const numericStatus = Number(rawStatus)
      if (numericStatus === 0 || numericStatus === 1) {
        return numericStatus
      }

      return Number(rideStatus) === 1 ? 1 : 0
    },
    normalizeRideStatus(item) {
      const rawStatus = item.rideStatus ?? item.ride_status ?? item.vehicleStatus
      const numericStatus = Number(rawStatus)
      return Number.isFinite(numericStatus) ? numericStatus : 0
    },
    normalizeFaultStatus(item) {
      const rawStatus = item.faultStatus ?? item.fault_status
      const numericStatus = Number(rawStatus)
      return Number.isFinite(numericStatus) ? numericStatus : 0
    },
    mapRideStatus(status) {
      const statusMap = {
        0: '空闲',
        1: '调度中',
        2: '维修中',
        3: '使用中'
      }
      return statusMap[Number(status)] || '--'
    },
    formatDateTime(value) {
      if (!value) {
        return '--'
      }
      return String(value).replace('T', ' ').replace('Z', '').slice(0, 19)
    },
    toTimestamp(value) {
      if (!value) {
        return 0
      }
      const timestamp = new Date(String(value).replace(' ', 'T')).getTime()
      return Number.isFinite(timestamp) ? timestamp : 0
    },
    formatBattery(value) {
      const numericValue = this.extractBatteryValue(value)
      return Number.isFinite(numericValue) ? `${numericValue}%` : '--'
    },
    extractBatteryValue(value) {
      const numericValue = Number(value)
      return Number.isFinite(numericValue) ? numericValue : null
    },
    isToday(value) {
      if (!value) {
        return false
      }
      const date = new Date(String(value).replace(' ', 'T'))
      if (Number.isNaN(date.getTime())) {
        return false
      }
      const now = new Date()
      return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate()
    },
    changeFilter(filter) {
      this.currentFilter = filter
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
    confirmLock(item) {
      if (this.lockingId) {
        return
      }

      uni.showModal({
        title: '关锁停放',
        content: `确认将车辆 ${item.code} 关锁停放吗？`,
        confirmText: '确认投放',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          this.lockingId = item.id
          try {
            uni.showLoading({
              title: '投放中...'
            })
            const location = await this.getLocation()
            await lockScooter({
              code: item.code,
              battery: item.batteryValue ?? 0,
              latitude: Number(location.latitude),
              longitude: Number(location.longitude)
            })
            uni.hideLoading()
            uni.showToast({
              title: '投放成功',
              icon: 'success'
            })
            await this.loadHistory()
          } catch (error) {
            uni.hideLoading()
            uni.showToast({
              title: '投放失败，请稍后重试',
              icon: 'none'
            })
          } finally {
            this.lockingId = null
          }
        }
      })
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background-color: #fafaf8; }
.header { padding: 48rpx 32rpx; background-color: #fff; border-bottom: 1rpx solid #e5e5e2; }
.title { font-size: 36rpx; color: #0b0e0d; letter-spacing: 4rpx; }
.filter-section { display: flex; margin: 32rpx; background-color: #fff; padding: 20rpx; border: 1rpx solid #e5e5e2; }
.filter-item { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20rpx 0; }
.filter-item.active { background-color: #0b0e0d; }
.filter-text { font-size: 24rpx; color: #737373; }
.filter-item.active .filter-text { color: #fff; }
.history-list { margin: 0 32rpx 32rpx; }
.history-item { margin-bottom: 20rpx; background-color: #fff; border: 1rpx solid #e5e5e2; }
.history-header { display: flex; justify-content: space-between; align-items: center; padding: 32rpx; border-bottom: 1rpx solid #e5e5e2; }
.history-code { display: block; margin-bottom: 10rpx; font-size: 28rpx; color: #0b0e0d; }
.history-time { display: block; font-size: 22rpx; color: #737373; }
.history-tag { padding: 10rpx 24rpx; border: 1rpx solid transparent; }
.tag-processing { border-color: #0b0e0d; color: #0b0e0d; }
.tag-completed { border-color: #d4d4d1; color: #737373; }
.tag-text { font-size: 22rpx; }
.history-body { padding: 32rpx; }
.info-row { display: flex; justify-content: space-between; gap: 20rpx; margin-bottom: 18rpx; }
.info-row:last-child { margin-bottom: 0; }
.info-label { font-size: 22rpx; color: #737373; }
.info-value { flex: 1; text-align: right; font-size: 26rpx; color: #0b0e0d; word-break: break-all; }
.fault-text { color: #c62828; }
.action-row { padding: 0 32rpx 32rpx; }
.lock-btn { background-color: #0b0e0d; color: #fff; border: none; border-radius: 0; font-size: 28rpx; letter-spacing: 4rpx; }
.lock-btn[disabled] { opacity: 0.7; }
.empty-history { padding: 128rpx 32rpx; text-align: center; }
.empty-text { font-size: 24rpx; color: #737373; }
</style>
