<template>
  <view class="page">
    <view class="header">
      <text class="title">我的账单</text>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">登录后可查看账单记录</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <template v-else>
      <view class="filter-section">
        <view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="changeFilter('all')">
          <text class="filter-text">全部</text>
        </view>
        <view class="filter-item" :class="{ active: currentFilter === 'income' }" @click="changeFilter('income')">
          <text class="filter-text">收入</text>
        </view>
        <view class="filter-item" :class="{ active: currentFilter === 'expense' }" @click="changeFilter('expense')">
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
    </template>
  </view>
</template>

<script>
import { getUserBills } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const BILL_TYPE_TEXT = {
  1: '骑行消费',
  2: '账户充值',
  3: '退款',
  4: '购买套餐'
}

export default {
  data() {
    return {
      hasToken: false,
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
    this.hasToken = Boolean(uni.getStorageSync('token'))
    if (this.hasToken) {
      this.loadBills()
    }
  },
  methods: {
    async loadBills() {
      try {
        const res = await getUserBills()
        const bills = res.data && Array.isArray(res.data.bills) ? res.data.bills : []
        this.bills = bills.map((item, index) => this.normalizeBill(item, index))
      } catch (error) {
        this.bills = []
        showUnhandledError(error, '加载账单失败，请稍后重试')
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
.bill-list { margin: 0 32rpx 32rpx; }
.bill-item { display: flex; align-items: center; background-color: #fff; padding: 40rpx 32rpx; margin-bottom: 16rpx; border: 1rpx solid #e5e5e2; }
.bill-icon { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; margin-right: 24rpx; border: 1rpx solid #e5e5e2; background-color: #fafaf8; }
.type-income { border-color: #0b0e0d; }
.icon-text { font-size: 32rpx; color: #0b0e0d; }
.type-expense .icon-text { color: #737373; }
.bill-info { flex: 1; }
.bill-title { display: block; margin-bottom: 12rpx; font-size: 28rpx; color: #0b0e0d; }
.bill-time { display: block; font-size: 22rpx; color: #737373; }
.amount-income { color: #0b0e0d; }
.amount-expense { color: #737373; }
.amount-text { font-size: 30rpx; }
.empty-bills { padding: 128rpx 32rpx; text-align: center; }
.empty-text { font-size: 24rpx; color: #737373; }
</style>
