<template>
  <view class="page">
    <view class="header">
      <text class="title">骑行历史</text>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">登录后可查看骑行历史</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <template v-else>
      <view class="filter-section">
        <view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="changeFilter('all')">
          <text class="filter-text">全部</text>
        </view>
        <view class="filter-item" :class="{ active: currentFilter === 'paid' }" @click="changeFilter('paid')">
          <text class="filter-text">已支付</text>
        </view>
        <view class="filter-item" :class="{ active: currentFilter === 'unpaid' }" @click="changeFilter('unpaid')">
          <text class="filter-text">未支付</text>
        </view>
      </view>

      <view class="history-list">
        <view v-if="filteredHistory.length > 0">
          <view v-for="item in filteredHistory" :key="item.id" class="history-item">
            <view class="history-header">
              <view class="scooter-info">
                <text class="scooter-icon">车</text>
                <text class="scooter-code">订单 {{ item.orderId }}</text>
              </view>
              <view class="pay-status" :class="item.paidStatusClass">
                <text class="status-text">{{ item.paidStatus }}</text>
              </view>
            </view>

            <view class="history-body">
              <view class="info-row">
                <view class="info-item">
                  <text class="info-label">下单时间</text>
                  <text class="info-value">{{ item.orderTime }}</text>
                </view>
                <view class="info-divider"></view>
                <view class="info-item">
                  <text class="info-label">骑行时长</text>
                  <text class="info-value">{{ item.duration }}</text>
                </view>
              </view>

              <view class="info-row">
                <view class="info-item">
                  <text class="info-label">骑行里程</text>
                  <text class="info-value">{{ item.distance }} km</text>
                </view>
                <view class="info-divider"></view>
                <view class="info-item">
                  <text class="info-label">支付金额</text>
                  <text class="info-value amount">¥{{ item.amount }}</text>
                </view>
              </view>
            </view>

            <view v-if="item.canPay" class="pay-action">
              <button class="pay-btn" :disabled="isActionPending(`pay-${item.orderId}`)" @click="handlePay(item)">
                {{ isActionPending(`pay-${item.orderId}`) ? '支付中...' : '立即支付' }}
              </button>
            </view>
          </view>
        </view>
        <view v-else class="empty-history">
          <text class="empty-text">暂无骑行记录</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { getRideHistory, payUnpaidOrder } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

export default {
  mixins: [actionGuard],
  data() {
    return {
      hasToken: false,
      historyList: [],
      currentFilter: 'all',
      filters: {
        all: () => true,
        paid: (item) => item.isPaid,
        unpaid: (item) => !item.isPaid
      }
    }
  },
  computed: {
    filteredHistory() {
      return this.historyList.filter(this.filters[this.currentFilter])
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('token'))
    if (this.hasToken) {
      this.loadHistory()
    }
  },
  methods: {
    async loadHistory() {
      try {
        const res = await getRideHistory()
        const history = res.data && Array.isArray(res.data.history) ? res.data.history : []
        this.historyList = history.map((item, index) => this.normalizeHistory(item, index))
      } catch (error) {
        this.historyList = []
        showUnhandledError(error, '加载骑行历史失败，请稍后重试')
      }
    },
    normalizeHistory(item, index) {
      const orderId = Number(item.id || item.orderId || 0) || null
      const isPaid = Number(item.payStatus) === 1 || item.isPaid === true
      const isUnpaidOrder = Number(item.orderStatus) === 1 && Number(item.payStatus) === 0
      return {
        id: orderId || index + 1,
        orderId: orderId || '--',
        orderTime: this.formatDateTime(item.startTime),
        duration: item.totalTime || this.mapOrderStatus(item.orderStatus),
        distance: this.formatAmount(item.totalKilometer),
        amount: this.formatAmount(item.amount),
        isPaid,
        canPay: Boolean(orderId) && (isUnpaidOrder || !isPaid),
        paidStatus: isPaid ? '已支付' : '未支付',
        paidStatusClass: isPaid ? 'status-paid' : 'status-unpaid'
      }
    },
    changeFilter(filter) {
      this.currentFilter = filter
    },
    handlePay(item) {
      this.withAction(`pay-${item.orderId}`, () => new Promise((resolve) => {
        uni.showModal({
          title: '确认支付',
          content: `订单 ${item.orderId}，支付金额 ¥${item.amount}`,
          confirmText: '立即支付',
          success: async (res) => {
            if (!res.confirm) {
              resolve()
              return
            }

            try {
              uni.showLoading({
                title: '支付中...'
              })
              await payUnpaidOrder({
                orderId: item.orderId,
                amount: Number(item.amount)
              })
              uni.hideLoading()
              item.isPaid = true
              item.canPay = false
              item.paidStatus = '已支付'
              item.paidStatusClass = 'status-paid'
              uni.showToast({
                title: '支付成功',
                icon: 'success'
              })
            } catch (error) {
              uni.hideLoading()
              showUnhandledError(error, '支付失败，请稍后重试')
            }
            resolve()
          },
          fail: resolve
        })
      }))
    },
    formatDateTime(value) {
      if (!value) {
        return '--'
      }
      return String(value).replace('T', ' ').replace('Z', '').slice(0, 19)
    },
    formatAmount(value) {
      const amount = Number(value || 0)
      return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
    },
    mapOrderStatus(status) {
      const statusMap = { 0: '骑行中', 1: '待支付', 2: '已完成' }
      return statusMap[status] || '--'
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
.scooter-info { display: flex; align-items: center; }
.scooter-icon { margin-right: 16rpx; font-size: 28rpx; }
.scooter-code { font-size: 28rpx; color: #0b0e0d; }
.pay-status { padding: 10rpx 24rpx; border: 1rpx solid transparent; font-size: 22rpx; }
.status-paid { color: #0b0e0d; border-color: #0b0e0d; }
.status-unpaid { color: #737373; border-color: #d4d4d1; }
.history-body { padding: 32rpx; }
.info-row { display: flex; margin-bottom: 24rpx; }
.info-row:last-child { margin-bottom: 0; }
.info-item { flex: 1; }
.info-label { display: block; margin-bottom: 12rpx; font-size: 22rpx; color: #737373; }
.info-value { display: block; font-size: 28rpx; color: #0b0e0d; }
.info-divider { width: 1rpx; background-color: #e5e5e2; margin: 0 40rpx; }
.pay-action { padding: 24rpx 32rpx 32rpx; border-top: 1rpx solid #e5e5e2; }
.pay-btn { background-color: transparent; color: #0b0e0d; border: 1rpx solid #d4d4d1; border-radius: 0; }
.pay-btn[disabled] { color: #999999; border-color: #e5e5e2; }
.empty-history { padding: 128rpx 32rpx; text-align: center; }
.empty-text { font-size: 24rpx; color: #737373; }
</style>
