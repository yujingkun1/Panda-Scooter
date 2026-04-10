<template>
  <view class="page">
    <view class="header">
      <text class="title">我的钱包</text>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">登录后可查看钱包余额和骑行卡</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <template v-else>
      <view class="balance-section">
        <view class="balance-label">我的余额</view>
        <view class="balance-amount">¥{{ balance }}</view>
        <button class="recharge-btn" @click="openRechargePopup">{{ rechargeButtonText }}</button>
      </view>

      <view class="card-section">
        <view class="section-title">我的骑行卡</view>
        <view v-if="ridingCards.length > 0" class="card-list">
          <view v-for="card in ridingCards" :key="card.id" class="card-item">
            <view class="card-info">
              <text class="card-name">{{ card.name }}</text>
              <text class="card-validity">{{ card.validity }}</text>
            </view>
            <view class="card-status" :class="card.statusClass">{{ card.status }}</view>
          </view>
        </view>
        <view v-else class="empty-cards">
          <text class="empty-text">暂无骑行卡</text>
        </view>
      </view>

      <view class="bill-section">
        <view class="section-title">我的账单</view>
        <view class="bill-item" @click="navigateToBill">
          <text class="bill-text">查看完整账单</text>
          <text class="bill-arrow">›</text>
        </view>
      </view>
    </template>

    <view v-if="showRechargePopup" class="popup-mask" @click="closeRechargePopup"></view>
    <view v-if="showRechargePopup" class="popup-content" :style="popupStyle">
      <view class="popup-header">
        <text class="popup-title">充值金额</text>
        <text class="popup-close" @click="closeRechargePopup">✕</text>
      </view>
      <view class="popup-body">
        <view class="input-section">
          <text class="currency-symbol">¥</text>
          <input
            v-model="rechargeAmount"
            class="amount-input"
            type="digit"
            placeholder="请输入充值金额"
            :maxlength="10"
            :focus="rechargeInputFocused"
            :adjust-position="false"
            :cursor-spacing="24"
            @focus="handleRechargeFocus"
            @blur="handleRechargeBlur"
          />
        </view>
        <button class="confirm-recharge-btn" :disabled="isActionPending('confirmRecharge')" @click="confirmRecharge">
          {{ isActionPending('confirmRecharge') ? '充值中...' : '确认充值' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { getUserWallet, userBill } from '@/api/index'

export default {
  mixins: [actionGuard],
  data() {
    return {
      hasToken: false,
      balance: '0.00',
      ridingCards: [],
      showRechargePopup: false,
      rechargeAmount: '',
      rechargeInputFocused: false,
      keyboardHeight: 0,
      keyboardHeightHandler: null
    }
  },
  computed: {
    popupStyle() {
      return {
        bottom: `${this.keyboardHeight}px`
      }
    },
    rechargeButtonText() {
      return '\u53bb\u5145\u503c'
    }
  },
  onLoad() {
    this.registerKeyboardHeightListener()
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('token'))
    if (this.hasToken) {
      this.loadWalletData()
    }
  },
  onUnload() {
    this.unregisterKeyboardHeightListener()
  },
  methods: {
    async loadWalletData() {
      try {
        const walletRes = await getUserWallet()
        const data = walletRes.data || {}
        this.balance = this.formatAmount(data.balance)
        this.ridingCards = (data.packages || []).map((item, index) => {
          const restDay = Number(item.restDay || 0)
          const isActive = restDay > 0
          return {
            id: item.id || index + 1,
            name: item.title || `骑行卡 ${index + 1}`,
            validity: item.expireDate
              ? `有效期至：${String(item.expireDate).slice(0, 10)}`
              : `剩余天数：${restDay}`,
            status: isActive ? '使用中' : '已过期',
            statusClass: isActive ? 'status-active' : 'status-expired'
          }
        })
      } catch (error) {
        this.balance = '0.00'
        this.ridingCards = []
      }
    },
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/login?mode=login'
      })
    },
    openRechargePopup() {
      this.showRechargePopup = true
      this.keyboardHeight = 0
      this.rechargeInputFocused = false
      setTimeout(() => {
        this.rechargeInputFocused = true
      }, 0)
    },
    closeRechargePopup(force = false) {
      if (!force && this.isActionPending('confirmRecharge')) {
        return
      }

      this.rechargeInputFocused = false
      this.keyboardHeight = 0
      this.showRechargePopup = false
      this.rechargeAmount = ''
      if (typeof uni.hideKeyboard === 'function') {
        uni.hideKeyboard()
      }
    },
    registerKeyboardHeightListener() {
      if (typeof uni.onKeyboardHeightChange !== 'function' || this.keyboardHeightHandler) {
        return
      }

      this.keyboardHeightHandler = (res) => {
        if (!this.showRechargePopup) {
          return
        }
        this.keyboardHeight = Math.max(Number(res && res.height) || 0, 0)
      }
      uni.onKeyboardHeightChange(this.keyboardHeightHandler)
    },
    unregisterKeyboardHeightListener() {
      if (!this.keyboardHeightHandler || typeof uni.offKeyboardHeightChange !== 'function') {
        this.keyboardHeightHandler = null
        return
      }

      uni.offKeyboardHeightChange(this.keyboardHeightHandler)
      this.keyboardHeightHandler = null
    },
    handleRechargeFocus() {
      this.rechargeInputFocused = true
    },
    handleRechargeBlur() {
      this.rechargeInputFocused = false
      this.keyboardHeight = 0
    },
    async confirmRecharge() {
      const amount = parseFloat(this.rechargeAmount)
      if (!Number.isFinite(amount) || amount <= 0) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return
      }

      await this.withAction('confirmRecharge', async () => {
        try {
          uni.showLoading({
            title: '充值中...'
          })
          await userBill({
            type: 2,
            amount,
            remark: '账户充值'
          })
          uni.hideLoading()
          this.closeRechargePopup(true)
          await this.loadWalletData()
          uni.showToast({
            title: '充值成功',
            icon: 'success'
          })
        } catch (error) {
          uni.hideLoading()
        }
      })
    },
    navigateToBill() {
      uni.navigateTo({
        url: '/pages/bill/bill'
      })
    },
    formatAmount(value) {
      const amount = Number(value || 0)
      return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
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
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.guest-card,
.balance-section,
.card-section,
.bill-section {
  margin: 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.guest-card {
  padding: 40rpx 32rpx;
}

.guest-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 28rpx;
  color: #0b0e0d;
}

.login-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
}

