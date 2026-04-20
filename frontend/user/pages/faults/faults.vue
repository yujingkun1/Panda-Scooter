<template>
  <view class="page">
    <view class="header">
      <text class="title">故障上报记录</text>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">登录后可查看故障上报记录</text>
      <button class="login-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" @click="goLogin">去登录</button>
    </view>

    <template v-else>
      <view class="filter-section">
        <view class="filter-item ui-pressable" :class="{ active: currentFilter === 'all' }" hover-class="ui-pressable-hover" hover-stay-time="70" @click="changeFilter('all')">
          <text class="filter-text">全部</text>
        </view>
        <view class="filter-item ui-pressable" :class="{ active: currentFilter === 'pending' }" hover-class="ui-pressable-hover" hover-stay-time="70" @click="changeFilter('pending')">
          <text class="filter-text">处理中</text>
        </view>
        <view class="filter-item ui-pressable" :class="{ active: currentFilter === 'completed' }" hover-class="ui-pressable-hover" hover-stay-time="70" @click="changeFilter('completed')">
          <text class="filter-text">已完成</text>
        </view>
      </view>

      <view class="fault-list">
        <view v-if="filteredFaults.length > 0">
          <view v-for="item in filteredFaults" :key="item.id" class="fault-item">
            <view class="fault-header">
              <view class="scooter-info">
                <text class="scooter-icon">报</text>
                <text class="scooter-code">编号 {{ item.scooterCode }}</text>
              </view>
              <view class="fault-status" :class="item.statusClass">
                <text class="status-text">{{ item.status }}</text>
              </view>
            </view>

            <view class="fault-body">
              <view class="info-row">
                <view class="info-label">上报时间</view>
                <view class="info-value">{{ item.reportTime }}</view>
              </view>

              <view class="info-row">
                <view class="info-label">故障原因</view>
                <view class="info-value">{{ item.reason }}</view>
              </view>

              <view v-if="item.remark" class="info-row remark-row">
                <view class="info-label">处理备注</view>
                <view class="info-value remark">{{ item.remark }}</view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-faults">
          <text class="empty-text">暂无故障上报记录</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { getFaults } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

export default {
  data() {
    return {
      hasToken: false,
      faultsList: [],
      currentFilter: 'all',
      filters: {
        all: () => true,
        pending: (item) => item.status === '处理中',
        completed: (item) => item.status === '已完成'
      }
    }
  },
  computed: {
    filteredFaults() {
      return this.faultsList.filter(this.filters[this.currentFilter])
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('token'))
    if (this.hasToken) {
      this.loadFaults()
    }
  },
  methods: {
    async loadFaults() {
      try {
        const res = await getFaults()
        const faults = res.data && Array.isArray(res.data.faults) ? res.data.faults : []
        this.faultsList = faults.map((item, index) => this.normalizeFault(item, index))
      } catch (error) {
        this.faultsList = []
        showUnhandledError(error, '加载故障记录失败，请稍后重试')
      }
    },
    normalizeFault(item, index) {
      const rawStatus = item.status !== undefined ? item.status : item.processStatus
      const isCompleted =
        rawStatus === 1 ||
        rawStatus === 'completed' ||
        rawStatus === '已完成' ||
        rawStatus === true

      return {
        id: item.id || index + 1,
        scooterCode: item.code || item.scooterCode || '--',
        reportTime: this.formatDateTime(item.createTime || item.reportTime),
        reason: item.description || item.reason || '未填写故障原因',
        status: isCompleted ? '已完成' : '处理中',
        statusClass: isCompleted ? 'status-completed' : 'status-pending',
        remark: item.remark || ''
      }
    },
    changeFilter(filter) {
      this.currentFilter = filter
    },
    formatDateTime(value) {
      if (!value) {
        return '--'
      }
      return String(value).replace('T', ' ').replace('Z', '').slice(0, 19)
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
.fault-list { margin: 0 32rpx 32rpx; }
.fault-item { margin-bottom: 20rpx; background-color: #fff; border: 1rpx solid #e5e5e2; }
.fault-header { display: flex; justify-content: space-between; align-items: center; padding: 32rpx; border-bottom: 1rpx solid #e5e5e2; }
.scooter-info { display: flex; align-items: center; }
.scooter-icon { margin-right: 16rpx; font-size: 28rpx; }
.scooter-code { font-size: 28rpx; color: #0b0e0d; }
.fault-status { padding: 10rpx 24rpx; border: 1rpx solid transparent; font-size: 22rpx; }
.status-pending { color: #a67c00; border-color: #d4d4d1; }
.status-completed { color: #0b0e0d; border-color: #0b0e0d; }
.fault-body { padding: 32rpx; }
.info-row { margin-bottom: 28rpx; }
.info-row:last-child { margin-bottom: 0; }
.info-label { margin-bottom: 12rpx; font-size: 22rpx; color: #737373; }
.info-value { font-size: 28rpx; color: #0b0e0d; line-height: 1.6; }
.remark-row { padding-top: 24rpx; border-top: 1rpx dashed #e5e5e2; }
.remark { color: #737373; font-size: 24rpx; }
.empty-faults { padding: 128rpx 32rpx; text-align: center; }
.empty-text { font-size: 24rpx; color: #737373; }
</style>
