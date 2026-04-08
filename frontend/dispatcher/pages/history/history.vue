<template>
  <view class="page">
    <view class="header">
      <text class="title">Dispatch History</text>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">Sign in to view dispatch history.</text>
      <button class="login-btn" @click="goLogin">Sign In</button>
    </view>

    <template v-else>
      <view class="filter-section">
        <view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="changeFilter('all')">
          <text class="filter-text">All</text>
        </view>
        <view class="filter-item" :class="{ active: currentFilter === 'unlock' }" @click="changeFilter('unlock')">
          <text class="filter-text">Unlock</text>
        </view>
        <view class="filter-item" :class="{ active: currentFilter === 'lock' }" @click="changeFilter('lock')">
          <text class="filter-text">Lock</text>
        </view>
      </view>

      <view class="history-list">
        <view v-if="filteredHistory.length > 0">
          <view v-for="item in filteredHistory" :key="item.id" class="history-item">
            <view class="history-header">
              <view>
                <text class="history-code">{{ item.code }}</text>
                <text class="history-time">{{ item.time }}</text>
              </view>
              <view class="history-tag" :class="item.tagClass">
                <text class="tag-text">{{ item.typeText }}</text>
              </view>
            </view>

            <view class="history-body">
              <view class="info-row">
                <text class="info-label">Status</text>
                <text class="info-value">{{ item.statusText }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">Battery</text>
                <text class="info-value">{{ item.battery }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">Position</text>
                <text class="info-value">{{ item.position }}</text>
              </view>
              <view v-if="item.remark" class="info-row">
                <text class="info-label">Remark</text>
                <text class="info-value">{{ item.remark }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-history">
          <text class="empty-text">No dispatch record yet.</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { getDispatchHistory } from '@/api/index'

export default {
  data() {
    return {
      hasToken: false,
      historyList: [],
      currentFilter: 'all',
      filters: {
        all: () => true,
        unlock: (item) => item.type === 'unlock',
        lock: (item) => item.type === 'lock'
      }
    }
  },
  computed: {
    filteredHistory() {
      return this.historyList.filter(this.filters[this.currentFilter])
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('dispatcherToken'))
    if (this.hasToken) {
      this.loadHistory()
    }
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
          ? rawList.map((item, index) => this.normalizeHistory(item, index))
          : []
      } catch (error) {
        this.historyList = []
      }
    },
    normalizeHistory(item, index) {
      const rawType = String(item.type || item.dispatchType || item.action || '').toLowerCase()
      const isLock = rawType.includes('lock') || rawType === '2'
      const position = this.formatPosition(item.latitude, item.longitude)
      const battery = item.battery !== undefined && item.battery !== null ? `${item.battery}%` : '--'
      const statusText = item.statusText || item.status || item.result || 'Completed'

      return {
        id: item.id || item.dispatchId || index + 1,
        code: item.code || item.scooterCode || item.vehicleCode || `Scooter ${index + 1}`,
        time: this.formatDateTime(item.createTime || item.dispatchTime || item.updateTime),
        type: isLock ? 'lock' : 'unlock',
        typeText: isLock ? 'Lock Placement' : 'Dispatch Unlock',
        tagClass: isLock ? 'tag-lock' : 'tag-unlock',
        statusText,
        battery,
        position,
        remark: item.remark || item.description || ''
      }
    },
    formatDateTime(value) {
      if (!value) {
        return '--'
      }
      return String(value).replace('T', ' ').replace('Z', '').slice(0, 19)
    },
    formatPosition(latitude, longitude) {
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
        return '--'
      }
      return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
    },
    changeFilter(filter) {
      this.currentFilter = filter
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
.page { min-height: 100vh; background-color: #fafaf8; }
.header { padding: 48rpx 32rpx; background-color: #fff; border-bottom: 1rpx solid #e5e5e2; }
.title { font-size: 36rpx; color: #0b0e0d; letter-spacing: 4rpx; }
.guest-card { margin: 32rpx; padding: 40rpx 32rpx; background: #fff; border: 1rpx solid #e5e5e2; }
.guest-title { display: block; margin-bottom: 24rpx; font-size: 28rpx; color: #0b0e0d; }
.login-btn { background-color: #0b0e0d; color: #fff; border: none; border-radius: 0; }
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
.tag-unlock { border-color: #0b0e0d; color: #0b0e0d; }
.tag-lock { border-color: #d4d4d1; color: #737373; }
.tag-text { font-size: 22rpx; }
.history-body { padding: 32rpx; }
.info-row { display: flex; justify-content: space-between; gap: 20rpx; margin-bottom: 18rpx; }
.info-row:last-child { margin-bottom: 0; }
.info-label { font-size: 22rpx; color: #737373; }
.info-value { flex: 1; text-align: right; font-size: 26rpx; color: #0b0e0d; word-break: break-all; }
.empty-history { padding: 128rpx 32rpx; text-align: center; }
.empty-text { font-size: 24rpx; color: #737373; }
</style>
