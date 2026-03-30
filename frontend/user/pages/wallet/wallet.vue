<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">我的钱包</text>
    </view>

    <!-- Balance Section -->
    <view class="balance-section">
      <view class="balance-label">我的余额</view>
      <view class="balance-amount">¥{{ balance }}</view>
      <button class="recharge-btn" @click="showRechargePopup = true">去充值</button>
    </view>

    <!-- Riding Card Section -->
    <view class="card-section">
      <view class="section-title">我的骑行卡</view>
      <view v-if="ridingCards.length > 0" class="card-list">
        <view v-for="(card, index) in ridingCards" :key="index" class="card-item">
          <view class="card-info">
            <text class="card-name">{{ card.name }}</text>
            <text class="card-validity">有效期至：{{ card.validity }}</text>
          </view>
          <view class="card-status" :class="card.statusClass">{{ card.status }}</view>
        </view>
      </view>
      <view v-else class="empty-cards">
        <text class="empty-text">暂无骑行卡</text>
      </view>
    </view>

    <!-- Bill Section -->
    <view class="bill-section">
      <view class="section-title">我的账单</view>
      <view class="bill-item" @click="navigateToBill">
        <text class="bill-text">查看完整账单</text>
        <text class="bill-arrow">›</text>
      </view>
    </view>

    <!-- Recharge Popup -->
    <view v-if="showRechargePopup" class="popup-mask" @click="closeRechargePopup"></view>
    <view v-if="showRechargePopup" class="popup-content">
      <view class="popup-header">
        <text class="popup-title">充值金额</text>
        <text class="popup-close" @click="closeRechargePopup">✕</text>
      </view>
      <view class="popup-body">
        <view class="input-section">
          <text class="currency-symbol">¥</text>
          <input 
            type="digit" 
            class="amount-input" 
            v-model="rechargeAmount"
            placeholder="请输入充值金额"
            :maxlength="10"
          />
        </view>
        <view class="number-keyboard">
          <view 
            v-for="num in numberKeys" 
            :key="num" 
            class="key-item"
            @click="handleNumberClick(num)"
          >
            <text class="key-text">{{ num }}</text>
          </view>
          <view class="key-item delete-key" @click="deleteAmount">
            <text class="key-text">⌫</text>
          </view>
        </view>
        <button class="confirm-recharge-btn" @click="confirmRecharge">确认充值</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserWallet, userBill } from '@/api/index'

