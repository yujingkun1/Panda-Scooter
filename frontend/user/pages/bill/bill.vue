<template>
  <view class="page">
    <view class="header">
      <text class="title">我的账单</text>
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

    <view class="bill-list">
      <view v-if="filteredBills.length > 0">
        <view v-for="bill in filteredBills" :key="bill.id" class="bill-item">
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

const BILL_TYPE_TEXT = {
  1: '骑行消费',
  2: '账户充值',
  3: '退款',
  4: '购买套餐'
}

export default {
  data() {
    return {
      bills: [],
      currentFilter: 'all',
      filters: {
        all: () => true,
        income: (bill) => bill.type === 'income',
        expense: (bill) => bill.type === 'expense'
      }
    }
  },
  computed: {
    filteredBills() {
      return this.bills.filter(this.filters[this.currentFilter])
    }
  },
  onShow() {
    this.loadBills()
  },
  methods: {
    async loadBills() {
      try {
        const res = await getUserBills()
        const bills = res.data && Array.isArray(res.data.bills) ? res.data.bills : []
        this.bills = bills.map((item, index) => this.normalizeBill(item, index))
      } catch (error) {
        this.bills = []
      }
    },
    normalizeBill(item, index) {
      const amount = Number(item.amount || 0)
      const isIncome = amount > 0
      return {
        id: item.id || index + 1,
        title: item.remark || BILL_TYPE_TEXT[Number(item.type)] || '账单变动',
        time: this.formatDateTime(item.createTime),
        type: isIncome ? 'income' : 'expense',
        typeClass: isIncome ? 'type-income' : 'type-expense',
        typeIcon: isIncome ? '+' : '-',
        amountClass: isIncome ? 'amount-income' : 'amount-expense',
        amountText: `${isIncome ? '+' : '-'}${Math.abs(amount).toFixed(2)}`
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
}

.type-expense {
  border-color: #e5e5e2;
}

.icon-text {
  font-size: 32rpx;
  font-weight: 300;
  color: #0b0e0d;
  font-style: normal;
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
