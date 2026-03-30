<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">我的账单</text>
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
        :class="{ active: currentFilter === 'income' }"
        @click="changeFilter('income')"
      >
        <text class="filter-text">收入</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'expense' }"
        @click="changeFilter('expense')"
      >
        <text class="filter-text">支出</text>
      </view>
    </view>

    <!-- Bill List -->
    <view class="bill-list">
      <view v-if="filteredBills.length > 0">
        <view v-for="(bill, index) in filteredBills" :key="index" class="bill-item">
          <view class="bill-icon" :class="bill.typeClass">
            <text class="icon-text">{{ bill.typeIcon }}</text>
          </view>
          <view class="bill-info">
            <text class="bill-title">{{ bill.title }}</text>
            <text class="bill-time">{{ bill.time }}</text>
          </view>
          <view class="bill-amount" :class="bill.amountClass">
            <text class="amount-text">{{ bill.amountText }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-bills">
        <text class="empty-text">暂无账单记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserBills } from '@/api/index'

export default {
  data() {
    return {
      bills: [],
      currentFilter: 'all',
      filters: {
        all: (bill) => true,
        income: (bill) => bill.type === 'income',
        expense: (bill) => bill.type === 'expense'
      }
    }
  },
  computed: {
    filteredBills() {
      if (this.currentFilter === 'all') {
        return this.bills
      }
      return this.bills.filter(this.filters[this.currentFilter])
    }
  },
  onLoad() {
    this.loadBills()
  },
  methods: {
    async loadBills() {
      try {
        const res = await getUserBills()
        if (res.code === 0) {
          this.bills = res.data || []
        } else {
          // 如果 API 返回失败，使用模拟数据
          this.loadMockBills()
        }
      } catch (error) {
        console.error('加载账单失败:', error)
        // 使用模拟数据
        this.loadMockBills()
      }
    },
    loadMockBills() {
      // TODO: 调用真实 API 获取账单数据
      // 这里使用模拟数据
      this.bills = [
        {
          title: '骑行充值',
          time: '2024-01-15 14:30:25',
          amount: 50.00,
          type: 'income',
          typeClass: 'type-income',
          typeIcon: '+',
          amountClass: 'amount-income',
          amountText: '+50.00'
        },
        {
          title: '扫码开锁 - 编号 8372',
          time: '2024-01-15 13:20:10',
          amount: -2.50,
          type: 'expense',
          typeClass: 'type-expense',
          typeIcon: '-',
          amountClass: 'amount-expense',
          amountText: '-2.50'
        },
        {
          title: '月卡购买',
          time: '2024-01-10 09:15:00',
          amount: -29.90,
          type: 'expense',
          typeClass: 'type-expense',
          typeIcon: '-',
          amountClass: 'amount-expense',
          amountText: '-29.90'
        },
        {
          title: '扫码开锁 - 编号 5621',
          time: '2024-01-08 18:45:30',
          amount: -3.00,
          type: 'expense',
          typeClass: 'type-expense',
          typeIcon: '-',
          amountClass: 'amount-expense',
          amountText: '-3.00'
        },
        {
          title: '骑行充值',
          time: '2024-01-05 10:00:00',
          amount: 100.00,
          type: 'income',
          typeClass: 'type-income',
          typeIcon: '+',
          amountClass: 'amount-income',
          amountText: '+100.00'
        },
        {
          title: '故障上报退款',
          time: '2024-01-03 16:20:15',
          amount: 5.00,
          type: 'income',
          typeClass: 'type-income',
          typeIcon: '+',
          amountClass: 'amount-income',
          amountText: '+5.00'
        }
      ]
    },
    changeFilter(filter) {
      this.currentFilter = filter
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

/* Bill List */
.bill-list {
  flex: 1;
  margin: 0 32rpx 32rpx;
}

.bill-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 40rpx 32rpx;
  margin-bottom: 16rpx;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bill-item:hover {
  transform: translateY(-2rpx);
  border-color: #d4d4d1;
}

.bill-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  border: 1rpx solid #e5e5e2;
  background-color: #fafaf8;
}

.type-income {
  border-color: #0b0e0d;
  background-color: transparent;
}

.type-expense {
  border-color: #e5e5e2;
  background-color: transparent;
}

.icon-text {
  font-size: 32rpx;
  font-weight: 300;
  color: #0b0e0d;
  font-style: normal;
}

.type-income .icon-text {
  color: #0b0e0d;
}

.type-expense .icon-text {
  color: #737373;
}

.bill-info {
  flex: 1;
}

.bill-title {
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.bill-time {
  font-size: 22rpx;
  color: #737373;
  display: block;
  font-weight: 300;
}

.bill-amount {
  text-align: right;
}

.amount-income {
  color: #0b0e0d;
}

.amount-expense {
  color: #737373;
}

.amount-text {
  font-size: 30rpx;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.empty-bills {
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