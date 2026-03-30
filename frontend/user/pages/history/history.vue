<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">骑行历史</text>
    </view>

    <!-- Filter Section -->
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

    <!-- History List -->
    <view class="history-list">
      <view v-if="filteredHistory.length > 0">
        <view v-for="(item, index) in filteredHistory" :key="index" class="history-item">
          <view class="history-header">
            <view class="scooter-info">
              <text class="scooter-icon">🛴</text>
              <text class="scooter-code">编号 {{ item.scooterCode }}</text>
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
        all: (item) => true,
        paid: (item) => item.isPaid === true,
        unpaid: (item) => item.isPaid === false
      }
    }
  },
  computed: {
    filteredHistory() {
      if (this.currentFilter === 'all') {
        return this.historyList
      }
      return this.historyList.filter(this.filters[this.currentFilter])
    }
  },
  onLoad() {
    this.loadHistory()
  },
  methods: {
    async loadHistory() {
      try {
        const res = await getRideHistory()
        if (res.code === 0) {
          this.historyList = res.data || []
        } else {
          this.loadMockHistory()
        }
      } catch (error) {
        console.error('加载骑行历史失败:', error)
        // 使用模拟数据
        this.loadMockHistory()
      }
    },
    loadMockHistory() {
      // TODO: 调用真实 API 获取骑行历史数据
      // 这里使用模拟数据
      this.historyList = [
        {
          scooterCode: '8372',
          orderTime: '2024-01-15 13:20:10',
          duration: '25分钟',
          distance: '3.2',
          amount: '2.50',
          isPaid: true,
          paidStatus: '已支付',
          paidStatusClass: 'status-paid'
        },
        {
          scooterCode: '5621',
          orderTime: '2024-01-14 18:45:30',
          duration: '18分钟',
          distance: '2.1',
          amount: '2.50',
          isPaid: true,
          paidStatus: '已支付',
          paidStatusClass: 'status-paid'
        },
        {
          scooterCode: '9234',
          orderTime: '2024-01-13 09:15:20',
          duration: '42分钟',
          distance: '5.8',
          amount: '3.50',
          isPaid: false,
          paidStatus: '未支付',
          paidStatusClass: 'status-unpaid'
        },
        {
          scooterCode: '7156',
          orderTime: '2024-01-12 16:30:00',
          duration: '15分钟',
          distance: '1.5',
          amount: '2.50',
          isPaid: true,
          paidStatus: '已支付',
          paidStatusClass: 'status-paid'
        },
        {
          scooterCode: '3489',
          orderTime: '2024-01-10 08:20:45',
          duration: '35分钟',
          distance: '4.3',
          amount: '3.00',
          isPaid: false,
          paidStatus: '未支付',
          paidStatusClass: 'status-unpaid'
        },
        {
          scooterCode: '6712',
          orderTime: '2024-01-08 19:10:15',
          duration: '22分钟',
          distance: '2.8',
          amount: '2.50',
          isPaid: true,
          paidStatus: '已支付',
          paidStatusClass: 'status-paid'
        }
      ]
    },
    changeFilter(filter) {
      this.currentFilter = filter
    },
    handlePay(item) {
      uni.showModal({
        title: '确认支付',
        content: `订单编号 ${item.scooterCode}，支付金额 ¥${item.amount}`,
        confirmText: '立即支付',
        success: (res) => {
          if (res.confirm) {
            this.processPayment(item)
          }
        }
      })
    },
    async processPayment(item) {
      try {
        uni.showLoading({
          title: '支付中...'
        })

        // TODO: 调用支付 API
        // const res = await payOrder({
        //   orderId: item.id,
        //   amount: parseFloat(item.amount)
        // })

        // 模拟支付成功
        await new Promise(resolve => setTimeout(resolve, 1500))

        uni.hideLoading()
        uni.showToast({
          title: '支付成功',
          icon: 'success'
        })

        // 更新状态
        item.isPaid = true
        item.paidStatus = '已支付'
        item.paidStatusClass = 'status-paid'

        // 重新加载数据
        this.loadHistory()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
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

/* Header */
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

/* Filter Section */
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

/* History List */
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
  font-size: 32rpx;
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
  background-color: transparent;
  color: #0b0e0d;
  border-color: #0b0e0d;
}

.status-unpaid {
  background-color: transparent;
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