export default {
  data() {
    return {
      balance: '0.00',
      ridingCards: [],
      showRechargePopup: false,
      rechargeAmount: '',
      numberKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    }
  },
  onLoad() {
    this.loadWalletData()
  },
  methods: {
    async loadWalletData() {
      try {
        // 加载钱包余额
        const walletRes = await getUserWallet()
        if (walletRes.code === 0) {
          this.balance = walletRes.data.balance || '0.00'
        }
        
        // 加载骑行卡数据
        this.loadRidingCards()
      } catch (error) {
        console.error('加载钱包数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    loadRidingCards() {
      // TODO: 调用 API 获取骑行卡数据
      // 这里使用模拟数据
      this.ridingCards = [
        {
          name: '月卡',
          validity: '2024-12-31',
          status: '使用中',
          statusClass: 'status-active'
        },
        {
          name: '季卡',
          validity: '2024-06-30',
          status: '已过期',
          statusClass: 'status-expired'
        }
      ]
    },
    handleNumberClick(num) {
      if (this.rechargeAmount.length >= 10) {
        return
      }
      this.rechargeAmount += num
    },
    deleteAmount() {
      this.rechargeAmount = this.rechargeAmount.slice(0, -1)
    },
    closeRechargePopup() {
      this.showRechargePopup = false
      this.rechargeAmount = ''
    },
    async confirmRecharge() {
      if (!this.rechargeAmount || parseFloat(this.rechargeAmount) <= 0) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '充值中...'
        })

        // TODO: 调用充值 API
        // const res = await userBill({
        //   type: 'recharge',
        //   amount: parseFloat(this.rechargeAmount)
        // })

        // 模拟充值成功
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        uni.hideLoading()
        uni.showToast({
          title: '充值成功',
          icon: 'success'
        })

        // 更新余额
        const newBalance = (parseFloat(this.balance) + parseFloat(this.rechargeAmount)).toFixed(2)
        this.balance = newBalance
        
        this.closeRechargePopup()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '充值失败',
          icon: 'none'
        })
      }
    },
    navigateToBill() {
      uni.navigateTo({
        url: '/pages/bill/bill'
      })
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

/* Balance Section */
.balance-section {
  margin: 32rpx;
  padding: 64rpx 48rpx;
  background-color: #0b0e0d;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.balance-label {
  font-size: 24rpx;
  color: #737373;
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
  font-weight: 300;
}

.balance-amount {
  font-size: 56rpx;
  font-weight: 300;
  color: #ffffff;
  margin-bottom: 48rpx;
  letter-spacing: 4rpx;
}

.recharge-btn {
  background-color: transparent;
  color: #ffffff;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 0;
  padding: 20rpx 64rpx;
  font-size: 26rpx;
  font-weight: 300;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 2rpx;
}

.recharge-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

/* Card Section */
.card-section {
  margin: 0 32rpx 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.section-title {
  font-size: 30rpx;
  font-weight: 400;
  color: #0b0e0d;
  padding: 40rpx 32rpx 28rpx;
  letter-spacing: 4rpx;
}

.card-list {
  padding: 0 32rpx 32rpx;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  background: #fafaf8;
  border-radius: 0;
  margin-bottom: 20rpx;
  border: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-item:hover {
  transform: translateY(-2rpx);
  border-color: #d4d4d1;
  background: #ffffff;
}

.card-info {
  flex: 1;
}

.card-name {
  font-size: 28rpx;
  font-weight: 400;
  color: #0b0e0d;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.card-validity {
  font-size: 22rpx;
  color: #737373;
  display: block;
  font-weight: 300;
}

.card-status {
  font-size: 22rpx;
  padding: 10rpx 24rpx;
  border-radius: 0;
  font-weight: 300;
  letter-spacing: 2rpx;
  border: 1rpx solid transparent;
}

.status-active {
  background-color: transparent;
  color: #0b0e0d;
  border-color: #0b0e0d;
}

.status-expired {
  background-color: transparent;
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
  font-weight: 300;
  letter-spacing: 2rpx;
}

/* Bill Section */
.bill-section {
  margin: 0 32rpx 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-top: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.bill-item:hover {
  background-color: #fafaf8;
}

.bill-text {
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.bill-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
  font-weight: 300;
}

/* Popup Styles */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.popup-content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  border-radius: 0;
  z-index: 1000;
  padding: 48rpx 32rpx 32rpx;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 1rpx solid #e5e5e2;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.popup-close {
  font-size: 36rpx;
  color: #737373;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.popup-close:hover {
  color: #0b0e0d;
}

.popup-body {
  padding-bottom: 32rpx;
}

.input-section {
  display: flex;
  align-items: center;
  background-color: #fafaf8;
  border-radius: 0;
  padding: 32rpx 40rpx;
  margin-bottom: 48rpx;
  border: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-section:focus-within {
  border-color: #d4d4d1;
  background-color: #ffffff;
}

.currency-symbol {
  font-size: 40rpx;
  font-weight: 300;
  color: #0b0e0d;
  margin-right: 20rpx;
  letter-spacing: 2rpx;
}

.amount-input {
  flex: 1;
  font-size: 40rpx;
  font-weight: 300;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.number-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 48rpx;
}

.key-item {
  background-color: #fafaf8;
  border-radius: 0;
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e5e5e2;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.key-item:active {
  background-color: #f5f5f3;
  border-color: #d4d4d1;
}

.key-text {
  font-size: 36rpx;
  font-weight: 300;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.delete-key {
  background-color: #fafaf8;
  border-color: #e5e5e2;
}

.delete-key .key-text {
  color: #737373;
}

.confirm-recharge-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  padding: 32rpx 0;
  font-size: 30rpx;
  font-weight: 300;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 4rpx;
}

.confirm-recharge-btn:hover {
  background-color: #222222;
  transform: translateY(-2rpx);
}
</style>