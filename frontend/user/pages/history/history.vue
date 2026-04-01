<template>
  <view class="page">
    <view class="header">
      <text class="title">骑行历史</text>
    </view>

    <view class="filter-section">
      <view
        class="filter-item"
        :class="{ active: currentFilter === 'all' }"
        @click="changeFilter('all')"
      >
        <text class="filter-text">全部</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: currentFilter === 'paid' }"
        @click="changeFilter('paid')"
      >
        <text class="filter-text">已支付</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: currentFilter === 'unpaid' }"
        @click="changeFilter('unpaid')"
      >
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

          <view v-if="!item.isPaid" class="pay-action">
            <button class="pay-btn" @click="handlePay(item)">立即支付</button>
          </view>
        </view>
      </view>
      <view v-else class="empty-history">
        <text class="empty-text">暂无骑行记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getRideHistory } from '@/api/index'

export default {
  data() {
    return {
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
    this.loadHistory()
  },
  methods: {
    async loadHistory() {
      try {
        const res = await getRideHistory()
        const history = res.data && Array.isArray(res.data.history) ? res.data.history : []
        this.historyList = history.map((item, index) => this.normalizeHistory(item, index))
      } catch (error) {
        this.historyList = []
      }
    },
    normalizeHistory(item, index) {
      const isPaid = Number(item.payStatus) === 1 || item.isPaid === true
      return {
        id: item.id || index + 1,
        orderId: item.id || '--',
        orderTime: this.formatDateTime(item.startTime),
        duration: item.totalTime || item.duration || this.mapOrderStatus(item.orderStatus),
        distance: this.formatAmount(item.totalKilometer),
        amount: this.formatAmount(item.amount),
        isPaid,
        paidStatus: isPaid ? '已支付' : '未支付',
        paidStatusClass: isPaid ? 'status-paid' : 'status-unpaid'
      }
    },
    changeFilter(filter) {
      this.currentFilter = filter
    },
    handlePay(item) {
      uni.showModal({
        title: '确认支付',
        content: `订单 ${item.orderId}，支付金额 ¥${item.amount}`,
        confirmText: '立即支付',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          uni.showLoading({
            title: '支付中...'
          })
          await new Promise((resolve) => setTimeout(resolve, 800))
          uni.hideLoading()
          item.isPaid = true
          item.paidStatus = '已支付'
          item.paidStatusClass = 'status-paid'
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          })
        }
      })
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
      const statusMap = {
        0: '骑行中',
        1: '待支付',
        2: '已完成'
      }
      return statusMap[status] || '--'
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
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.title {
  font-size: 36rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.filter-section {
  display: flex;
  margin: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  padding: 20rpx;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.filter-item.active {
  background-color: #0b0e0d;
  color: #ffffff;
}

.filter-text {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.filter-item.active .filter-text {
  color: #ffffff;
}

.history-list {
  flex: 1;
  margin: 0 32rpx 32rpx;
}

.history-item {
  background-color: #ffffff;
  border-radius: 0;
  margin-bottom: 20rpx;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-item:hover {
  transform: translateY(-2rpx);
  border-color: #d4d4d1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.scooter-info {
  display: flex;
  align-items: center;
}

.scooter-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  font-style: normal;
}

.scooter-code {
  font-size: 28rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.pay-status {
  padding: 10rpx 24rpx;
  border-radius: 0;
  font-size: 22rpx;
  font-weight: 300;
  border: 1rpx solid transparent;
  letter-spacing: 2rpx;
}

.status-paid {
  color: #0b0e0d;
  border-color: #0b0e0d;
}

.status-unpaid {
  color: #737373;
  border-color: #d4d4d1;
}

.history-body {
  padding: 32rpx;
}

.info-row {
  display: flex;
  margin-bottom: 24rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
}

.info-label {
  font-size: 22rpx;
  color: #737373;
  display: block;
  margin-bottom: 12rpx;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.info-value {
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  display: block;
  letter-spacing: 2rpx;
}

.info-value.amount {
  color: #0b0e0d;
  font-weight: 400;
}

.info-divider {
  width: 1rpx;
  background-color: #e5e5e2;
  margin: 0 40rpx;
}

.pay-action {
  padding: 24rpx 32rpx 32rpx;
  border-top: 1rpx solid #e5e5e2;
}

.pay-btn {
  background-color: transparent;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  padding: 24rpx 0;
  font-size: 26rpx;
  font-weight: 300;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 2rpx;
}

.pay-btn:hover {
  background-color: #0b0e0d;
  color: #ffffff;
  border-color: #0b0e0d;
  transform: translateY(-2rpx);
}

.empty-history {
  padding: 128rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}
</style>