.balance-section {
  padding: 64rpx 48rpx;
  background-color: #0b0e0d;
}

.balance-label {
  font-size: 24rpx;
  color: #bbbbbb;
  margin-bottom: 24rpx;
}

.balance-amount {
  font-size: 56rpx;
  color: #ffffff;
  margin-bottom: 48rpx;
}

.recharge-btn {
  background-color: transparent;
  color: #ffffff;
  border: 1rpx solid rgba(255,255,255,0.35);
  border-radius: 0;
}

.section-title {
  font-size: 30rpx;
  color: #0b0e0d;
  padding: 40rpx 32rpx 28rpx;
}

.card-list {
  padding: 0 32rpx 32rpx;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  background: #fafaf8;
  border: 1rpx solid #e5e5e2;
}

.card-name {
  display: block;
  font-size: 28rpx;
  color: #0b0e0d;
  margin-bottom: 12rpx;
}

.card-validity {
  display: block;
  font-size: 22rpx;
  color: #737373;
}

.card-status {
  font-size: 22rpx;
  padding: 10rpx 24rpx;
  border: 1rpx solid transparent;
}

.status-active {
  color: #0b0e0d;
  border-color: #0b0e0d;
}

.status-expired {
  color: #737373;
  border-color: #d4d4d1;
}

.empty-cards {
  padding: 64rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-top: 1rpx solid #e5e5e2;
}

.bill-text {
  font-size: 28rpx;
  color: #0b0e0d;
}

.bill-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
}

.popup-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.popup-content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  background-color: #ffffff;
  padding: 48rpx 32rpx 32rpx;
  border-top: 1rpx solid #e5e5e2;
  transition: bottom 0.2s ease;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.popup-title {
  font-size: 32rpx;
  color: #0b0e0d;
}

.popup-close {
  font-size: 36rpx;
  color: #737373;
}

.input-section {
  display: flex;
  align-items: center;
  min-width: 0;
  margin-bottom: 32rpx;
  padding: 28rpx 32rpx;
  border: 1rpx solid #e5e5e2;
  background-color: #fafaf8;
}

.currency-symbol {
  margin-right: 16rpx;
  font-size: 40rpx;
}

.amount-input {
  flex: 1;
  min-width: 0;
  font-size: 36rpx;
  box-sizing: border-box;
}

.confirm-recharge-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
}

.confirm-recharge-btn:disabled {
  background-color: #d4d4d1;
}
</style>
